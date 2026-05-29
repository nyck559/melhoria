import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../store/useGame'
import { useAudio } from '../../hooks/useAudio'

interface Pop {
  id: number
  amount: number
}

export default function FxOverlay() {
  const lastXpGain = useGame((s) => s.lastXpGain)
  const lastLevelUp = useGame((s) => s.lastLevelUp)
  const play = useAudio((s) => s.play)
  const [pops, setPops] = useState<Pop[]>([])
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const xpRef = useRef(0)
  const lvlRef = useRef(0)
  const seeded = useRef(false)

  // XP popup
  useEffect(() => {
    if (!seeded.current) return
    if (lastXpGain && lastXpGain !== xpRef.current) {
      xpRef.current = lastXpGain
      const id = Date.now()
      setPops((p) => [...p, { id, amount: lastXpGain }])
      setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1500)
    }
  }, [lastXpGain])

  // level up cinematic
  useEffect(() => {
    if (!seeded.current) return
    if (lastLevelUp && lastLevelUp !== lvlRef.current) {
      lvlRef.current = lastLevelUp
      setLevelUp(lastLevelUp)
      play('levelup')
      setTimeout(() => setLevelUp(null), 2200)
    }
  }, [lastLevelUp, play])

  useEffect(() => {
    xpRef.current = lastXpGain
    lvlRef.current = lastLevelUp
    seeded.current = true
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[60] overflow-hidden">
      {/* XP popups */}
      <AnimatePresence>
        {pops.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -120, scale: 1.1 }}
            exit={{ opacity: 0, y: -160 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 text-2xl font-black text-cyan text-glow-cyan"
          >
            +{p.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Level up cinematic */}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              className="absolute h-[420px] w-[420px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(106,0,255,.6), transparent 60%)' }}
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
            <motion.div
              className="relative text-center"
              initial={{ scale: 0.6, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <div className="font-display text-sm tracking-[8px] text-violet-soft">SISTEMA</div>
              <div className="font-display text-glow text-4xl font-black tracking-widest text-white">LEVEL UP</div>
              <div className="font-display mt-1 text-2xl font-bold text-cyan text-glow-cyan">NÍVEL {levelUp}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
