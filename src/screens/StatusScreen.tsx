import { type MotionValue } from 'framer-motion'
import Screen from '../components/common/Screen'
import { ScreenTitle, AnimatedNumber, Holo, SectionLabel } from '../components/common/ui'
import Hunter3D from '../components/character/Hunter3D'
import DailyChart from '../components/common/DailyChart'
import { useGame, useLevelInfo, useCorruption, useDiscipline, useCoins } from '../store/useGame'
import { rankForLevel } from '../data/game'

const ACCENT = '#8b3bff'

export default function StatusScreen({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  void px; void py
  const habits = useGame((s) => s.habits)
  const { level } = useLevelInfo()
  const corruption = useCorruption()
  const discipline = useDiscipline()
  const coins = useCoins()
  const rank = rankForLevel(level) // drives only the 3D visual intensity (not shown)

  const doneToday = habits.filter((h) => h.concluidoHoje).length
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0)

  return (
    <Screen>
      <ScreenTitle title="SUNG JINWOO" sub="Sua evolução diária" />

      {/* 3D hero */}
      <Holo className="relative mb-3 h-[44vh] min-h-[360px] overflow-hidden scanlines" glow>
        <div className="absolute inset-0" style={{ background: `radial-gradient(110% 80% at 50% 115%, ${ACCENT}44, transparent 60%)` }} />
        <Hunter3D rank={rank} accent={ACCENT} corruption={corruption} discipline={discipline} className="absolute inset-0" />
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[2px] text-violet-soft/50">
          ✦ TOQUE · ARRASTE PARA GIRAR
        </div>
      </Holo>

      {/* today's real-growth summary */}
      <div className="mb-3 grid grid-cols-3 gap-2.5">
        {[
          { label: 'MISSÕES HOJE', value: doneToday, suffix: `/${habits.length}`, color: '#43ffb0' },
          { label: 'MOEDAS', value: coins, suffix: '', color: '#ffcb57' },
          { label: 'MELHOR OFENSIVA', value: bestStreak, suffix: 'd', color: '#46e0ff' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl px-2 py-3 text-center">
            <div className="text-[8px] tracking-[1px] text-violet-soft/55">{s.label}</div>
            <div className="font-display text-2xl font-black" style={{ color: s.color }}>
              <AnimatedNumber value={s.value} />
              <span className="text-[11px] font-semibold text-violet-soft/50">{s.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* daily evolution line chart */}
      <SectionLabel>GRÁFICO</SectionLabel>
      <DailyChart days={7} accent={ACCENT} />
    </Screen>
  )
}
