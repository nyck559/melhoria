import { motion, type MotionValue, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GlowButton, EnergyBar } from '../components/common/ui'
import { useAudio } from '../hooks/useAudio'

/** Colossal boss SVG — massive, layered, intimidating. */
function Colossus({ px, py }: { px?: MotionValue<number>; py?: MotionValue<number> }) {
  const fbX = useMotionValue(0)
  const fbY = useMotionValue(0)
  const x = useTransform(px ?? fbX, (v) => v * 14)
  const y = useTransform(py ?? fbY, (v) => v * 10)
  const [blink, setBlink] = useState(1)
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(0.1)
      setTimeout(() => setBlink(1), 90)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div style={{ x, y }} className="absolute inset-0">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="h-full w-full">
        <svg viewBox="0 0 400 460" className="h-full w-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="bbody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a0f2e" />
              <stop offset="1" stopColor="#06020a" />
            </linearGradient>
            <linearGradient id="bedge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff5a7d" />
              <stop offset="0.6" stopColor="#b98bff" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
            <radialGradient id="beye" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.4" stopColor="#ff3b5e" />
              <stop offset="1" stopColor="#6a00ff" />
            </radialGradient>
            <radialGradient id="baura" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#6a00ff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#6a00ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <motion.ellipse cx="200" cy="230" rx="200" ry="220" fill="url(#baura)"
            animate={{ opacity: [0.5, 0.95, 0.5], scale: [1, 1.08, 1] }} transition={{ duration: 3.5, repeat: Infinity }} style={{ transformOrigin: '200px 230px' }} />

          {/* horns */}
          <path d="M120 110 C70 60 60 20 90 8 C92 50 130 78 150 100 Z" fill="url(#bbody)" stroke="url(#bedge)" strokeWidth="2" />
          <path d="M280 110 C330 60 340 20 310 8 C308 50 270 78 250 100 Z" fill="url(#bbody)" stroke="url(#bedge)" strokeWidth="2" />

          {/* head */}
          <path d="M200 60 C250 60 286 100 286 150 C286 196 250 224 200 224 C150 224 114 196 114 150 C114 100 150 60 200 60 Z"
            fill="url(#bbody)" stroke="url(#bedge)" strokeWidth="2.4" />

          {/* shoulders / body */}
          <path d="M120 210 C150 188 250 188 280 210 L320 400 C326 440 300 456 280 460 L120 460 C100 456 74 440 80 400 Z"
            fill="url(#bbody)" stroke="url(#bedge)" strokeWidth="2.4" />
          {/* chest core */}
          <motion.circle cx="200" cy="320" r="30" fill="url(#beye)"
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.15, 0.9] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: '200px 320px' }} />

          {/* spikes */}
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M${110 + i * 30} 200 l 10 -34 l 10 34 z`} fill="url(#bbody)" stroke="url(#bedge)" strokeWidth="1.4" />
          ))}

          {/* eyes */}
          <motion.g animate={{ scaleY: blink }} style={{ transformOrigin: '200px 150px' }}>
            <ellipse cx="170" cy="150" rx="16" ry="9" fill="url(#beye)" />
            <ellipse cx="230" cy="150" rx="16" ry="9" fill="url(#beye)" />
          </motion.g>
          <path d="M150 134 L188 146 M250 134 L212 146" stroke="#ff3b5e" strokeWidth="3" strokeLinecap="round" />
          {/* maw */}
          <path d="M168 188 L200 200 L232 188 L224 204 L200 212 L176 204 Z" fill="#1a0610" stroke="#ff3b5e" strokeWidth="1.5" />

          {/* rising energy */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.circle key={i} cx={110 + (i * 31) % 200} cy={440} r={2 + (i % 3)} fill={i % 2 ? '#ff5a7d' : '#8b3bff'}
              animate={{ y: [0, -360], opacity: [0, 1, 0] }} transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }} />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default function BossScreen({
  px,
  py,
  onBack,
}: {
  px: MotionValue<number>
  py: MotionValue<number>
  onBack: () => void
}) {
  const play = useAudio((s) => s.play)
  const [shake, setShake] = useState(false)

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={shake ? { duration: 0.5 } : { duration: 0.5 }}
    >
      {/* boss-specific dark-red atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 28%, rgba(255,45,94,.22), transparent 60%), radial-gradient(90% 70% at 50% 80%, rgba(106,0,255,.42), transparent 65%), linear-gradient(180deg,#0a0510,#05030a)',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'repeating-linear-gradient(0deg, rgba(255,45,94,.05) 0 2px, transparent 2px 5px)' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />

      <div className="relative z-10 flex items-center justify-between px-4 pt-12">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-xl border border-violet-glow/30 bg-black/40 text-2xl leading-none text-cold">
          ‹
        </button>
        <span className="font-display rounded-full border border-corrupt/40 bg-corrupt/10 px-3 py-1.5 text-[10px] tracking-[3px] text-corrupt shadow-glow-corrupt">
          CHEFE · ELITE
        </span>
      </div>

      <div className="relative z-0 h-[42%]">
        <Colossus px={px} py={py} />
      </div>

      <div className="relative z-10 mt-auto px-4 pb-28">
        <div className="text-center">
          <div className="font-display text-sm tracking-[5px] text-cold">CAVALEIRO DE</div>
          <motion.h2
            className="font-display bg-gradient-to-b from-white to-corrupt bg-clip-text text-[42px] font-black leading-none text-transparent"
            style={{ textShadow: '0 0 34px rgba(255,45,94,.6)' }}
            animate={{ textShadow: ['0 0 20px rgba(255,45,94,.5)', '0 0 44px rgba(255,45,94,.9)', '0 0 20px rgba(255,45,94,.5)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            FERRO
          </motion.h2>
        </div>

        <div className="mb-3 mt-3">
          <div className="font-num mb-1.5 flex justify-between text-[11px] font-bold tracking-wide text-cold">
            <span>HP</span>
            <span>184.000 / 184.000</span>
          </div>
          <EnergyBar value={100} c1="#ff2d5e" c2="#ff7a3d" height={12} />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2.5">
          {[
            { k: 'PODER REC.', v: '1.800' },
            { k: 'XP', v: '+4.200' },
            { k: 'RECOMPENSA', v: '◆ x3' },
          ].map((b) => (
            <div key={b.k} className="glass rounded-xl py-2.5 text-center">
              <div className="text-[8px] tracking-wide text-violet-soft/60">{b.k}</div>
              <div className="font-display mt-1 text-sm font-bold">{b.v}</div>
            </div>
          ))}
        </div>

        <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <GlowButton
            variant="danger"
            sound="challenge"
            onClick={() => {
              setShake(true)
              play('challenge')
              setTimeout(() => setShake(false), 600)
            }}
            className="w-full !py-4 text-base"
          >
            DESAFIAR ⚔ -2
          </GlowButton>
        </motion.div>
      </div>
    </motion.div>
  )
}
