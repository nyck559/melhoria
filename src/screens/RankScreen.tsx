import { motion } from 'framer-motion'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, EnergyBar } from '../components/common/ui'
import RankBadge from '../components/hud/RankBadge'
import { useLevelInfo } from '../store/useGame'
import { RANKS, RANK_DATA, rankForLevel, xpForLevel } from '../data/game'

export default function RankScreen() {
  const { level, into, need } = useLevelInfo()
  const current = rankForLevel(level)
  const curIdx = RANKS.indexOf(current)
  const nextRank = RANKS[Math.min(RANKS.length - 1, curIdx + 1)]
  const rd = RANK_DATA[current]

  // progress to next rank by level
  const nextMin = RANK_DATA[nextRank].minLevel
  const prevMin = rd.minLevel
  const rankPct =
    nextRank === current ? 100 : Math.round(((level - prevMin + into / need) / (nextMin - prevMin)) * 100)

  return (
    <Screen>
      <ScreenTitle title="RANK" sub="Classificação global" />

      {/* current rank hero */}
      <motion.div
        className="relative mb-5 flex flex-col items-center overflow-hidden rounded-3xl border border-violet-glow/25 bg-gradient-to-b from-[#140a28]/70 to-[#08040f]/90 py-6 scanlines"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <RankBadge rank={current} color={rd.color} size={170} />
        <div className="mt-3 text-center">
          <div className="font-display text-glow text-xl font-extrabold">{rd.name}</div>
          <div className="text-[11px] tracking-wide text-violet-soft/60">{rd.sub}</div>
        </div>
        <div className="mt-4 w-3/4">
          <div className="font-num mb-1.5 flex justify-between text-[10px] tracking-wide text-cold/70">
            <span>PRÓXIMO · RANK {nextRank}</span>
            <span>{Math.max(0, Math.min(100, rankPct))}%</span>
          </div>
          <EnergyBar value={Math.max(0, Math.min(100, rankPct))} c1={rd.color} c2="#46e0ff" height={8} />
        </div>
      </motion.div>

      <SectionLabel>ESCADA DE RANKS</SectionLabel>
      <div className="flex flex-col gap-2.5">
        {[...RANKS].reverse().map((r, i) => {
          const d = RANK_DATA[r]
          const isCur = r === current
          const reached = level >= d.minLevel
          return (
            <motion.div
              key={r}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative flex items-center gap-3 rounded-2xl border p-3"
              style={{
                borderColor: isCur ? d.color : 'rgba(139,92,255,.14)',
                background: isCur ? `linear-gradient(135deg, ${d.color}22, rgba(20,10,32,.6))` : 'rgba(20,14,38,.45)',
                boxShadow: isCur ? `0 0 22px ${d.color}66` : 'none',
              }}
            >
              <span
                className="font-display w-12 text-center text-2xl font-black"
                style={{ color: reached ? d.color : '#3a3556', textShadow: reached ? `0 0 16px ${d.color}88` : 'none' }}
              >
                {r}
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold" style={{ color: reached ? '#fff' : '#565273' }}>
                  {d.name}
                </div>
                <div className="text-[9px] tracking-wide text-violet-soft/50">{d.sub}</div>
                <div className="mt-1.5">
                  <EnergyBar value={reached ? 100 : level > d.minLevel - 12 ? 40 : 8} c1={d.color} c2={d.color} height={4} />
                </div>
              </div>
              <span className="font-num text-[10px] text-violet-soft/50">Lv {d.minLevel}+</span>
            </motion.div>
          )
        })}
      </div>
    </Screen>
  )
}
