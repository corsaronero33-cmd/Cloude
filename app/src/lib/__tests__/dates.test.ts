import { describe, expect, it } from 'vitest'
import {
  aggiungiGiorni, aggiungiMesi, daFormatoItaliano, formatta, giorniTra, oreTra, quantoManca,
} from '../dates'

// L'aritmetica delle date e' il punto in cui questa app puo' sbagliare in modo
// silenzioso e costoso: una scadenza spostata di un giorno non si nota, ma e'
// una verifica fuori termine. Qui si fissano i casi che fanno male.

describe('aggiungiMesi', () => {
  it('somma i mesi restando sul calendario', () => {
    expect(aggiungiMesi('2026-03-15', 24)).toBe('2028-03-15')
    expect(aggiungiMesi('2026-01-31', 1)).toBe('2026-02-28')
    expect(aggiungiMesi('2024-01-31', 1)).toBe('2024-02-29') // anno bisestile
  })

  it('attraversa il capodanno', () => {
    expect(aggiungiMesi('2026-11-10', 2)).toBe('2027-01-10')
    expect(aggiungiMesi('2026-12-31', 24)).toBe('2028-12-31')
  })

  it('accetta valori negativi', () => {
    expect(aggiungiMesi('2026-03-10', -12)).toBe('2025-03-10')
    expect(aggiungiMesi('2026-01-10', -1)).toBe('2025-12-10')
  })

  it('non inventa nulla su una data non valida', () => {
    expect(aggiungiMesi('', 12)).toBe('')
    expect(aggiungiMesi('10/03/2026', 12)).toBe('10/03/2026')
  })
})

describe('giorniTra', () => {
  it('conta i giorni nei due versi', () => {
    expect(giorniTra('2026-03-01', '2026-03-10')).toBe(9)
    expect(giorniTra('2026-03-10', '2026-03-01')).toBe(-9)
    expect(giorniTra('2026-03-10', '2026-03-10')).toBe(0)
  })

  it('non si fa disturbare dal cambio dell ora legale', () => {
    // In Italia l'ora legale del 2026 comincia il 29 marzo: fra il 28 e il 30
    // ci sono due giorni di calendario, anche se le ore trascorse sono 47.
    expect(giorniTra('2026-03-28', '2026-03-30')).toBe(2)
    expect(giorniTra('2026-10-24', '2026-10-26')).toBe(2)
  })

  it('attraversa il 29 febbraio', () => {
    expect(giorniTra('2024-02-28', '2024-03-01')).toBe(2)
    expect(giorniTra('2026-02-28', '2026-03-01')).toBe(1)
  })
})

describe('aggiungiGiorni', () => {
  it('scavalca i confini di mese e anno', () => {
    expect(aggiungiGiorni('2026-02-28', 1)).toBe('2026-03-01')
    expect(aggiungiGiorni('2026-12-31', 1)).toBe('2027-01-01')
    expect(aggiungiGiorni('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('daFormatoItaliano', () => {
  it('legge il formato con cui si scrive a mano', () => {
    expect(daFormatoItaliano('10/03/2026')).toBe('2026-03-10')
    expect(daFormatoItaliano('1/3/2026')).toBe('2026-03-01')
    expect(daFormatoItaliano('01.03.2026')).toBe('2026-03-01')
    expect(daFormatoItaliano('01-03-2026')).toBe('2026-03-01')
  })

  it('lascia passare il formato ISO', () => {
    expect(daFormatoItaliano('2026-03-10')).toBe('2026-03-10')
  })

  it('completa l anno a due cifre', () => {
    expect(daFormatoItaliano('10/03/26')).toBe('2026-03-10')
    expect(daFormatoItaliano('10/03/98')).toBe('1998-03-10')
  })

  it('rifiuta le date impossibili invece di correggerle', () => {
    expect(daFormatoItaliano('31/02/2026')).toBeNull()
    expect(daFormatoItaliano('10/13/2026')).toBeNull()
    expect(daFormatoItaliano('non una data')).toBeNull()
    expect(daFormatoItaliano('')).toBeNull()
  })
})

describe('formatta', () => {
  it('mostra le date come le si leggono', () => {
    expect(formatta('2026-03-10')).toBe('10/03/2026')
    expect(formatta(null)).toBe('')
    expect(formatta(undefined)).toBe('')
  })
})

describe('quantoManca', () => {
  it('usa le parole giuste per i casi vicini', () => {
    expect(quantoManca(0)).toBe('oggi')
    expect(quantoManca(1)).toBe('domani')
    expect(quantoManca(-1)).toBe('scaduta da ieri')
    expect(quantoManca(12)).toBe('fra 12 giorni')
    expect(quantoManca(-3)).toBe('scaduta da 3 giorni')
  })
})

describe('oreTra', () => {
  it('arrotonda al quarto d ora', () => {
    expect(oreTra('09:00', '10:30')).toBe(1.5)
    expect(oreTra('09:00', '09:20')).toBe(0.25)
    expect(oreTra('08:45', '12:00')).toBe(3.25)
  })

  it('restituisce null quando il conto non ha senso', () => {
    expect(oreTra('10:00', '09:00')).toBeNull()
    expect(oreTra('10:00', '10:00')).toBeNull()
    expect(oreTra(null, '10:00')).toBeNull()
    expect(oreTra('10:00', null)).toBeNull()
    expect(oreTra('mattina', '10:00')).toBeNull()
  })
})
