import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useGame, useLevelInfo } from '../../store/useGame'
import { useAudio } from '../../hooks/useAudio'
import { RANK_DATA, rankForLevel } from '../../data/game'

interface Pop { id: number; amount: number }

const streakTitle = (d: number) =>
  d >= 100 ? 'LENDA VIVA' : d >= 60 ? 'INABALÁVEL' : d >= 30 ? 'CAÇADOR IMPARÁVEL' : d >= 14 ? 'DISCIPLINA DE FERRO' : d >= 7 ? 'SEQUÊNCIA PERFEITA' : 'EM CHAMAS'

export default function FxOverlay() {
  const lastXpGain = useGame((s) => s.lastXpGain)
  const lastLevelUp = useGame((s) => s.lastLevelUp)
  const lastStreak = useGame((s) => s.lastStreakMilestone)
  const { level } = useLevelInfo()
  const play = useAudio((s) => s.play)

  const [pops, setPops] = useState<Pop[]>([])
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [rankUp, setRankUp] = useState<string | null>(null)
  const [streak, setStreak] = useState<{ nome: string; days: number } | null>(null)

  const xpRef = useRef(0)
  const lvlRef = useRef(0)
  const rankRef = useRef('')
  const streakRef = useRef(0)
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

  // rank-up cinematic takes priority over level-up
  useEffect(() => {
    if (!seeded.current) return
    const rank = rankForLevel(level)
    if (rank !== rankRef.current) {
      const prevIndex = Object.keys(RANK_DATA).indexOf(rankRef.current)
      const up = Object.keys(RANK_DATA).indexOf(rank) > prevIndex
      rankRef.current = rank
      if (up) {
        setRankUp(rank)
        play('levelup')
        try { navigator.vibrate?.([40, 30, 80]) } catch { /* ignore */ }
        setTimeout(() => setRankUp(null), 3200)
        return
      }
    }
    if (lastLevelUp && lastLevelUp !== lvlRef.current) {
      lvlRef.current = lastLevelUp
      setLevelUp(lastLevelUp)
      play('levelup')
      setTimeout(() => setLevelUp(null), 2200)
    }
  }, [lastLevelUp, level, play])

  // streak milestone
  useEffect(() => {
    if (!seeded.current || !lastStreak) return
    if (lastStreak.ts !== streakRef.current) {
      streakRef.current = lastStreak.ts
      setStreak({ nome: lastStreak.nome, days: lastStreak.days })
      play('xp')
      setTimeout(() => setStreak(null), 2600)
    }
  }, [lastStreak, play])

  useEffect(() => {
    xpRef.current = lastXpGain
    lvlRef.current = lastLevelUp
    rankRef.current = rankForLevel(level)
    streakRef.current = lastStreak?.ts ?? 0
    seeded.current = true
  }, [])

  const rankColor = rankUp ? RANK_DATA[rankUp as keyof typeof RANK_DATA].color : '#8b3bff'

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
            className="font-display text-glow-cyan absolute left-1/2 top-1/2 -translate-x-1/2 text-2xl font-black text-cyan"
          >
            +{p.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>

      {/* streak banner */}
      <AnimatePresence>
        {streak && (
          <motion.div
            className="absolute inset-x-0 top-1/3 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="font-display text-glow text-3xl font-black text-gold">🔥 {streak.days} DIAS</div>
            <div className="font-display mt-1 text-sm tracking-[4px] text-white">{streakTitle(streak.days)}</div>
            <div className="mt-0.5 text-[11px] text-violet-soft/70">{streak.nome}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEVEL UP */}
      <AnimatePresence>
        {levelUp && (
          <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              className="absolute h-[420px] w-[420px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(106,0,255,.6), transparent 60%)' }}
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
            <motion.div className="relative text-center" initial={{ scale: 0.6, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <div className="font-display text-sm tracking-[8px] text-violet-soft">SISTEMA</div>
              <div className="font-display text-glow text-4xl font-black tracking-widest text-white">LEVEL UP</div>
              <div className="font-display text-glow-cyan mt-1 text-2xl font-bold text-cyan">NÍVEL {levelUp}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RANK UP — DESPERTAR */}
      <AnimatePresence>
        {rankUp && (
          <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/80" />
            {/* shockwave */}
            <motion.div
              className="absolute h-[160px] w-[160px] rounded-full"
              style={{ background: `radial-gradient(circle, ${rankColor}, transparent 60%)` }}
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
            {/* light beams */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{ width: 2, height: 360, background: `linear-gradient(${rankColor}, transparent)`, rotate: `${i * 36}deg` }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 0.7, 0], scaleY: [0, 1, 1] }}
                transition={{ duration: 2.4, delay: 0.2 }}
              />
            ))}
            <motion.div className="relative text-center" initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
              <motion.div
                className="font-display text-sm tracking-[10px] text-violet-soft"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                DESPERTAR
              </motion.div>
              <div className="font-display my-1 text-3xl font-black tracking-widest text-white" style={{ textShadow: `0 0 30px ${rankColor}` }}>
                VOCÊ EVOLUIU
              </div>
              <div
                className="font-display text-7xl font-black leading-none"
                style={{ color: '#fff', textShadow: `0 0 40px ${rankColor}, 0 0 80px ${rankColor}` }}
              >
                RANK {rankUp}
              </div>
              <div className="mt-2 text-[12px] tracking-[3px]" style={{ color: rankColor }}>
                {RANK_DATA[rankUp as keyof typeof RANK_DATA].name.toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
