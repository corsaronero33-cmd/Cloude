// Unisce i due file della funzione degli avvisi in uno solo, da incollare
// nell'editor del pannello Supabase.
//
// La funzione resta divisa in due nel repository: `messaggio.ts`, senza
// dipendenze da Deno, cosi' la suite di test puo' provarlo davvero, e
// `index.ts` con il collante. Ma chiedere a chi la installa di creare due file
// nell'editor e' un passaggio in piu' da sbagliare, quindi qui se ne fa uno.
//
// Un test controlla che il file unito non resti indietro rispetto ai due
// originali: modificandone uno e dimenticando di rigenerare, la suite se ne
// accorge.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const CARTELLA = 'supabase/functions/avvisi-scadenze'
export const FILE_UNITO = join(CARTELLA, 'funzione-completa.ts')

export function componi(radice = '.') {
  const messaggio = readFileSync(join(radice, CARTELLA, 'messaggio.ts'), 'utf8')
  const indice = readFileSync(join(radice, CARTELLA, 'index.ts'), 'utf8')

  // Uniti in un file solo, gli `export` di messaggio.ts non servono piu'.
  const messaggioInline = messaggio.replace(/^export /gm, '').trim()

  // E l'import di './messaggio.ts' nemmeno: quel codice ora e' qui sopra.
  const indiceSenzaImport = indice
    .replace(/import \{[\s\S]*?\} from '\.\/messaggio\.ts'\n/, '')
    .trim()

  return `// ============================================================================
// Avvisi di scadenza — file unico da incollare nell'editor di Supabase.
//
// GENERATO AUTOMATICAMENTE da messaggio.ts + index.ts.
// Non modificarlo a mano: si cambiano quei due e si rigenera con
//     npm run unisci-funzione
// ============================================================================

${messaggioInline}

${indiceSenzaImport}
`
}

// Eseguito direttamente (non importato da un test): scrive il file.
if (process.argv[1] && process.argv[1].endsWith('unisci-funzione.mjs')) {
  const unito = componi()
  writeFileSync(FILE_UNITO, unito)
  console.log(`${FILE_UNITO}: ${unito.split('\n').length} righe`)
}
