import Dexie, { type Table } from 'dexie'
import { adesso } from './dates'
import type {
  Cliente, Contratto, Dispositivo, Impostazione, Intervento, InterventoRiga,
  Profilo, Ricambio, Sede,
} from './types'

// ============================================================================
// Il database locale.
//
// L'app legge e scrive SEMPRE qui, anche con la rete attiva: IndexedDB e' la
// fonte di verita' per l'interfaccia, e Supabase e' la copia condivisa con cui
// ci si allinea quando si puo'. E' questo che rende il rapportino compilabile
// nel retro di un negozio senza campo.
//
// Ogni scrittura lascia una traccia nella tabella `pendenti`. La traccia non
// contiene i dati, solo il riferimento alla riga toccata: al momento di salire
// si rilegge la versione corrente dal locale. Cosi' dieci correzioni allo
// stesso rapportino diventano una sola richiesta, e non si rischia di inviare
// un valore vecchio.
// ============================================================================

/** Riferimento a una riga locale modificata e non ancora salita. */
export interface Pendente {
  tabella: NomeTabella
  chiave: string
  seq: number
  tentativi: number
  ultimo_errore: string | null
}

export interface Meta {
  chiave: string
  valore: string
}

export type NomeTabella =
  | 'clienti' | 'sedi' | 'dispositivi' | 'contratti'
  | 'interventi' | 'intervento_righe' | 'ricambi' | 'impostazioni' | 'profiles'

/**
 * Ordine in cui le tabelle salgono al server. Conta: una sede non puo' essere
 * inserita prima del suo cliente, un rapportino prima del suo dispositivo.
 * Rispettando questa sequenza i vincoli di integrita' non vengono mai violati,
 * nemmeno sincronizzando una giornata intera di lavoro offline.
 */
export const ORDINE_TABELLE: NomeTabella[] = [
  'profiles', 'clienti', 'sedi', 'dispositivi', 'contratti',
  'ricambi', 'interventi', 'intervento_righe', 'impostazioni',
]

/** Per ogni tabella: qual e' la chiave primaria e cosa decide il server. */
export const DESCRITTORI: Record<NomeTabella, { chiave: string; campiServer: string[] }> = {
  profiles:         { chiave: 'id',     campiServer: ['synced_at'] },
  clienti:          { chiave: 'id',     campiServer: ['synced_at'] },
  sedi:             { chiave: 'id',     campiServer: ['synced_at'] },
  dispositivi:      { chiave: 'id',     campiServer: ['synced_at'] },
  contratti:        { chiave: 'id',     campiServer: ['synced_at'] },
  ricambi:          { chiave: 'id',     campiServer: ['synced_at'] },
  // `numero` e' il progressivo del rapportino: lo assegna il server, il client
  // non lo manda mai per non sovrascriverlo con un nullo.
  interventi:       { chiave: 'id',     campiServer: ['synced_at', 'numero'] },
  intervento_righe: { chiave: 'id',     campiServer: ['synced_at'] },
  impostazioni:     { chiave: 'chiave', campiServer: ['synced_at'] },
}

class DatabaseLocale extends Dexie {
  profiles!: Table<Profilo, string>
  clienti!: Table<Cliente, string>
  sedi!: Table<Sede, string>
  dispositivi!: Table<Dispositivo, string>
  contratti!: Table<Contratto, string>
  interventi!: Table<Intervento, string>
  intervento_righe!: Table<InterventoRiga, string>
  ricambi!: Table<Ricambio, string>
  impostazioni!: Table<Impostazione, string>
  pendenti!: Table<Pendente, [string, string]>
  meta!: Table<Meta, string>

  constructor() {
    super('gestione-assistenza')
    // Nota: in IndexedDB un booleano non e' una chiave valida, quindi campi
    // come `deleted` o `attivo` non si possono indicizzare -- le righe
    // semplicemente non comparirebbero nell'indice. Si filtrano in memoria,
    // che su questi volumi non si sente.
    this.version(1).stores({
      profiles: 'id, nome',
      clienti: 'id, ragione_sociale, citta',
      sedi: 'id, cliente_id',
      dispositivi: 'id, cliente_id, sede_id, matricola, stato',
      contratti: 'id, cliente_id, data_scadenza, stato, tipo',
      interventi: 'id, cliente_id, sede_id, dispositivo_id, stato, tipo, data_intervento, tecnico_id',
      intervento_righe: 'id, intervento_id',
      ricambi: 'id, codice',
      impostazioni: 'chiave',
      pendenti: '[tabella+chiave], seq, tabella',
      meta: 'chiave',
    })
  }
}

export const db = new DatabaseLocale()

// --- identificatori --------------------------------------------------------

/**
 * Un uuid generato sul dispositivo. L'id definitivo nasce qui e non cambia
 * piu': e' quello che permette di collegare fra loro record creati offline
 * (un intervento e le sue righe) prima che il server li abbia mai visti.
 */
export function nuovoId(): string {
  const api: Crypto | undefined = typeof crypto === 'undefined' ? undefined : crypto
  if (api && typeof api.randomUUID === 'function') return api.randomUUID()
  // Ripiego per browser datati o contesti non sicuri (dove randomUUID manca).
  const b = new Uint8Array(16)
  if (!api) throw new Error('Questo browser non offre un generatore di numeri casuali sicuro')
  api.getRandomValues(b)
  b[6] = (b[6]! & 0x0f) | 0x40
  b[8] = (b[8]! & 0x3f) | 0x80
  const esa = [...b].map((n) => n.toString(16).padStart(2, '0')).join('')
  return `${esa.slice(0, 8)}-${esa.slice(8, 12)}-${esa.slice(12, 16)}-${esa.slice(16, 20)}-${esa.slice(20)}`
}

// --- scritture -------------------------------------------------------------

let contatoreSeq = 0

async function prossimoSeq(): Promise<number> {
  if (contatoreSeq === 0) {
    const ultimo = await db.pendenti.orderBy('seq').last()
    contatoreSeq = ultimo ? ultimo.seq : 0
  }
  contatoreSeq += 1
  return contatoreSeq
}

async function segnaPendente(tabella: NomeTabella, chiave: string): Promise<void> {
  const esistente = await db.pendenti.get([tabella, chiave])
  if (esistente) {
    // Gia' in coda: la riga verra' riletta al momento dell'invio, quindi non
    // c'e' nulla da aggiornare se non azzerare un eventuale errore pregresso.
    if (esistente.ultimo_errore) {
      await db.pendenti.update([tabella, chiave], { tentativi: 0, ultimo_errore: null })
    }
    return
  }
  await db.pendenti.put({
    tabella, chiave, seq: await prossimoSeq(), tentativi: 0, ultimo_errore: null,
  })
}

/**
 * Salva una riga in locale e la mette in coda per il server.
 * `updated_at` viene timbrato qui: e' l'istante della modifica reale, anche se
 * la riga salira' fra tre ore, e quindi e' il criterio giusto per decidere
 * quale fra due versioni in conflitto e' la piu' recente.
 */
export async function salva<T extends Record<string, unknown>>(
  tabella: NomeTabella,
  riga: T,
): Promise<T> {
  const descrittore = DESCRITTORI[tabella]
  const completa = { ...riga, updated_at: adesso() } as T
  await db.transaction('rw', db[tabella], db.pendenti, async () => {
    await (db[tabella] as Table).put(completa)
    await segnaPendente(tabella, String(completa[descrittore.chiave]))
  })
  void sincronizzaInBackground()
  return completa
}

/**
 * Cancellazione logica. Una riga rimossa fisicamente non potrebbe arrivare
 * agli altri dispositivi, che se la ritroverebbero in casa alla prossima
 * sincronizzazione: percio' si marca e si lascia viaggiare.
 */
export async function elimina(tabella: NomeTabella, chiave: string): Promise<void> {
  const esistente = await (db[tabella] as Table).get(chiave)
  if (!esistente) return
  await salva(tabella, { ...(esistente as Record<string, unknown>), deleted: true })
}

// --- meta ------------------------------------------------------------------

export async function leggiMeta(chiave: string): Promise<string | null> {
  const riga = await db.meta.get(chiave)
  return riga ? riga.valore : null
}

export async function scriviMeta(chiave: string, valore: string): Promise<void> {
  await db.meta.put({ chiave, valore })
}

// Riferimento riempito da sync.ts: evita una dipendenza circolare fra i due
// moduli lasciando a db.ts il solo compito di chiedere "prova a sincronizzare".
let agganciaSync: (() => void) | null = null

export function registraSync(fn: () => void): void {
  agganciaSync = fn
}

async function sincronizzaInBackground(): Promise<void> {
  if (agganciaSync) agganciaSync()
}

/** Quante scritture aspettano di salire. Serve all'indicatore in alto. */
export function contaPendenti(): Promise<number> {
  return db.pendenti.count()
}

/** Svuota tutto il locale: usato al logout, per non lasciare dati in giro. */
export async function azzeraLocale(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
  })
  contatoreSeq = 0
}
