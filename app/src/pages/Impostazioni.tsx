import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { contaPendenti, db, salva } from '../lib/db'
import { useImpostazioni, useProfili } from '../lib/dati'
import { ricaricaTutto, sincronizza } from '../lib/sync'
import { configurato } from '../lib/supabase'
import {
  Bottone, Campo, Intestazione, Pillola, Scheda, Testo,
} from '../components/ui'

export default function Impostazioni() {
  const { valori, imposta } = useImpostazioni()
  const { profilo } = useAuth()
  const profili = useProfili()
  const [pendenti, setPendenti] = useState(0)
  const [errori, setErrori] = useState<{ tabella: string; messaggio: string }[]>([])
  const [nome, setNome] = useState(profilo?.nome ?? '')

  useEffect(() => setNome(profilo?.nome ?? ''), [profilo?.nome])

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

  const campoAzienda = (chiave: string, etichetta: string, suggerimento?: string) => (
    <Campo etichetta={etichetta} suggerimento={suggerimento}>
      <Testo
        value={valori[chiave] ?? ''}
        onChange={(e) => void imposta(chiave, e.target.value)}
      />
    </Campo>
  )

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
          <Campo
            etichetta="Cadenza della verifica periodica (mesi)"
            suggerimento="La norma vigente per i registratori telematici prevede 24 mesi"
          >
            <Testo
              type="number"
              min="1"
              max="120"
              value={valori['mesi_verifica'] ?? '24'}
              onChange={(e) => void imposta('mesi_verifica', e.target.value)}
            />
          </Campo>
          <Campo
            etichetta="Preavviso (giorni)"
            suggerimento="Da quanti giorni prima una scadenza entra fra quelle in arrivo"
          >
            <Testo
              type="number"
              min="7"
              max="365"
              value={valori['giorni_avviso'] ?? '60'}
              onChange={(e) => void imposta('giorni_avviso', e.target.value)}
            />
          </Campo>
        </div>
        <p className="text-xs text-slate-500">
          Cambiare la cadenza ricalcola subito tutte le scadenze: non sono memorizzate, si ottengono
          dall&apos;ultima verifica o dalla messa in servizio di ciascun apparecchio.
        </p>
      </Scheda>

      <Scheda className="space-y-3 p-4">
        <h2 className="text-sm font-bold text-slate-800">Intestazione dei rapportini</h2>
        <p className="text-xs text-slate-500">
          Questi dati finiscono in cima al PDF che si consegna al cliente.
        </p>
        {campoAzienda('azienda_nome', 'Denominazione')}
        {campoAzienda('azienda_indirizzo', 'Indirizzo')}
        <div className="grid gap-3 sm:grid-cols-3">
          {campoAzienda('azienda_piva', 'Partita IVA')}
          {campoAzienda('azienda_telefono', 'Telefono')}
          {campoAzienda('azienda_email', 'Email')}
        </div>
        {campoAzienda(
          'azienda_laboratorio',
          'Laboratorio abilitato',
          'Codice o riferimento del laboratorio per le verifiche periodiche',
        )}
      </Scheda>

      <Scheda className="space-y-3 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          Sincronizzazione
          {!configurato && <Pillola tono="viola">solo locale</Pillola>}
        </h2>
        <p className="text-sm text-slate-700">
          {pendenti === 0
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
          <Bottone onClick={() => void sincronizza()}>Sincronizza adesso</Bottone>
          <Bottone
            onClick={() => {
              if (!confirm('Riscaricare tutto dal server? I dati locali non ancora inviati restano in coda.')) return
              void ricaricaTutto()
            }}
          >
            Riscarica tutto
          </Bottone>
        </div>
      </Scheda>

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
        <p className="text-xs text-slate-500">
          Il primo accesso richiede la connessione: serve a scaricare i dati e a stabilire la
          sessione.
        </p>
      </Scheda>

      <p className="pb-4 text-center text-xs text-slate-500">
        <Link to="/importa" className="underline">
          Importa o esporta i dati
        </Link>
      </p>
    </div>
  )
}
