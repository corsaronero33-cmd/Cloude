import { describe, expect, it } from 'vitest'
import { abbina, analizza, esporta, rilevaSeparatore } from '../csv'

// Il file da importare arriva da Excel in italiano, e quello e' il caso che
// deve funzionare senza che nessuno debba toccare il file prima.

describe('rilevaSeparatore', () => {
  it('riconosce il punto e virgola di Excel italiano', () => {
    expect(rilevaSeparatore('nome;piva;citta')).toBe(';')
  })

  it('riconosce la virgola e la tabulazione', () => {
    expect(rilevaSeparatore('nome,piva,citta')).toBe(',')
    expect(rilevaSeparatore('nome\tpiva\tcitta')).toBe('\t')
  })

  it('non si lascia ingannare dai separatori dentro le virgolette', () => {
    // Una sola colonna, con tre virgole protette dalle virgolette: il punto e
    // virgola, che separa davvero, deve vincere.
    expect(rilevaSeparatore('"Rossi, Bianchi, Verdi";piva')).toBe(';')
  })
})

describe('analizza', () => {
  it('legge intestazioni e righe', () => {
    const t = analizza('Nome;Citta\nRossi srl;Nizza\nBianchi snc;Asti\n')
    expect(t.intestazioni).toEqual(['Nome', 'Citta'])
    expect(t.righe).toEqual([
      ['Rossi srl', 'Nizza'],
      ['Bianchi snc', 'Asti'],
    ])
  })

  it('rispetta le virgolette e i separatori che contengono', () => {
    const t = analizza('Nome;Note\n"Rossi, Bianchi e C.";"prima riga"\n')
    expect(t.righe[0]).toEqual(['Rossi, Bianchi e C.', 'prima riga'])
  })

  it('raddoppia le virgolette interne come fa Excel', () => {
    const t = analizza('Nome\n"Il ""Baretto"" di Asti"\n')
    expect(t.righe[0]).toEqual(['Il "Baretto" di Asti'])
  })

  it('tiene insieme un campo che va a capo dentro le virgolette', () => {
    const t = analizza('Nome;Note\nRossi;"prima riga\nseconda riga"\n')
    expect(t.righe).toHaveLength(1)
    expect(t.righe[0]![1]).toBe('prima riga\nseconda riga')
  })

  it('tollera i fine riga di Windows', () => {
    const t = analizza('Nome;Citta\r\nRossi;Nizza\r\n')
    expect(t.intestazioni).toEqual(['Nome', 'Citta'])
    expect(t.righe[0]).toEqual(['Rossi', 'Nizza'])
  })

  it('scarta il BOM che Excel mette in testa al file', () => {
    const t = analizza('﻿Nome;Citta\nRossi;Nizza\n')
    expect(t.intestazioni[0]).toBe('Nome')
  })

  it('salta le righe completamente vuote', () => {
    const t = analizza('Nome;Citta\nRossi;Nizza\n;\n\nBianchi;Asti\n')
    expect(t.righe).toEqual([
      ['Rossi', 'Nizza'],
      ['Bianchi', 'Asti'],
    ])
  })

  it('legge anche l ultima riga senza ritorno a capo finale', () => {
    const t = analizza('Nome;Citta\nRossi;Nizza')
    expect(t.righe).toEqual([['Rossi', 'Nizza']])
  })

  it('conserva le celle vuote in mezzo alla riga', () => {
    const t = analizza('Nome;Piva;Citta\nRossi;;Nizza\n')
    expect(t.righe[0]).toEqual(['Rossi', '', 'Nizza'])
  })

  it('accetta un separatore imposto da fuori', () => {
    const t = analizza('Nome,Citta\nRossi,Nizza\n', ',')
    expect(t.intestazioni).toEqual(['Nome', 'Citta'])
  })
})

describe('esporta', () => {
  it('protegge le celle che contengono separatori, virgolette o capi riga', () => {
    const csv = esporta(['Nome', 'Note'], [['Rossi; Bianchi', 'dice "si"'], ['Verdi', 'a\ncapo']])
    expect(csv).toContain('"Rossi; Bianchi";"dice ""si"""')
    expect(csv).toContain('Verdi;"a\ncapo"')
  })

  it('mette il BOM perche Excel apra il file in UTF-8', () => {
    expect(esporta(['Città'], [['Nizza']]).charCodeAt(0)).toBe(0xfeff)
  })

  it('tratta i valori nulli come celle vuote', () => {
    expect(esporta(['A', 'B'], [[null, 12]])).toContain(';12')
  })
})

describe('abbina', () => {
  const campi = [
    { chiave: 'ragione_sociale', etichetta: 'Ragione sociale', sinonimi: ['cliente'] },
    { chiave: 'partita_iva', etichetta: 'Partita IVA', sinonimi: ['piva'] },
    { chiave: 'citta', etichetta: 'Città', sinonimi: ['comune'] },
  ]

  it('accosta le colonne ignorando maiuscole, spazi e punteggiatura', () => {
    const m = abbina(['RAGIONE  SOCIALE', 'P.IVA', 'Comune'], campi)
    expect(m).toEqual({ ragione_sociale: 0, partita_iva: 1, citta: 2 })
  })

  it('accosta anche togliendo gli accenti', () => {
    expect(abbina(['Citta'], campi)['citta']).toBe(0)
    expect(abbina(['CITTÀ'], campi)['citta']).toBe(0)
  })

  it('riconosce il nome tecnico del campo', () => {
    expect(abbina(['ragione_sociale'], campi)['ragione_sociale']).toBe(0)
  })

  it('lascia fuori i campi che non trova, senza indovinare', () => {
    const m = abbina(['Qualcosa', 'Altro'], campi)
    expect(m).toEqual({})
  })

  it('ignora le intestazioni vuote', () => {
    const m = abbina(['', 'Partita IVA'], campi)
    expect(m).toEqual({ partita_iva: 1 })
  })
})
