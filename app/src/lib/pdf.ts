import type { jsPDF } from 'jspdf'
import { formatta } from './dates'
import { ETICHETTE_TIPO_INTERVENTO } from './types'
import type { Cliente, Dispositivo, Intervento, InterventoRiga, Sede } from './types'

// Rapportino in PDF, generato interamente sul dispositivo: jsPDF non chiama
// nessun servizio, quindi il foglio si produce e si consegna al cliente anche
// in un negozio senza copertura. Niente tabelle automatiche e niente font
// esterni, cosi' il risultato e' identico su qualunque telefono.
//
// jsPDF viene caricato con un import dinamico: da solo pesa quanto tutto il
// resto dell'app, e chi apre lo scadenzario al mattino non ha motivo di
// scaricarlo. Arriva al primo rapportino che si stampa, e da quel momento il
// service worker lo tiene in cache anche per le volte in cui non c'e' rete.

export interface DatiRapportino {
  intervento: Intervento
  cliente: Cliente | undefined
  sede: Sede | undefined
  dispositivo: Dispositivo | undefined
  righe: InterventoRiga[]
  tecnico: string
  azienda: Record<string, string>
}

const MARGINE = 15
const LARGHEZZA = 210
const UTILE = LARGHEZZA - MARGINE * 2

export async function generaRapportino(d: DatiRapportino): Promise<jsPDF> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGINE

  // --- intestazione dell'azienda -------------------------------------------
  doc.setFont('helvetica', 'bold').setFontSize(13)
  doc.text(d.azienda['azienda_nome'] || 'Centro di assistenza tecnica', MARGINE, y)
  y += 5
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(90)
  for (const riga of [
    d.azienda['azienda_indirizzo'],
    [
      d.azienda['azienda_piva'] && `P.IVA ${d.azienda['azienda_piva']}`,
      d.azienda['azienda_telefono'],
      d.azienda['azienda_email'],
    ].filter(Boolean).join(' · '),
    d.azienda['azienda_laboratorio'] && `Laboratorio abilitato: ${d.azienda['azienda_laboratorio']}`,
  ]) {
    if (!riga) continue
    doc.text(riga, MARGINE, y)
    y += 4
  }

  doc.setTextColor(0)
  const titolo = d.intervento.tipo === 'verifica_periodica'
    ? 'VERBALE DI VERIFICA PERIODICA'
    : 'RAPPORTINO DI INTERVENTO'
  doc.setFont('helvetica', 'bold').setFontSize(11)
  doc.text(titolo, LARGHEZZA - MARGINE, MARGINE, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(9)
  doc.text(
    `n. ${d.intervento.numero ?? 'bozza'} del ${formatta(d.intervento.data_intervento) || '—'}`,
    LARGHEZZA - MARGINE,
    MARGINE + 5,
    { align: 'right' },
  )

  y = Math.max(y, MARGINE + 12) + 3
  y = linea(doc, y)

  // --- cliente e apparecchio ------------------------------------------------
  y = blocco(doc, y, 'Cliente', [
    d.cliente?.ragione_sociale ?? '—',
    [d.cliente?.indirizzo, d.cliente?.cap, d.cliente?.citta, d.cliente?.provincia && `(${d.cliente.provincia})`]
      .filter(Boolean).join(' '),
    d.cliente?.partita_iva ? `P.IVA ${d.cliente.partita_iva}` : '',
    d.sede ? `Sede: ${d.sede.nome}${d.sede.indirizzo ? ` — ${d.sede.indirizzo}` : ''}` : '',
  ])

  if (d.dispositivo) {
    y = blocco(doc, y, 'Apparecchio', [
      `Matricola ${d.dispositivo.matricola}`,
      [d.dispositivo.marca, d.dispositivo.modello].filter(Boolean).join(' '),
      d.dispositivo.provvedimento ? `Provvedimento ${d.dispositivo.provvedimento}` : '',
      d.dispositivo.firmware_versione ? `Firmware ${d.dispositivo.firmware_versione}` : '',
      d.dispositivo.data_messa_servizio
        ? `Messa in servizio ${formatta(d.dispositivo.data_messa_servizio)}` : '',
    ])
  }

  // --- intervento -----------------------------------------------------------
  y = blocco(doc, y, 'Tipo di intervento', [
    ETICHETTE_TIPO_INTERVENTO[d.intervento.tipo],
    [
      d.intervento.ora_inizio && d.intervento.ora_fine
        ? `Orario ${d.intervento.ora_inizio} – ${d.intervento.ora_fine}` : '',
      d.intervento.ore != null ? `Ore ${d.intervento.ore}` : '',
      d.tecnico ? `Tecnico: ${d.tecnico}` : '',
    ].filter(Boolean).join('   ·   '),
  ])

  if (d.intervento.problema) y = blocco(doc, y, 'Problema rilevato', [d.intervento.problema])
  if (d.intervento.soluzione) y = blocco(doc, y, 'Lavoro eseguito', [d.intervento.soluzione])

  if (d.intervento.tipo === 'verifica_periodica') {
    y = blocco(doc, y, 'Esito della verifica', [
      d.intervento.verifica_esito === 'regolare'
        ? 'REGOLARE — apparecchio conforme'
        : d.intervento.verifica_esito === 'irregolare'
          ? 'IRREGOLARE'
          : 'non indicato',
      d.intervento.verifica_sigilli ? `Sigilli: ${d.intervento.verifica_sigilli}` : '',
      d.intervento.verifica_libretto ? `Libretto fiscale: ${d.intervento.verifica_libretto}` : '',
      d.intervento.ade_trasmessa
        ? `Trasmesso all'Agenzia delle Entrate il ${formatta(d.intervento.ade_trasmessa_il)}`
        : 'Trasmissione all’Agenzia delle Entrate: da effettuare',
    ])
  }

  // --- righe ----------------------------------------------------------------
  if (d.righe.length > 0) {
    y = etichetta(doc, y, 'Materiali e prestazioni')
    doc.setFontSize(9)
    let totale = 0
    for (const r of d.righe) {
      y = spazio(doc, y, 5)
      const importo = (r.prezzo_unitario ?? 0) * r.quantita
      totale += importo
      doc.text(`${r.quantita} × ${r.descrizione || r.tipo}`, MARGINE + 2, y)
      if (r.prezzo_unitario != null) {
        doc.text(euro(importo), LARGHEZZA - MARGINE, y, { align: 'right' })
      }
      y += 1
    }
    if (totale > 0) {
      y = spazio(doc, y, 6)
      doc.setFont('helvetica', 'bold')
      doc.text('Totale', MARGINE + 2, y)
      doc.text(euro(totale), LARGHEZZA - MARGINE, y, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      y += 1
    }
    y += 3
  }

  if (d.intervento.note) y = blocco(doc, y, 'Note', [d.intervento.note])

  // --- firma ----------------------------------------------------------------
  y = spazio(doc, y, 40)
  y = linea(doc, y)
  doc.setFontSize(8.5).setTextColor(90)
  doc.text('Firma del cliente per accettazione del lavoro svolto', MARGINE, y + 4)
  doc.setTextColor(0)
  if (d.intervento.firma_base64) {
    try {
      doc.addImage(d.intervento.firma_base64, 'PNG', MARGINE, y + 6, 70, 24)
    } catch {
      // Un'immagine illeggibile non deve impedire la stampa del rapportino.
    }
  }
  if (d.intervento.firma_nome) {
    doc.setFontSize(9)
    doc.text(d.intervento.firma_nome, MARGINE, y + 34)
  }
  doc.setFontSize(8.5).setTextColor(90)
  doc.text('Il tecnico', LARGHEZZA - MARGINE - 60, y + 4)
  doc.setTextColor(0).setFontSize(9)
  doc.text(d.tecnico || '', LARGHEZZA - MARGINE - 60, y + 34)

  return doc
}

export function nomeFileRapportino(i: Intervento, cliente: Cliente | undefined): string {
  const pezzi = [
    'rapportino',
    i.numero ? String(i.numero) : i.id.slice(0, 8),
    (cliente?.ragione_sociale ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  ].filter(Boolean)
  return `${pezzi.join('-')}.pdf`
}

// --- aiutanti di impaginazione ---------------------------------------------

function euro(n: number): string {
  return `€ ${n.toFixed(2).replace('.', ',')}`
}

function linea(doc: jsPDF, y: number): number {
  doc.setDrawColor(200)
  doc.line(MARGINE, y, LARGHEZZA - MARGINE, y)
  return y + 5
}

function etichetta(doc: jsPDF, y: number, testo: string): number {
  y = spazio(doc, y, 8)
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(110)
  doc.text(testo.toUpperCase(), MARGINE, y)
  doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(0)
  return y + 4
}

function blocco(doc: jsPDF, y: number, titolo: string, righe: (string | undefined)[]): number {
  y = etichetta(doc, y, titolo)
  for (const riga of righe) {
    if (!riga) continue
    for (const spezzata of doc.splitTextToSize(riga, UTILE - 2) as string[]) {
      y = spazio(doc, y, 5)
      doc.text(spezzata, MARGINE + 2, y)
      y += 0.5
    }
  }
  return y + 3
}

/** Manda a pagina nuova se lo spazio richiesto non entra piu'. */
function spazio(doc: jsPDF, y: number, richiesto: number): number {
  if (y + richiesto > 285) {
    doc.addPage()
    return MARGINE + 4
  }
  return y + richiesto - 1
}

/** Genera e consegna il file al browser. E' quello che chiama l'interfaccia. */
export async function scaricaRapportino(d: DatiRapportino): Promise<void> {
  const doc = await generaRapportino(d)
  doc.save(nomeFileRapportino(d.intervento, d.cliente))
}
