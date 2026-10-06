import { aggiungiMesi, formatta, giorniTra, oggi } from './dates'
import type { Cliente, Contratto, Dispositivo, Intervento } from './types'
import { ETICHETTE_TIPO_CONTRATTO } from './types'

// ============================================================================
// Lo scadenzario unificato.
//
// E' il motivo per cui questa app esiste. Tre cose con natura diversa -- le
// verifiche periodiche dei registratori, i rinnovi degli abbonamenti e le
// verifiche svolte ma non ancora trasmesse all'Agenzia -- finiscono in un'unica
// lista ordinata per data, perche' la domanda vera non e' "quali RT devo
// verificare" ma "che cosa devo fare questa settimana".
//
// Tutto il calcolo avviene in memoria sui dati locali: lo scadenzario si apre
// identico con o senza rete.
// ============================================================================

export type Origine = 'verifica' | 'contratto' | 'trasmissione'

export type Fascia = 'scaduta' | 'urgente' | 'vicina' | 'prossima' | 'futura'

export interface Scadenza {
  /** Chiave stabile, utile a React e alle liste. */
  chiave: string
  origine: Origine
  riferimento: string
  cliente_id: string
  cliente: string
  titolo: string
  dettaglio: string
  data: string
  giorni: number
  fascia: Fascia
  importo: number | null
}

export const ETICHETTE_FASCIA: Record<Fascia, string> = {
  scaduta: 'Scadute',
  urgente: 'Entro una settimana',
  vicina: 'Entro il mese',
  prossima: 'In arrivo',
  futura: 'Più avanti',
}

/** Gli stati per cui una verifica periodica ha ancora senso. */
const STATI_DA_VERIFICARE = new Set(['attivo', 'fuori_servizio'])

/** Gli stati di contratto che vanno ancora seguiti. */
const STATI_DA_SEGUIRE = new Set(['attivo', 'scaduto'])

/**
 * La prossima verifica periodica di un apparecchio.
 *
 * Si parte dall'ultima verifica registrata; se non ce n'e' nessuna si parte
 * dalla messa in servizio, perche' il conto decorre da quella. Se mancano
 * entrambe le date non si inventa niente e si restituisce null: l'apparecchio
 * finira' nell'elenco dei dati da completare, che e' l'unica risposta onesta.
 */
export function prossimaVerifica(d: Dispositivo, mesiCadenza: number): string | null {
  const base = d.data_ultima_verifica ?? d.data_messa_servizio
  if (!base) return null
  return aggiungiMesi(base, mesiCadenza)
}

export function fasciaPerGiorni(giorni: number, giorniAvviso: number): Fascia {
  if (giorni < 0) return 'scaduta'
  if (giorni <= 7) return 'urgente'
  if (giorni <= 30) return 'vicina'
  if (giorni <= giorniAvviso) return 'prossima'
  return 'futura'
}

export interface IngressiScadenzario {
  dispositivi: Dispositivo[]
  contratti: Contratto[]
  interventi: Intervento[]
  clienti: Cliente[]
  mesiCadenza: number
  giorniAvviso: number
}

/**
 * Costruisce la lista completa, ordinata per data crescente: prima le cose in
 * ritardo, poi quelle che arrivano.
 */
export function costruisciScadenzario(ing: IngressiScadenzario): Scadenza[] {
  const giorno = oggi()
  const nomi = new Map(ing.clienti.map((c) => [c.id, c.ragione_sociale]))
  const nomeDi = (id: string): string => nomi.get(id) ?? 'Cliente non trovato'
  const risultato: Scadenza[] = []

  for (const d of ing.dispositivi) {
    if (!STATI_DA_VERIFICARE.has(d.stato)) continue
    const data = prossimaVerifica(d, ing.mesiCadenza)
    if (!data) continue
    const giorni = giorniTra(giorno, data)
    risultato.push({
      chiave: `verifica:${d.id}`,
      origine: 'verifica',
      riferimento: d.id,
      cliente_id: d.cliente_id,
      cliente: nomeDi(d.cliente_id),
      titolo: 'Verifica periodica',
      dettaglio: descriviDispositivo(d),
      data,
      giorni,
      fascia: fasciaPerGiorni(giorni, ing.giorniAvviso),
      importo: null,
    })
  }

  for (const c of ing.contratti) {
    if (!STATI_DA_SEGUIRE.has(c.stato)) continue
    const giorni = giorniTra(giorno, c.data_scadenza)
    risultato.push({
      chiave: `contratto:${c.id}`,
      origine: 'contratto',
      riferimento: c.id,
      cliente_id: c.cliente_id,
      cliente: nomeDi(c.cliente_id),
      titolo: ETICHETTE_TIPO_CONTRATTO[c.tipo],
      dettaglio: c.descrizione || (c.licenza ? `Licenza ${c.licenza}` : ''),
      data: c.data_scadenza,
      giorni,
      fascia: fasciaPerGiorni(giorni, ing.giorniAvviso),
      importo: c.importo,
    })
  }

  // Verifiche concluse e non ancora trasmesse a Fatture e Corrispettivi.
  // Non e' una scadenza nel senso del calendario, ma e' esattamente il tipo di
  // adempimento che si dimentica e che poi costa caro, quindi sta qui in mezzo
  // alle altre cose da fare.
  for (const i of ing.interventi) {
    if (i.tipo !== 'verifica_periodica') continue
    if (i.stato !== 'chiuso') continue
    if (i.ade_trasmessa) continue
    const data = i.data_intervento ?? giorno
    const giorni = giorniTra(giorno, data)
    risultato.push({
      chiave: `trasmissione:${i.id}`,
      origine: 'trasmissione',
      riferimento: i.id,
      cliente_id: i.cliente_id,
      cliente: nomeDi(i.cliente_id),
      titolo: 'Da trasmettere ad AdE',
      dettaglio: `Verifica del ${formatta(data)}${i.numero ? ` · rapportino n. ${i.numero}` : ''}`,
      data,
      giorni: Math.min(giorni, 0),
      fascia: 'scaduta',
      importo: null,
    })
  }

  risultato.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : a.cliente.localeCompare(b.cliente)))
  return risultato
}

export function descriviDispositivo(d: Dispositivo): string {
  const pezzi = [d.marca, d.modello].filter(Boolean).join(' ')
  return pezzi ? `${pezzi} · matricola ${d.matricola}` : `Matricola ${d.matricola}`
}

/**
 * Apparecchi attivi di cui non si conosce ne' l'ultima verifica ne' la messa in
 * servizio: non possono comparire nello scadenzario e vanno sistemati a mano.
 * Tenerli in vista e' parte del lavoro, non un dettaglio.
 */
export function dispositiviSenzaDate(dispositivi: Dispositivo[]): Dispositivo[] {
  return dispositivi.filter(
    (d) => STATI_DA_VERIFICARE.has(d.stato) && !d.data_ultima_verifica && !d.data_messa_servizio,
  )
}

/**
 * Apparecchi attivi non ancora segnati come collegati al POS: e' la lista di
 * lavoro per l'adeguamento, cliente per cliente.
 */
export function daAdeguareAlPos(dispositivi: Dispositivo[]): Dispositivo[] {
  return dispositivi.filter((d) => d.stato === 'attivo' && d.tipo !== 'altro' && !d.collegato_pos)
}

export interface Riepilogo {
  scadute: number
  settegiorni: number
  trentagiorni: number
  daTrasmettere: number
  senzaDate: number
  interventiAperti: number
}

export function riepiloga(
  scadenze: Scadenza[],
  dispositivi: Dispositivo[],
  interventi: Intervento[],
): Riepilogo {
  return {
    scadute: scadenze.filter((s) => s.origine !== 'trasmissione' && s.fascia === 'scaduta').length,
    settegiorni: scadenze.filter((s) => s.fascia === 'urgente').length,
    trentagiorni: scadenze.filter((s) => s.fascia === 'vicina').length,
    daTrasmettere: scadenze.filter((s) => s.origine === 'trasmissione').length,
    senzaDate: dispositiviSenzaDate(dispositivi).length,
    interventiAperti: interventi.filter(
      (i) => i.stato === 'aperto' || i.stato === 'in_corso' || i.stato === 'sospeso',
    ).length,
  }
}
