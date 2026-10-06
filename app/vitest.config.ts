import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Oltre al codice dell'app si provano anche le parti pure delle funzioni
    // lato server: la composizione dell'email non deve dipendere da Deno ne'
    // dalla rete proprio per poter essere provata qui.
    include: ['src/**/*.test.ts', 'supabase/functions/**/*.test.ts'],
  },
})
