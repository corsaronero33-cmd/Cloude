// ============================================================================
// Avviso giornaliero delle scadenze.
//
// Viene chiamata da pg_cron ogni mattina (vedi supabase/avvisi/pianificazione.sql)
// e, su richiesta, dal pulsante "manda una prova" dentro Impostazioni.
//
// Il calcolo non viene rifatto qui: lo fa la funzione SQL public.scadenze, che
// e' la stessa cosa che vede l'app. Questo file si occupa solo di decidere se
// mandare, a chi, e di consegnare.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import {
  corpoHtml, corpoTesto, oggetto, riepiloga, type RigaScadenza,
} from './messaggio.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Corpo {
  /** Invio di prova: manda comunque, anche se gli avvisi sono spenti o non c'e' nulla. */
  prova?: boolean
  /** Destinatari solo per questo invio, per provare senza toccare le impostazioni. */
  destinatari?: string[]
}

Deno.serve(async (richiesta: Request): Promise<Response> => {
  if (richiesta.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const db = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  )

  const risponde = (stato: number, dati: Record<string, unknown>) =>
    new Response(JSON.stringify(dati), {
      status: stato,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  const registra = async (
    esito: 'inviato' | 'saltato' | 'errore',
    messaggio: string,
    destinatari: string[],
    conteggi: ReturnType<typeof riepiloga> | null,
    prova: boolean,
  ) => {
    await db.from('avvisi_log').insert({
      esito,
      messaggio,
      destinatari: destinatari.join(', '),
      scadute: conteggi?.scadute ?? 0,
      entro_sette: conteggi?.entroSette ?? 0,
      entro_trenta: conteggi?.entroTrenta ?? 0,
      da_trasmettere: conteggi?.daTrasmettere ?? 0,
      prova,
    })
  }

  let corpo: Corpo = {}
  try {
    if (richiesta.headers.get('content-type')?.includes('application/json')) {
      corpo = (await richiesta.json()) as Corpo
    }
  } catch {
    // Un corpo assente o malformato non e' un motivo per non mandare l'avviso:
    // pg_cron chiama senza passare nulla.
  }
  const prova = corpo.prova === true

  try {
    // --- impostazioni -------------------------------------------------------
    const { data: righeImpostazioni, error: erroreImpostazioni } = await db
      .from('impostazioni')
      .select('chiave, valore')
    if (erroreImpostazioni) throw new Error(`lettura impostazioni: ${erroreImpostazioni.message}`)

    const imp: Record<string, string> = {}
    for (const riga of righeImpostazioni ?? []) imp[riga.chiave] = riga.valore

    const attivi = (imp['avvisi_attivi'] ?? '1') === '1'
    if (!attivi && !prova) {
      await registra('saltato', 'avvisi disattivati nelle impostazioni', [], null, prova)
      return risponde(200, { esito: 'saltato', motivo: 'avvisi disattivati' })
    }

    const destinatari = (corpo.destinatari ?? (imp['avvisi_destinatari'] ?? '').split(','))
      .map((d) => d.trim())
      .filter((d) => d.includes('@'))
    if (destinatari.length === 0) {
      const motivo = 'nessun destinatario configurato in Impostazioni'
      await registra('errore', motivo, [], null, prova)
      return risponde(400, { esito: 'errore', motivo })
    }

    const orizzonte = Number(imp['avvisi_orizzonte'] ?? '30')
    const ancheSeNulla = (imp['avvisi_anche_se_nulla'] ?? '0') === '1'

    // --- scadenze -----------------------------------------------------------
    const { data: righe, error: erroreScadenze } = await db.rpc('scadenze', {
      p_giorni: Number.isFinite(orizzonte) ? orizzonte : 30,
    })
    if (erroreScadenze) throw new Error(`calcolo scadenze: ${erroreScadenze.message}`)

    const elenco = (righe ?? []) as RigaScadenza[]
    const conteggi = riepiloga(elenco)

    if (elenco.length === 0 && !ancheSeNulla && !prova) {
      await registra('saltato', 'nessuna scadenza da segnalare', destinatari, conteggi, prova)
      return risponde(200, { esito: 'saltato', motivo: 'nessuna scadenza' })
    }

    // --- consegna -----------------------------------------------------------
    const chiave = Deno.env.get('RESEND_API_KEY')
    if (!chiave) {
      const motivo = 'manca il segreto RESEND_API_KEY nella configurazione della funzione'
      await registra('errore', motivo, destinatari, conteggi, prova)
      return risponde(500, { esito: 'errore', motivo })
    }

    const mittente = Deno.env.get('AVVISI_MITTENTE')
      ?? 'Gestione Assistenza <onboarding@resend.dev>'
    const titolo = (prova ? '[prova] ' : '') + oggetto(conteggi)

    const risposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chiave}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mittente,
        to: destinatari,
        subject: titolo,
        html: corpoHtml(elenco, {
          indirizzoApp: imp['app_indirizzo'] || undefined,
          orizzonte: Number.isFinite(orizzonte) ? orizzonte : 30,
        }),
        text: corpoTesto(elenco),
      }),
    })

    if (!risposta.ok) {
      const dettaglio = await risposta.text()
      const motivo = `il servizio di posta ha risposto ${risposta.status}: ${dettaglio.slice(0, 300)}`
      await registra('errore', motivo, destinatari, conteggi, prova)
      return risponde(502, { esito: 'errore', motivo })
    }

    await registra('inviato', titolo, destinatari, conteggi, prova)
    return risponde(200, {
      esito: 'inviato',
      destinatari,
      oggetto: titolo,
      conteggi,
      righe: elenco.length,
    })
  } catch (e) {
    const motivo = e instanceof Error ? e.message : String(e)
    await registra('errore', motivo, [], null, prova)
    return risponde(500, { esito: 'errore', motivo })
  }
})
