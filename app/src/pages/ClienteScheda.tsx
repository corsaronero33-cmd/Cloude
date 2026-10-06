import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatta, giorniTra, oggi, quantoManca } from '../lib/dates'
import { elimina, nuovoId, salva } from '../lib/db'
import {
  useCliente, useContratti, useDispositivi, useImpostazioni, useInterventi, useSedi,
} from '../lib/dati'
import { prossimaVerifica } from '../lib/scadenze'
import {
  ETICHETTE_STATO_DISPOSITIVO, ETICHETTE_STATO_INTERVENTO, ETICHETTE_TIPO_CONTRATTO,
  ETICHETTE_TIPO_INTERVENTO, type Sede,
} from '../lib/types'
import {
  Area, Bottone, Campo, Finestra, Intestazione, Pillola, Scheda, Testo, Vuoto,
} from '../components/ui'
import { FormCliente } from './Clienti'

export default function ClienteScheda() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const cliente = useCliente(id)
  const sedi = useSedi(id)
  const dispositivi = useDispositivi(id)
  const contratti = useContratti(id)
  const interventi = useInterventi({ clienteId: id })
  const { mesiCadenza } = useImpostazioni()

  const [modificaCliente, setModificaCliente] = useState(false)
  const [sedeInModifica, setSedeInModifica] = useState<Sede | null>(null)

  if (!cliente) {
    return <Vuoto testo="Cliente non trovato. Potrebbe non essere ancora arrivato su questo dispositivo." />
  }

  const recapiti = [
    cliente.indirizzo && [cliente.indirizzo, cliente.cap, cliente.citta, cliente.provincia && `(${cliente.provincia})`].filter(Boolean).join(' '),
    cliente.partita_iva && `P.IVA ${cliente.partita_iva}`,
    cliente.codice_fiscale && `C.F. ${cliente.codice_fiscale}`,
    cliente.telefono,
    cliente.email,
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-5">
      <div>
        <Link to="/clienti" className="text-sm text-slate-600 hover:underline">
          ← Clienti
        </Link>
        <Intestazione
          titolo={cliente.ragione_sociale}
          azioni={
            <>
              <Bottone onClick={() => setModificaCliente(true)}>Modifica</Bottone>
              <Bottone
                variante="primario"
                onClick={() => navigate(`/interventi/nuovo?cliente=${cliente.id}`)}
              >
                Nuovo intervento
              </Bottone>
            </>
          }
        />
        {recapiti.length > 0 && (
          <Scheda className="p-4 text-sm text-slate-700">
            <ul className="space-y-1">
              {recapiti.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {cliente.note && (
              <p className="mt-3 border-t border-slate-100 pt-3 whitespace-pre-wrap text-slate-600">
                {cliente.note}
              </p>
            )}
          </Scheda>
        )}
      </div>

      <Sezione
        titolo="Sedi"
        azione={
          <Bottone onClick={() => setSedeInModifica(sedeVuota(cliente.id))} className="px-3 py-1 text-xs">
            Aggiungi
          </Bottone>
        }
      >
        {sedi.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">
            Nessuna sede separata: gli apparecchi fanno riferimento direttamente al cliente.
          </p>
        ) : (
          sedi.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{s.nome}</div>
                <div className="truncate text-sm text-slate-600">
                  {[s.indirizzo, s.citta, s.referente, s.telefono].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <Bottone variante="piatto" className="px-2 py-1 text-xs" onClick={() => setSedeInModifica(s)}>
                Modifica
              </Bottone>
            </div>
          ))
        )}
      </Sezione>

      <Sezione
        titolo="Apparecchi"
        azione={
          <Bottone
            onClick={() => navigate(`/dispositivi/nuovo?cliente=${cliente.id}`)}
            className="px-3 py-1 text-xs"
          >
            Aggiungi
          </Bottone>
        }
      >
        {dispositivi.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">Nessun apparecchio registrato.</p>
        ) : (
          dispositivi.map((d) => {
            const scadenza = prossimaVerifica(d, mesiCadenza)
            const giorni = scadenza ? giorniTra(oggi(), scadenza) : null
            return (
              <Link
                key={d.id}
                to={`/dispositivi/${d.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-slate-900">{d.matricola}</span>
                    {d.stato !== 'attivo' && (
                      <Pillola>{ETICHETTE_STATO_DISPOSITIVO[d.stato]}</Pillola>
                    )}
                    {!d.collegato_pos && d.stato === 'attivo' && (
                      <Pillola tono="ambra">POS da collegare</Pillola>
                    )}
                  </div>
                  <div className="truncate text-sm text-slate-600">
                    {[d.marca, d.modello].filter(Boolean).join(' ') || '—'}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs">
                  {scadenza ? (
                    <>
                      <div className="font-semibold text-slate-800">{formatta(scadenza)}</div>
                      <div className={giorni !== null && giorni < 0 ? 'text-rose-700' : 'text-slate-500'}>
                        {giorni !== null ? quantoManca(giorni) : ''}
                      </div>
                    </>
                  ) : (
                    <Pillola tono="ambra">date mancanti</Pillola>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </Sezione>

      <Sezione
        titolo="Contratti e abbonamenti"
        azione={
          <Bottone
            onClick={() => navigate(`/contratti?nuovo=${cliente.id}`)}
            className="px-3 py-1 text-xs"
          >
            Aggiungi
          </Bottone>
        }
      >
        {contratti.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">Nessun contratto registrato.</p>
        ) : (
          contratti.map((c) => {
            const giorni = giorniTra(oggi(), c.data_scadenza)
            return (
              <Link
                key={c.id}
                to={`/contratti?apri=${c.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{ETICHETTE_TIPO_CONTRATTO[c.tipo]}</div>
                  <div className="truncate text-sm text-slate-600">{c.descrizione || '—'}</div>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <div className="font-semibold text-slate-800">{formatta(c.data_scadenza)}</div>
                  <div className={giorni < 0 ? 'text-rose-700' : 'text-slate-500'}>
                    {quantoManca(giorni)}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </Sezione>

      <Sezione titolo={`Storico interventi (${interventi.length})`}>
        {interventi.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">Nessun intervento registrato.</p>
        ) : (
          interventi.slice(0, 20).map((i) => (
            <Link
              key={i.id}
              to={`/interventi/${i.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {i.numero ? `n. ${i.numero}` : 'bozza'}
                  </span>
                  <Pillola tono={i.stato === 'chiuso' ? 'verde' : 'ambra'}>
                    {ETICHETTE_STATO_INTERVENTO[i.stato]}
                  </Pillola>
                </div>
                <div className="truncate text-sm text-slate-600">
                  {ETICHETTE_TIPO_INTERVENTO[i.tipo]}
                  {i.problema && ` · ${i.problema}`}
                </div>
              </div>
              <div className="shrink-0 text-xs text-slate-500">{formatta(i.data_intervento)}</div>
            </Link>
          ))
        )}
      </Sezione>

      {modificaCliente && <FormCliente cliente={cliente} chiudi={() => setModificaCliente(false)} />}
      <FormSede sede={sedeInModifica} chiudi={() => setSedeInModifica(null)} />
    </div>
  )
}

function Sezione({
  titolo, azione, children,
}: {
  titolo: string
  azione?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">{titolo}</h2>
        {azione}
      </div>
      <Scheda className="divide-y divide-slate-100">{children}</Scheda>
    </section>
  )
}

function sedeVuota(clienteId: string): Sede {
  return {
    id: nuovoId(), cliente_id: clienteId, nome: '',
    indirizzo: null, cap: null, citta: null, provincia: null,
    telefono: null, referente: null, note: null,
    updated_at: '', deleted: false,
  }
}

function FormSede({ sede, chiudi }: { sede: Sede | null; chiudi: () => void }) {
  const [bozza, setBozza] = useState<Sede | null>(sede)
  if (sede?.id !== bozza?.id) setBozza(sede)
  if (!bozza) return null

  const campo = <K extends keyof Sede>(k: K, v: Sede[K]) => setBozza({ ...bozza, [k]: v })

  return (
    <Finestra titolo={sede?.updated_at ? 'Modifica sede' : 'Nuova sede'} aperta chiudi={chiudi}>
      <div className="space-y-3">
        <Campo etichetta="Nome della sede" obbligatorio suggerimento="Per esempio: Negozio centro, Magazzino, Sede legale">
          <Testo value={bozza.nome} onChange={(e) => campo('nome', e.target.value)} autoFocus />
        </Campo>
        <Campo etichetta="Indirizzo">
          <Testo value={bozza.indirizzo ?? ''} onChange={(e) => campo('indirizzo', e.target.value || null)} />
        </Campo>
        <div className="grid grid-cols-3 gap-3">
          <Campo etichetta="CAP">
            <Testo value={bozza.cap ?? ''} onChange={(e) => campo('cap', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Città">
            <Testo value={bozza.citta ?? ''} onChange={(e) => campo('citta', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Prov.">
            <Testo maxLength={2} value={bozza.provincia ?? ''} onChange={(e) => campo('provincia', e.target.value.toUpperCase() || null)} />
          </Campo>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Referente">
            <Testo value={bozza.referente ?? ''} onChange={(e) => campo('referente', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Telefono">
            <Testo type="tel" value={bozza.telefono ?? ''} onChange={(e) => campo('telefono', e.target.value || null)} />
          </Campo>
        </div>
        <Campo etichetta="Note">
          <Area value={bozza.note ?? ''} onChange={(e) => campo('note', e.target.value || null)} />
        </Campo>
        <div className="flex justify-between gap-2 pt-2">
          {sede?.updated_at ? (
            <Bottone
              variante="pericolo"
              onClick={async () => {
                await elimina('sedi', bozza.id)
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
              disabled={!bozza.nome.trim()}
              onClick={async () => {
                await salva('sedi', { ...bozza, nome: bozza.nome.trim() } as unknown as Record<string, unknown>)
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

