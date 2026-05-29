import { motion, type MotionValue, useMotionValue, useTransform } from 'framer-motion'
import type { RankTier } from '../../types'

interface Props {
  tier: RankTier
  accent?: string
  px?: MotionValue<number>
  py?: MotionValue<number>
  corrupt?: boolean
  className?: string
  /** how the splash is framed inside its box */
  fit?: 'cover' | 'contain'
  objectPosition?: string
}

const base = import.meta.env.BASE_URL

const IMG: Record<RankTier, string> = {
  fraco: 'art/hunter_weak.webp',
  firme: 'art/hunter_dominant.webp',
  dominante: 'art/hunter_dominant.webp',
  transcendente: 'art/hunter_transcendent.webp',
}

const INTENSITY: Record<RankTier, number> = {
  fraco: 0.45,
  firme: 0.85,
  dominante: 1.1,
  transcendente: 1.5,
}

/**
 * Illustrated (flat-art) character splash that stays "alive":
 * float + breathing scale, parallax sway, breathing aura glow, energy wash.
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
  const swayX = useTransform(px ?? fbX, (v) => v * 16)
  const swayY = useTransform(py ?? fbY, (v) => v * 10)
  const k = INTENSITY[tier]
  const glow = corrupt ? '#ff2d5e' : accent

  return (
    <motion.div className={className} style={{ x: swayX, y: swayY, willChange: 'transform' }}>
      {/* aura glow behind the art */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ width: '78%', height: '70%', background: `radial-gradient(circle, ${glow}cc, transparent 65%)` }}
        animate={{ opacity: [0.3 * k, 0.8 * k, 0.3 * k], scale: [1, 1.12, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* floating + breathing wrapper */}
      <motion.div
        className="relative h-full w-full"
        animate={{ y: [0, -10, 0], scale: [1, 1.012, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={base + IMG[tier]}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none"
          style={{
            objectFit: fit,
            objectPosition,
            filter: corrupt ? 'hue-rotate(285deg) saturate(1.4) brightness(.92)' : 'none',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 86%, transparent)',
            maskImage: 'linear-gradient(to bottom, #000 86%, transparent)',
          }}
        />

        {/* energy color wash (glow breathing) */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: `radial-gradient(60% 45% at 50% 38%, ${glow}26, transparent 72%)` }}
          animate={{ opacity: [0.18 * k, 0.5 * k, 0.18 * k] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* rising energy embers on stronger tiers */}
        {k > 0.8 &&
          Array.from({ length: Math.round(k * 6) }).map((_, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute bottom-[14%] h-1 w-1 rounded-full"
              style={{ left: `${20 + ((i * 37) % 60)}%`, background: glow, boxShadow: `0 0 8px ${glow}` }}
              animate={{ y: [0, -220 - (i % 3) * 40], opacity: [0, 0.9, 0] }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}
      </motion.div>
    </motion.div>
  )
}
