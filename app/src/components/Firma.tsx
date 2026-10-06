import { useEffect, useRef, useState } from 'react'
import { Bottone } from './ui'

/**
 * Riquadro per la firma del cliente sul rapportino.
 *
 * Usa gli eventi pointer, che coprono dito, pennino e mouse con un solo
 * percorso di codice, e disegna su un canvas scalato al devicePixelRatio, cosi'
 * il tratto resta nitido anche sui telefoni ad alta densita'. Il risultato
 * esce come PNG in base64: finisce dentro la riga dell'intervento e viaggia con
 * essa, quindi la firma raccolta offline non si perde per strada ne' dipende da
 * un caricamento separato su storage.
 */
export default function Firma({
  valore, onCambia, nome, onNome,
}: {
  valore: string | null
  onCambia: (dataUrl: string | null) => void
  nome: string
  onNome: (v: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const disegnando = useRef(false)
  const [vuoto, setVuoto] = useState(!valore)

  // Prepara il canvas e, se c'e' gia' una firma salvata, la ridisegna.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rapporto = window.devicePixelRatio || 1
    const larghezza = canvas.clientWidth
    const altezza = canvas.clientHeight
    canvas.width = Math.round(larghezza * rapporto)
    canvas.height = Math.round(altezza * rapporto)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(rapporto, rapporto)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f172a'
    if (valore) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, larghezza, altezza)
      img.src = valore
      setVuoto(false)
    }
    // Volutamente senza `valore` fra le dipendenze: ridimensionare il canvas a
    // ogni tratto cancellerebbe quello che si sta disegnando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const posizione = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }

  const inizia = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    disegnando.current = true
    const [x, y] = posizione(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const muovi = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!disegnando.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const [x, y] = posizione(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (vuoto) setVuoto(false)
  }

  const concludi = () => {
    if (!disegnando.current) return
    disegnando.current = false
    const canvas = canvasRef.current
    if (canvas) onCambia(canvas.toDataURL('image/png'))
  }

  const pulisci = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setVuoto(true)
    onCambia(null)
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Firma del cliente
        </span>
        <Bottone variante="piatto" type="button" onClick={pulisci} className="px-2 py-1 text-xs">
          Cancella
        </Bottone>
      </div>
      <div className="relative rounded-lg border border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={inizia}
          onPointerMove={muovi}
          onPointerUp={concludi}
          onPointerLeave={concludi}
          onPointerCancel={concludi}
          className="h-40 w-full touch-none rounded-lg"
        />
        {vuoto && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Far firmare qui
          </span>
        )}
      </div>
      <input
        value={nome}
        onChange={(e) => onNome(e.target.value)}
        placeholder="Nome e cognome di chi firma"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </div>
  )
}
