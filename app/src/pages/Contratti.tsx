import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { aggiungiMesi, formatta, giorniTra, oggi, quantoManca } from '../lib/dates'
import { elimina, nuovoId, salva } from '../lib/db'
import { useClienti, useContratti } from '../lib/dati'
import {
  ETICHETTE_PERIODICITA, ETICHETTE_TIPO_CONTRATTO,
  type Contratto, type Periodicita, type StatoContratto, type TipoContratto,
} from '../lib/types'
import {
  Area, Bottone, Campo, Finestra, Intestazione, Pillola, Scelta, Scheda, Spunta, Testo, Vuoto, unisci,
} from '../components/ui'

// Contratti e abbonamenti: il tuo software, i canoni di assistenza, i noleggi.
// Il rinnovo e' un'operazione di un tocco, perche' e' quella che si fa decine di
// volte l'anno: sposta la scadenza di un periodo e rimette il contratto in corso.

const MESI_PER_PERIODICITA: Record<Periodicita, number> = {
  mensile: 1,
  trimestrale: 3,
  semestrale: 6,
  annuale: 12,
  biennale: 24,
  una_tantum: 0,
}

type Vista = 'da_rinnovare' | 'tutti' | 'scaduti'

const ETICHETTE_VISTA: Record<Vista, string> = {
  da_rinnovare: 'In scadenza e scaduti',
  tutti: 'Tutti',
  scaduti: 'Solo scaduti',
}

export default function Contratti() {
  const contratti = useContratti()
  const clienti = useClienti()
  const [parametri, setParametri] = useSearchParams()
  const [vista, setVista] = useState<Vista>('da_rinnovare')
  const [cerca, setCerca] = useState('')
  const [inModifica, setInModifica] = useState<Contratto | null>(null)

  const nomi = useMemo(() => new Map(clienti.map((c) => [c.id, c.ragione_sociale])), [clienti])
  const giorno = oggi()

  // Gli indirizzi ?apri= e ?nuovo= arrivano dallo scadenzario e dalla scheda
  // cliente: aprono direttamente il riquadro giusto.
  const daAprire = parametri.get('apri')
  const nuovoPer = parametri.get('nuovo')
  useEffect(() => {
    if (daAprire) {
      const c = contratti.find((x) => x.id === daAprire)
      if (c) {
        setInModifica(c)
        setParametri({}, { replace: true })
      }
    } else if (nuovoPer) {
      setInModifica(contrattoVuoto(nuovoPer))
      setParametri({}, { replace: true })
    }
  }, [daAprire, nuovoPer, contratti, setParametri])

  const visibili = useMemo(() => {
    const t = cerca.trim().toLowerCase()
    return contratti
      .map((c) => ({ c, giorni: giorniTra(giorno, c.data_scadenza) }))
      .filter(({ c, giorni }) => {
        if (vista === 'scaduti' && giorni >= 0) return false
        if (vista === 'da_rinnovare' && (giorni > 90 || c.stato === 'disdetto' || c.stato === 'rinnovato')) {
          return false
        }
        if (!t) return true
        const cliente = (nomi.get(c.cliente_id) ?? '').toLowerCase()
        return (
          cliente.includes(t) ||
          c.descrizione.toLowerCase().includes(t) ||
          (c.licenza ?? '').toLowerCase().includes(t)
        )
      })
  }, [contratti, vista, cerca, nomi, giorno])

  const totaleAnnuo = useMemo(
    () =>
      contratti
        .filter((c) => c.stato === 'attivo' && c.importo)
        .reduce((somma, c) => {
          const mesi = MESI_PER_PERIODICITA[c.periodicita]
          if (mesi === 0) return somma
          return somma + (c.importo ?? 0) * (12 / mesi)
        }, 0),
    [contratti],
  )

  return (
    <div>
      <Intestazione
        titolo="Contratti e abbonamenti"
        sottotitolo={
          totaleAnnuo > 0
            ? `Valore ricorrente su base annua: € ${totaleAnnuo.toFixed(2).replace('.', ',')}`
            : undefined
        }
        azioni={
          <Bottone variante="primario" onClick={() => setInModifica(contrattoVuoto(''))}>
            Nuovo contratto
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
        <input
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="Cerca cliente, descrizione, licenza…"
          className="min-w-44 flex-1 rounded-lg border border-slate-300 px-4 py-1.5 text-sm outline-none focus:border-slate-500"
        />
      </div>

      {visibili.length === 0 ? (
        <Vuoto testo="Nessun contratto con questi filtri." />
      ) : (
        <Scheda className="divide-y divide-slate-100">
          {visibili.map(({ c, giorni }) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setInModifica(c)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-slate-900">
                    {nomi.get(c.cliente_id) ?? '—'}
                  </span>
                  <Pillola tono={c.tipo === 'software' ? 'viola' : 'neutro'}>
                    {ETICHETTE_TIPO_CONTRATTO[c.tipo]}
                  </Pillola>
                  {c.stato === 'disdetto' && <Pillola>disdetto</Pillola>}
                  {c.rinnovo_automatico && <Pillola tono="blu">auto</Pillola>}
                </div>
                <div className="truncate text-sm text-slate-600">
                  {c.descrizione || '—'}
                  {c.importo ? ` · € ${c.importo.toFixed(2).replace('.', ',')} ${ETICHETTE_PERIODICITA[c.periodicita].toLowerCase()}` : ''}
                </div>
              </button>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold text-slate-900">{formatta(c.data_scadenza)}</div>
                <div className={unisci('text-xs', giorni < 0 ? 'text-rose-700' : 'text-slate-500')}>
                  {quantoManca(giorni)}
                </div>
              </div>
              {c.periodicita !== 'una_tantum' && c.stato !== 'disdetto' && (
                <Bottone
                  className="shrink-0 px-2 py-1 text-xs"
                  onClick={() => void rinnova(c)}
                  title="Sposta la scadenza di un periodo"
                >
                  Rinnova
                </Bottone>
              )}
            </div>
          ))}
        </Scheda>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Le scadenze di questi contratti compaiono nello{' '}
        <Link to="/" className="underline">
          scadenzario
        </Link>{' '}
        insieme alle verifiche periodiche.
      </p>

      <FormContratto contratto={inModifica} chiudi={() => setInModifica(null)} />
    </div>
  )
}

/**
 * Rinnovo: la nuova scadenza si calcola dalla precedente, non da oggi, cosi' un
 * contratto rinnovato in ritardo non perde i giorni di cui il cliente ha
 * diritto. Se il ritardo e' tale che la nuova data sarebbe comunque passata, si
 * continua a sommare periodi fino a superare la data di oggi.
 */
async function rinnova(c: Contratto): Promise<void> {
  const mesi = MESI_PER_PERIODICITA[c.periodicita]
  if (mesi === 0) return
  let nuova = aggiungiMesi(c.data_scadenza, mesi)
  const giorno = oggi()
  let giri = 0
  while (nuova < giorno && giri < 120) {
    nuova = aggiungiMesi(nuova, mesi)
    giri += 1
  }
  await salva('contratti', {
    ...c,
    data_scadenza: nuova,
    stato: 'attivo',
  } as unknown as Record<string, unknown>)
}

function contrattoVuoto(clienteId: string): Contratto {
  return {
    id: nuovoId(),
    cliente_id: clienteId,
    tipo: 'software',
    descrizione: '',
    data_inizio: oggi(),
    data_scadenza: aggiungiMesi(oggi(), 12),
    periodicita: 'annuale',
    importo: null,
    licenza: null,
    rinnovo_automatico: false,
    stato: 'attivo',
    note: null,
    updated_at: '', deleted: false,
  }
}

function FormContratto({
  contratto, chiudi,
}: {
  contratto: Contratto | null
  chiudi: () => void
}) {
  const clienti = useClienti()
  const [bozza, setBozza] = useState<Contratto | null>(contratto)
  if (contratto?.id !== bozza?.id) setBozza(contratto)
  if (!bozza) return null

  const campo = <K extends keyof Contratto>(k: K, v: Contratto[K]) => setBozza({ ...bozza, [k]: v })
  const completo = Boolean(bozza.cliente_id && bozza.data_scadenza)

  return (
    <Finestra
      titolo={contratto?.updated_at ? 'Modifica contratto' : 'Nuovo contratto'}
      aperta
      chiudi={chiudi}
      largaIn
    >
      <div className="space-y-3">
        <Campo etichetta="Cliente" obbligatorio>
          <Scelta value={bozza.cliente_id} onChange={(e) => campo('cliente_id', e.target.value)}>
            <option value="">— scegliere —</option>
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ragione_sociale}
              </option>
            ))}
          </Scelta>
        </Campo>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Tipo">
            <Scelta value={bozza.tipo} onChange={(e) => campo('tipo', e.target.value as TipoContratto)}>
              {Object.entries(ETICHETTE_TIPO_CONTRATTO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
          <Campo etichetta="Stato">
            <Scelta value={bozza.stato} onChange={(e) => campo('stato', e.target.value as StatoContratto)}>
              <option value="attivo">In corso</option>
              <option value="scaduto">Scaduto</option>
              <option value="rinnovato">Sostituito da un rinnovo</option>
              <option value="disdetto">Disdetto</option>
            </Scelta>
          </Campo>
        </div>

        <Campo etichetta="Descrizione" suggerimento="Per esempio: licenza gestionale 3 postazioni">
          <Testo value={bozza.descrizione} onChange={(e) => campo('descrizione', e.target.value)} />
        </Campo>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Data inizio">
            <Testo
              type="date"
              value={bozza.data_inizio ?? ''}
              onChange={(e) => campo('data_inizio', e.target.value || null)}
            />
          </Campo>
          <Campo etichetta="Scadenza" obbligatorio>
            <Testo
              type="date"
              value={bozza.data_scadenza}
              onChange={(e) => campo('data_scadenza', e.target.value)}
            />
          </Campo>
          <Campo etichetta="Periodicità">
            <Scelta
              value={bozza.periodicita}
              onChange={(e) => campo('periodicita', e.target.value as Periodicita)}
            >
              {Object.entries(ETICHETTE_PERIODICITA).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
          <Campo etichetta="Importo">
            <Testo
              type="number"
              step="0.01"
              min="0"
              value={bozza.importo ?? ''}
              onChange={(e) => campo('importo', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Campo>
        </div>

        <Campo etichetta="Chiave di licenza">
          <Testo
            value={bozza.licenza ?? ''}
            onChange={(e) => campo('licenza', e.target.value || null)}
            className="font-mono"
          />
        </Campo>

        <Spunta
          etichetta="Rinnovo automatico (tacito)"
          checked={bozza.rinnovo_automatico}
          onChange={(v) => campo('rinnovo_automatico', v)}
        />

        <Campo etichetta="Note">
          <Area value={bozza.note ?? ''} onChange={(e) => campo('note', e.target.value || null)} />
        </Campo>

        <div className="flex justify-between gap-2 pt-2">
          {contratto?.updated_at ? (
            <Bottone
              variante="pericolo"
              onClick={async () => {
                await elimina('contratti', bozza.id)
                chiudi()
              }}
            >
              Elimina
            </Bottone>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Bottone onClick={chiudi}>Annulla</Bottone>
            <Bottone
              variante="primario"
              disabled={!completo}
              onClick={async () => {
                await salva('contratti', bozza as unknown as Record<string, unknown>)
                chiudi()
              }}
            >
              Salva
            </Bottone>
          </div>
        </div>
      </div>
    </Finestra>
  )
}
