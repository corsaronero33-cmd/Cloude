import { describe, expect, it } from 'vitest'
import {
  corpoHtml, corpoTesto, esc, euro, formattaData, oggetto, quantoManca, raggruppa, riepiloga,
  type RigaScadenza,
} from './messaggio'

// L'email parte da sola alle sette del mattino e nessuno la rilegge prima che
// arrivi: queste prove sono l'unico momento in cui qualcuno la guarda davvero.

function riga(p: Partial<RigaScadenza> & { giorni: number }): RigaScadenza {
  return {
    origine: 'verifica',
    riferimento: 'r1',
    cliente_id: 'c1',
    cliente: 'Bar Centrale',
    titolo: 'Verifica periodica',
    dettaglio: 'Epson FP-81 · matricola RT001',
    data: '2026-03-20',
    importo: null,
    ...p,
  }
}

describe('riepiloga', () => {
  it('conta per fascia tenendo fuori gli adempimenti dalle scadenze', () => {
    const r = riepiloga([
      riga({ giorni: -5 }),
      riga({ giorni: -1 }),
      riga({ giorni: 3 }),
      riga({ giorni: 20 }),
      riga({ giorni: 45 }),
      riga({ giorni: -10, origine: 'trasmissione' }),
    ])
    expect(r).toEqual({
      scadute: 2, entroSette: 1, entroTrenta: 1, daTrasmettere: 1, totale: 6,
    })
  })

  it('tratta oggi e il settimo giorno come urgenti', () => {
    const r = riepiloga([riga({ giorni: 0 }), riga({ giorni: 7 }), riga({ giorni: 8 })])
    expect(r.entroSette).toBe(2)
    expect(r.entroTrenta).toBe(1)
  })
})

describe('oggetto', () => {
  it('dice tutto nell oggetto, perche e quello che si legge sul telefono', () => {
    expect(oggetto(riepiloga([riga({ giorni: -2 }), riga({ giorni: 3 })])))
      .toBe('Scadenze: 1 scaduta · 1 entro 7 giorni')
  })

  it('usa il plurale quando serve', () => {
    expect(oggetto(riepiloga([riga({ giorni: -2 }), riga({ giorni: -3 })])))
      .toBe('Scadenze: 2 scadute')
  })

  it('segnala a parte gli adempimenti da trasmettere', () => {
    expect(oggetto(riepiloga([riga({ giorni: -1, origine: 'trasmissione' })])))
      .toBe('Scadenze: 1 da trasmettere')
  })

  it('ripiega sul mese quando non c e nulla di urgente', () => {
    expect(oggetto(riepiloga([riga({ giorni: 20 })]))).toBe('Scadenze: 1 entro il mese')
  })

  it('lo dice chiaramente quando non c e niente', () => {
    expect(oggetto(riepiloga([]))).toBe('Scadenze: nulla in vista')
  })
})

describe('raggruppa', () => {
  it('mette gli adempimenti per primi e salta i gruppi vuoti', () => {
    const gruppi = raggruppa([
      riga({ giorni: 20 }),
      riga({ giorni: -3 }),
      riga({ giorni: -1, origine: 'trasmissione' }),
    ])
    expect(gruppi.map((g) => g.titolo)).toEqual([
      "Da trasmettere all'Agenzia delle Entrate",
      'In ritardo',
      'Entro il mese',
    ])
  })

  it('non perde nessuna riga per strada', () => {
    const righe = [-40, -1, 0, 7, 8, 30, 31, 400].map((giorni) => riga({ giorni }))
    const totale = raggruppa(righe).reduce((s, g) => s + g.righe.length, 0)
    expect(totale).toBe(righe.length)
  })
})

describe('formattaData e quantoManca', () => {
  it('scrive le date come si leggono', () => {
    expect(formattaData('2026-03-20')).toBe('20/03/2026')
    expect(formattaData('2026-03-20T10:00:00Z')).toBe('20/03/2026')
  })

  it('usa le parole giuste', () => {
    expect(quantoManca(0, 'verifica')).toBe('oggi')
    expect(quantoManca(1, 'verifica')).toBe('domani')
    expect(quantoManca(-1, 'verifica')).toBe('da ieri')
    expect(quantoManca(5, 'verifica')).toBe('fra 5 giorni')
    expect(quantoManca(-5, 'verifica')).toBe('da 5 giorni')
  })

  it('per un adempimento arretrato non ha senso contare i giorni', () => {
    expect(quantoManca(-30, 'trasmissione')).toBe('in attesa')
  })
})

describe('esc', () => {
  it('rende innocuo quello che arriva dall archivio', () => {
    expect(esc('Rossi & Figli')).toBe('Rossi &amp; Figli')
    expect(esc('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(esc('dice "si"')).toBe('dice &quot;si&quot;')
    expect(esc(null)).toBe('')
  })
})

describe('euro', () => {
  it('scrive gli importi alla maniera italiana', () => {
    expect(euro(480)).toBe('€ 480,00')
    expect(euro(1234.5)).toBe('€ 1234,50')
    expect(euro(null)).toBe('')
  })
})

describe('corpoHtml', () => {
  const righe = [
    riga({ giorni: -10, cliente: 'Rossi & Figli snc' }),
    riga({ giorni: 3, origine: 'contratto', titolo: 'Abbonamento software', dettaglio: 'Gestionale', importo: 480 }),
    riga({ giorni: -2, origine: 'trasmissione', titolo: 'Da trasmettere ad AdE', dettaglio: 'Verifica del 10/03/2026' }),
  ]

  it('mette in alto un oggetto leggibile', () => {
    expect(corpoHtml(righe)).toContain('Scadenze: 1 scaduta · 1 entro 7 giorni · 1 da trasmettere')
  })

  it('elenca tutti i clienti e tutte le date', () => {
    const html = corpoHtml(righe)
    expect(html).toContain('Rossi &amp; Figli snc')
    expect(html).toContain('20/03/2026')
    expect(html).toContain('€ 480,00')
  })

  it('non lascia passare HTML che arriva dai dati', () => {
    const html = corpoHtml([riga({ giorni: 1, cliente: '<img src=x onerror=alert(1)>' })])
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x')
  })

  it('aggiunge il collegamento allo scadenzario solo se l indirizzo c e', () => {
    expect(corpoHtml(righe, { indirizzoApp: 'https://assistenza.esempio.it' }))
      .toContain('href="https://assistenza.esempio.it"')
    expect(corpoHtml(righe)).not.toContain('Apri lo scadenzario')
  })

  it('con l elenco vuoto manda un messaggio sensato, non una pagina vuota', () => {
    const html = corpoHtml([], { orizzonte: 45 })
    expect(html).toContain('Nessuna scadenza nei prossimi 45 giorni')
    expect(html).toContain('nulla in vista')
  })

  it('e un documento HTML completo', () => {
    const html = corpoHtml(righe)
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<meta charset="utf-8">')
    expect(html.trimEnd().endsWith('</html>')).toBe(true)
  })
})

describe('corpoTesto', () => {
  it('ripete lo stesso contenuto senza formattazione', () => {
    const testo = corpoTesto([riga({ giorni: -10 }), riga({ giorni: 3, cliente: 'Panificio' })])
    expect(testo).toContain('IN RITARDO (1)')
    expect(testo).toContain('Bar Centrale')
    expect(testo).toContain('Panificio')
    expect(testo).toContain('(da 10 giorni)')
  })

  it('dice chiaramente quando non c e niente', () => {
    expect(corpoTesto([])).toBe('Nessuna scadenza in vista e nessun arretrato.')
  })
})
