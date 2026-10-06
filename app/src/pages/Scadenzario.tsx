import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatta, quantoManca } from '../lib/dates'
import { useScadenzario } from '../lib/dati'
import { ETICHETTE_FASCIA, type Fascia, type Origine, type Scadenza } from '../lib/scadenze'
import { Intestazione, Pillola, Riquadro, Scheda, Vuoto, unisci } from '../components/ui'

// La schermata di apertura: non un cruscotto decorativo, ma la risposta alla
// domanda "che cosa devo fare adesso". Tutto cio' che si vede qui e' calcolato
// in locale, quindi si apre uguale in ufficio e in mezzo alla strada.

const ORDINE_FASCE: Fascia[] = ['scaduta', 'urgente', 'vicina', 'prossima', 'futura']

const TONO_FASCIA: Record<Fascia, 'rosso' | 'ambra' | 'blu' | 'neutro'> = {
  scaduta: 'rosso',
  urgente: 'ambra',
  vicina: 'blu',
  prossima: 'neutro',
  futura: 'neutro',
}

const ETICHETTE_ORIGINE: Record<Origine, string> = {
  verifica: 'Verifica RT',
  contratto: 'Contratto',
  trasmissione: 'Adempimento',
}

const TONO_ORIGINE: Record<Origine, 'verde' | 'viola' | 'rosso'> = {
  verifica: 'verde',
  contratto: 'viola',
  trasmissione: 'rosso',
}

type Filtro = 'tutte' | Origine

export default function Scadenzario() {
  const { scadenze, riepilogo } = useScadenzario()
  const [filtro, setFiltro] = useState<Filtro>('tutte')
  const [mostraFuture, setMostraFuture] = useState(false)
  const [cerca, setCerca] = useState('')

  const visibili = useMemo(() => {
    const testo = cerca.trim().toLowerCase()
    return scadenze.filter((s) => {
      if (filtro !== 'tutte' && s.origine !== filtro) return false
      if (!mostraFuture && s.fascia === 'futura') return false
      if (!testo) return true
      return (
        s.cliente.toLowerCase().includes(testo) ||
        s.titolo.toLowerCase().includes(testo) ||
        s.dettaglio.toLowerCase().includes(testo)
      )
    })
  }, [scadenze, filtro, mostraFuture, cerca])

  const gruppi = useMemo(() => raggruppa(visibili), [visibili])

  return (
    <div>
      <Intestazione
        titolo="Scadenzario"
        sottotitolo="Verifiche periodiche, rinnovi e adempimenti in un elenco solo"
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Riquadro titolo="Scadute" valore={riepilogo.scadute} tono="rosso" />
        <Riquadro titolo="Entro 7 giorni" valore={riepilogo.settegiorni} tono="ambra" />
        <Riquadro titolo="Entro 30 giorni" valore={riepilogo.trentagiorni} tono="blu" />
        <Riquadro titolo="Da trasmettere" valore={riepilogo.daTrasmettere} tono="rosso" />
        <Riquadro titolo="Interventi aperti" valore={riepilogo.interventiAperti} tono="viola" />
        <Riquadro titolo="Date mancanti" valore={riepilogo.senzaDate} tono="neutro" />
      </div>

      {riepilogo.senzaDate > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ci sono <strong>{riepilogo.senzaDate}</strong> apparecchi attivi senza data di messa in
          servizio né di ultima verifica: non possono comparire nello scadenzario finché il dato non
          viene inserito.{' '}
          <Link to="/dispositivi?filtro=senza-date" className="font-semibold underline">
            Vedi quali sono
          </Link>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(['tutte', 'verifica', 'contratto', 'trasmissione'] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={unisci(
              'rounded-full px-3 py-1.5 text-sm font-semibold transition',
              filtro === f
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
            )}
          >
            {f === 'tutte' ? 'Tutte' : ETICHETTE_ORIGINE[f]}
          </button>
        ))}
        <input
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="Cerca cliente o matricola…"
          className="min-w-40 flex-1 rounded-full border border-slate-300 px-4 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={mostraFuture}
            onChange={(e) => setMostraFuture(e.target.checked)}
            className="size-4 rounded border-slate-400"
          />
          anche le lontane
        </label>
      </div>

      {visibili.length === 0 ? (
        <Vuoto testo="Nessuna scadenza da seguire con questi filtri. Se è il primo avvio, i dati vanno ancora caricati." />
      ) : (
        <div className="space-y-5">
          {ORDINE_FASCE.filter((f) => gruppi[f]?.length).map((fascia) => (
            <section key={fascia}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                {ETICHETTE_FASCIA[fascia]}
                <Pillola tono={TONO_FASCIA[fascia]}>{gruppi[fascia]!.length}</Pillola>
              </h2>
              <Scheda className="divide-y divide-slate-100">
                {gruppi[fascia]!.map((s) => (
                  <RigaScadenza key={s.chiave} s={s} />
                ))}
              </Scheda>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function raggruppa(scadenze: Scadenza[]): Partial<Record<Fascia, Scadenza[]>> {
  const out: Partial<Record<Fascia, Scadenza[]>> = {}
  for (const s of scadenze) {
    const elenco = out[s.fascia] ?? (out[s.fascia] = [])
    elenco.push(s)
  }
  return out
}

function RigaScadenza({ s }: { s: Scadenza }) {
  const destinazione =
    s.origine === 'verifica'
      ? `/dispositivi/${s.riferimento}`
      : s.origine === 'contratto'
        ? `/contratti?apri=${s.riferimento}`
        : `/interventi/${s.riferimento}`

  return (
    <Link to={destinazione} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold text-slate-900">{s.cliente}</span>
          <Pillola tono={TONO_ORIGINE[s.origine]}>{ETICHETTE_ORIGINE[s.origine]}</Pillola>
        </div>
        <div className="mt-0.5 truncate text-sm text-slate-600">
          {s.titolo}
          {s.dettaglio && ` · ${s.dettaglio}`}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold text-slate-900">{formatta(s.data)}</div>
        <div
          className={unisci(
            'text-xs font-medium',
            s.giorni < 0 ? 'text-rose-700' : s.giorni <= 7 ? 'text-amber-700' : 'text-slate-500',
          )}
        >
          {s.origine === 'trasmissione' ? 'in attesa' : quantoManca(s.giorni)}
        </div>
      </div>
    </Link>
  )
}

