import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Firma from '../components/Firma'
import {
  Area, Bottone, Campo, Intestazione, Pillola, Scelta, Scheda, Spunta, Testo, Vuoto,
} from '../components/ui'
import { useAuth } from '../lib/auth'
import { adesso, oggi, oraCorrente, oreTra } from '../lib/dates'
import { elimina, nuovoId, salva } from '../lib/db'
import {
  useClienti, useDispositivi, useImpostazioni, useIntervento, useProfili, useRighe, useSedi,
} from '../lib/dati'
import { scaricaRapportino } from '../lib/pdf'
import {
  ETICHETTE_PRIORITA, ETICHETTE_STATO_INTERVENTO, ETICHETTE_TIPO_INTERVENTO,
  type Intervento, type InterventoRiga, type Priorita, type StatoIntervento, type TipoIntervento,
} from '../lib/types'

// Il rapportino. E' la schermata che decide se l'app verra' usata: se compilarla
// sul telefono costa piu' di due minuti, il tecnico torna alla carta. Per questo
// i campi sono precompilati dove possibile (data di oggi, ora corrente, tecnico
// che ha fatto l'accesso) e la firma sta in fondo, pronta da raccogliere.

export default function InterventoScheda() {
  const { id } = useParams<{ id: string }>()
  const [parametri] = useSearchParams()
  const { sessione } = useAuth()
  const nuovo = id === 'nuovo'
  const esistente = useIntervento(nuovo ? undefined : id)

  const clienteIniziale = parametri.get('cliente') ?? ''
  const dispositivoIniziale = parametri.get('dispositivo') ?? ''
  const tipoIniziale = (parametri.get('tipo') as TipoIntervento | null) ?? 'hardware'

  const vuoto = useMemo(
    () => interventoVuoto(clienteIniziale, dispositivoIniziale, tipoIniziale, sessione?.user.id ?? null),
    [clienteIniziale, dispositivoIniziale, tipoIniziale, sessione?.user.id],
  )

  if (nuovo) return <Modulo key={vuoto.id} iniziale={vuoto} nuovo />
  if (!esistente) {
    return (
      <Vuoto testo="Caricamento… Se la scheda non compare, questo intervento non è ancora arrivato sul dispositivo: attendere la prossima sincronizzazione." />
    )
  }
  return <Modulo key={esistente.id} iniziale={esistente} nuovo={false} />
}

function interventoVuoto(
  clienteId: string,
  dispositivoId: string,
  tipo: TipoIntervento,
  tecnicoId: string | null,
): Intervento {
  return {
    id: nuovoId(),
    numero: null,
    cliente_id: clienteId,
    sede_id: null,
    dispositivo_id: dispositivoId || null,
    tipo,
    stato: 'in_corso',
    priorita: 'normale',
    data_apertura: adesso(),
    data_intervento: oggi(),
    ora_inizio: oraCorrente(),
    ora_fine: null,
    tecnico_id: tecnicoId,
    problema: null,
    soluzione: null,
    ore: null,
    da_fatturare: true,
    fatturato: false,
    firma_base64: null,
    firma_nome: null,
    verifica_esito: null,
    verifica_sigilli: null,
    verifica_libretto: null,
    ade_trasmessa: false,
    ade_trasmessa_il: null,
    note: null,
    updated_at: '', deleted: false,
  }
}

function Modulo({ iniziale, nuovo }: { iniziale: Intervento; nuovo: boolean }) {
  const navigate = useNavigate()
  const clienti = useClienti()
  const profili = useProfili()
  const { valori } = useImpostazioni()
  const [bozza, setBozza] = useState<Intervento>(iniziale)
  const sedi = useSedi(bozza.cliente_id || undefined)
  const dispositiviCliente = useDispositivi(bozza.cliente_id || undefined)
  const righeSalvate = useRighe(nuovo ? undefined : iniziale.id)

  const [righe, setRighe] = useState<InterventoRiga[]>([])
  const [righeToccate, setRigheToccate] = useState(false)
  const [aggiornaVerifica, setAggiornaVerifica] = useState(true)
  const [salvato, setSalvato] = useState<string | null>(null)

  // Le righe arrivano da IndexedDB in un secondo momento: si copiano nello
  // stato locale finche' l'utente non le ha toccate, per non sovrascrivere
  // quello che sta scrivendo.
  useEffect(() => {
    if (!righeToccate) setRighe(righeSalvate)
  }, [righeSalvate, righeToccate])

  const campo = <K extends keyof Intervento>(k: K, v: Intervento[K]) => {
    setBozza((precedente) => {
      const dopo = { ...precedente, [k]: v }
      // Le ore si ricalcolano da sole quando si toccano gli orari: un conto in
      // meno da fare a mano sul posto.
      if (k === 'ora_inizio' || k === 'ora_fine') {
        const calcolate = oreTra(dopo.ora_inizio, dopo.ora_fine)
        if (calcolate !== null) dopo.ore = calcolate
      }
      return dopo
    })
  }

  const dispositivo = dispositiviCliente.find((d) => d.id === bozza.dispositivo_id)
  const cliente = clienti.find((c) => c.id === bozza.cliente_id)
  const sede = sedi.find((s) => s.id === bozza.sede_id)
  const tecnico = profili.find((p) => p.id === bozza.tecnico_id)
  const isVerifica = bozza.tipo === 'verifica_periodica'
  const completo = Boolean(bozza.cliente_id)

  const salvaTutto = async () => {
    if (!completo) return
    await salva('interventi', bozza as unknown as Record<string, unknown>)

    // Righe: si salva quello che c'e' e si marcano eliminate quelle rimosse.
    const presenti = new Set(righe.map((r) => r.id))
    for (const r of righe) {
      await salva('intervento_righe', { ...r, intervento_id: bozza.id } as unknown as Record<string, unknown>)
    }
    for (const r of righeSalvate) {
      if (!presenti.has(r.id)) await elimina('intervento_righe', r.id)
    }

    // Una verifica periodica conclusa sposta in avanti la scadenza
    // dell'apparecchio: e' il punto in cui il lavoro svolto e lo scadenzario si
    // riagganciano, e lasciarlo a mano significherebbe dimenticarselo.
    if (
      isVerifica && aggiornaVerifica && bozza.stato === 'chiuso'
      && bozza.verifica_esito === 'regolare' && dispositivo && bozza.data_intervento
      && dispositivo.data_ultima_verifica !== bozza.data_intervento
    ) {
      await salva('dispositivi', {
        ...dispositivo,
        data_ultima_verifica: bozza.data_intervento,
      } as unknown as Record<string, unknown>)
    }

    setSalvato('Salvato')
    setTimeout(() => setSalvato(null), 2500)
    if (nuovo) navigate(`/interventi/${bozza.id}`, { replace: true })
  }

  const [pdfInCorso, setPdfInCorso] = useState(false)

  const scaricaPdf = async () => {
    setPdfInCorso(true)
    try {
      await scaricaRapportino({
        intervento: bozza,
        cliente,
        sede,
        dispositivo,
        righe,
        tecnico: tecnico?.nome ?? '',
        azienda: valori,
      })
    } finally {
      setPdfInCorso(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/interventi" className="text-sm text-slate-600 hover:underline">
          ← Interventi
        </Link>
        <Intestazione
          titolo={nuovo ? 'Nuovo intervento' : `Intervento ${bozza.numero ? `n. ${bozza.numero}` : '(bozza)'}`}
          sottotitolo={cliente?.ragione_sociale}
          azioni={
            <>
              {!nuovo && (
                <Bottone onClick={() => void scaricaPdf()} disabled={pdfInCorso}>
                  {pdfInCorso ? 'Preparo il PDF…' : 'Rapportino PDF'}
                </Bottone>
              )}
              <Bottone variante="primario" onClick={salvaTutto} disabled={!completo}>
                {salvato ?? 'Salva'}
              </Bottone>
            </>
          }
        />
        {!bozza.numero && !nuovo && (
          <p className="mb-2 text-xs text-slate-500">
            Il numero progressivo viene assegnato quando l&apos;intervento arriva al server.
          </p>
        )}
      </div>

      <Scheda className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Cliente" obbligatorio>
            <Scelta
              value={bozza.cliente_id}
              onChange={(e) =>
                setBozza({ ...bozza, cliente_id: e.target.value, sede_id: null, dispositivo_id: null })
              }
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

        <Campo etichetta="Apparecchio" suggerimento="Lasciare vuoto per un intervento non legato a un apparecchio">
          <Scelta
            value={bozza.dispositivo_id ?? ''}
            onChange={(e) => campo('dispositivo_id', e.target.value || null)}
            disabled={dispositiviCliente.length === 0}
          >
            <option value="">
              {dispositiviCliente.length === 0 ? 'nessun apparecchio per questo cliente' : '— nessuno —'}
            </option>
            {dispositiviCliente.map((d) => (
              <option key={d.id} value={d.id}>
                {d.matricola} {[d.marca, d.modello].filter(Boolean).join(' ')}
              </option>
            ))}
          </Scelta>
        </Campo>

        <div className="grid gap-3 sm:grid-cols-3">
          <Campo etichetta="Tipo">
            <Scelta value={bozza.tipo} onChange={(e) => campo('tipo', e.target.value as TipoIntervento)}>
              {Object.entries(ETICHETTE_TIPO_INTERVENTO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
          <Campo etichetta="Stato">
            <Scelta value={bozza.stato} onChange={(e) => campo('stato', e.target.value as StatoIntervento)}>
              {Object.entries(ETICHETTE_STATO_INTERVENTO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
          <Campo etichetta="Priorità">
            <Scelta value={bozza.priorita} onChange={(e) => campo('priorita', e.target.value as Priorita)}>
              {Object.entries(ETICHETTE_PRIORITA).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </Scelta>
          </Campo>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Campo etichetta="Data">
            <Testo
              type="date"
              value={bozza.data_intervento ?? ''}
              onChange={(e) => campo('data_intervento', e.target.value || null)}
            />
          </Campo>
          <Campo etichetta="Dalle">
            <Testo
              type="time"
              value={bozza.ora_inizio ?? ''}
              onChange={(e) => campo('ora_inizio', e.target.value || null)}
            />
          </Campo>
          <Campo etichetta="Alle">
            <Testo
              type="time"
              value={bozza.ora_fine ?? ''}
              onChange={(e) => campo('ora_fine', e.target.value || null)}
            />
          </Campo>
          <Campo etichetta="Ore">
            <Testo
              type="number"
              step="0.25"
              min="0"
              value={bozza.ore ?? ''}
              onChange={(e) => campo('ore', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Campo>
        </div>

        <Campo etichetta="Tecnico">
          <Scelta
            value={bozza.tecnico_id ?? ''}
            onChange={(e) => campo('tecnico_id', e.target.value || null)}
          >
            <option value="">— nessuno —</option>
            {profili.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Scelta>
        </Campo>

        <Campo etichetta="Problema rilevato">
          <Area
            value={bozza.problema ?? ''}
            onChange={(e) => campo('problema', e.target.value || null)}
            placeholder="Che cosa ha segnalato il cliente, che cosa si è trovato"
          />
        </Campo>
        <Campo etichetta="Lavoro eseguito">
          <Area
            value={bozza.soluzione ?? ''}
            onChange={(e) => campo('soluzione', e.target.value || null)}
            placeholder="Che cosa è stato fatto, ricambi sostituiti, esito"
          />
        </Campo>
      </Scheda>

      {isVerifica && (
        <Scheda className="space-y-3 border-emerald-200 bg-emerald-50/50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            Verifica periodica
            {bozza.stato === 'chiuso' && !bozza.ade_trasmessa && (
              <Pillola tono="rosso">da trasmettere ad AdE</Pillola>
            )}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo etichetta="Esito">
              <Scelta
                value={bozza.verifica_esito ?? ''}
                onChange={(e) =>
                  campo('verifica_esito', (e.target.value || null) as Intervento['verifica_esito'])
                }
              >
                <option value="">— non indicato —</option>
                <option value="regolare">Regolare</option>
                <option value="irregolare">Irregolare</option>
              </Scelta>
            </Campo>
            <Campo etichetta="Sigilli">
              <Testo
                value={bozza.verifica_sigilli ?? ''}
                onChange={(e) => campo('verifica_sigilli', e.target.value || null)}
              />
            </Campo>
            <Campo etichetta="Libretto fiscale">
              <Testo
                value={bozza.verifica_libretto ?? ''}
                onChange={(e) => campo('verifica_libretto', e.target.value || null)}
                placeholder="pagina / riferimento"
              />
            </Campo>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <Spunta
              etichetta="Trasmessa a Fatture e Corrispettivi"
              checked={bozza.ade_trasmessa}
              onChange={(v) =>
                setBozza({
                  ...bozza,
                  ade_trasmessa: v,
                  ade_trasmessa_il: v ? (bozza.ade_trasmessa_il ?? oggi()) : null,
                })
              }
            />
            {bozza.ade_trasmessa && (
              <div className="mt-2 max-w-48">
                <Campo etichetta="Data di trasmissione">
                  <Testo
                    type="date"
                    value={bozza.ade_trasmessa_il ?? ''}
                    onChange={(e) => campo('ade_trasmessa_il', e.target.value || null)}
                  />
                </Campo>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Finché questa casella resta vuota, la verifica compare fra gli adempimenti arretrati
              nello scadenzario.
            </p>
          </div>

          {dispositivo && (
            <Spunta
              etichetta={`Alla chiusura, aggiorna l'ultima verifica di ${dispositivo.matricola} a questa data`}
              checked={aggiornaVerifica}
              onChange={setAggiornaVerifica}
            />
          )}
        </Scheda>
      )}

      <RigheIntervento
        righe={righe}
        onCambia={(r) => {
          setRigheToccate(true)
          setRighe(r)
        }}
      />

      <Scheda className="space-y-3 p-4">
        <Firma
          valore={bozza.firma_base64}
          onCambia={(v) => campo('firma_base64', v)}
          nome={bozza.firma_nome ?? ''}
          onNome={(v) => campo('firma_nome', v || null)}
        />
        <div className="grid gap-1 sm:grid-cols-2">
          <Spunta
            etichetta="Da fatturare"
            checked={bozza.da_fatturare}
            onChange={(v) => campo('da_fatturare', v)}
          />
          <Spunta
            etichetta="Già fatturato"
            checked={bozza.fatturato}
            onChange={(v) => campo('fatturato', v)}
          />
        </div>
        <Campo etichetta="Note interne">
          <Area value={bozza.note ?? ''} onChange={(e) => campo('note', e.target.value || null)} />
        </Campo>
      </Scheda>

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        {!nuovo ? (
          <Bottone
            variante="pericolo"
            onClick={async () => {
              if (!confirm('Eliminare questo intervento?')) return
              await elimina('interventi', bozza.id)
              navigate('/interventi')
            }}
          >
            Elimina
          </Bottone>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {bozza.stato !== 'chiuso' && (
            <Bottone
              onClick={() => {
                setBozza({
                  ...bozza,
                  stato: 'chiuso',
                  ora_fine: bozza.ora_fine ?? oraCorrente(),
                  ore: bozza.ore ?? oreTra(bozza.ora_inizio, oraCorrente()),
                })
              }}
            >
              Segna come chiuso
            </Bottone>
          )}
          <Bottone variante="primario" onClick={salvaTutto} disabled={!completo}>
            {salvato ?? 'Salva'}
          </Bottone>
        </div>
      </div>
    </div>
  )
}

/** Materiali e prestazioni. Poche colonne, aggiungibili con un tocco. */
function RigheIntervento({
  righe, onCambia,
}: {
  righe: InterventoRiga[]
  onCambia: (r: InterventoRiga[]) => void
}) {
  const aggiungi = () => {
    onCambia([
      ...righe,
      {
        id: nuovoId(), intervento_id: '', tipo: 'manodopera', descrizione: '',
        quantita: 1, prezzo_unitario: null, ricambio_id: null,
        updated_at: '', deleted: false,
      },
    ])
  }

  const modifica = (indice: number, parziale: Partial<InterventoRiga>) => {
    onCambia(righe.map((r, i) => (i === indice ? { ...r, ...parziale } : r)))
  }

  const totale = righe.reduce((s, r) => s + (r.prezzo_unitario ?? 0) * r.quantita, 0)

  return (
    <Scheda className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">Materiali e prestazioni</h2>
        <Bottone onClick={aggiungi} className="px-3 py-1 text-xs">
          Aggiungi riga
        </Bottone>
      </div>
      {righe.length === 0 ? (
        <p className="text-sm text-slate-500">Nessuna riga. Il rapportino può anche restare senza.</p>
      ) : (
        <div className="space-y-2">
          {righe.map((r, i) => (
            <div key={r.id} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 sm:col-span-3">
                <Scelta
                  value={r.tipo}
                  onChange={(e) => modifica(i, { tipo: e.target.value as InterventoRiga['tipo'] })}
                >
                  <option value="manodopera">Manodopera</option>
                  <option value="ricambio">Ricambio</option>
                  <option value="trasferta">Trasferta</option>
                  <option value="altro">Altro</option>
                </Scelta>
              </div>
              <div className="col-span-12 sm:col-span-5">
                <Testo
                  value={r.descrizione}
                  onChange={(e) => modifica(i, { descrizione: e.target.value })}
                  placeholder="Descrizione"
                />
              </div>
              <div className="col-span-4 sm:col-span-1">
                <Testo
                  type="number"
                  step="0.5"
                  min="0"
                  value={r.quantita}
                  onChange={(e) => modifica(i, { quantita: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <Testo
                  type="number"
                  step="0.01"
                  min="0"
                  value={r.prezzo_unitario ?? ''}
                  placeholder="€"
                  onChange={(e) =>
                    modifica(i, {
                      prezzo_unitario: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <Bottone
                  variante="piatto"
                  className="w-full px-2 py-2 text-xs"
                  onClick={() => onCambia(righe.filter((_, k) => k !== i))}
                >
                  togli
                </Bottone>
              </div>
            </div>
          ))}
          {totale > 0 && (
            <div className="border-t border-slate-100 pt-2 text-right text-sm font-bold text-slate-900">
              Totale € {totale.toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>
      )}
    </Scheda>
  )
}
