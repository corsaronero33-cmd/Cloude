// ============================================================================
// Riconoscimento degli errori che il server puo' restituire.
//
// Sta a parte dalla sincronizzazione perche' e' logica pura, e perche' e'
// esattamente il genere di codice che sbaglia in silenzio: un riconoscimento
// troppo largo nasconderebbe un guasto vero, uno troppo stretto romperebbe la
// sincronizzazione di chi non ha ancora eseguito una migrazione.
// ============================================================================

export type ErroreServer = { code?: string; message?: string }

/**
 * Vero quando l'errore dice "questa tabella non esiste".
 *
 * `PGRST205` e' la risposta di PostgREST quando il nome non e' nella cache
 * dello schema; `42P01` e' il codice che arriva da PostgreSQL quando la
 * richiesta ci passa attraverso. Il messaggio e' il ripiego, perche' le
 * versioni piu' vecchie non mandavano sempre un codice.
 *
 * I due modelli nominano la *tabella* di proposito. Cercare la sola "schema
 * cache" sarebbe stato piu' comodo e sbagliato: con quella frase PostgREST
 * segnala anche una colonna che manca, e una colonna che manca e' un guasto da
 * mostrare, non da saltare.
 */
const TABELLA_MANCANTE = [
  /could not find the table/i,
  /relation "?[\w.]+"? does not exist/i,
]

export function sembraTabellaMancante(errore: ErroreServer | null | undefined): boolean {
  if (!errore) return false
  if (errore.code === 'PGRST205' || errore.code === '42P01') return true
  const messaggio = errore.message ?? ''
  return TABELLA_MANCANTE.some((m) => m.test(messaggio))
}
