import type { Session } from '@supabase/supabase-js'
import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react'
import { azzeraLocale, db } from './db'
import { avviaSync, fermaSync } from './sync'
import { configurato, sb } from './supabase'
import type { Profilo } from './types'

interface Autenticazione {
  pronto: boolean
  sessione: Session | null
  profilo: Profilo | null
  entra: (email: string, password: string) => Promise<void>
  esci: () => Promise<void>
}

const Contesto = createContext<Autenticazione | null>(null)

export function ProviderAuth({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false)
  const [sessione, setSessione] = useState<Session | null>(null)
  const [profilo, setProfilo] = useState<Profilo | null>(null)

  useEffect(() => {
    if (!configurato) {
      setPronto(true)
      return
    }
    let vivo = true

    void sb.auth.getSession().then(({ data }) => {
      if (!vivo) return
      setSessione(data.session)
      setPronto(true)
      if (data.session) avviaSync()
    })

    const { data: osservatore } = sb.auth.onAuthStateChange((_evento, nuova) => {
      setSessione(nuova)
      if (nuova) avviaSync()
      else fermaSync()
    })

    return () => {
      vivo = false
      osservatore.subscription.unsubscribe()
    }
  }, [])

  // Il profilo arriva dalla copia locale: appena la discesa porta la tabella
  // profiles, il nome e il ruolo compaiono senza altre chiamate.
  useEffect(() => {
    const utente = sessione?.user.id
    if (!utente) {
      setProfilo(null)
      return
    }
    let vivo = true
    const leggi = async () => {
      const p = await db.profiles.get(utente)
      if (vivo) setProfilo(p ?? null)
    }
    void leggi()
    const timer = setInterval(leggi, 5000)
    return () => {
      vivo = false
      clearInterval(timer)
    }
  }, [sessione?.user.id])

  const valore = useMemo<Autenticazione>(
    () => ({
      pronto,
      sessione,
      profilo,
      entra: async (email, password) => {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw new Error(traduciErrore(error.message))
      },
      esci: async () => {
        fermaSync()
        await sb.auth.signOut()
        // Il locale si svuota: su un telefono condiviso i dati dei clienti non
        // devono restare leggibili dopo l'uscita.
        await azzeraLocale()
      },
    }),
    [pronto, sessione, profilo],
  )

  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>
}

export function useAuth(): Autenticazione {
  const c = useContext(Contesto)
  if (!c) throw new Error('useAuth usato fuori dal provider')
  return c
}

function traduciErrore(messaggio: string): string {
  if (/invalid login credentials/i.test(messaggio)) return 'Email o password non corretti.'
  if (/email not confirmed/i.test(messaggio)) return "L'indirizzo email non è ancora stato confermato."
  if (/failed to fetch|network/i.test(messaggio)) {
    return 'Server non raggiungibile: il primo accesso richiede la connessione.'
  }
  return messaggio
}
