import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState } from 'react'
import type { RankTier } from '../../types'

interface Props {
  tier: RankTier
  accent?: string
  px?: MotionValue<number>
  py?: MotionValue<number>
  corrupt?: boolean
  className?: string
  fit?: 'cover' | 'contain'
  objectPosition?: string
  interactive?: boolean
}

const base = import.meta.env.BASE_URL

const IMG: Record<RankTier, string> = {
  fraco: 'art/hunter_weak.webp',
  firme: 'art/hunter_firm.webp',
  dominante: 'art/hunter_dominant.webp',
  transcendente: 'art/hunter_transcendent.webp',
}

const INTENSITY: Record<RankTier, number> = { fraco: 0.5, firme: 0.9, dominante: 1.2, transcendente: 1.6 }
const ZOOM: Record<RankTier, number> = { fraco: 1.0, firme: 1.07, dominante: 1.14, transcendente: 1.22 }

const LINES: Record<RankTier, string[]> = {
  fraco: ['Eu... preciso ficar mais forte.', 'Não vou desistir.', 'Levante-se.', 'Mais um dia.'],
  firme: ['Estou evoluindo.', 'Sinto o poder crescer.', 'Continue assim.', 'Nada vai me parar.'],
  dominante: ['Eu fico mais forte a cada dia.', 'Sombras, obedeçam.', 'Ninguém me detém.', 'Poder.'],
  transcendente: ['Eu sou o Monarca.', 'Ajoelhe-se.', 'Eu comando as sombras.', 'O Sistema é meu.'],
}
const CORRUPT_LINES = ['A escuridão... está crescendo.', 'Preciso resistir.', 'Não me perca.']

interface Fx { id: number; x: number; y: number }

/**
 * Illustrated character that is ALIVE and INTERACTIVE (Solo Leveling Arise vibe):
 * tap → recoil pulse + energy ring at the touch point + holographic line + haptic;
 * drag → 3D tilt that springs back. Plus idle: aura, smoke, spotlight, embers, zoom.
 */
export default function Hunter({
  tier,
  accent = '#8b3bff',
  px,
  py,
  corrupt = false,
  className,
  fit = 'contain',
  objectPosition = 'center bottom',
  interactive = false,
}: Props) {
  const fbX = useMotionValue(0)
  const fbY = useMotionValue(0)
  const swayX = useTransform(px ?? fbX, (v) => v * 18)
  const swayY = useTransform(py ?? fbY, (v) => v * 12)
  const k = INTENSITY[tier]
  const glow = corrupt ? '#ff2d5e' : accent

  // interaction state
  const rootRef = useRef<HTMLDivElement>(null)
  const rotX = useSpring(0, { stiffness: 140, damping: 12 })
  const rotY = useSpring(0, { stiffness: 140, damping: 12 })
  const punch = useAnimationControls()
  const [fx, setFx] = useState<Fx[]>([])
  const [line, setLine] = useState<string | null>(null)
  const drag = useRef({ active: false, moved: false, sx: 0, sy: 0 })

  const speak = () => {
    const pool = corrupt && Math.random() < 0.5 ? CORRUPT_LINES : LINES[tier]
    setLine(pool[Math.floor(Math.random() * pool.length)])
    window.clearTimeout((speak as any)._t)
    ;(speak as any)._t = window.setTimeout(() => setLine(null), 2200)
  }

  const react = (clientX: number, clientY: number) => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = clientX - r.left
    const y = clientY - r.top
    const id = Date.now() + Math.random()
    setFx((f) => [...f, { id, x, y }])
    setTimeout(() => setFx((f) => f.filter((p) => p.id !== id)), 700)
    punch.start({ scale: [1, 0.94, 1.06, 1] }, { duration: 0.45, ease: 'easeOut' })
    speak()
    try { navigator.vibrate?.(20) } catch { /* ignore */ }
  }

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return
    drag.current = { active: true, moved: false, sx: e.clientX, sy: e.clientY }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!interactive || !drag.current.active) return
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    rotY.set(Math.max(-1, Math.min(1, dx)) * 16)
    rotX.set(Math.max(-1, Math.min(1, dy)) * -12)
    if (Math.abs(e.clientX - drag.current.sx) > 6 || Math.abs(e.clientY - drag.current.sy) > 6) drag.current.moved = true
  }
  const onUp = (e: React.PointerEvent) => {
    if (!interactive) return
    const wasTap = drag.current.active && !drag.current.moved
    drag.current.active = false
    rotX.set(0)
    rotY.set(0)
    if (wasTap) react(e.clientX, e.clientY)
  }

  return (
    <motion.div
      ref={rootRef}
      className={className}
      style={{ x: swayX, y: swayY, willChange: 'transform', perspective: 1000, touchAction: interactive ? 'none' : undefined, cursor: interactive ? 'grab' : undefined }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* breathing aura behind */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ width: '86%', height: '78%', background: `radial-gradient(circle, ${glow}, transparent 62%)` }}
        animate={{ opacity: [0.28 * k, 0.7 * k, 0.28 * k], scale: [1, 1.14, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* drifting shadow/smoke wisps */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={'w' + i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: 150 + i * 40, height: 150 + i * 40, left: `${18 + i * 26}%`, top: `${24 + (i % 2) * 30}%`,
            background: `radial-gradient(circle, ${i === 1 ? '#1f0d3a' : glow}55, transparent 70%)`,
          }}
          animate={{ x: [0, i % 2 ? 22 : -22, 0], y: [0, -16, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* tilt layer */}
      <motion.div className="absolute inset-0" style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}>
        {/* float + zoom */}
        <motion.div
          className="relative h-full w-full"
          style={{ scale: ZOOM[tier], transformOrigin: 'center 75%' }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* punch (tap recoil) */}
          <motion.div className="absolute inset-0" animate={punch}>
            <motion.img
              src={base + IMG[tier]}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                objectFit: fit,
                objectPosition,
                filter: corrupt
                  ? 'hue-rotate(285deg) saturate(1.4) brightness(.9) drop-shadow(0 8px 30px rgba(255,45,94,.5))'
                  : `drop-shadow(0 10px 34px ${glow}66)`,
                WebkitMaskImage: 'linear-gradient(to bottom, #000 88%, transparent)',
                maskImage: 'linear-gradient(to bottom, #000 88%, transparent)',
              }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{ background: `radial-gradient(60% 45% at 50% 36%, ${glow}30, transparent 72%)` }}
              animate={{ opacity: [0.16 * k, 0.5 * k, 0.16 * k] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {[0, 1, 2].map((i) => (
              <motion.div
                key={'m' + i}
                className="pointer-events-none absolute bottom-0 rounded-full blur-xl mix-blend-screen"
                style={{ width: 120, height: 80, left: `${15 + i * 30}%`, background: `radial-gradient(circle, ${glow}40, transparent 70%)` }}
                animate={{ y: [10, -70 - i * 20], opacity: [0, 0.5, 0] }}
                transition={{ duration: 6 + i * 1.5, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }}
              />
            ))}

            {k > 0.8 &&
              Array.from({ length: Math.round(k * 7) }).map((_, i) => (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute bottom-[16%] rounded-full"
                  style={{ width: 2 + (i % 3), height: 2 + (i % 3), left: `${16 + ((i * 41) % 66)}%`, background: glow, boxShadow: `0 0 8px ${glow}` }}
                  animate={{ y: [0, -240 - (i % 3) * 50], opacity: [0, 0.95, 0] }}
                  transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
                />
              ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ground spotlight */}
      <motion.div
        className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-[50%] blur-xl"
        style={{ width: '62%', height: 26, background: `radial-gradient(ellipse, ${glow}aa, transparent 70%)` }}
        animate={{ opacity: [0.4, 0.75, 0.4], scaleX: [1, 1.12, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ---- interaction FX ---- */}
      {interactive && (
        <>
          {/* tap energy rings + sparks */}
          {fx.map((p) => (
            <div key={p.id} className="pointer-events-none absolute" style={{ left: p.x, top: p.y }}>
              <motion.span
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ borderColor: glow, boxShadow: `0 0 14px ${glow}` }}
                initial={{ width: 8, height: 8, opacity: 0.9 }}
                animate={{ width: 120, height: 120, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              {Array.from({ length: 7 }).map((_, i) => {
                const a = (i / 7) * Math.PI * 2
                return (
                  <motion.span
                    key={i}
                    className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: glow, boxShadow: `0 0 6px ${glow}` }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: Math.cos(a) * 46, y: Math.sin(a) * 46, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                )
              })}
            </div>
          ))}

          {/* holographic speech bubble */}
          {line && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[10%] z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border px-3 py-1.5"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ borderColor: `${glow}88`, background: 'rgba(10,6,20,.82)', boxShadow: `0 0 16px ${glow}66` }}
            >
              <span className="text-[12px] font-semibold text-cold">{line}</span>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
