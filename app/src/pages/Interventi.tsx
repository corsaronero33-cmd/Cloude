import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatta } from '../lib/dates'
import { useClienti, useDispositivi, useInterventi, useProfili } from '../lib/dati'
import {
  ETICHETTE_STATO_INTERVENTO, ETICHETTE_TIPO_INTERVENTO,
  type StatoIntervento, type TipoIntervento,
} from '../lib/types'
import { Bottone, Intestazione, Pillola, Scheda, Vuoto, unisci } from '../components/ui'

type Vista = 'da_fare' | 'tutti' | 'da_fatturare' | 'da_trasmettere'

const ETICHETTE_VISTA: Record<Vista, string> = {
  da_fare: 'Da fare',
  tutti: 'Tutti',
  da_fatturare: 'Da fatturare',
  da_trasmettere: 'Da trasmettere ad AdE',
}

const APERTI = new Set<StatoIntervento>(['aperto', 'in_corso', 'sospeso'])

const TONO_STATO: Record<StatoIntervento, 'ambra' | 'blu' | 'verde' | 'neutro'> = {
  aperto: 'ambra',
  in_corso: 'blu',
  sospeso: 'neutro',
  chiuso: 'verde',
  annullato: 'neutro',
}

export default function Interventi() {
  const interventi = useInterventi()
  const clienti = useClienti()
  const dispositivi = useDispositivi()
  const profili = useProfili()
  const navigate = useNavigate()
  const [vista, setVista] = useState<Vista>('da_fare')
  const [tipo, setTipo] = useState<TipoIntervento | 'tutti'>('tutti')
  const [cerca, setCerca] = useState('')

  const nomiClienti = useMemo(() => new Map(clienti.map((c) => [c.id, c.ragione_sociale])), [clienti])
  const matricole = useMemo(() => new Map(dispositivi.map((d) => [d.id, d.matricola])), [dispositivi])
  const nomiTecnici = useMemo(() => new Map(profili.map((p) => [p.id, p.nome])), [profili])

  const visibili = useMemo(() => {
    const t = cerca.trim().toLowerCase()
    return interventi.filter((i) => {
      if (vista === 'da_fare' && !APERTI.has(i.stato)) return false
      if (vista === 'da_fatturare' && !(i.da_fatturare && !i.fatturato && i.stato === 'chiuso')) return false
      if (vista === 'da_trasmettere'
        && !(i.tipo === 'verifica_periodica' && i.stato === 'chiuso' && !i.ade_trasmessa)) return false
      if (tipo !== 'tutti' && i.tipo !== tipo) return false
      if (!t) return true
      const cliente = (nomiClienti.get(i.cliente_id) ?? '').toLowerCase()
      const matricola = (i.dispositivo_id ? matricole.get(i.dispositivo_id) ?? '' : '').toLowerCase()
      return (
        cliente.includes(t) ||
        matricola.includes(t) ||
        String(i.numero ?? '').includes(t) ||
        (i.problema ?? '').toLowerCase().includes(t) ||
        (i.soluzione ?? '').toLowerCase().includes(t)
      )
    })
  }, [interventi, vista, tipo, cerca, nomiClienti, matricole])

  return (
    <div>
      <Intestazione
        titolo="Interventi"
        sottotitolo="Guasti, assistenza software, verifiche, installazioni"
        azioni={
          <Bottone variante="primario" onClick={() => navigate('/interventi/nuovo')}>
            Nuovo intervento
          </Bottone>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(ETICHETTE_VISTA) as Vista[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className={unisci(
              'rounded-full px-3 py-1.5 text-sm font-semibold transition',
              vista === v
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
            )}
          >
            {ETICHETTE_VISTA[v]}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoIntervento | 'tutti')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        >
          <option value="tutti">Tutti i tipi</option>
          {Object.entries(ETICHETTE_TIPO_INTERVENTO).map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="Cerca cliente, matricola, numero…"
          className="min-w-44 flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      {visibili.length === 0 ? (
        <Vuoto
          testo={
            vista === 'da_fare'
              ? 'Nessun intervento aperto. Buon segno.'
              : 'Nessun intervento con questi filtri.'
          }
        />
      ) : (
        <Scheda className="divide-y divide-slate-100">
          {visibili.map((i) => (
            <Link
              key={i.id}
              to={`/interventi/${i.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {nomiClienti.get(i.cliente_id) ?? '—'}
                  </span>
                  <Pillola tono={TONO_STATO[i.stato]}>{ETICHETTE_STATO_INTERVENTO[i.stato]}</Pillola>
                  {i.priorita === 'urgente' && <Pillola tono="rosso">urgente</Pillola>}
                  {i.tipo === 'verifica_periodica' && i.stato === 'chiuso' && !i.ade_trasmessa && (
                    <Pillola tono="rosso">da trasmettere</Pillola>
                  )}
                </div>
                <div className="truncate text-sm text-slate-600">
                  {ETICHETTE_TIPO_INTERVENTO[i.tipo]}
                  {i.dispositivo_id && matricole.get(i.dispositivo_id)
                    && ` · ${matricole.get(i.dispositivo_id)}`}
                  {i.problema && ` · ${i.problema}`}
                </div>
                {i.tecnico_id && (
                  <div className="text-xs text-slate-500">{nomiTecnici.get(i.tecnico_id) ?? ''}</div>
                )}
              </div>
              <div className="shrink-0 text-right text-xs">
                <div className="font-semibold text-slate-800">{formatta(i.data_intervento)}</div>
                <div className="text-slate-500">{i.numero ? `n. ${i.numero}` : 'non inviato'}</div>
              </div>
            </Link>
          ))}
        </Scheda>
      )}
    </div>
  )
}
