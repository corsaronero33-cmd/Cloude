import type {
  ButtonHTMLAttributes, InputHTMLAttributes, ReactNode,
  SelectHTMLAttributes, TextareaHTMLAttributes,
} from 'react'

// Mattoncini dell'interfaccia. Tenuti in un file solo e volutamente pochi:
// finche' le schermate si costruiscono con questi, restano coerenti fra loro
// senza bisogno di una libreria di componenti.

export function unisci(...classi: (string | false | null | undefined)[]): string {
  return classi.filter(Boolean).join(' ')
}

const BASE_CAMPO =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ' +
  'shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ' +
  'disabled:bg-slate-100 disabled:text-slate-500'

export function Campo({
  etichetta, suggerimento, children, obbligatorio,
}: {
  etichetta: string
  suggerimento?: string
  obbligatorio?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {etichetta}
        {obbligatorio && <span className="ml-1 text-rose-600">*</span>}
      </span>
      {children}
      {suggerimento && <span className="mt-1 block text-xs text-slate-500">{suggerimento}</span>}
    </label>
  )
}

export function Testo(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={unisci(BASE_CAMPO, props.className)} />
}

export function Scelta(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={unisci(BASE_CAMPO, 'pr-8', props.className)} />
}

export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={unisci(BASE_CAMPO, 'min-h-24', props.className)} />
}

export function Spunta({
  etichetta, checked, onChange, disabled,
}: {
  etichetta: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm text-slate-800">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 rounded border-slate-400 text-slate-700 focus:ring-slate-300"
      />
      {etichetta}
    </label>
  )
}

type Variante = 'primario' | 'neutro' | 'pericolo' | 'piatto'

const VARIANTI: Record<Variante, string> = {
  primario: 'bg-slate-800 text-white hover:bg-slate-900 active:bg-black',
  neutro: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  pericolo: 'bg-rose-600 text-white hover:bg-rose-700',
  piatto: 'text-slate-700 hover:bg-slate-200',
}

export function Bottone({
  variante = 'neutro', className, ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      {...resto}
      className={unisci(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
        'transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTI[variante],
        className,
      )}
    />
  )
}

type Tono = 'neutro' | 'rosso' | 'ambra' | 'verde' | 'blu' | 'viola'

const TONI: Record<Tono, string> = {
  neutro: 'bg-slate-200 text-slate-700',
  rosso: 'bg-rose-100 text-rose-800',
  ambra: 'bg-amber-100 text-amber-800',
  verde: 'bg-emerald-100 text-emerald-800',
  blu: 'bg-sky-100 text-sky-800',
  viola: 'bg-violet-100 text-violet-800',
}

export function Pillola({
  tono = 'neutro', children, className,
}: {
  tono?: Tono
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={unisci(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONI[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Scheda({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={unisci('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

export function Intestazione({
  titolo, sottotitolo, azioni,
}: {
  titolo: string
  sottotitolo?: string
  azioni?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{titolo}</h1>
        {sottotitolo && <p className="mt-0.5 text-sm text-slate-600">{sottotitolo}</p>}
      </div>
      {azioni && <div className="flex flex-wrap gap-2">{azioni}</div>}
    </div>
  )
}

export function Vuoto({ testo, azione }: { testo: string; azione?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      <p className="text-sm text-slate-600">{testo}</p>
      {azione && <div className="mt-4 flex justify-center">{azione}</div>}
    </div>
  )
}

export function Finestra({
  titolo, aperta, chiudi, children, largaIn,
}: {
  titolo: string
  aperta: boolean
  chiudi: () => void
  children: ReactNode
  largaIn?: boolean
}) {
  if (!aperta) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <div
        className={unisci(
          'flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-slate-50 shadow-xl sm:rounded-2xl',
          largaIn ? 'sm:max-w-3xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="font-bold text-slate-900">{titolo}</h2>
          <button
            type="button"
            onClick={chiudi}
            aria-label="Chiudi"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}

export function Riquadro({
  titolo, valore, tono = 'neutro', onClick,
}: {
  titolo: string
  valore: number | string
  tono?: Tono
  onClick?: () => void
}) {
  const interattivo = Boolean(onClick)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interattivo}
      className={unisci(
        'rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition',
        interattivo && 'hover:border-slate-400 hover:shadow',
      )}
    >
      <div className="text-2xl font-bold text-slate-900">{valore}</div>
      <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-600">
        <span className={unisci('size-2 rounded-full', TONI[tono].split(' ')[0])} />
        {titolo}
      </div>
    </button>
  )
}
