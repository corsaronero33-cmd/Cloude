// Composizione del messaggio di avviso.
//
// Tenuto separato dal resto della funzione, e senza una riga che dipenda da
// Deno o dalla rete, per una ragione pratica: cosi' si puo' provare con la
// stessa suite di test del resto del progetto, invece di scoprire a posteriori
// che l'email del lunedi' mattina esce storta.
//
// L'HTML e' volutamente antiquato -- tabelle e stili in linea -- perche' e'
// l'unica cosa che i programmi di posta rendono allo stesso modo.

export interface RigaScadenza {
  origine: 'verifica' | 'contratto' | 'trasmissione'
  riferimento: string
  cliente_id: string
  cliente: string
  titolo: string
  dettaglio: string | null
  data: string
  giorni: number
  importo: number | null
}

export interface Riepilogo {
  scadute: number
  entroSette: number
  entroTrenta: number
  daTrasmettere: number
  totale: number
}

export function riepiloga(righe: RigaScadenza[]): Riepilogo {
  const scadenze = righe.filter((r) => r.origine !== 'trasmissione')
  return {
    scadute: scadenze.filter((r) => r.giorni < 0).length,
    entroSette: scadenze.filter((r) => r.giorni >= 0 && r.giorni <= 7).length,
    entroTrenta: scadenze.filter((r) => r.giorni > 7 && r.giorni <= 30).length,
    daTrasmettere: righe.filter((r) => r.origine === 'trasmissione').length,
    totale: righe.length,
  }
}

/**
 * L'oggetto deve dire tutto da solo: su un telefono si legge quello e si
 * decide se aprire. Niente "Notifica automatica dal sistema".
 */
export function oggetto(r: Riepilogo): string {
  const pezzi: string[] = []
  if (r.scadute > 0) pezzi.push(`${r.scadute} ${r.scadute === 1 ? 'scaduta' : 'scadute'}`)
  if (r.entroSette > 0) pezzi.push(`${r.entroSette} entro 7 giorni`)
  if (r.daTrasmettere > 0) {
    pezzi.push(`${r.daTrasmettere} da trasmettere`)
  }
  if (pezzi.length === 0) {
    if (r.entroTrenta > 0) return `Scadenze: ${r.entroTrenta} entro il mese`
    return 'Scadenze: nulla in vista'
  }
  return `Scadenze: ${pezzi.join(' · ')}`
}

interface Gruppo {
  titolo: string
  colore: string
  righe: RigaScadenza[]
}

/** I gruppi in cui si divide l'elenco, nell'ordine in cui vanno guardati. */
export function raggruppa(righe: RigaScadenza[]): Gruppo[] {
  const scadenze = righe.filter((r) => r.origine !== 'trasmissione')
  const gruppi: Gruppo[] = [
    {
      titolo: "Da trasmettere all'Agenzia delle Entrate",
      colore: '#b91c1c',
      righe: righe.filter((r) => r.origine === 'trasmissione'),
    },
    { titolo: 'In ritardo', colore: '#b91c1c', righe: scadenze.filter((r) => r.giorni < 0) },
    {
      titolo: 'Entro una settimana',
      colore: '#b45309',
      righe: scadenze.filter((r) => r.giorni >= 0 && r.giorni <= 7),
    },
    {
      titolo: 'Entro il mese',
      colore: '#0369a1',
      righe: scadenze.filter((r) => r.giorni > 7 && r.giorni <= 30),
    },
    { titolo: 'Più avanti', colore: '#475569', righe: scadenze.filter((r) => r.giorni > 30) },
  ]
  return gruppi.filter((g) => g.righe.length > 0)
}

export function formattaData(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

export function quantoManca(giorni: number, origine: RigaScadenza['origine']): string {
  if (origine === 'trasmissione') return 'in attesa'
  if (giorni === 0) return 'oggi'
  if (giorni === 1) return 'domani'
  if (giorni === -1) return 'da ieri'
  if (giorni > 0) return `fra ${giorni} giorni`
  return `da ${-giorni} giorni`
}

/**
 * I nomi dei clienti e le note arrivano dall'archivio e finiscono dentro
 * dell'HTML: vanno sempre fatti passare di qui, o una ragione sociale con una
 * e commerciale rompe il messaggio.
 */
export function esc(testo: string | null | undefined): string {
  if (testo === null || testo === undefined) return ''
  return String(testo)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function euro(n: number | null): string {
  if (n === null || n === undefined) return ''
  return `€ ${n.toFixed(2).replace('.', ',')}`
}

export function corpoHtml(
  righe: RigaScadenza[],
  opzioni: { indirizzoApp?: string; orizzonte?: number } = {},
): string {
  const r = riepiloga(righe)
  const gruppi = raggruppa(righe)
  const orizzonte = opzioni.orizzonte ?? 30

  const sezioni = gruppi
    .map(
      (g) => `
      <tr><td style="padding:22px 24px 6px 24px;">
        <div style="font:600 13px/1.4 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                    color:${g.colore};text-transform:uppercase;letter-spacing:.04em;">
          ${esc(g.titolo)} (${g.righe.length})
        </div>
      </td></tr>
      <tr><td style="padding:0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="border-collapse:collapse;font:14px/1.45 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          ${g.righe.map((riga) => rigaHtml(riga, g.colore)).join('')}
        </table>
      </td></tr>`,
    )
    .join('')

  const vuoto = `
      <tr><td style="padding:24px;font:14px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#475569;">
        Nessuna scadenza nei prossimi ${orizzonte} giorni e nessun arretrato. Buona giornata.
      </td></tr>`

  const collegamento = opzioni.indirizzoApp
    ? `<tr><td style="padding:4px 24px 24px 24px;">
         <a href="${esc(opzioni.indirizzoApp)}"
            style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;
                   padding:10px 18px;border-radius:8px;
                   font:600 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
           Apri lo scadenzario
         </a>
       </td></tr>`
    : ''

  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(oggetto(r))}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
    <tr><td align="center" style="padding:20px 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;
                    box-shadow:0 1px 3px rgba(15,23,42,.12);">
        <tr><td style="background:#0f172a;padding:18px 24px;">
          <div style="font:700 17px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
            Scadenze del giorno
          </div>
          <div style="font:13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#94a3b8;margin-top:3px;">
            ${esc(oggetto(r))}
          </div>
        </td></tr>
        ${gruppi.length > 0 ? sezioni : vuoto}
        ${collegamento}
        <tr><td style="padding:14px 24px;border-top:1px solid #e2e8f0;
                       font:12px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#94a3b8;">
          Messaggio generato da Gestione Assistenza. L&rsquo;orizzonte degli avvisi e i destinatari
          si cambiano in Impostazioni.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function rigaHtml(riga: RigaScadenza, colore: string): string {
  const dettagli = [riga.titolo, riga.dettaglio, euro(riga.importo)].filter(Boolean).join(' · ')
  return `
    <tr>
      <td style="padding:9px 0;border-top:1px solid #f1f5f9;vertical-align:top;">
        <div style="font-weight:600;color:#0f172a;">${esc(riga.cliente)}</div>
        <div style="color:#64748b;font-size:13px;">${esc(dettagli)}</div>
      </td>
      <td style="padding:9px 0;border-top:1px solid #f1f5f9;text-align:right;
                 white-space:nowrap;vertical-align:top;">
        <div style="font-weight:600;color:#0f172a;">${esc(formattaData(riga.data))}</div>
        <div style="font-size:12px;color:${colore};">${esc(quantoManca(riga.giorni, riga.origine))}</div>
      </td>
    </tr>`
}

/** Versione in solo testo, per i programmi di posta che non mostrano l'HTML. */
export function corpoTesto(righe: RigaScadenza[]): string {
  const gruppi = raggruppa(righe)
  if (gruppi.length === 0) return 'Nessuna scadenza in vista e nessun arretrato.'
  return gruppi
    .map((g) => {
      const elenco = g.righe
        .map(
          (r) =>
            `  - ${r.cliente} | ${[r.titolo, r.dettaglio].filter(Boolean).join(' · ')}` +
            ` | ${formattaData(r.data)} (${quantoManca(r.giorni, r.origine)})`,
        )
        .join('\n')
      return `${g.titolo.toUpperCase()} (${g.righe.length})\n${elenco}`
    })
    .join('\n\n')
}
