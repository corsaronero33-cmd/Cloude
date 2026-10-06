import { aggiungiGiorni, aggiungiMesi, oggi } from './dates'
import { db, nuovoId, salva } from './db'
import type { Cliente, Contratto, Dispositivo, Intervento, Sede } from './types'

// Dati di esempio per provare l'app con qualcosa dentro.
//
// Le date sono tutte relative al giorno in cui si preme il pulsante, cosi' lo
// scadenzario e' sempre significativo: qualcosa in ritardo, qualcosa questa
// settimana, qualcosa piu' avanti. Serve a capire se l'impianto funziona prima
// di passare una serata a inserire l'archivio vero.
//
// Disponibile solo quando il server non e' configurato: su un archivio vero
// questi nomi inventati non devono poter entrare.

function cliente(nome: string, p: Partial<Cliente> = {}): Cliente {
  return {
    id: nuovoId(), ragione_sociale: nome,
    partita_iva: null, codice_fiscale: null, codice_sdi: null, pec: null,
    email: null, telefono: null, indirizzo: null, cap: null, citta: null,
    provincia: null, note: null, attivo: true, updated_at: '', deleted: false,
    ...p,
  }
}

function dispositivo(clienteId: string, p: Partial<Dispositivo> & { matricola: string }): Dispositivo {
  return {
    id: nuovoId(), cliente_id: clienteId, sede_id: null,
    marca: null, modello: null, provvedimento: null, tipo: 'rt',
    data_messa_servizio: null, data_ultima_verifica: null, firmware_versione: null,
    collegato_pos: false, stato: 'attivo', data_dismissione: null, note: null,
    updated_at: '', deleted: false,
    ...p,
  }
}

function contratto(clienteId: string, p: Partial<Contratto> & { data_scadenza: string }): Contratto {
  return {
    id: nuovoId(), cliente_id: clienteId, tipo: 'software', descrizione: '',
    data_inizio: null, periodicita: 'annuale', importo: null, licenza: null,
    rinnovo_automatico: false, stato: 'attivo', note: null,
    updated_at: '', deleted: false,
    ...p,
  }
}

function intervento(clienteId: string, p: Partial<Intervento>): Intervento {
  return {
    id: nuovoId(), numero: null, cliente_id: clienteId, sede_id: null, dispositivo_id: null,
    tipo: 'hardware', stato: 'chiuso', priorita: 'normale',
    data_apertura: new Date().toISOString(), data_intervento: oggi(),
    ora_inizio: null, ora_fine: null, tecnico_id: null,
    problema: null, soluzione: null, ore: null,
    da_fatturare: true, fatturato: false, firma_base64: null, firma_nome: null,
    verifica_esito: null, verifica_sigilli: null, verifica_libretto: null,
    ade_trasmessa: false, ade_trasmessa_il: null, note: null,
    updated_at: '', deleted: false,
    ...p,
  }
}

/** Vero se nell'archivio locale c'e' gia' qualcosa. */
export async function archivioVuoto(): Promise<boolean> {
  const quanti = await db.clienti.count()
  return quanti === 0
}

export async function caricaDatiEsempio(): Promise<void> {
  const g = oggi()

  const bar = cliente('Bar Centrale di Rossi snc', {
    partita_iva: '01234567890', citta: 'Nizza Monferrato', provincia: 'AT',
    indirizzo: 'Corso Asti 14', cap: '14049', telefono: '0141 721456',
    email: 'barcentrale@esempio.it',
  })
  const panificio = cliente('Panificio Bianchi', {
    partita_iva: '02345678901', citta: 'Canelli', provincia: 'AT',
    indirizzo: 'Via Roma 3', telefono: '0141 823190',
  })
  const supermercato = cliente('Alimentari Verdi srl', {
    partita_iva: '03456789012', citta: 'Asti', provincia: 'AT',
    indirizzo: 'Viale Partigiani 88', telefono: '0141 594100',
  })
  const tabaccheria = cliente('Tabaccheria Neri', {
    partita_iva: '04567890123', citta: 'Costigliole d’Asti', provincia: 'AT',
  })
  const ristorante = cliente('Trattoria del Borgo', {
    partita_iva: '05678901234', citta: 'Nizza Monferrato', provincia: 'AT',
    note: 'Chiuso il lunedì. Chiamare prima di passare.',
  })

  const clienti = [bar, panificio, supermercato, tabaccheria, ristorante]
  for (const c of clienti) await salva('clienti', c as unknown as Record<string, unknown>)

  const sede: Sede = {
    id: nuovoId(), cliente_id: supermercato.id, nome: 'Punto vendita di corso Alba',
    indirizzo: 'Corso Alba 102', cap: '14100', citta: 'Asti', provincia: 'AT',
    telefono: null, referente: 'Sig.ra Verdi', note: null,
    updated_at: '', deleted: false,
  }
  await salva('sedi', sede as unknown as Record<string, unknown>)

  const dispositivi: Dispositivo[] = [
    // in ritardo di quasi tre settimane
    dispositivo(bar.id, {
      matricola: '1ABC2100345', marca: 'Epson', modello: 'FP-81 II',
      provvedimento: '12345/2019', data_messa_servizio: aggiungiMesi(g, -56),
      data_ultima_verifica: aggiungiGiorni(aggiungiMesi(g, -24), -19),
      firmware_versione: '1.8.3', collegato_pos: false,
    }),
    // scade fra quattro giorni
    dispositivo(panificio.id, {
      matricola: '2DEF2200781', marca: 'RCH', modello: 'Print F',
      data_ultima_verifica: aggiungiGiorni(aggiungiMesi(g, -24), 4),
      collegato_pos: true,
    }),
    // scade fra tre settimane
    dispositivo(supermercato.id, {
      matricola: '3GHI2301122', marca: 'Custom', modello: 'K3',
      sede_id: sede.id,
      data_ultima_verifica: aggiungiGiorni(aggiungiMesi(g, -24), 21),
      collegato_pos: false, firmware_versione: '2.1.0',
    }),
    // scade fra due mesi
    dispositivo(supermercato.id, {
      matricola: '3GHI2301123', marca: 'Custom', modello: 'K3',
      sede_id: sede.id,
      data_ultima_verifica: aggiungiGiorni(aggiungiMesi(g, -22), 0),
      collegato_pos: true,
    }),
    // mai verificato, messo in servizio ventitre mesi fa
    dispositivo(tabaccheria.id, {
      matricola: '4JKL2400567', marca: 'Olivetti', modello: 'Form 100',
      data_messa_servizio: aggiungiMesi(g, -23), collegato_pos: false,
    }),
    // scheda incompleta: finisce fra i dati da sistemare
    dispositivo(ristorante.id, {
      matricola: '5MNO2200999', marca: 'Epson', modello: 'FP-81 II',
      note: 'Matricola presa dal libretto, date da verificare in sede.',
    }),
    // dismesso: non deve comparire nello scadenzario
    dispositivo(bar.id, {
      matricola: '0XYZ1800111', marca: 'Epson', modello: 'FP-90',
      stato: 'dismesso', data_dismissione: aggiungiMesi(g, -8),
      data_ultima_verifica: aggiungiMesi(g, -40),
    }),
  ]
  for (const d of dispositivi) await salva('dispositivi', d as unknown as Record<string, unknown>)

  const contratti: Contratto[] = [
    contratto(bar.id, {
      tipo: 'software', descrizione: 'Gestionale bar, 2 postazioni',
      data_scadenza: aggiungiGiorni(g, -6), importo: 380, licenza: 'GB-2024-0071',
      data_inizio: aggiungiMesi(g, -12), stato: 'scaduto',
    }),
    contratto(panificio.id, {
      tipo: 'software', descrizione: 'Gestionale negozio',
      data_scadenza: aggiungiGiorni(g, 12), importo: 290, licenza: 'GN-2025-0132',
      data_inizio: aggiungiMesi(g, -12), rinnovo_automatico: true,
    }),
    contratto(supermercato.id, {
      tipo: 'assistenza', descrizione: 'Assistenza full 4 casse',
      data_scadenza: aggiungiGiorni(g, 25), importo: 1200,
      data_inizio: aggiungiMesi(g, -11),
    }),
    contratto(tabaccheria.id, {
      tipo: 'canone_rt', descrizione: 'Canone RT annuale',
      data_scadenza: aggiungiGiorni(g, 48), importo: 90,
    }),
    contratto(ristorante.id, {
      tipo: 'software', descrizione: 'Comande su tablet',
      data_scadenza: aggiungiGiorni(g, 95), importo: 540, licenza: 'CT-2025-0044',
    }),
  ]
  for (const k of contratti) await salva('contratti', k as unknown as Record<string, unknown>)

  const interventi: Intervento[] = [
    // verifica fatta, non ancora trasmessa: e' l'adempimento arretrato
    intervento(panificio.id, {
      tipo: 'verifica_periodica', stato: 'chiuso',
      dispositivo_id: dispositivi[1]!.id,
      data_intervento: aggiungiGiorni(g, -9),
      verifica_esito: 'regolare', verifica_sigilli: 'integri, n. 4',
      verifica_libretto: 'pag. 12',
      problema: 'Verifica periodica biennale.',
      soluzione: 'Controllo memoria permanente e sigilli. Esito regolare.',
      ore: 1, ade_trasmessa: false,
    }),
    intervento(bar.id, {
      tipo: 'hardware', stato: 'aperto', priorita: 'alta',
      dispositivo_id: dispositivi[0]!.id,
      data_intervento: g,
      problema: 'La stampante non taglia lo scontrino, carta inceppata a ogni chiusura.',
    }),
    intervento(supermercato.id, {
      tipo: 'software', stato: 'in_corso',
      data_intervento: aggiungiGiorni(g, -1),
      problema: 'Listino non si aggiorna sulla cassa 3.',
      soluzione: 'Riallineato il database, in attesa di conferma dal cliente.',
      ore: 1.5,
    }),
    intervento(ristorante.id, {
      tipo: 'installazione', stato: 'chiuso',
      data_intervento: aggiungiGiorni(g, -34),
      problema: 'Nuovo registratore telematico.',
      soluzione: 'Installato e messo in servizio, personale formato.',
      ore: 3, da_fatturare: true, fatturato: true,
    }),
  ]
  for (const i of interventi) await salva('interventi', i as unknown as Record<string, unknown>)
}
