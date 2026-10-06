// Lettura e scrittura di CSV.
//
// Scritto a mano e non delegato a una libreria perche' il caso che conta e' uno
// solo: il file che esce da Excel in italiano. Quello usa il punto e virgola
// come separatore, mette le virgolette solo quando servono e le raddoppia
// quando sono dentro al testo. Il rilevamento del separatore guarda la prima
// riga e sceglie il carattere che compare piu' volte fuori dalle virgolette.

export interface Tabella {
  intestazioni: string[]
  righe: string[][]
}

const SEPARATORI = [';', ',', '\t']

export function rilevaSeparatore(testo: string): string {
  const primaRiga = testo.split(/\r?\n/, 1)[0] ?? ''
  let migliore = ';'
  let massimo = -1
  for (const sep of SEPARATORI) {
    const quanti = contaFuoriDaVirgolette(primaRiga, sep)
    if (quanti > massimo) {
      massimo = quanti
      migliore = sep
    }
  }
  return migliore
}

function contaFuoriDaVirgolette(riga: string, carattere: string): number {
  let dentro = false
  let quanti = 0
  for (let i = 0; i < riga.length; i += 1) {
    const c = riga[i]
    if (c === '"') dentro = !dentro
    else if (!dentro && c === carattere) quanti += 1
  }
  return quanti
}

export function analizza(testo: string, separatore?: string): Tabella {
  const sep = separatore ?? rilevaSeparatore(testo)
  const righe: string[][] = []
  let corrente: string[] = []
  let campo = ''
  let dentro = false

  // Il BOM che Excel mette in testa ai file UTF-8 finirebbe dentro la prima
  // intestazione e farebbe fallire ogni confronto sul nome della colonna.
  const sorgente = testo.charCodeAt(0) === 0xfeff ? testo.slice(1) : testo

  const chiudiCampo = () => {
    corrente.push(campo)
    campo = ''
  }
  const chiudiRiga = () => {
    chiudiCampo()
    if (corrente.some((c) => c.trim() !== '')) righe.push(corrente)
    corrente = []
  }

  for (let i = 0; i < sorgente.length; i += 1) {
    const c = sorgente[i]!
    if (dentro) {
      if (c === '"') {
        if (sorgente[i + 1] === '"') {
          campo += '"'
          i += 1
        } else {
          dentro = false
        }
      } else {
        campo += c
      }
      continue
    }
    if (c === '"') {
      dentro = true
    } else if (c === sep) {
      chiudiCampo()
    } else if (c === '\n') {
      chiudiRiga()
    } else if (c !== '\r') {
      campo += c
    }
  }
  if (campo !== '' || corrente.length > 0) chiudiRiga()

  const intestazioni = (righe.shift() ?? []).map((h) => h.trim())
  return { intestazioni, righe }
}

export function esporta(intestazioni: string[], righe: (string | number | null)[][]): string {
  const cella = (v: string | number | null): string => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const linee = [intestazioni.map(cella).join(';')]
  for (const r of righe) linee.push(r.map(cella).join(';'))
  // Il BOM serve a Excel per aprire il file in UTF-8 senza storpiare gli accenti.
  return `﻿${linee.join('\r\n')}\r\n`
}

export function scarica(nomeFile: string, contenuto: string, tipo = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([contenuto], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeFile
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Accosta le colonne del file ai campi attesi. Il confronto ignora accenti,
 * maiuscole, spazi e punteggiatura, cosi' "Ragione Sociale", "ragione_sociale"
 * e "RAGIONE  SOCIALE" finiscono tutte sullo stesso campo.
 */
export function abbina(
  intestazioni: string[],
  campi: { chiave: string; etichetta: string; sinonimi?: string[] }[],
): Record<string, number> {
  const normalizza = (s: string): string =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '')

  const normalizzate = intestazioni.map(normalizza)
  const esito: Record<string, number> = {}

  for (const campo of campi) {
    const candidati = [campo.chiave, campo.etichetta, ...(campo.sinonimi ?? [])].map(normalizza)
    const indice = normalizzate.findIndex((h) => h !== '' && candidati.includes(h))
    if (indice >= 0) esito[campo.chiave] = indice
  }
  return esito
}
