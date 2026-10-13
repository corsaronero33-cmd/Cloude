import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
// @ts-expect-error — script di servizio in JavaScript, senza dichiarazioni di tipo
import { FILE_UNITO, componi } from '../../../strumenti/unisci-funzione.mjs'

// Il file da incollare nel pannello Supabase e' generato dagli altri due.
// Senza questa prova, una correzione a messaggio.ts resterebbe fuori dal file
// che viene davvero installato, e l'email continuerebbe a uscire come prima
// senza che nessuno capisca perche'.

describe('il file unico della funzione', () => {
  it('e allineato ai due file da cui nasce', () => {
    const atteso = componi()
    const suDisco = readFileSync(FILE_UNITO, 'utf8')
    expect(suDisco).toBe(atteso)
  })

  it('contiene sia la composizione del messaggio sia il collante', () => {
    const unito = readFileSync(FILE_UNITO, 'utf8')
    expect(unito).toContain('function corpoHtml')
    expect(unito).toContain('function riepiloga')
    expect(unito).toContain('Deno.serve')
    expect(unito).toContain('api.resend.com')
  })

  it('non cerca piu il file separato', () => {
    expect(readFileSync(FILE_UNITO, 'utf8')).not.toContain("from './messaggio.ts'")
  })
})
