import {
  DESCRITTORI, ORDINE_TABELLE, db, leggiMeta, registraSync, scriviMeta,
  type NomeTabella,
} from './db'
import { sembraTabellaMancante, type ErroreServer } from './erroriServer'
import { configurato, sb } from './supabase'

// ============================================================================
// Sincronizzazione.
//
// Due movimenti indipendenti, in quest'ordine:
//
//   salita   -- le righe marcate in `pendenti` vengono rilette dal locale e
//               mandate su con un upsert. Si procede tabella per tabella nella
//               sequenza di ORDINE_TABELLE, cosi' i vincoli di integrita'
//               reggono anche sincronizzando un'intera giornata di lavoro
//               fatta senza rete.
//
//   discesa  -- per ogni tabella si chiede solo cio' che ha synced_at piu'
//               recente del segnalibro salvato. Non si scarica mai tutto due
//               volte, e il traffico resta proporzionale a cio' che e'
//               cambiato, non a quanto e' grande l'archivio.
//
// Regola sui conflitti: vince la scrittura con updated_at piu' recente. Una
// riga che ha ancora modifiche locali da inviare non viene sovrascritta da
// quello che arriva: prima sale la nostra versione, poi ci si riallinea.
// ============================================================================

const LIMITE_PAGINA = 500
const EPOCA = '1970-01-01T00:00:00.000Z'

/** Il secchio dello Storage dove finiscono le foto degli interventi. */
const SECCHIO_FOTO = 'foto-interventi'

// Tabelle che questo server non ha. Succede a un database creato prima che una
// tabella facoltativa esistesse: chi non ha eseguito la migrazione delle foto
// non deve perdere la sincronizzazione di tutto il resto. Si impara una volta
// per sessione; eseguita la migrazione, basta riaprire l'app.
const assenti = new Set<NomeTabella>()

/** Una tabella facoltativa che questo server non ha: si salta, non e' un guasto. */
function tabellaFacoltativaAssente(tabella: NomeTabella, errore: ErroreServer): boolean {
  return Boolean(DESCRITTORI[tabella].opzionale) && sembraTabellaMancante(errore)
}

export type StatoSync =
  | { fase: 'inattivo'; ultima: string | null; errore: string | null }
  | { fase: 'in_corso'; ultima: string | null; errore: string | null }
  | { fase: 'offline'; ultima: string | null; errore: string | null }
  | { fase: 'non_configurato'; ultima: string | null; errore: string | null }

let stato: StatoSync = { fase: 'inattivo', ultima: null, errore: null }
const ascoltatori = new Set<(s: StatoSync) => void>()

export function osservaSync(fn: (s: StatoSync) => void): () => void {
  ascoltatori.add(fn)
  fn(stato)
  return () => ascoltatori.delete(fn)
}

function aggiorna(parziale: Partial<StatoSync>): void {
  stato = { ...stato, ...parziale } as StatoSync
  for (const fn of ascoltatori) fn(stato)
}

export function statoCorrente(): StatoSync {
  return stato
}

let inEsecuzione = false
let richiestaPendente = false

/**
 * Esegue un ciclo completo. Se un ciclo e' gia' in corso ne accoda un altro:
 * salvare dieci schede di fila non apre dieci sincronizzazioni sovrapposte.
 */
export async function sincronizza(): Promise<void> {
  if (!configurato) {
    aggiorna({ fase: 'non_configurato' })
    return
  }
  if (inEsecuzione) {
    richiestaPendente = true
    return
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    aggiorna({ fase: 'offline' })
    return
  }

  const { data: sessione } = await sb.auth.getSession()
  if (!sessione.session) {
    aggiorna({ fase: 'inattivo' })
    return
  }

  inEsecuzione = true
  aggiorna({ fase: 'in_corso', errore: null })
  try {
    await salita()
    await discesa()
    aggiorna({ fase: 'inattivo', ultima: new Date().toISOString(), errore: null })
  } catch (e) {
    const messaggio = e instanceof Error ? e.message : String(e)
    aggiorna({
      fase: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'inattivo',
      errore: messaggio,
    })
  } finally {
    inEsecuzione = false
    if (richiestaPendente) {
      richiestaPendente = false
      void sincronizza()
    }
  }
}

// --- salita ----------------------------------------------------------------

async function salita(): Promise<void> {
  for (const tabella of ORDINE_TABELLE) {
    if (assenti.has(tabella)) continue
    const pendenti = await db.pendenti.where('tabella').equals(tabella).sortBy('seq')
    if (pendenti.length === 0) continue

    // Le foto hanno due pezzi: il file nello Storage e la riga nel database.
    // Il file va per primo, altrimenti il database finirebbe per descrivere
    // un'immagine che non esiste. Quelle che non riescono a salire restano in
    // coda e si riprovano, senza fermare il resto.
    const fotoRimaste = tabella === 'allegati' ? await portaSuLeFoto() : new Set<string>()

    const descrittore = DESCRITTORI[tabella]
    const righe: Record<string, unknown>[] = []
    const chiaviVive: string[] = []

    for (const p of pendenti) {
      if (fotoRimaste.has(p.chiave)) continue
      const riga = await (db[tabella] as never as { get(k: string): Promise<unknown> }).get(p.chiave)
      if (!riga) {
        // La riga non c'e' piu' in locale: la traccia non ha piu' nulla da
        // dire, la si butta.
        await db.pendenti.delete([tabella, p.chiave])
        continue
      }
      righe.push(soloCampiDaInviare(riga as Record<string, unknown>, descrittore))
      chiaviVive.push(p.chiave)
    }
    if (righe.length === 0) continue

    // A blocchi, per non costruire richieste enormi dopo un lungo periodo offline.
    for (let i = 0; i < righe.length; i += 100) {
      const blocco = righe.slice(i, i + 100)
      const chiaviBlocco = chiaviVive.slice(i, i + 100)
      const { error } = await sb
        .from(tabella)
        .upsert(blocco, { onConflict: descrittore.chiave })
      if (error) {
        if (tabellaFacoltativaAssente(tabella, error)) {
          // Il server non ha questa tabella: le righe restano in coda e le
          // altre tabelle proseguono. Non e' un guasto da sbandierare.
          assenti.add(tabella)
          console.warn(`La tabella ${tabella} non c'e' sul server: la salto.`)
          break
        }
        await segnaErrore(tabella, chiaviBlocco, error.message)
        // Fermarsi qui e non passare alle tabelle successive: se un cliente non
        // e' salito, le sue sedi non possono salire.
        throw new Error(`Invio di ${tabella} non riuscito: ${error.message}`)
      }
      await db.pendenti.bulkDelete(chiaviBlocco.map((c) => [tabella, c] as [string, string]))
    }
  }
}

/**
 * Prepara la riga da inviare togliendo due categorie di campi: quelli che
 * decide il server (rimandarli indietro li sovrascriverebbe) e quelli che
 * vivono solo qui, come l'immagine di una foto, che nel database non ci va
 * perche' il file sta nello Storage.
 */
function soloCampiDaInviare(
  riga: Record<string, unknown>,
  descrittore: { campiServer: string[]; campiLocali?: string[] },
): Record<string, unknown> {
  const fuori = new Set([...descrittore.campiServer, ...(descrittore.campiLocali ?? [])])
  const copia: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(riga)) {
    if (!fuori.has(k)) copia[k] = v
  }
  return copia
}

/**
 * Porta nello Storage le immagini non ancora caricate, e toglie da li' quelle
 * marcate come eliminate.
 *
 * Restituisce gli identificativi delle foto che NON ce l'hanno fatta: le loro
 * righe non vanno inviate, perche' descriverebbero un file che non esiste.
 * Restano in coda e si riprovano al giro successivo, esattamente come una
 * qualunque altra scrittura rimasta indietro.
 */
async function portaSuLeFoto(): Promise<Set<string>> {
  const rimaste = new Set<string>()
  const pendenti = await db.pendenti.where('tabella').equals('allegati').sortBy('seq')

  for (const p of pendenti) {
    const riga = await db.allegati.get(p.chiave)
    if (!riga) continue

    if (riga.deleted) {
      // Il file se ne va con la riga. Se non c'era gia' piu', va bene lo stesso:
      // qui conta che non resti, non che ci fosse.
      await sb.storage.from(SECCHIO_FOTO).remove([riga.percorso])
      continue
    }

    if (riga.caricato || !riga.blob) continue

    const { error } = await sb.storage
      .from(SECCHIO_FOTO)
      .upload(riga.percorso, riga.blob, {
        contentType: riga.tipo ?? 'image/jpeg',
        upsert: true,
      })

    if (error) {
      rimaste.add(riga.id)
      continue
    }
    await db.allegati.update(riga.id, { caricato: true })
  }

  return rimaste
}

/**
 * L'indirizzo con cui mostrare una foto che non abbiamo in locale. Il secchio
 * e' privato, quindi serve un collegamento firmato, che vale un'ora.
 */
export async function indirizzoFoto(percorso: string): Promise<string | null> {
  if (!configurato) return null
  const { data, error } = await sb.storage.from(SECCHIO_FOTO).createSignedUrl(percorso, 3600)
  if (error || !data) return null
  return data.signedUrl
}

async function segnaErrore(
  tabella: NomeTabella,
  chiavi: string[],
  messaggio: string,
): Promise<void> {
  await db.transaction('rw', db.pendenti, async () => {
    for (const chiave of chiavi) {
      const p = await db.pendenti.get([tabella, chiave])
      if (p) {
        await db.pendenti.update([tabella, chiave], {
          tentativi: p.tentativi + 1,
          ultimo_errore: messaggio,
        })
      }
    }
  })
}

// --- discesa ---------------------------------------------------------------

async function discesa(): Promise<void> {
  for (const tabella of ORDINE_TABELLE) {
    if (assenti.has(tabella)) continue
    const descrittore = DESCRITTORI[tabella]
    let cursore = (await leggiMeta(`pull:${tabella}`)) ?? EPOCA

    for (;;) {
      const { data, error } = await sb
        .from(tabella)
        .select('*')
        .gt('synced_at', cursore)
        .order('synced_at', { ascending: true })
        .order(descrittore.chiave, { ascending: true })
        .limit(LIMITE_PAGINA)
      if (error) {
        if (tabellaFacoltativaAssente(tabella, error)) {
          assenti.add(tabella)
          console.warn(`La tabella ${tabella} non c'e' sul server: la salto.`)
          break
        }
        throw new Error(`Lettura di ${tabella} non riuscita: ${error.message}`)
      }
      if (!data || data.length === 0) break

      await applica(tabella, data as Record<string, unknown>[])

      const ultima = data[data.length - 1] as Record<string, unknown>
      const nuovoCursore = String(ultima['synced_at'] ?? cursore)
      if (data.length < LIMITE_PAGINA) {
        cursore = nuovoCursore
        break
      }
      // Pagina piena: se tutte le righe condividono lo stesso istante si
      // avanza di un millesimo, altrimenti il ciclo non finirebbe mai.
      cursore = nuovoCursore === cursore
        ? new Date(Date.parse(cursore) + 1).toISOString()
        : nuovoCursore
    }

    // Il segnalibro si sposta solo se la tabella e' stata letta davvero.
    if (!assenti.has(tabella)) await scriviMeta(`pull:${tabella}`, cursore)
  }
}

async function applica(tabella: NomeTabella, righe: Record<string, unknown>[]): Promise<void> {
  const descrittore = DESCRITTORI[tabella]
  const tavola = db[tabella] as never as {
    put(r: unknown): Promise<unknown>
    delete(k: string): Promise<void>
    get(k: string): Promise<Record<string, unknown> | undefined>
  }

  await db.transaction('rw', db[tabella], db.pendenti, async () => {
    for (const riga of righe) {
      const chiave = String(riga[descrittore.chiave])

      // Modifiche locali non ancora salite: la nostra versione ha la
      // precedenza, si lascia stare e si riproveranno al prossimo giro.
      if (await db.pendenti.get([tabella, chiave])) continue

      if (riga['deleted'] === true) {
        await tavola.delete(chiave)
        continue
      }

      const locale = await tavola.get(chiave)
      if (locale && String(locale['updated_at'] ?? '') > String(riga['updated_at'] ?? '')) {
        // In locale c'e' qualcosa di piu' recente (per esempio e' appena
        // arrivata la nostra stessa scrittura, ma intanto l'abbiamo ritoccata).
        continue
      }
      await tavola.put(riga)
    }
  })
}

// --- avvio -----------------------------------------------------------------

let intervallo: ReturnType<typeof setInterval> | null = null

/**
 * Collega la sincronizzazione agli eventi che contano: il ritorno della rete,
 * il rientro in primo piano dell'app e un battito di sicurezza ogni due
 * minuti. Niente polling aggressivo: su rete mobile si pagherebbe in batteria.
 */
export function avviaSync(): void {
  registraSync(() => {
    void sincronizza()
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => void sincronizza())
    window.addEventListener('offline', () => aggiorna({ fase: 'offline' }))
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void sincronizza()
    })
  }

  if (intervallo) clearInterval(intervallo)
  intervallo = setInterval(() => void sincronizza(), 120_000)
  void sincronizza()
}

export function fermaSync(): void {
  if (intervallo) clearInterval(intervallo)
  intervallo = null
}

/** Rifa' la discesa da zero: utile dopo il primo accesso su un dispositivo. */
export async function ricaricaTutto(): Promise<void> {
  for (const tabella of ORDINE_TABELLE) {
    await scriviMeta(`pull:${tabella}`, EPOCA)
  }
  await sincronizza()
}
