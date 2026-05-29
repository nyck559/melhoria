import { useEffect, useState } from 'react'
import { motion, type MotionValue, useMotionValue, useTransform } from 'framer-motion'
import type { RankTier } from '../../types'

interface Props {
  tier: RankTier
  accent?: string
  px?: MotionValue<number>
  py?: MotionValue<number>
  corrupt?: boolean
  className?: string
}

const TIER_CFG: Record<RankTier, { eye: number; aura: number; headTilt: number; bodyTilt: number; particles: number }> = {
  fraco:         { eye: 0.45, aura: 0.35, headTilt: 7,  bodyTilt: 2,  particles: 0 },
  firme:         { eye: 0.85, aura: 0.7,  headTilt: 2,  bodyTilt: 0,  particles: 4 },
  dominante:     { eye: 1,    aura: 1,    headTilt: -2, bodyTilt: -1, particles: 8 },
  transcendente: { eye: 1,    aura: 1.4,  headTilt: -4, bodyTilt: -2, particles: 14 },
}

export default function Hunter({ tier, accent = '#8b3bff', px, py, corrupt = false, className }: Props) {
  const cfg = TIER_CFG[tier]
  const eyeColor = corrupt ? '#ff3b5e' : accent
  const [blink, setBlink] = useState(1)

  // random eye blink
  useEffect(() => {
    let t: number
    const loop = () => {
      setBlink(0.08)
      setTimeout(() => setBlink(1), 130)
      t = window.setTimeout(loop, 2200 + Math.random() * 3800)
    }
    t = window.setTimeout(loop, 1500)
    return () => clearTimeout(t)
  }, [])

  // parallax sway for character layer (fallback to inert values when no parallax provided)
  const fbX = useMotionValue(0)
  const fbY = useMotionValue(0)
  const swayX = useTransform(px ?? fbX, (v) => v * 18)
  const swayY = useTransform(py ?? fbY, (v) => v * 12)

  return (
    <motion.div className={className} style={{ x: swayX, y: swayY, willChange: 'transform' }}>
      {/* floating + breathing wrapper */}
      <motion.div
        className="relative h-full w-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 400 560" className="h-full w-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="coat" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#241a40" />
              <stop offset="0.5" stopColor="#120b24" />
              <stop offset="1" stopColor="#070411" />
            </linearGradient>
            <linearGradient id="coatLight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.9" />
              <stop offset="1" stopColor="#3b82f6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1a1430" />
              <stop offset="1" stopColor="#05030c" />
            </linearGradient>
            <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9d8e6" />
              <stop offset="1" stopColor="#b89ec4" />
            </linearGradient>
            <radialGradient id="eyeGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.45" stopColor={eyeColor} />
              <stop offset="1" stopColor="#3a0a86" />
            </radialGradient>
            <radialGradient id="auraGrad" cx="0.5" cy="0.55" r="0.5">
              <stop offset="0" stopColor={corrupt ? '#ff2d5e' : accent} stopOpacity="0.75" />
              <stop offset="1" stopColor={corrupt ? '#ff2d5e' : accent} stopOpacity="0" />
            </radialGradient>
            <filter id="soft"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>

          {/* ---------- AURA (behind) ---------- */}
          <motion.ellipse
            cx="200" cy="300" rx="160" ry="230"
            fill="url(#auraGrad)"
            animate={{ opacity: [0.4 * cfg.aura, 0.85 * cfg.aura, 0.4 * cfg.aura], scale: [1, 1.07, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '200px 300px' }}
          />

          {/* shadow wisps rising */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M${120 + i * 40} 520 q -10 -80 6 -160 q 10 -50 -6 -110`}
              fill="none"
              stroke={corrupt ? '#ff2d5e' : accent}
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0.0}
              animate={{ opacity: [0, 0.5 * cfg.aura, 0], y: [10, -30, -70] }}
              transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
            />
          ))}

          {/* ---------- BODY GROUP (breathing + tilt) ---------- */}
          <motion.g
            animate={{ scaleY: [1, 1.012, 1], rotate: [cfg.bodyTilt, cfg.bodyTilt + 0.4, cfg.bodyTilt] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '200px 360px' }}
          >
            {/* coat tails (cloth sway) */}
            <motion.path
              d="M150 300 L120 540 L150 540 L185 360 Z"
              fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.4"
              animate={{ rotate: [0, 2.5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '160px 320px' }}
            />
            <motion.path
              d="M250 300 L280 540 L250 540 L215 360 Z"
              fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.4"
              animate={{ rotate: [0, -2.5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              style={{ transformOrigin: '240px 320px' }}
            />

            {/* torso / coat body */}
            <path
              d="M200 168
                 C168 168 150 184 144 214
                 L132 360 C160 384 240 384 268 360
                 L256 214 C250 184 232 168 200 168 Z"
              fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.6"
            />
            {/* inner glow seam */}
            <path d="M200 176 L200 372" stroke={accent} strokeWidth="2" opacity={0.5 * cfg.aura} filter="url(#soft)" />
            <path d="M168 200 L150 350 M232 200 L250 350" stroke="#3b82f6" strokeWidth="1.4" opacity={0.4 * cfg.aura} />

            {/* shoulders / pauldrons */}
            <path d="M144 200 L108 230 L120 268 L150 244 Z" fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.4" />
            <path d="M256 200 L292 230 L280 268 L250 244 Z" fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.4" />

            {/* arms */}
            <motion.path
              d="M120 250 L92 360 L118 366 L142 268 Z" fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.3"
              animate={{ rotate: [0, 1.5, 0] }} transition={{ duration: 5, repeat: Infinity }} style={{ transformOrigin: '120px 250px' }}
            />
            <motion.path
              d="M280 250 L308 360 L282 366 L258 268 Z" fill="url(#coat)" stroke="url(#coatLight)" strokeWidth="1.3"
              animate={{ rotate: [0, -1.5, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.3 }} style={{ transformOrigin: '280px 250px' }}
            />

            {/* hand energy orbs (dominante / transcendente) */}
            {cfg.particles > 4 && (
              <>
                <motion.circle cx="104" cy="372" r="14" fill="url(#auraGrad)"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }} transition={{ duration: 2.4, repeat: Infinity }} />
                <motion.circle cx="296" cy="372" r="14" fill="url(#auraGrad)"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }} />
              </>
            )}
          </motion.g>

          {/* ---------- HEAD GROUP (tilt + sway) ---------- */}
          <motion.g
            animate={{ rotate: [cfg.headTilt, cfg.headTilt + 1.2, cfg.headTilt], y: [0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '200px 150px' }}
          >
            {/* neck */}
            <path d="M186 150 L186 180 L214 180 L214 150 Z" fill="url(#skin)" />
            {/* face */}
            <path
              d="M200 78 C176 78 160 98 160 124 C160 150 178 168 200 168 C222 168 240 150 240 124 C240 98 224 78 200 78 Z"
              fill="url(#skin)"
            />
            {/* jaw shadow */}
            <path d="M172 140 C184 162 216 162 228 140 C220 158 180 158 172 140 Z" fill="#9a7fae" opacity="0.5" />

            {/* eyes (blink scaleY) */}
            <motion.g animate={{ scaleY: blink }} style={{ transformOrigin: '200px 122px' }}>
              <ellipse cx="183" cy="122" rx="9" ry="6" fill="#0a0612" />
              <ellipse cx="217" cy="122" rx="9" ry="6" fill="#0a0612" />
              <motion.ellipse cx="183" cy="122" rx="6.5" ry="4.6" fill="url(#eyeGrad)"
                animate={{ opacity: [cfg.eye * 0.7, cfg.eye, cfg.eye * 0.7] }} transition={{ duration: 2.2, repeat: Infinity }} />
              <motion.ellipse cx="217" cy="122" rx="6.5" ry="4.6" fill="url(#eyeGrad)"
                animate={{ opacity: [cfg.eye * 0.7, cfg.eye, cfg.eye * 0.7] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }} />
            </motion.g>
            {/* sharp brow */}
            <path d="M172 110 L194 116 M228 110 L206 116" stroke="#1a1430" strokeWidth="2.5" strokeLinecap="round" />
            {/* nose + mouth */}
            <path d="M200 128 L196 140 L204 140" fill="none" stroke="#9a7fae" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M190 152 Q200 156 210 152" fill="none" stroke="#7a5f8e" strokeWidth="1.6" strokeLinecap="round" />

            {/* third eye (transcendente) */}
            {tier === 'transcendente' && (
              <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
                <path d="M200 96 l8 6 -8 6 -8 -6 z" fill="url(#eyeGrad)" />
                <circle cx="200" cy="102" r="2.6" fill="#fff" />
              </motion.g>
            )}

            {/* ---------- HAIR (sway) ---------- */}
            <motion.g
              animate={{ rotate: [0, 1.4, 0], x: [0, 1.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '200px 90px' }}
            >
              <path d="M156 120 C150 92 164 64 200 60 C236 64 250 92 244 120
                       C246 100 240 84 230 74 L238 96 L226 70 L214 92 L208 64
                       L200 88 L192 64 L186 92 L174 70 L162 96 L170 74
                       C160 84 154 100 156 120 Z"
                    fill="url(#hair)" stroke="url(#coatLight)" strokeWidth="1" />
              {/* side bangs */}
              <path d="M160 116 L150 150 L164 138 Z" fill="url(#hair)" />
              <path d="M240 116 L250 150 L236 138 Z" fill="url(#hair)" />
              {/* glowing hair tips on higher tiers */}
              {cfg.particles > 4 && (
                <path d="M200 60 L200 50 M186 64 L182 54 M214 64 L218 54" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity={0.8} />
              )}
            </motion.g>
          </motion.g>

          {/* ---------- COSMIC TENDRILS (SSS) ---------- */}
          {tier === 'transcendente' &&
            Array.from({ length: 6 }).map((_, i) => {
              const ang = (i / 6) * Math.PI * 2
              const x2 = 200 + Math.cos(ang) * 190
              const y2 = 260 + Math.sin(ang) * 230
              return (
                <motion.path
                  key={i}
                  d={`M200 260 Q ${200 + Math.cos(ang) * 80} ${260 + Math.sin(ang) * 60}, ${x2} ${y2}`}
                  fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"
                  animate={{ opacity: [0, 0.7, 0], pathLength: [0, 1, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
                />
              )
            })}

          {/* foreground floating energy particles */}
          {Array.from({ length: cfg.particles }).map((_, i) => (
            <motion.circle
              key={i}
              cx={120 + (i * 37) % 220}
              cy={460}
              r={1.5 + (i % 3)}
              fill={corrupt ? '#ff5a7d' : accent}
              animate={{ y: [0, -260 - (i % 4) * 40], opacity: [0, 0.9, 0] }}
              transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
            />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  )
}
