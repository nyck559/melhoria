import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Scrollable screen container with safe padding for the bottom nav. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="screen-enter no-scrollbar absolute inset-0 overflow-y-auto px-4 pb-28 pt-14">
      {children}
    </div>
  )
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h1 className="text-[22px] font-bold leading-tight text-text">{title}</h1>
        {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between">
      <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted">{children}</h2>
      {right}
    </div>
  )
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`card p-4 ${className}`} style={style}>
      {children}
    </div>
  )
}

/** Segmented control for sub-tabs / period pickers. */
export function SegTabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition"
            style={{ color: on ? '#fff' : 'var(--muted)' }}
          >
            {on && <motion.span layoutId="seg" className="absolute inset-0 rounded-lg" style={{ background: 'var(--blue-deep)' }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: string }) {
  return (
    <div className="card p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-[20px] font-bold" style={{ color: accent ?? 'var(--text)' }}>{value}</div>
    </div>
  )
}

export function CoinPill({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-bold text-blue">
      <span>🪙</span>
      {value.toLocaleString('pt-BR')}
    </span>
  )
}

export function BlueButton({ children, onClick, disabled, variant = 'solid', className = '' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'solid' | 'ghost'; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition disabled:opacity-40 ${className}`}
      style={
        variant === 'solid'
          ? { background: disabled ? 'var(--surface-2)' : 'var(--blue-deep)', color: disabled ? 'var(--muted)' : '#fff' }
          : { background: 'transparent', color: 'var(--blue)', border: '1px solid var(--border)' }
      }
    >
      {children}
    </button>
  )
}
