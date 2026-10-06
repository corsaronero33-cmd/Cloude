import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import { configurato } from '../lib/supabase'
import { Bottone, Campo, Scheda, Testo } from '../components/ui'

export default function Accesso() {
  const { entra } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [inCorso, setInCorso] = useState(false)

  const invia = async (e: FormEvent) => {
    e.preventDefault()
    setErrore(null)
    setInCorso(true)
    try {
      await entra(email.trim(), password)
    } catch (err) {
      setErrore(err instanceof Error ? err.message : String(err))
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-900 p-4">
      <Scheda className="w-full max-w-sm p-6">
        <h1 className="text-lg font-bold text-slate-900">Gestione Assistenza</h1>
        <p className="mt-1 text-sm text-slate-600">
          Verifiche RT, scadenze contratti e interventi tecnici.
        </p>

        {!configurato ? (
          <div className="mt-5 rounded-lg bg-violet-50 p-4 text-sm text-violet-900">
            <p className="font-semibold">Collegamento al server non ancora configurato.</p>
            <p className="mt-2">
              Copiare <code className="rounded bg-violet-100 px-1">.env.example</code> in{' '}
              <code className="rounded bg-violet-100 px-1">.env.local</code> e inserire l&apos;indirizzo
              del progetto Supabase e la chiave <em>anon</em>. Le istruzioni passo passo sono nel
              README.
            </p>
          </div>
        ) : (
          <form onSubmit={invia} className="mt-5 space-y-3">
            <Campo etichetta="Email">
              <Testo
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Campo>
            <Campo etichetta="Password">
              <Testo
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Campo>
            {errore && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{errore}</p>
            )}
            <Bottone variante="primario" type="submit" disabled={inCorso} className="w-full">
              {inCorso ? 'Accesso in corso…' : 'Entra'}
            </Bottone>
            <p className="pt-1 text-xs text-slate-500">
              Il primo accesso su un dispositivo richiede la connessione. Dopo, l&apos;app continua a
              funzionare anche senza rete.
            </p>
          </form>
        )}
      </Scheda>
    </div>
  )
}
