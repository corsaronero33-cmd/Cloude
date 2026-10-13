import { describe, expect, it } from 'vitest'
import { sembraTabellaMancante } from '../erroriServer'

describe('sembraTabellaMancante', () => {
  it('riconosce la risposta di PostgREST per una tabella fuori dalla cache', () => {
    expect(
      sembraTabellaMancante({
        code: 'PGRST205',
        message: "Could not find the table 'public.allegati' in the schema cache",
      }),
    ).toBe(true)
  })

  it('riconosce il codice di PostgreSQL', () => {
    expect(sembraTabellaMancante({ code: '42P01', message: 'relation "allegati" does not exist' }))
      .toBe(true)
  })

  it('riconosce il solo messaggio, senza codice', () => {
    expect(sembraTabellaMancante({ message: 'relation "public.allegati" does not exist' }))
      .toBe(true)
  })

  // L'altra meta' del lavoro: un guasto vero non va confuso con una tabella
  // mancante, altrimenti la sincronizzazione lo nasconderebbe per sempre.
  it('non confonde un errore di permessi con una tabella mancante', () => {
    expect(
      sembraTabellaMancante({
        code: '42501',
        message: 'new row violates row-level security policy for table "allegati"',
      }),
    ).toBe(false)
  })

  it('non confonde una colonna mancante con una tabella mancante', () => {
    expect(
      sembraTabellaMancante({
        code: 'PGRST204',
        message: "Could not find the 'caricato' column of 'allegati' in the schema cache",
      }),
    ).toBe(false)
  })

  it('non confonde una chiave esterna violata', () => {
    expect(
      sembraTabellaMancante({
        code: '23503',
        message: 'insert or update on table "allegati" violates foreign key constraint',
      }),
    ).toBe(false)
  })

  it('sta tranquillo quando non c\'e\' nessun errore', () => {
    expect(sembraTabellaMancante(null)).toBe(false)
    expect(sembraTabellaMancante(undefined)).toBe(false)
    expect(sembraTabellaMancante({})).toBe(false)
  })
})
