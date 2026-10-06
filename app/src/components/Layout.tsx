import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { contaPendenti } from '../lib/db'
import { configurato } from '../lib/supabase'
import { osservaSync, sincronizza, type StatoSync } from '../lib/sync'
import { Bottone, unisci } from './ui'

const VOCI = [
  { a: '/', etichetta: 'Scadenze', icona: '◉' },
  { a: '/interventi', etichetta: 'Interventi', icona: '✎' },
  { a: '/clienti', etichetta: 'Clienti', icona: '☰' },
  { a: '/dispositivi', etichetta: 'Apparecchi', icona: '▣' },
  { a: '/contratti', etichetta: 'Contratti', icona: '§' },
]

const VOCI_SECONDARIE = [
  { a: '/importa', etichetta: 'Importa dati' },
  { a: '/impostazioni', etichetta: 'Impostazioni' },
]

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 md:flex-row">
      <BarraLaterale />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperiore />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 md:pb-8">
          <Outlet />
        </main>
      </div>
      <BarraInferiore />
    </div>
  )
}

function BarraLaterale() {
  return (
    <nav className="hidden w-56 shrink-0 flex-col gap-1 bg-slate-900 p-3 md:flex">
      <div className="mb-4 px-2 pt-1">
        <div className="text-sm font-bold text-white">Gestione Assistenza</div>
        <div className="text-xs text-slate-400">verifiche · scadenze · interventi</div>
      </div>
      {VOCI.map((v) => (
        <NavLink
          key={v.a}
          to={v.a}
          end={v.a === '/'}
          className={({ isActive }) =>
            unisci(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800',
            )
          }
        >
          <span className="w-4 text-center opacity-70">{v.icona}</span>
          {v.etichetta}
        </NavLink>
      ))}
      <div className="mt-4 border-t border-slate-800 pt-3">
        {VOCI_SECONDARIE.map((v) => (
          <NavLink
            key={v.a}
            to={v.a}
            className={({ isActive }) =>
              unisci(
                'block rounded-lg px-3 py-2 text-sm transition',
                isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800',
              )
            }
          >
            {v.etichetta}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function BarraInferiore() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {VOCI.map((v) => (
        <NavLink
          key={v.a}
          to={v.a}
          end={v.a === '/'}
          className={({ isActive }) =>
            unisci(
              'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              isActive ? 'text-slate-900' : 'text-slate-500',
            )
          }
        >
          <span className="text-base leading-none">{v.icona}</span>
          {v.etichetta}
        </NavLink>
      ))}
      <NavLink
        to="/impostazioni"
        className={({ isActive }) =>
          unisci(
            'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
            isActive ? 'text-slate-900' : 'text-slate-500',
          )
        }
      >
        <span className="text-base leading-none">⚙</span>
        Altro
      </NavLink>
    </nav>
  )
}

function BarraSuperiore() {
  const { profilo, esci } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur">
      <div className="text-sm font-bold text-slate-900 md:hidden">Gestione Assistenza</div>
      <div className="flex-1" />
      <IndicatoreSync />
      <div className="hidden text-right text-xs leading-tight md:block">
        <div className="font-semibold text-slate-800">{profilo?.nome || 'Utente'}</div>
        <div className="text-slate-500">{profilo?.ruolo === 'admin' ? 'Amministratore' : 'Tecnico'}</div>
      </div>
      <Bottone
        variante="piatto"
        onClick={async () => {
          await esci()
          navigate('/accesso')
        }}
      >
        Esci
      </Bottone>
    </header>
  )
}

/**
 * L'indicatore piu' importante dell'interfaccia: dice se il lavoro fatto e'
 * arrivato al server. Un tecnico che chiude dieci rapportini in cantina deve
 * poter vedere a colpo d'occhio che dieci cose aspettano ancora di salire.
 */
export function IndicatoreSync() {
  const [stato, setStato] = useState<StatoSync>({ fase: 'inattivo', ultima: null, errore: null })
  const [pendenti, setPendenti] = useState(0)

  useEffect(() => osservaSync(setStato), [])

  useEffect(() => {
    const leggi = () => void contaPendenti().then(setPendenti)
    leggi()
    const t = setInterval(leggi, 2000)
    return () => clearInterval(t)
  }, [])

  const { testo, classe } = descrivi(stato, pendenti)

  return (
    <button
      type="button"
      onClick={() => void sincronizza()}
      title={stato.errore ?? 'Toccare per sincronizzare adesso'}
      className={unisci(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition',
        classe,
      )}
    >
      <span className="size-2 rounded-full bg-current opacity-70" />
      {testo}
    </button>
  )
}

function descrivi(stato: StatoSync, pendenti: number): { testo: string; classe: string } {
  // Il controllo sulla configurazione viene prima di tutto: senza server la
  // sincronizzazione non parte mai, quindi lo stato resterebbe "inattivo" e
  // l'indicatore direbbe "Aggiornato" a proposito di dati che non sono andati
  // da nessuna parte.
  if (!configurato || stato.fase === 'non_configurato') {
    return { testo: 'Solo locale', classe: 'bg-violet-100 text-violet-800' }
  }
  if (stato.fase === 'offline') {
    return {
      testo: pendenti > 0 ? `Offline · ${pendenti} da inviare` : 'Offline',
      classe: 'bg-amber-100 text-amber-800',
    }
  }
  if (stato.fase === 'in_corso') {
    return { testo: 'Sincronizzo…', classe: 'bg-sky-100 text-sky-800' }
  }
  if (stato.errore) {
    return { testo: 'Errore invio', classe: 'bg-rose-100 text-rose-800' }
  }
  if (pendenti > 0) {
    return { testo: `${pendenti} da inviare`, classe: 'bg-amber-100 text-amber-800' }
  }
  return { testo: 'Aggiornato', classe: 'bg-emerald-100 text-emerald-800' }
}
