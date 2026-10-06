import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { formatta, giorniTra, oggi, quantoManca } from '../lib/dates'
import { elimina, nuovoId, salva } from '../lib/db'
import {
  useClienti, useDispositivo, useImpostazioni, useInterventi, useSedi,
} from '../lib/dati'
import { prossimaVerifica } from '../lib/scadenze'
import {
  ETICHETTE_STATO_DISPOSITIVO, ETICHETTE_STATO_INTERVENTO, ETICHETTE_TIPO_DISPOSITIVO,
  ETICHETTE_TIPO_INTERVENTO, type Dispositivo, type StatoDispositivo, type TipoDispositivo,
} from '../lib/types'
import {
  Area, Bottone, Campo, Intestazione, Pillola, Scelta, Scheda, Spunta, Testo, Vuoto, unisci,
} from '../components/ui'

export default function DispositivoScheda() {
  const { id } = useParams<{ id: string }>()
  const [parametri] = useSearchParams()
  const nuovo = id === 'nuovo'
  const esistente = useDispositivo(nuovo ? undefined : id)
  const clienteIniziale = parametri.get('cliente') ?? ''

  // L'id della scheda nuova va generato una volta sola: ricalcolarlo a ogni
  // render cambierebbe la `key` e il modulo si svuoterebbe sotto le dita.
  const vuoto = useMemo(() => dispositivoVuoto(clienteIniziale), [clienteIniziale])

  if (nuovo) {
    return <Modulo key={vuoto.id} iniziale={vuoto} nuovo />
  }
  // useLiveQuery restituisce undefined sia mentre legge sia quando la riga non
  // c'e': un messaggio solo copre onestamente i due casi.
  if (!esistente) {
    return (
      <Vuoto testo="Caricamento… Se la scheda non compare, questo apparecchio non è ancora arrivato sul dispositivo: attendere la prossima sincronizzazione." />
    )
  }
  return <Modulo key={esistente.id} iniziale={esistente} nuovo={false} />
}

function dispositivoVuoto(clienteId: string): Dispositivo {
  return {
    id: nuovoId(),
    cliente_id: clienteId,
    sede_id: null,
    matricola: '',
    marca: null, modello: null, provvedimento: null,
    tipo: 'rt',
    data_messa_servizio: null,
    data_ultima_verifica: null,
    firmware_versione: null,
    collegato_pos: false,
    stato: 'attivo',
    data_dismissione: null,
    note: null,
    updated_at: '', deleted: false,
  }
}

function Modulo({ iniziale, nuovo }: { iniziale: Dispositivo; nuovo: boolean }) {
  const navigate = useNavigate()
  const clienti = useClienti()
  const { mesiCadenza } = useImpostazioni()
  const [bozza, setBozza] = useState<Dispositivo>(iniziale)
  const sedi = useSedi(bozza.cliente_id || undefined)
  const storico = useInterventi({ dispositivoId: nuovo ? undefined : iniziale.id })

  const campo = <K extends keyof Dispositivo>(k: K, v: Dispositivo[K]) =>
    setBozza({ ...bozza, [k]: v })

  const scadenza = prossimaVerifica(bozza, mesiCadenza)
  const giorni = scadenza ? giorniTra(oggi(), scadenza) : null
  const completo = Boolean(bozza.cliente_id && bozza.matricola.trim())

  const salvaDispositivo = async () => {
    if (!completo) return
    await salva('dispositivi', {
      ...bozza,
      matricola: bozza.matricola.trim().toUpperCase(),
    } as unknown as Record<string, unknown>)
    navigate(`/dispositivi/${bozza.id}`, { replace: true })
  }

  return (
    <div className="space-y-5">
      <div>
        <Link to="/dispositivi" className="text-sm text-slate-600 hover:underline">
          ← Apparecchi
        </Link>
        <Intestazione
          titolo={nuovo ? 'Nuovo apparecchio' : bozza.matricola || 'Apparecchio'}
          sottotitolo={[bozza.marca, bozza.modello].filter(Boolean).join(' ') || undefined}
          azioni={
            !nuovo ? (
              <Bottone
                variante="primario"
                onClick={() =>
                  navigate(
                    `/interventi/nuovo?dispositivo=${bozza.id}&cliente=${bozza.cliente_id}&tipo=verifica_periodica`,
                  )
                }
              >
                Registra verifica
              </Bottone>
            ) : undefined
          }
        />
      </div>

      {!nuovo && (
        <Scheda
          className={unisci(
            'flex flex-wrap items-center justify-between gap-3 p-4',
            giorni !== null && giorni < 0 && 'border-rose-300 bg-rose-50',
            giorni !== null && giorni >= 0 && giorni <= 30 && 'border-amber-300 bg-amber-50',
          )}
        >
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prossima verifica periodica
            </div>
            {scadenza ? (
              <div className="mt-0.5 text-lg font-bold text-slate-900">
                {formatta(scadenza)}{' '}
                <span className="text-sm font-medium text-slate-600">
                  ({quantoManca(giorni ?? 0)})
                </span>
              </div>
            ) : (
              <div className="mt-0.5 text-sm text-slate-700">
                Non calcolabile: manca sia l&apos;ultima verifica sia la messa in servizio.
              </div>
            )}
          </div>
          <div className="text-right text-xs text-slate-600">
            cadenza di {mesiCadenza} mesi
            <br />
            dal {bozza.data_ultima_verifica ? 'ultima verifica' : 'messa in servizio'}
          </div>
        </Scheda>
      )}

      <Scheda className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Cliente" obbligatorio>
            <Scelta
              value={bozza.cliente_id}
              onChange={(e) => setBozza({ ...bozza, cliente_id: e.target.value, sede_id: null })}
            >
              <option value="">— scegliere —</option>
              {clienti.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ragione_sociale}
                </option>
              ))}
            </Scelta>
          </Campo>
          <Campo etichetta="Sede">
            <Scelta
              value={bozza.sede_id ?? ''}
              onChange={(e) => campo('sede_id', e.target.value || null)}
              disabled={sedi.length === 0}
            >
              <option value="">{sedi.length === 0 ? 'nessuna sede registrata' : '— nessuna —'}</option>
              {sedi.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </Scelta>
          </Campo>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            etichetta="Matricola"
            obbligatorio
            suggerimento="La matricola assegnata dall'Agenzia delle Entrate"
          >
            <Testo
              value={bozza.matricola}
              onChange={(e) => campo('matricola', e.target.value)}
              className="font-mono uppercase"
              autoFocus={nuovo}
            />
          </Campo>
          <Campo etichetta="Tipo">
            <Scelta value={bozza.tipo} onChange={(e) => campo('tipo', e.target.value as TipoDispositivo)}>
              {Object.entries(ETICHETTE_TIPO_DISPOSITIVO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
          <Campo etichetta="Marca">
            <Testo value={bozza.marca ?? ''} onChange={(e) => campo('marca', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Modello">
            <Testo value={bozza.modello ?? ''} onChange={(e) => campo('modello', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Provvedimento di approvazione">
            <Testo
              value={bozza.provvedimento ?? ''}
              onChange={(e) => campo('provvedimento', e.target.value || null)}
            />
          </Campo>
          <Campo etichetta="Versione firmware">
            <Testo
              value={bozza.firmware_versione ?? ''}
              onChange={(e) => campo('firmware_versione', e.target.value || null)}
            />
          </Campo>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Messa in servizio">
            <Testo
              type="date"
              value={bozza.data_messa_servizio ?? ''}
              onChange={(e) => campo('data_messa_servizio', e.target.value || null)}
            />
          </Campo>
          <Campo
            etichetta="Ultima verifica periodica"
            suggerimento="Da qui riparte il conto per la prossima scadenza"
          >
            <Testo
              type="date"
              value={bozza.data_ultima_verifica ?? ''}
              onChange={(e) => campo('data_ultima_verifica', e.target.value || null)}
            />
          </Campo>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Stato">
            <Scelta
              value={bozza.stato}
              onChange={(e) => campo('stato', e.target.value as StatoDispositivo)}
            >
              {Object.entries(ETICHETTE_STATO_DISPOSITIVO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
          {(bozza.stato === 'dismesso' || bozza.data_dismissione) && (
            <Campo etichetta="Data dismissione">
              <Testo
                type="date"
                value={bozza.data_dismissione ?? ''}
                onChange={(e) => campo('data_dismissione', e.target.value || null)}
              />
            </Campo>
          )}
        </div>

        <Spunta
          etichetta="Collegato al POS (adeguamento effettuato)"
          checked={bozza.collegato_pos}
          onChange={(v) => campo('collegato_pos', v)}
        />

        <Campo etichetta="Note">
          <Area value={bozza.note ?? ''} onChange={(e) => campo('note', e.target.value || null)} />
        </Campo>

        <div className="flex flex-wrap justify-between gap-2 pt-1">
          {!nuovo ? (
            <Bottone
              variante="pericolo"
              onClick={async () => {
                if (!confirm('Eliminare questo apparecchio? Lo storico degli interventi resta.')) return
                await elimina('dispositivi', bozza.id)
                navigate('/dispositivi')
              }}
            >
              Elimina
            </Bottone>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Bottone onClick={() => navigate(-1)}>Annulla</Bottone>
            <Bottone variante="primario" onClick={salvaDispositivo} disabled={!completo}>
              Salva
            </Bottone>
          </div>
        </div>
      </Scheda>

      {!nuovo && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-slate-700">
            Storico di questo apparecchio ({storico.length})
          </h2>
          <Scheda className="divide-y divide-slate-100">
            {storico.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">
                Nessun intervento registrato su questo apparecchio.
              </p>
            ) : (
              storico.map((i) => (
                <Link
                  key={i.id}
                  to={`/interventi/${i.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {i.numero ? `n. ${i.numero}` : 'bozza'}
                      </span>
                      <Pillola tono={i.tipo === 'verifica_periodica' ? 'verde' : 'neutro'}>
                        {ETICHETTE_TIPO_INTERVENTO[i.tipo]}
                      </Pillola>
                      {i.tipo === 'verifica_periodica' && !i.ade_trasmessa && i.stato === 'chiuso' && (
                        <Pillola tono="rosso">da trasmettere</Pillola>
                      )}
                    </div>
                    <div className="truncate text-sm text-slate-600">
                      {ETICHETTE_STATO_INTERVENTO[i.stato]}
                      {i.soluzione && ` · ${i.soluzione}`}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-slate-500">{formatta(i.data_intervento)}</div>
                </Link>
              ))
            )}
          </Scheda>
        </section>
      )}
    </div>
  )
}
