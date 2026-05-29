import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { useAudio } from '../../hooks/useAudio'

/* ---------------- Holographic panel ---------------- */
export function Holo({
  children,
  className = '',
  cyan = true,
  glow = false,
}: {
  children: ReactNode
  className?: string
  cyan?: boolean
  glow?: boolean
}) {
  return (
    <div
      className={`holo shimmer relative rounded-[14px] ${glow ? 'shadow-glow' : ''} ${className}`}
    >
      {cyan && <span className="holo-corner-tr" />}
      {cyan && <span className="holo-corner-bl" />}
      {children}
    </div>
  )
}

/* ---------------- Animated number ---------------- */
export function AnimatedNumber({
  value,
  className = '',
  format = (n: number) => Math.round(n).toLocaleString('pt-BR'),
}: {
  value: number
  className?: string
  format?: (n: number) => string
}) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => format(v))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1, ease: 'easeOut' })
    return controls.stop
  }, [value, mv])
  return <motion.span className={className}>{text}</motion.span>
}

/* ---------------- Energy bar ---------------- */
export function EnergyBar({
  value,
  c1 = '#6a00ff',
  c2 = '#46e0ff',
  height = 8,
  className = '',
}: {
  value: number // 0..100
  c1?: string
  c2?: string
  height?: number
  className?: string
}) {
  return (
    <div className={`energy-bar ${className}`} style={{ height, ['--c1' as any]: c1, ['--c2' as any]: c2 }}>
      <motion.i
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ position: 'absolute', inset: 0 } as any}
      />
    </div>
  )
}

/* ---------------- Glow button ---------------- */
export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  sound = 'ui',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'danger' | 'ghost' | 'gold'
  className?: string
  sound?: 'ui' | 'menu' | 'challenge' | 'xp'
  type?: 'button' | 'submit'
}) {
  const play = useAudio((s) => s.play)
  const styles: Record<string, string> = {
    primary: 'bg-gradient-to-br from-violet-neon to-violet-deep border-violet-glow shadow-glow',
    danger: 'bg-gradient-to-br from-corrupt to-[#7a0a2a] border-[#ff6a8a] shadow-glow-corrupt',
    ghost: 'bg-white/5 border-violet-glow/30 text-cold',
    gold: 'bg-gradient-to-br from-gold to-[#a9740a] border-gold text-black',
  }
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => {
        play(sound)
        onClick?.()
      }}
      className={`font-display relative overflow-hidden rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[2px] text-white ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

/* ---------------- Screen title ---------------- */
export function ScreenTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-glow bg-gradient-to-r from-white to-violet-soft bg-clip-text text-2xl font-extrabold tracking-wider text-transparent">
          {title}
        </h1>
        {sub && <span className="mt-0.5 block text-[11px] uppercase tracking-[1.5px] text-violet-soft/60">{sub}</span>}
      </motion.div>
      {right}
    </div>
  )
}

/* ---------------- Section label ---------------- */
export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 mt-5 flex items-center justify-between">
      <h2 className="font-display relative pl-3.5 text-[12px] font-bold tracking-[3px] text-cold">
        <span className="absolute left-0 top-1/2 h-3.5 w-1 -translate-y-1/2 rounded bg-gradient-to-b from-violet-neon to-electric shadow-glow" />
        {children}
      </h2>
      {right}
    </div>
  )
}
