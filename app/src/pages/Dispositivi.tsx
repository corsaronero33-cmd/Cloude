import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { formatta, giorniTra, oggi, quantoManca } from '../lib/dates'
import { useClienti, useDispositivi, useImpostazioni } from '../lib/dati'
import { prossimaVerifica } from '../lib/scadenze'
import { ETICHETTE_STATO_DISPOSITIVO } from '../lib/types'
import { Bottone, Intestazione, Pillola, Scheda, Vuoto, unisci } from '../components/ui'

// Elenco degli apparecchi con i filtri che servono davvero nel lavoro di tutti
// i giorni: chi e' in ritardo con la verifica, chi deve ancora essere adeguato
// al collegamento con il POS, e chi ha la scheda incompleta.

type Filtro = 'tutti' | 'scadute' | 'senza-date' | 'pos' | 'dismessi'

const ETICHETTE_FILTRO: Record<Filtro, string> = {
  tutti: 'Attivi',
  scadute: 'Verifica scaduta',
  'senza-date': 'Date mancanti',
  pos: 'POS da collegare',
  dismessi: 'Dismessi e magazzino',
}

export default function Dispositivi() {
  const dispositivi = useDispositivi()
  const clienti = useClienti()
  const { mesiCadenza } = useImpostazioni()
  const navigate = useNavigate()
  const [parametri, setParametri] = useSearchParams()
  const [cerca, setCerca] = useState('')

  const filtro = (parametri.get('filtro') as Filtro | null) ?? 'tutti'
  const nomi = useMemo(() => new Map(clienti.map((c) => [c.id, c.ragione_sociale])), [clienti])
  const giorno = oggi()

  const righe = useMemo(() => {
    const t = cerca.trim().toLowerCase()
    return dispositivi
      .map((d) => {
        const scadenza = prossimaVerifica(d, mesiCadenza)
        return {
          d,
          cliente: nomi.get(d.cliente_id) ?? '—',
          scadenza,
          giorni: scadenza ? giorniTra(giorno, scadenza) : null,
        }
      })
      .filter((r) => {
        const attivo = r.d.stato === 'attivo' || r.d.stato === 'fuori_servizio'
        if (filtro === 'dismessi' && attivo) return false
        if (filtro !== 'dismessi' && !attivo) return false
        if (filtro === 'scadute' && !(r.giorni !== null && r.giorni < 0)) return false
        if (filtro === 'senza-date' && r.scadenza !== null) return false
        if (filtro === 'pos' && (r.d.collegato_pos || r.d.stato !== 'attivo')) return false
        if (!t) return true
        return (
          r.d.matricola.toLowerCase().includes(t) ||
          r.cliente.toLowerCase().includes(t) ||
          [r.d.marca, r.d.modello].filter(Boolean).join(' ').toLowerCase().includes(t)
        )
      })
      .sort((a, b) => {
        // In cima quello che scade prima; le schede senza date restano in fondo,
        // dove si notano comunque perche' sono marcate.
        if (a.scadenza && b.scadenza) return a.scadenza.localeCompare(b.scadenza)
        if (a.scadenza) return -1
        if (b.scadenza) return 1
        return a.d.matricola.localeCompare(b.d.matricola)
      })
  }, [dispositivi, nomi, mesiCadenza, filtro, cerca, giorno])

  return (
    <div>
      <Intestazione
        titolo="Apparecchi"
        sottotitolo="Registratori telematici e misuratori installati"
        azioni={
          <Bottone variante="primario" onClick={() => navigate('/dispositivi/nuovo')}>
            Nuovo apparecchio
          </Bottone>
        }
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(ETICHETTE_FILTRO) as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setParametri(f === 'tutti' ? {} : { filtro: f })}
            className={unisci(
              'rounded-full px-3 py-1.5 text-sm font-semibold transition',
              filtro === f
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
            )}
          >
            {ETICHETTE_FILTRO[f]}
          </button>
        ))}
      </div>

      <input
        value={cerca}
        onChange={(e) => setCerca(e.target.value)}
        placeholder="Cerca per matricola, cliente, modello…"
        className="mb-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
      />

      {righe.length === 0 ? (
        <Vuoto testo="Nessun apparecchio con questi filtri." />
      ) : (
        <Scheda className="divide-y divide-slate-100">
          {righe.map(({ d, cliente, scadenza, giorni }) => (
            <Link
              key={d.id}
              to={`/dispositivi/${d.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">{d.matricola}</span>
                  {d.stato !== 'attivo' && <Pillola>{ETICHETTE_STATO_DISPOSITIVO[d.stato]}</Pillola>}
                  {d.stato === 'attivo' && !d.collegato_pos && (
                    <Pillola tono="ambra">POS</Pillola>
                  )}
                </div>
                <div className="truncate text-sm text-slate-600">
                  {cliente}
                  {(d.marca || d.modello) && ` · ${[d.marca, d.modello].filter(Boolean).join(' ')}`}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs">
                {scadenza ? (
                  <>
                    <div className="font-semibold text-slate-800">{formatta(scadenza)}</div>
                    <div
                      className={unisci(
                        giorni !== null && giorni < 0
                          ? 'text-rose-700'
                          : giorni !== null && giorni <= 30
                            ? 'text-amber-700'
                            : 'text-slate-500',
                      )}
                    >
                      {giorni !== null ? quantoManca(giorni) : ''}
                    </div>
                  </>
                ) : (
                  <Pillola tono="ambra">date mancanti</Pillola>
                )}
              </div>
            </Link>
          ))}
        </Scheda>
      )}
    </div>
  )
}
