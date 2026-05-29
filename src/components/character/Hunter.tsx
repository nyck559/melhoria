import { motion, type MotionValue, useMotionValue, useTransform } from 'framer-motion'
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
}

const base = import.meta.env.BASE_URL

const IMG: Record<RankTier, string> = {
  fraco: 'art/hunter_weak.webp',
  firme: 'art/hunter_firm.webp',
  dominante: 'art/hunter_dominant.webp',
  transcendente: 'art/hunter_transcendent.webp',
}

const INTENSITY: Record<RankTier, number> = { fraco: 0.5, firme: 0.9, dominante: 1.2, transcendente: 1.6 }
// "camera moves closer" as power rises
const ZOOM: Record<RankTier, number> = { fraco: 1.0, firme: 1.07, dominante: 1.14, transcendente: 1.22 }

/**
 * Illustrated character splash kept ALIVE (character-zone animation only):
 * drifting smoke, breathing aura, ground spotlight, float/breathe, energy wash,
 * rising embers, and a tier-based zoom so the hero grows with rank.
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
}: Props) {
  const fbX = useMotionValue(0)
  const fbY = useMotionValue(0)
  const swayX = useTransform(px ?? fbX, (v) => v * 18)
  const swayY = useTransform(py ?? fbY, (v) => v * 12)
  const k = INTENSITY[tier]
  const glow = corrupt ? '#ff2d5e' : accent

  return (
    <motion.div className={className} style={{ x: swayX, y: swayY, willChange: 'transform' }}>
      {/* breathing aura behind */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ width: '86%', height: '78%', background: `radial-gradient(circle, ${glow}, transparent 62%)` }}
        animate={{ opacity: [0.28 * k, 0.7 * k, 0.28 * k], scale: [1, 1.14, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* drifting shadow/smoke wisps (behind) */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={'w' + i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: 150 + i * 40,
            height: 150 + i * 40,
            left: `${18 + i * 26}%`,
            top: `${24 + (i % 2) * 30}%`,
            background: `radial-gradient(circle, ${i === 1 ? '#1f0d3a' : glow}55, transparent 70%)`,
          }}
          animate={{ x: [0, i % 2 ? 22 : -22, 0], y: [0, -16, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* float + breathe + tier zoom */}
      <motion.div
        className="relative h-full w-full"
        style={{ scale: ZOOM[tier], transformOrigin: 'center 75%' }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
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

        {/* energy wash (glow breathing) */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: `radial-gradient(60% 45% at 50% 36%, ${glow}30, transparent 72%)` }}
          animate={{ opacity: [0.16 * k, 0.5 * k, 0.16 * k] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* rising foreground mist */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={'m' + i}
            className="pointer-events-none absolute bottom-0 rounded-full blur-xl mix-blend-screen"
            style={{ width: 120, height: 80, left: `${15 + i * 30}%`, background: `radial-gradient(circle, ${glow}40, transparent 70%)` }}
            animate={{ y: [10, -70 - i * 20], opacity: [0, 0.5, 0] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }}
          />
        ))}

        {/* rising embers (stronger tiers) */}
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

      {/* ground spotlight */}
      <motion.div
        className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-[50%] blur-xl"
        style={{ width: '62%', height: 26, background: `radial-gradient(ellipse, ${glow}aa, transparent 70%)` }}
        animate={{ opacity: [0.4, 0.75, 0.4], scaleX: [1, 1.12, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
