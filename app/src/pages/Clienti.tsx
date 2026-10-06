import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { nuovoId, salva } from '../lib/db'
import { useClienti, useDispositivi } from '../lib/dati'
import type { Cliente } from '../lib/types'
import {
  Area, Bottone, Campo, Finestra, Intestazione, Pillola, Scheda, Testo, Vuoto,
} from '../components/ui'

export default function Clienti() {
  const clienti = useClienti()
  const dispositivi = useDispositivi()
  const [cerca, setCerca] = useState('')
  const [inModifica, setInModifica] = useState<Cliente | null>(null)

  const conteggioApparecchi = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of dispositivi) {
      if (d.stato === 'dismesso') continue
      m.set(d.cliente_id, (m.get(d.cliente_id) ?? 0) + 1)
    }
    return m
  }, [dispositivi])

  const visibili = useMemo(() => {
    const t = cerca.trim().toLowerCase()
    if (!t) return clienti
    return clienti.filter((c) =>
      [c.ragione_sociale, c.partita_iva, c.citta, c.telefono, c.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t)),
    )
  }, [clienti, cerca])

  return (
    <div>
      <Intestazione
        titolo="Clienti"
        sottotitolo={`${clienti.length} in archivio`}
        azioni={
          <Bottone variante="primario" onClick={() => setInModifica(clienteVuoto())}>
            Nuovo cliente
          </Bottone>
        }
      />

      <input
        value={cerca}
        onChange={(e) => setCerca(e.target.value)}
        placeholder="Cerca per nome, partita IVA, città, telefono…"
        className="mb-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
      />

      {visibili.length === 0 ? (
        <Vuoto
          testo={cerca ? 'Nessun cliente corrisponde alla ricerca.' : 'Non ci sono ancora clienti.'}
          azione={
            !cerca ? (
              <Bottone variante="primario" onClick={() => setInModifica(clienteVuoto())}>
                Inserisci il primo
              </Bottone>
            ) : undefined
          }
        />
      ) : (
        <Scheda className="divide-y divide-slate-100">
          {visibili.map((c) => (
            <Link
              key={c.id}
              to={`/clienti/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-slate-900">{c.ragione_sociale}</span>
                  {!c.attivo && <Pillola>non attivo</Pillola>}
                </div>
                <div className="truncate text-sm text-slate-600">
                  {[c.citta, c.partita_iva && `P.IVA ${c.partita_iva}`, c.telefono]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </div>
              </div>
              {(conteggioApparecchi.get(c.id) ?? 0) > 0 && (
                <Pillola tono="verde">{conteggioApparecchi.get(c.id)} app.</Pillola>
              )}
            </Link>
          ))}
        </Scheda>
      )}

      <FormCliente
        cliente={inModifica}
        chiudi={() => setInModifica(null)}
      />
    </div>
  )
}

export function clienteVuoto(): Cliente {
  return {
    id: nuovoId(),
    ragione_sociale: '',
    partita_iva: null, codice_fiscale: null, codice_sdi: null, pec: null,
    email: null, telefono: null, indirizzo: null, cap: null, citta: null, provincia: null,
    note: null, attivo: true,
    updated_at: '', deleted: false,
  }
}

/** Form unico per creazione e modifica: i campi sono gli stessi. */
export function FormCliente({
  cliente, chiudi,
}: {
  cliente: Cliente | null
  chiudi: () => void
}) {
  const [bozza, setBozza] = useState<Cliente | null>(cliente)

  // Quando il chiamante passa un cliente diverso si riparte da quello.
  if (cliente?.id !== bozza?.id) setBozza(cliente)
  if (!bozza) return null

  const campo = <K extends keyof Cliente>(chiave: K, valore: Cliente[K]) =>
    setBozza({ ...bozza, [chiave]: valore })

  const salvaCliente = async () => {
    const ragione = bozza.ragione_sociale.trim()
    if (!ragione) return
    await salva('clienti', { ...bozza, ragione_sociale: ragione } as unknown as Record<string, unknown>)
    chiudi()
  }

  return (
    <Finestra titolo={cliente?.updated_at ? 'Modifica cliente' : 'Nuovo cliente'} aperta chiudi={chiudi} largaIn>
      <div className="space-y-3">
        <Campo etichetta="Ragione sociale" obbligatorio>
          <Testo
            value={bozza.ragione_sociale}
            onChange={(e) => campo('ragione_sociale', e.target.value)}
            autoFocus
          />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Partita IVA">
            <Testo value={bozza.partita_iva ?? ''} onChange={(e) => campo('partita_iva', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Codice fiscale">
            <Testo value={bozza.codice_fiscale ?? ''} onChange={(e) => campo('codice_fiscale', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Telefono">
            <Testo type="tel" value={bozza.telefono ?? ''} onChange={(e) => campo('telefono', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Email">
            <Testo type="email" value={bozza.email ?? ''} onChange={(e) => campo('email', e.target.value || null)} />
          </Campo>
          <Campo etichetta="Codice SDI">
            <Testo value={bozza.codice_sdi ?? ''} onChange={(e) => campo('codice_sdi', e.target.value || null)} />
          </Campo>
          <Campo etichetta="PEC">
            <Testo value={bozza.pec ?? ''} onChange={(e) => campo('pec', e.target.value || null)} />
          </Campo>
        </div>
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
            <Testo
              maxLength={2}
              value={bozza.provincia ?? ''}
              onChange={(e) => campo('provincia', e.target.value.toUpperCase() || null)}
            />
          </Campo>
        </div>
        <Campo etichetta="Note">
          <Area value={bozza.note ?? ''} onChange={(e) => campo('note', e.target.value || null)} />
        </Campo>

        <div className="flex justify-end gap-2 pt-2">
          <Bottone onClick={chiudi}>Annulla</Bottone>
          <Bottone variante="primario" onClick={salvaCliente} disabled={!bozza.ragione_sociale.trim()}>
            Salva
          </Bottone>
        </div>
      </div>
    </Finestra>
  )
}
