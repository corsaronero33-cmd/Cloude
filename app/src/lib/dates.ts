// Le date viaggiano sempre come stringhe 'AAAA-MM-GG'. Nessun fuso orario,
// nessun Date da serializzare: una scadenza e' un giorno sul calendario, non
// un istante, e trattarla come istante produce quei fastidiosi scarti di un
// giorno quando il telefono e' su un fuso diverso dal server.

/** Oggi in formato 'AAAA-MM-GG', secondo l'orologio locale del dispositivo. */
export function oggi(): string {
  return aIso(new Date())
}

export function aIso(d: Date): string {
  const anno = d.getFullYear()
  const mese = String(d.getMonth() + 1).padStart(2, '0')
  const giorno = String(d.getDate()).padStart(2, '0')
  return `${anno}-${mese}-${giorno}`
}

function pezzi(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const anno = Number(m[1])
  const mese = Number(m[2])
  const giorno = Number(m[3])
  if (mese < 1 || mese > 12 || giorno < 1 || giorno > 31) return null
  return [anno, mese, giorno]
}

export function valida(iso: string | null | undefined): boolean {
  return !!iso && pezzi(iso) !== null
}

/**
 * Somma mesi a una data restando sul calendario. Il giorno viene limitato
 * all'ultimo del mese di arrivo: 31 gennaio piu' un mese fa 28 febbraio, non
 * 3 marzo come farebbe l'aritmetica ingenua di Date.
 */
export function aggiungiMesi(iso: string, mesi: number): string {
  const p = pezzi(iso)
  if (!p) return iso
  const [anno, mese, giorno] = p
  const totale = (anno * 12 + (mese - 1)) + mesi
  const nuovoAnno = Math.floor(totale / 12)
  const nuovoMese = (totale % 12) + 1
  const ultimo = giorniNelMese(nuovoAnno, nuovoMese)
  const nuovoGiorno = Math.min(giorno, ultimo)
  return `${String(nuovoAnno).padStart(4, '0')}-${String(nuovoMese).padStart(2, '0')}-${String(nuovoGiorno).padStart(2, '0')}`
}

export function aggiungiGiorni(iso: string, giorni: number): string {
  const p = pezzi(iso)
  if (!p) return iso
  const d = new Date(p[0], p[1] - 1, p[2] + giorni)
  return aIso(d)
}

export function giorniNelMese(anno: number, mese: number): number {
  return new Date(anno, mese, 0).getDate()
}

/**
 * Giorni che mancano da `da` a `a`. Negativo se `a` e' gia' passata.
 * Il conto e' fatto a mezzogiorno per non farsi disturbare dall'ora legale.
 */
export function giorniTra(da: string, a: string): number {
  const pa = pezzi(da)
  const pb = pezzi(a)
  if (!pa || !pb) return 0
  const x = new Date(pa[0], pa[1] - 1, pa[2], 12).getTime()
  const y = new Date(pb[0], pb[1] - 1, pb[2], 12).getTime()
  return Math.round((y - x) / 86_400_000)
}

/** 'AAAA-MM-GG' diventa 'GG/MM/AAAA'. Stringa vuota se la data manca. */
export function formatta(iso: string | null | undefined): string {
  if (!iso) return ''
  const p = pezzi(iso)
  if (!p) return iso
  return `${String(p[2]).padStart(2, '0')}/${String(p[1]).padStart(2, '0')}/${p[0]}`
}

/** Accetta 'GG/MM/AAAA' o 'AAAA-MM-GG' e restituisce sempre la forma ISO. */
export function daFormatoItaliano(testo: string): string | null {
  const t = testo.trim()
  if (!t) return null
  if (pezzi(t)) return t
  const m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/.exec(t)
  if (!m) return null
  const giorno = Number(m[1])
  const mese = Number(m[2])
  let anno = Number(m[3])
  if (anno < 100) anno += anno < 70 ? 2000 : 1900
  if (mese < 1 || mese > 12) return null
  if (giorno < 1 || giorno > giorniNelMese(anno, mese)) return null
  return `${String(anno).padStart(4, '0')}-${String(mese).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`
}

const MESI = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

/** 'marzo 2026', per intestare i gruppi dello scadenzario. */
export function meseEAnno(iso: string): string {
  const p = pezzi(iso)
  if (!p) return ''
  return `${MESI[p[1] - 1]} ${p[0]}`
}

/** 'fra 12 giorni', 'oggi', 'scaduta da 3 giorni'. */
export function quantoManca(giorni: number): string {
  if (giorni === 0) return 'oggi'
  if (giorni === 1) return 'domani'
  if (giorni === -1) return 'scaduta da ieri'
  if (giorni > 0) return `fra ${giorni} giorni`
  return `scaduta da ${-giorni} giorni`
}

/** Momento attuale in ISO completo, per updated_at. */
export function adesso(): string {
  return new Date().toISOString()
}

/** 'HH:MM' dall'orologio locale, per precompilare ora inizio e fine. */
export function oraCorrente(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Ore fra due orari 'HH:MM', arrotondate al quarto d'ora. 0 se non calcolabile. */
export function oreTra(inizio: string | null, fine: string | null): number | null {
  if (!inizio || !fine) return null
  const a = /^(\d{1,2}):(\d{2})$/.exec(inizio.trim())
  const b = /^(\d{1,2}):(\d{2})$/.exec(fine.trim())
  if (!a || !b) return null
  const minuti = (Number(b[1]) * 60 + Number(b[2])) - (Number(a[1]) * 60 + Number(a[2]))
  if (minuti <= 0) return null
  return Math.round(minuti / 15) / 4
}
