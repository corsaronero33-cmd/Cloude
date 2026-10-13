// ============================================================================
// Costruisce il pacchetto da mandare: l'app compilata, i file da incollare nel
// pannello Supabase e il foglio di istruzioni.
//
// Esiste perche' la volta prima l'ho messo insieme a mano, e un pacchetto
// montato a mano e' un pacchetto che prima o poi parte con dentro la cosa
// sbagliata: il `dist/` di una compilazione vecchia, o un file da incollare
// che non corrisponde piu' al codice.
//
//   node strumenti/pacchetto.mjs      (oppure: npm run pacchetto)
//
// Va lanciato dopo `npm run build`, e vuole `.env.local` con l'indirizzo del
// progetto: serve a scrivere il riferimento dentro la pianificazione, cosi'
// chi incolla ha un segnaposto in meno da sostituire. La chiave segreta non
// viene toccata: quella resta un segnaposto, perche' non deve mai uscire dal
// pannello.
// ============================================================================

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const radice = path.resolve(import.meta.dirname, '..')
const uscita = path.join(radice, 'pacchetto-pronto')
const dentro = path.join(uscita, 'gestione-assistenza')
const zip = path.join(uscita, 'gestione-assistenza.zip')

function riferimentoProgetto() {
  const env = path.join(radice, '.env.local')
  if (!fs.existsSync(env)) return null
  const riga = fs.readFileSync(env, 'utf8').match(/^VITE_SUPABASE_URL=(.+)$/m)
  const host = riga?.[1]?.trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)
  return host?.[1] ?? null
}

const dist = path.join(radice, 'dist')
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('Manca dist/index.html: lancia prima `npm run build`.')
  process.exit(1)
}

fs.rmSync(uscita, { recursive: true, force: true })
fs.mkdirSync(path.join(dentro, 'da-incollare'), { recursive: true })
fs.cpSync(dist, path.join(dentro, 'app-da-pubblicare'), { recursive: true })
fs.copyFileSync(path.join(radice, 'pacchetto', 'LEGGIMI.txt'), path.join(dentro, 'LEGGIMI.txt'))

const daIncollare = [
  ['supabase/migrations/0003_foto.sql', '1-foto.sql'],
  ['supabase/functions/avvisi-scadenze/funzione-completa.ts', '2-funzione-avvisi.ts'],
  ['supabase/avvisi/pianificazione.sql', '3-pianificazione.sql'],
]

const riferimento = riferimentoProgetto()
for (const [sorgente, nome] of daIncollare) {
  let testo = fs.readFileSync(path.join(radice, sorgente), 'utf8')
  if (riferimento) {
    // Prima le spiegazioni, poi il segnaposto: al contrario, il nome del
    // progetto finirebbe anche dentro la frase che spiega come trovarlo.
    testo = testo
      .replace(
        /^--   RIFERIMENTO_PROGETTO .*\n--  +pannello,.*$/m,
        `--   Il riferimento del progetto (${riferimento}) in questa copia e' GIA' al`
        + "\n--   suo posto: resta da sostituire solo la chiave qui sotto.",
      )
      .replace(
        /^-- funzione `avvisi-scadenze`\. Prima di lanciarlo vanno sostituiti i due\n-- segnaposto piu' sotto\.$/m,
        '-- funzione `avvisi-scadenze`. Prima di lanciarlo va sostituito il segnaposto'
        + "\n-- indicato piu' sotto.",
      )
      .replace(/RIFERIMENTO_PROGETTO/g, riferimento)
  }
  fs.writeFileSync(path.join(dentro, 'da-incollare', nome), testo)
}

execFileSync('zip', ['-r', '-q', zip, 'gestione-assistenza'], { cwd: uscita })

const peso = (fs.statSync(zip).size / 1024 / 1024).toFixed(2)
console.log(`${path.relative(radice, zip)}: ${peso} MB`)
console.log(riferimento
  ? `riferimento del progetto scritto nei file da incollare: ${riferimento}`
  : 'senza .env.local: i file da incollare restano con i segnaposto')
