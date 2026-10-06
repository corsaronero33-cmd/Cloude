import { useLiveQuery } from 'dexie-react-hooks'
import { db, salva } from './db'
import { costruisciScadenzario, riepiloga, type Scadenza } from './scadenze'
import type {
  Cliente, Contratto, Dispositivo, Impostazione, Intervento, InterventoRiga,
  Profilo, Ricambio, Sede,
} from './types'

// Lettura dei dati locali. useLiveQuery tiene le schermate agganciate a
// IndexedDB: appena la sincronizzazione scrive una riga, l'elenco a video si
// aggiorna da solo, senza ricaricare e senza invalidare cache a mano.

function vivi<T extends { deleted: boolean }>(righe: T[] | undefined): T[] {
  return (righe ?? []).filter((r) => !r.deleted)
}

export function useClienti(): Cliente[] {
  const righe = useLiveQuery(() => db.clienti.orderBy('ragione_sociale').toArray(), [])
  return vivi(righe)
}

export function useCliente(id: string | undefined): Cliente | undefined {
  return useLiveQuery(async () => (id ? db.clienti.get(id) : undefined), [id])
}

export function useSedi(clienteId?: string): Sede[] {
  const righe = useLiveQuery(
    () => (clienteId ? db.sedi.where('cliente_id').equals(clienteId).toArray() : db.sedi.toArray()),
    [clienteId],
  )
  return vivi(righe).sort((a, b) => a.nome.localeCompare(b.nome))
}

export function useDispositivi(clienteId?: string): Dispositivo[] {
  const righe = useLiveQuery(
    () =>
      clienteId
        ? db.dispositivi.where('cliente_id').equals(clienteId).toArray()
        : db.dispositivi.toArray(),
    [clienteId],
  )
  return vivi(righe).sort((a, b) => a.matricola.localeCompare(b.matricola))
}

export function useDispositivo(id: string | undefined): Dispositivo | undefined {
  return useLiveQuery(async () => (id ? db.dispositivi.get(id) : undefined), [id])
}

export function useContratti(clienteId?: string): Contratto[] {
  const righe = useLiveQuery(
    () =>
      clienteId
        ? db.contratti.where('cliente_id').equals(clienteId).toArray()
        : db.contratti.toArray(),
    [clienteId],
  )
  return vivi(righe).sort((a, b) => a.data_scadenza.localeCompare(b.data_scadenza))
}

export function useContratto(id: string | undefined): Contratto | undefined {
  return useLiveQuery(async () => (id ? db.contratti.get(id) : undefined), [id])
}

export function useInterventi(filtro?: { clienteId?: string; dispositivoId?: string }): Intervento[] {
  const clienteId = filtro?.clienteId
  const dispositivoId = filtro?.dispositivoId
  const righe = useLiveQuery(() => {
    if (dispositivoId) return db.interventi.where('dispositivo_id').equals(dispositivoId).toArray()
    if (clienteId) return db.interventi.where('cliente_id').equals(clienteId).toArray()
    return db.interventi.toArray()
  }, [clienteId, dispositivoId])
  return vivi(righe).sort(ordinaInterventi)
}

/** I piu' recenti in cima; quelli senza data di intervento contano come oggi. */
function ordinaInterventi(a: Intervento, b: Intervento): number {
  const da = a.data_intervento ?? a.data_apertura.slice(0, 10)
  const dbb = b.data_intervento ?? b.data_apertura.slice(0, 10)
  if (da !== dbb) return dbb.localeCompare(da)
  return (b.numero ?? 0) - (a.numero ?? 0)
}

export function useIntervento(id: string | undefined): Intervento | undefined {
  return useLiveQuery(async () => (id ? db.interventi.get(id) : undefined), [id])
}

export function useRighe(interventoId: string | undefined): InterventoRiga[] {
  const righe = useLiveQuery(
    () =>
      interventoId
        ? db.intervento_righe.where('intervento_id').equals(interventoId).toArray()
        : Promise.resolve([] as InterventoRiga[]),
    [interventoId],
  )
  return vivi(righe)
}

export function useRicambi(): Ricambio[] {
  const righe = useLiveQuery(() => db.ricambi.orderBy('codice').toArray(), [])
  return vivi(righe)
}

export function useProfili(): Profilo[] {
  const righe = useLiveQuery(() => db.profiles.toArray(), [])
  return vivi(righe).sort((a, b) => a.nome.localeCompare(b.nome))
}

// --- impostazioni ----------------------------------------------------------

export interface Impostazioni {
  valori: Record<string, string>
  /** Cadenza della verifica periodica, in mesi. Oggi la norma dice 24. */
  mesiCadenza: number
  /** Da quanti giorni prima una scadenza compare fra quelle "in arrivo". */
  giorniAvviso: number
  imposta: (chiave: string, valore: string) => Promise<void>
}

export function useImpostazioni(): Impostazioni {
  const righe = useLiveQuery(() => db.impostazioni.toArray(), [])
  const valori: Record<string, string> = {}
  for (const r of righe ?? []) if (!r.deleted) valori[r.chiave] = r.valore

  const numero = (chiave: string, difetto: number): number => {
    const n = Number(valori[chiave])
    return Number.isFinite(n) && n > 0 ? n : difetto
  }

  return {
    valori,
    mesiCadenza: numero('mesi_verifica', 24),
    giorniAvviso: numero('giorni_avviso', 60),
    imposta: async (chiave: string, valore: string) => {
      const riga: Impostazione = { chiave, valore, updated_at: '', deleted: false }
      await salva('impostazioni', riga as unknown as Record<string, unknown>)
    },
  }
}

// --- scadenzario -----------------------------------------------------------

export function useScadenzario(): {
  scadenze: Scadenza[]
  riepilogo: ReturnType<typeof riepiloga>
  dispositivi: Dispositivo[]
  interventi: Intervento[]
} {
  const dispositivi = useDispositivi()
  const contratti = useContratti()
  const interventi = useInterventi()
  const clienti = useClienti()
  const { mesiCadenza, giorniAvviso } = useImpostazioni()

  const scadenze = costruisciScadenzario({
    dispositivi, contratti, interventi, clienti, mesiCadenza, giorniAvviso,
  })

  return { scadenze, riepilogo: riepiloga(scadenze, dispositivi, interventi), dispositivi, interventi }
}
