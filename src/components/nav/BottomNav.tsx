import { motion } from 'framer-motion'

export type ScreenKey = 'crescimento' | 'checklist' | 'recompensas'

const ITEMS: { key: ScreenKey; icon: string; label: string }[] = [
  { key: 'crescimento', icon: '📈', label: 'Crescimento' },
  { key: 'checklist', icon: '✓', label: 'Checklist' },
  { key: 'recompensas', icon: '🎁', label: 'Recompensas' },
]

export default function BottomNav({ active, onChange }: { active: ScreenKey; onChange: (k: ScreenKey) => void }) {
  return (
    <nav className="absolute inset-x-3 bottom-3 z-30 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 backdrop-blur">
      {ITEMS.map((it) => {
        const on = active === it.key
        return (
          <button key={it.key} onClick={() => onChange(it.key)} className="relative flex flex-col items-center gap-1 rounded-xl py-2">
            {on && <motion.span layoutId="navpill" className="absolute inset-0 rounded-xl" style={{ background: 'rgba(91,156,255,.14)', border: '1px solid rgba(91,156,255,.35)' }} transition={{ type: 'spring', stiffness: 360, damping: 30 }} />}
            <span className="relative text-[16px]" style={{ filter: on ? 'none' : 'grayscale(.5) opacity(.7)' }}>{it.icon}</span>
            <span className="relative text-[10px] font-semibold" style={{ color: on ? 'var(--blue)' : 'var(--muted)' }}>{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
