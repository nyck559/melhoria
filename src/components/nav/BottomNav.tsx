import { motion } from 'framer-motion'
import { useAudio } from '../../hooks/useAudio'

export type ScreenKey = 'inicio' | 'missoes' | 'recompensas' | 'pecados'

const ITEMS: { key: ScreenKey; icon: string; label: string }[] = [
  { key: 'inicio', icon: '◈', label: 'INÍCIO' },
  { key: 'missoes', icon: '❒', label: 'MISSÕES' },
  { key: 'recompensas', icon: '🎁', label: 'RECOMPENSAS' },
  { key: 'pecados', icon: '✷', label: 'PECADOS' },
]

export default function BottomNav({
  active,
  onChange,
  accent,
}: {
  active: ScreenKey
  onChange: (k: ScreenKey) => void
  accent: string
}) {
  const play = useAudio((s) => s.play)
  return (
    <nav
      className="glass clip-holo absolute inset-x-3 bottom-3 z-30 grid grid-cols-4 gap-1 rounded-[20px] px-2 py-2"
      style={{ boxShadow: `0 -4px 30px rgba(0,0,0,.6), 0 0 22px ${accent}33` }}
    >
      {/* holographic top line */}
      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      {ITEMS.map((it) => {
        const on = active === it.key
        return (
          <button
            key={it.key}
            onClick={() => {
              play('menu')
              onChange(it.key)
            }}
            className="relative flex flex-col items-center gap-1 rounded-2xl py-2"
          >
            {on && (
              <motion.span
                layoutId="navglow"
                className="absolute inset-0 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${accent}44, #3b82f622)` }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              />
            )}
            {on && (
              <motion.span
                layoutId="navbar-indicator"
                className="absolute -top-2 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full"
                style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
              />
            )}
            <span
              className="relative text-[18px] transition"
              style={{ color: on ? '#fff' : '#565273', filter: on ? `drop-shadow(0 0 8px ${accent})` : 'none' }}
            >
              {it.icon}
            </span>
            <span
              className="relative text-[8px] font-semibold tracking-wide"
              style={{ color: on ? '#fff' : '#565273' }}
            >
              {it.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
