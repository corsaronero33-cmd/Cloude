import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { contaPendenti, db, salva } from '../lib/db'
import { useImpostazioni, useProfili } from '../lib/dati'
import { archivioVuoto, caricaDatiEsempio } from '../lib/esempio'
import { configurato, sb } from '../lib/supabase'
import { ricaricaTutto, sincronizza } from '../lib/sync'
import {
  Bottone, Campo, Intestazione, Pillola, Scheda, Spunta, Testo,
} from '../components/ui'

export default function Impostazioni() {
  const { valori, imposta } = useImpostazioni()
  const { profilo } = useAuth()
  const profili = useProfili()
  const [nome, setNome] = useState(profilo?.nome ?? '')

  useEffect(() => setNome(profilo?.nome ?? ''), [profilo?.nome])

  return (
    <div className="space-y-5">
      <Intestazione titolo="Impostazioni" />

      <Scheda className="space-y-3 p-4">
        <h2 className="text-sm font-bold text-slate-800">Il tuo profilo</h2>
        <Campo etichetta="Nome e cognome" suggerimento="Compare sui rapportini come tecnico">
          <Testo value={nome} onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <div className="flex items-center gap-3">
          <Bottone
            disabled={!profilo || nome.trim() === (profilo?.nome ?? '')}
            onClick={async () => {
              if (!profilo) return
              await salva('profiles', { ...profilo, nome: nome.trim() } as unknown as Record<string, unknown>)
            }}
          >
            Salva il nome
          </Bottone>
          <span className="text-xs text-slate-500">
            Ruolo: {profilo?.ruolo === 'admin' ? 'amministratore' : 'tecnico'}
          </span>
        </div>
      </Scheda>

      <Scheda className="space-y-3 p-4">
        <h2 className="text-sm font-bold text-slate-800">Regole dello scadenzario</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoImpostazione
            chiave="mesi_verifica"
            etichetta="Cadenza della verifica periodica (mesi)"
            suggerimento="La norma vigente per i registratori telematici prevede 24 mesi"
            tipo="number"
            difetto="24"
            valori={valori}
            imposta={imposta}
          />
          <CampoImpostazione
            chiave="giorni_avviso"
            etichetta="Preavviso (giorni)"
            suggerimento="Da quanti giorni prima una scadenza entra fra quelle in arrivo"
            tipo="number"
            difetto="60"
            valori={valori}
            imposta={imposta}
          />
        </div>
        <p className="text-xs text-slate-500">
          Cambiare la cadenza ricalcola subito tutte le scadenze: non sono memorizzate, si ottengono
          dall&apos;ultima verifica o dalla messa in servizio di ciascun apparecchio.
        </p>
      </Scheda>

      <SezioneAvvisi valori={valori} imposta={imposta} />

      <Scheda className="space-y-3 p-4">
        <h2 className="text-sm font-bold text-slate-800">Intestazione dei rapportini</h2>
        <p className="text-xs text-slate-500">
          Questi dati finiscono in cima al PDF che si consegna al cliente.
        </p>
        <CampoImpostazione chiave="azienda_nome" etichetta="Denominazione" valori={valori} imposta={imposta} />
        <CampoImpostazione chiave="azienda_indirizzo" etichetta="Indirizzo" valori={valori} imposta={imposta} />
        <div className="grid gap-3 sm:grid-cols-3">
          <CampoImpostazione chiave="azienda_piva" etichetta="Partita IVA" valori={valori} imposta={imposta} />
          <CampoImpostazione chiave="azienda_telefono" etichetta="Telefono" valori={valori} imposta={imposta} />
          <CampoImpostazione chiave="azienda_email" etichetta="Email" valori={valori} imposta={imposta} />
        </div>
        <CampoImpostazione
          chiave="azienda_laboratorio"
          etichetta="Laboratorio abilitato"
          suggerimento="Codice o riferimento del laboratorio per le verifiche periodiche"
          valori={valori}
          imposta={imposta}
        />
      </Scheda>

      <SezioneSincronizzazione />

      <Scheda className="space-y-2 p-4">
        <h2 className="text-sm font-bold text-slate-800">Utenti</h2>
        {profili.length === 0 ? (
          <p className="text-sm text-slate-500">Nessun profilo ancora sincronizzato.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {profili.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span className="text-slate-800">{p.nome || '(senza nome)'}</span>
                <Pillola tono={p.ruolo === 'admin' ? 'blu' : 'neutro'}>
                  {p.ruolo === 'admin' ? 'amministratore' : 'tecnico'}
                </Pillola>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500">
          I tecnici si aggiungono invitandoli dal pannello Supabase (Authentication → Users). Il
          profilo viene creato da solo al primo accesso.
        </p>
      </Scheda>

      {!configurato && <SezioneProva />}

      <Scheda className="space-y-2 p-4">
        <h2 className="text-sm font-bold text-slate-800">Installare l&apos;app sul telefono</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Aprire questo indirizzo con Chrome su Android o Safari su iPhone.</li>
          <li>
            Dal menu del browser scegliere <em>Aggiungi a schermata Home</em> (su iPhone è nel menu
            di condivisione).
          </li>
          <li>Da quel momento si apre come un&apos;app, a schermo pieno e anche senza rete.</li>
        </ol>
      </Scheda>

      <p className="pb-4 text-center text-xs text-slate-500">
        <Link to="/importa" className="underline">
          Importa o esporta i dati
        </Link>
      </p>
    </div>
  )
}

/**
 * Campo collegato a un'impostazione, che salva quando si esce dal campo e non a
 * ogni tasto premuto: scrivere un indirizzo email non deve produrre trenta
 * scritture in coda di sincronizzazione.
 */
function CampoImpostazione({
  chiave, etichetta, suggerimento, tipo = 'text', difetto = '', valori, imposta,
}: {
  chiave: string
  etichetta: string
  suggerimento?: string
  tipo?: string
  difetto?: string
  valori: Record<string, string>
  imposta: (chiave: string, valore: string) => Promise<void>
}) {
  const salvato = valori[chiave] ?? difetto
  const [bozza, setBozza] = useState(salvato)
  const [ultimoSalvato, setUltimoSalvato] = useState(salvato)

  // Se il valore cambia da fuori (una sincronizzazione, un altro dispositivo)
  // il campo si allinea, ma solo se non lo si sta modificando.
  if (salvato !== ultimoSalvato && bozza === ultimoSalvato) {
    setUltimoSalvato(salvato)
    setBozza(salvato)
  }

  const scrivi = () => {
    if (bozza === salvato) return
    void imposta(chiave, bozza)
    setUltimoSalvato(bozza)
  }

  return (
    <Campo etichetta={etichetta} suggerimento={suggerimento}>
      <Testo
        type={tipo}
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onBlur={scrivi}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
    </Campo>
  )
}

// --- avvisi ----------------------------------------------------------------

interface RigaLog {
  id: string
  inviato_il: string
  destinatari: string
  scadute: number
  entro_sette: number
  esito: string
  messaggio: string | null
  prova: boolean
}

function SezioneAvvisi({
  valori, imposta,
}: {
  valori: Record<string, string>
  imposta: (chiave: string, valore: string) => Promise<void>
}) {
  const [log, setLog] = useState<RigaLog[]>([])
  const [prova, setProva] = useState<{ esito: string; testo: string } | null>(null)
  const [inCorso, setInCorso] = useState(false)

  const leggiLog = useCallback(async () => {
    if (!configurato) return
    const { data } = await sb
      .from('avvisi_log')
      .select('id, inviato_il, destinatari, scadute, entro_sette, esito, messaggio, prova')
      .order('inviato_il', { ascending: false })
      .limit(5)
    setLog((data ?? []) as RigaLog[])
  }, [])

  useEffect(() => {
    void leggiLog()
  }, [leggiLog])

  const mandaProva = async () => {
    setInCorso(true)
    setProva(null)
    try {
      const { data, error } = await sb.functions.invoke('avvisi-scadenze', {
        body: { prova: true },
      })
      if (error) {
        setProva({ esito: 'errore', testo: error.message })
      } else {
        const risposta = data as { esito?: string; motivo?: string; destinatari?: string[] }
        setProva(
          risposta.esito === 'inviato'
            ? { esito: 'ok', testo: `Inviata a ${(risposta.destinatari ?? []).join(', ')}` }
            : { esito: 'errore', testo: risposta.motivo ?? 'risposta inattesa dalla funzione' },
        )
      }
    } catch (e) {
      setProva({ esito: 'errore', testo: e instanceof Error ? e.message : String(e) })
    } finally {
      setInCorso(false)
      void leggiLog()
    }
  }

  const attivi = (valori['avvisi_attivi'] ?? '1') === '1'

  return (
    <Scheda className="space-y-3 p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        Avvisi per email
        {!configurato && <Pillola tono="viola">richiede il server</Pillola>}
      </h2>
      <p className="text-xs text-slate-500">
        Ogni mattina, dal lunedì al venerdì, parte un messaggio con le scadenze in ritardo, quelle
        della settimana e le verifiche ancora da trasmettere. Se non c&apos;è niente da segnalare,
        non viene mandato nulla.
      </p>

      <Spunta
        etichetta="Avvisi attivi"
        checked={attivi}
        onChange={(v) => void imposta('avvisi_attivi', v ? '1' : '0')}
      />

      <CampoImpostazione
        chiave="avvisi_destinatari"
        etichetta="Destinatari"
        suggerimento="Più indirizzi separati da virgola"
        valori={valori}
        imposta={imposta}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoImpostazione
          chiave="avvisi_orizzonte"
          etichetta="Orizzonte dell'avviso (giorni)"
          suggerimento="Quanto avanti guardare. Gli arretrati entrano sempre"
          tipo="number"
          difetto="30"
          valori={valori}
          imposta={imposta}
        />
        <CampoImpostazione
          chiave="app_indirizzo"
          etichetta="Indirizzo dell'app"
          suggerimento="Per il pulsante dentro l'email"
          valori={valori}
          imposta={imposta}
        />
      </div>
      <Spunta
        etichetta="Manda il messaggio anche quando non c'è nulla in scadenza"
        checked={(valori['avvisi_anche_se_nulla'] ?? '0') === '1'}
        onChange={(v) => void imposta('avvisi_anche_se_nulla', v ? '1' : '0')}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
        <Bottone onClick={() => void mandaProva()} disabled={inCorso || !configurato}>
          {inCorso ? 'Invio in corso…' : 'Manda una prova adesso'}
        </Bottone>
        {prova && (
          <span className={prova.esito === 'ok' ? 'text-sm text-emerald-700' : 'text-sm text-rose-700'}>
            {prova.testo}
          </span>
        )}
      </div>

      {log.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ultimi invii
          </div>
          <ul className="divide-y divide-slate-100 text-xs">
            {log.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 py-1.5">
                <span className="text-slate-700">
                  {new Date(r.inviato_il).toLocaleString('it-IT')}
                  {r.prova && ' · prova'}
                  {r.esito === 'errore' && r.messaggio && (
                    <span className="block text-rose-700">{r.messaggio}</span>
                  )}
                </span>
                <Pillola
                  tono={r.esito === 'inviato' ? 'verde' : r.esito === 'saltato' ? 'neutro' : 'rosso'}
                >
                  {r.esito}
                </Pillola>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!configurato && (
        <p className="rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-900">
          Gli avvisi partono dal server: vanno pubblicate la funzione
          <code className="mx-1 rounded bg-violet-100 px-1">avvisi-scadenze</code>
          e la pianificazione, come spiegato nel README.
        </p>
      )}
    </Scheda>
  )
}

// --- sincronizzazione -------------------------------------------------------

function SezioneSincronizzazione() {
  const [pendenti, setPendenti] = useState(0)
  const [errori, setErrori] = useState<{ tabella: string; messaggio: string }[]>([])

  useEffect(() => {
    const leggi = async () => {
      setPendenti(await contaPendenti())
      const falliti = await db.pendenti.filter((p) => p.ultimo_errore !== null).toArray()
      setErrori(falliti.slice(0, 5).map((p) => ({ tabella: p.tabella, messaggio: p.ultimo_errore! })))
    }
    void leggi()
    const t = setInterval(leggi, 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <Scheda className="space-y-3 p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        Sincronizzazione
        {!configurato && <Pillola tono="viola">solo locale</Pillola>}
      </h2>
      <p className="text-sm text-slate-700">
        {!configurato
          ? "Il server non è configurato: tutto quello che inserisci resta su questo dispositivo e non viene condiviso con nessuno."
          : pendenti === 0
            ? 'Tutto quello che hai inserito è arrivato al server.'
            : `${pendenti} modifiche aspettano di salire. Restano salvate sul dispositivo finché non ci riescono.`}
      </p>
      {errori.length > 0 && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-900">
          <div className="font-semibold">Il server ha rifiutato alcune scritture:</div>
          <ul className="mt-1 space-y-0.5">
            {errori.map((e, i) => (
              <li key={i}>
                <strong>{e.tabella}</strong>: {e.messaggio}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Bottone onClick={() => void sincronizza()} disabled={!configurato}>
          Sincronizza adesso
        </Bottone>
        <Bottone
          disabled={!configurato}
          onClick={() => {
            if (!confirm('Riscaricare tutto dal server? I dati locali non ancora inviati restano in coda.')) return
            void ricaricaTutto()
          }}
        >
          Riscarica tutto
        </Bottone>
      </div>
    </Scheda>
  )
}

// --- dati di esempio --------------------------------------------------------

function SezioneProva() {
  const [vuoto, setVuoto] = useState(false)
  const [inCorso, setInCorso] = useState(false)

  useEffect(() => {
    void archivioVuoto().then(setVuoto)
  }, [inCorso])

  return (
    <Scheda className="space-y-3 border-violet-200 bg-violet-50/60 p-4">
      <h2 className="text-sm font-bold text-slate-800">Prova con dati di esempio</h2>
      <p className="text-sm text-slate-700">
        Carica cinque clienti inventati, sette apparecchi e un po&apos; di contratti, con date
        calcolate a partire da oggi: qualcosa in ritardo, qualcosa questa settimana, qualcosa più
        avanti. Serve a vedere l&apos;app piena prima di passare una serata a inserire l&apos;archivio
        vero.
      </p>
      <Bottone
        variante="primario"
        disabled={!vuoto || inCorso}
        onClick={async () => {
          setInCorso(true)
          try {
            await caricaDatiEsempio()
          } finally {
            setInCorso(false)
          }
        }}
      >
        {inCorso ? 'Carico…' : 'Carica i dati di esempio'}
      </Bottone>
      {!vuoto && (
        <p className="text-xs text-slate-600">
          Disponibile solo su un archivio vuoto, per non mescolare nomi inventati con i tuoi.
        </p>
      )}
    </Scheda>
  )
}
