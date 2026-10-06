import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  costruisciScadenzario, daAdeguareAlPos, dispositiviSenzaDate, fasciaPerGiorni,
  prossimaVerifica, riepiloga,
} from '../scadenze'
import type { Cliente, Contratto, Dispositivo, Intervento } from '../types'

// Lo scadenzario e' il cuore dell'app: queste prove fissano le regole con cui
// decide che cosa mostrare e in che ordine. Il tempo e' congelato al 15 marzo
// 2026 perche' altrimenti la suite cambierebbe esito ogni giorno.

const OGGI = '2026-03-15'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 2, 15, 10, 0, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

function cliente(id: string, nome: string): Cliente {
  return {
    id, ragione_sociale: nome,
    partita_iva: null, codice_fiscale: null, codice_sdi: null, pec: null, email: null,
    telefono: null, indirizzo: null, cap: null, citta: null, provincia: null, note: null,
    attivo: true, updated_at: '', deleted: false,
  }
}

function dispositivo(parziale: Partial<Dispositivo> & { id: string }): Dispositivo {
  return {
    cliente_id: 'c1', sede_id: null, matricola: 'MAT001',
    marca: null, modello: null, provvedimento: null, tipo: 'rt',
    data_messa_servizio: null, data_ultima_verifica: null, firmware_versione: null,
    collegato_pos: false, stato: 'attivo', data_dismissione: null, note: null,
    updated_at: '', deleted: false,
    ...parziale,
  }
}

function contratto(parziale: Partial<Contratto> & { id: string }): Contratto {
  return {
    cliente_id: 'c1', tipo: 'software', descrizione: '', data_inizio: null,
    data_scadenza: '2026-06-30', periodicita: 'annuale', importo: null, licenza: null,
    rinnovo_automatico: false, stato: 'attivo', note: null,
    updated_at: '', deleted: false,
    ...parziale,
  }
}

function intervento(parziale: Partial<Intervento> & { id: string }): Intervento {
  return {
    numero: null, cliente_id: 'c1', sede_id: null, dispositivo_id: null,
    tipo: 'hardware', stato: 'chiuso', priorita: 'normale',
    data_apertura: '2026-03-01T08:00:00.000Z', data_intervento: '2026-03-01',
    ora_inizio: null, ora_fine: null, tecnico_id: null, problema: null, soluzione: null,
    ore: null, da_fatturare: true, fatturato: false, firma_base64: null, firma_nome: null,
    verifica_esito: null, verifica_sigilli: null, verifica_libretto: null,
    ade_trasmessa: false, ade_trasmessa_il: null, note: null,
    updated_at: '', deleted: false,
    ...parziale,
  }
}

const CLIENTI = [cliente('c1', 'Rossi srl'), cliente('c2', 'Bianchi snc')]

function scadenzario(opzioni: {
  dispositivi?: Dispositivo[]
  contratti?: Contratto[]
  interventi?: Intervento[]
  mesiCadenza?: number
  giorniAvviso?: number
}) {
  return costruisciScadenzario({
    dispositivi: opzioni.dispositivi ?? [],
    contratti: opzioni.contratti ?? [],
    interventi: opzioni.interventi ?? [],
    clienti: CLIENTI,
    mesiCadenza: opzioni.mesiCadenza ?? 24,
    giorniAvviso: opzioni.giorniAvviso ?? 60,
  })
}

describe('prossimaVerifica', () => {
  it('conta dall ultima verifica quando c e', () => {
    const d = dispositivo({
      id: 'd1', data_messa_servizio: '2020-01-10', data_ultima_verifica: '2024-05-20',
    })
    expect(prossimaVerifica(d, 24)).toBe('2026-05-20')
  })

  it('conta dalla messa in servizio quando la verifica manca', () => {
    const d = dispositivo({ id: 'd1', data_messa_servizio: '2024-09-01' })
    expect(prossimaVerifica(d, 24)).toBe('2026-09-01')
  })

  it('non inventa una scadenza se non ha nessuna delle due date', () => {
    expect(prossimaVerifica(dispositivo({ id: 'd1' }), 24)).toBeNull()
  })

  it('rispetta una cadenza diversa da ventiquattro mesi', () => {
    const d = dispositivo({ id: 'd1', data_ultima_verifica: '2026-01-31' })
    expect(prossimaVerifica(d, 12)).toBe('2027-01-31')
    expect(prossimaVerifica(d, 36)).toBe('2029-01-31')
  })
})

describe('fasciaPerGiorni', () => {
  it('assegna la fascia in base ai giorni che mancano', () => {
    expect(fasciaPerGiorni(-1, 60)).toBe('scaduta')
    expect(fasciaPerGiorni(0, 60)).toBe('urgente')
    expect(fasciaPerGiorni(7, 60)).toBe('urgente')
    expect(fasciaPerGiorni(8, 60)).toBe('vicina')
    expect(fasciaPerGiorni(30, 60)).toBe('vicina')
    expect(fasciaPerGiorni(31, 60)).toBe('prossima')
    expect(fasciaPerGiorni(60, 60)).toBe('prossima')
    expect(fasciaPerGiorni(61, 60)).toBe('futura')
  })

  it('segue il preavviso configurato', () => {
    expect(fasciaPerGiorni(61, 90)).toBe('prossima')
    expect(fasciaPerGiorni(91, 90)).toBe('futura')
  })
})

describe('costruisciScadenzario', () => {
  it('mette in elenco le verifiche degli apparecchi attivi', () => {
    const righe = scadenzario({
      dispositivi: [dispositivo({ id: 'd1', data_ultima_verifica: '2024-04-01' })],
    })
    expect(righe).toHaveLength(1)
    expect(righe[0]!.origine).toBe('verifica')
    expect(righe[0]!.data).toBe('2026-04-01')
    expect(righe[0]!.cliente).toBe('Rossi srl')
    expect(righe[0]!.fascia).toBe('vicina')
  })

  it('lascia fuori gli apparecchi dismessi e quelli in magazzino', () => {
    const righe = scadenzario({
      dispositivi: [
        dispositivo({ id: 'd1', stato: 'dismesso', data_ultima_verifica: '2023-01-01' }),
        dispositivo({ id: 'd2', stato: 'magazzino', data_ultima_verifica: '2023-01-01' }),
        dispositivo({ id: 'd3', stato: 'fuori_servizio', data_ultima_verifica: '2023-01-01' }),
      ],
    })
    // Un apparecchio fuori servizio va comunque verificato prima di rimetterlo
    // in funzione, quindi resta nell'elenco; gli altri due no.
    expect(righe.map((r) => r.riferimento)).toEqual(['d3'])
  })

  it('non mostra una verifica per un apparecchio senza date', () => {
    expect(scadenzario({ dispositivi: [dispositivo({ id: 'd1' })] })).toHaveLength(0)
  })

  it('mette in elenco i contratti in corso e quelli scaduti', () => {
    const righe = scadenzario({
      contratti: [
        contratto({ id: 'k1', data_scadenza: '2026-04-30', stato: 'attivo' }),
        contratto({ id: 'k2', data_scadenza: '2026-01-31', stato: 'scaduto' }),
        contratto({ id: 'k3', data_scadenza: '2026-05-31', stato: 'disdetto' }),
        contratto({ id: 'k4', data_scadenza: '2026-05-31', stato: 'rinnovato' }),
      ],
    })
    expect(righe.map((r) => r.riferimento).sort()).toEqual(['k1', 'k2'])
    expect(righe.find((r) => r.riferimento === 'k2')!.fascia).toBe('scaduta')
  })

  it('segnala le verifiche concluse e non trasmesse all Agenzia', () => {
    const righe = scadenzario({
      interventi: [
        intervento({ id: 'i1', tipo: 'verifica_periodica', stato: 'chiuso', ade_trasmessa: false, numero: 42 }),
        intervento({ id: 'i2', tipo: 'verifica_periodica', stato: 'chiuso', ade_trasmessa: true }),
        intervento({ id: 'i3', tipo: 'verifica_periodica', stato: 'in_corso', ade_trasmessa: false }),
        intervento({ id: 'i4', tipo: 'hardware', stato: 'chiuso', ade_trasmessa: false }),
      ],
    })
    expect(righe).toHaveLength(1)
    expect(righe[0]!.riferimento).toBe('i1')
    expect(righe[0]!.fascia).toBe('scaduta')
    expect(righe[0]!.dettaglio).toContain('42')
  })

  it('scrive la data dell adempimento come si legge, non in formato interno', () => {
    const righe = scadenzario({
      interventi: [
        intervento({
          id: 'i1', tipo: 'verifica_periodica', stato: 'chiuso',
          ade_trasmessa: false, data_intervento: '2026-02-09', numero: 7,
        }),
      ],
    })
    expect(righe[0]!.dettaglio).toBe('Verifica del 09/02/2026 · rapportino n. 7')
    expect(righe[0]!.dettaglio).not.toContain('2026-02-09')
  })

  it('ordina per data crescente, le cose in ritardo per prime', () => {
    const righe = scadenzario({
      dispositivi: [
        dispositivo({ id: 'd1', data_ultima_verifica: '2024-08-01' }), // scade 2026-08-01
        dispositivo({ id: 'd2', data_ultima_verifica: '2023-12-01' }), // scade 2025-12-01, in ritardo
      ],
      contratti: [contratto({ id: 'k1', data_scadenza: '2026-04-10' })],
      giorniAvviso: 200,
    })
    expect(righe.map((r) => r.riferimento)).toEqual(['d2', 'k1', 'd1'])
  })

  it('riporta il nome del cliente e dice chiaramente quando non lo trova', () => {
    const righe = scadenzario({
      dispositivi: [dispositivo({ id: 'd1', cliente_id: 'sconosciuto', data_ultima_verifica: '2024-04-01' })],
    })
    expect(righe[0]!.cliente).toBe('Cliente non trovato')
  })

  it('calcola i giorni rispetto a oggi', () => {
    const righe = scadenzario({
      contratti: [contratto({ id: 'k1', data_scadenza: OGGI })],
    })
    expect(righe[0]!.giorni).toBe(0)
    expect(righe[0]!.fascia).toBe('urgente')
  })
})

describe('elenchi di servizio', () => {
  it('trova gli apparecchi attivi con la scheda incompleta', () => {
    const elenco = dispositiviSenzaDate([
      dispositivo({ id: 'd1' }),
      dispositivo({ id: 'd2', data_messa_servizio: '2025-01-01' }),
      dispositivo({ id: 'd3', stato: 'dismesso' }),
    ])
    expect(elenco.map((d) => d.id)).toEqual(['d1'])
  })

  it('trova gli apparecchi da adeguare al collegamento con il POS', () => {
    const elenco = daAdeguareAlPos([
      dispositivo({ id: 'd1', collegato_pos: false }),
      dispositivo({ id: 'd2', collegato_pos: true }),
      dispositivo({ id: 'd3', collegato_pos: false, stato: 'dismesso' }),
      dispositivo({ id: 'd4', collegato_pos: false, tipo: 'altro' }),
    ])
    expect(elenco.map((d) => d.id)).toEqual(['d1'])
  })
})

describe('riepiloga', () => {
  it('conta per fascia senza mescolare gli adempimenti con le scadenze', () => {
    const dispositivi = [
      dispositivo({ id: 'd1', data_ultima_verifica: '2023-12-01' }), // in ritardo
      dispositivo({ id: 'd2', data_ultima_verifica: '2024-03-18' }), // fra 3 giorni
      dispositivo({ id: 'd3' }), // senza date
    ]
    const interventi = [
      intervento({ id: 'i1', tipo: 'verifica_periodica', stato: 'chiuso', ade_trasmessa: false }),
      intervento({ id: 'i2', stato: 'aperto' }),
      intervento({ id: 'i3', stato: 'in_corso' }),
    ]
    const righe = scadenzario({ dispositivi, interventi })
    const r = riepiloga(righe, dispositivi, interventi)

    expect(r.scadute).toBe(1)
    expect(r.settegiorni).toBe(1)
    expect(r.daTrasmettere).toBe(1)
    expect(r.senzaDate).toBe(1)
    expect(r.interventiAperti).toBe(2)
  })
})
