import { useEffect, useRef, useState } from 'react'
import { elimina, nuovoId, salva } from '../lib/db'
import { useAllegati } from '../lib/dati'
import { pesoLeggibile, riduci } from '../lib/immagini'
import { indirizzoFoto } from '../lib/sync'
import type { Allegato } from '../lib/types'
import { Bottone, Pillola, Scheda } from './ui'

/**
 * Le foto di un intervento.
 *
 * Il percorso di una foto e' questo: si scatta, viene ridotta, finisce
 * nell'archivio del telefono e si vede subito. Il caricamento vero avviene
 * dopo, insieme a tutto il resto, quando c'e' rete. Per chi la scatta non
 * cambia niente: la foto c'e' da subito, in galleria non resta copia, e se il
 * telefono e' in cantina il caricamento aspetta senza lamentarsi.
 */
export default function Foto({
  interventoId,
  primaDiAggiungere,
}: {
  interventoId: string
  /**
   * Chiamata prima della prima foto. Serve a salvare l'intervento: una foto
   * appesa a un intervento che non esiste ancora non potrebbe salire.
   */
  primaDiAggiungere?: () => Promise<void>
}) {
  const allegati = useAllegati(interventoId)
  const input = useRef<HTMLInputElement | null>(null)
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const aggiungi = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setInCorso(true)
    setErrore(null)
    try {
      if (primaDiAggiungere) await primaDiAggiungere()
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        const ridotta = await riduci(file)
        const id = nuovoId()
        const allegato: Allegato = {
          id,
          intervento_id: interventoId,
          nome: file.name || 'foto.jpg',
          percorso: `${interventoId}/${id}.jpg`,
          tipo: ridotta.tipo,
          dimensione: ridotta.dimensione,
          blob: ridotta.blob,
          caricato: false,
          updated_at: '',
          deleted: false,
        }
        await salva('allegati', allegato as unknown as Record<string, unknown>)
      }
    } catch (e) {
      setErrore(e instanceof Error ? e.message : String(e))
    } finally {
      setInCorso(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <Scheda className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-800">
          Foto {allegati.length > 0 && <span className="font-normal text-slate-500">({allegati.length})</span>}
        </h2>
        <Bottone onClick={() => input.current?.click()} disabled={inCorso} className="px-3 py-1 text-xs">
          {inCorso ? 'Preparo…' : 'Aggiungi foto'}
        </Bottone>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => void aggiungi(e.target.files)}
      />

      {errore && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">{errore}</p>
      )}

      {allegati.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nessuna foto. Sul telefono il pulsante apre direttamente la fotocamera.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allegati.map((a) => (
            <Riquadro key={a.id} allegato={a} />
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Le foto vengono rimpicciolite prima di essere conservate: restano nitide
        ma pesano poco, così si possono scattare anche senza rete senza riempire il telefono.
      </p>
    </Scheda>
  )
}

function Riquadro({ allegato }: { allegato: Allegato }) {
  const [indirizzo, setIndirizzo] = useState<string | null>(null)

  // Se la foto e' ancora qui, si mostra quella: niente rete, nessuna attesa.
  // Se e' solo sul server (per esempio l'ha scattata un altro tecnico), si
  // chiede un collegamento firmato, perche' il secchio e' privato.
  useEffect(() => {
    let vivo = true
    let creato: string | null = null

    if (allegato.blob) {
      creato = URL.createObjectURL(allegato.blob)
      setIndirizzo(creato)
    } else {
      void indirizzoFoto(allegato.percorso).then((u) => {
        if (vivo) setIndirizzo(u)
      })
    }

    return () => {
      vivo = false
      if (creato) URL.revokeObjectURL(creato)
    }
  }, [allegato.blob, allegato.percorso])

  return (
    <figure className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {indirizzo ? (
        <img
          src={indirizzo}
          alt={allegato.nome}
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center text-xs text-slate-500">
          non disponibile offline
        </div>
      )}

      {allegato.caricato !== true && (
        <Pillola tono="ambra" className="absolute left-1.5 top-1.5">
          da inviare
        </Pillola>
      )}

      <button
        type="button"
        aria-label="Elimina la foto"
        onClick={() => {
          if (!confirm('Eliminare questa foto?')) return
          void elimina('allegati', allegato.id)
        }}
        className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/70 px-2 py-0.5 text-sm leading-none text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
      >
        ×
      </button>

      <figcaption className="px-2 py-1 text-[11px] text-slate-500">
        {pesoLeggibile(allegato.dimensione)}
      </figcaption>
    </figure>
  )
}
