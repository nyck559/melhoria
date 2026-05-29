import { motion, type MotionValue } from 'framer-motion'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, AnimatedNumber, EnergyBar, Holo } from '../components/common/ui'
import Hunter3D from '../components/character/Hunter3D'
import RankBadge from '../components/hud/RankBadge'
import { useGame, useLevelInfo, useCorruption, useDiscipline } from '../store/useGame'
import { ATTRS, ATTR_ORDER, RANK_DATA, rankForLevel } from '../data/game'

export default function StatusScreen({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const attrs = useGame((s) => s.attrs)
  const { level, into, need } = useLevelInfo()
  const corruption = useCorruption()
  const discipline = useDiscipline()
  const equipped = useGame((s) => s.equipped)
  const rank = rankForLevel(level)
  const rd = RANK_DATA[rank]

  return (
    <Screen>
      <ScreenTitle title="STATUS" sub="Sistema · Jogador" />

      {/* HERO — character ~70% */}
      <Holo className="relative mb-3 h-[400px] overflow-hidden scanlines" glow>
        {/* inner aura floor */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: `radial-gradient(120% 90% at 50% 120%, ${rd.color}55, transparent 60%)` }}
        />
        <Hunter3D rank={rank} accent={rd.color} corruption={corruption} discipline={discipline} equipped={equipped} className="absolute inset-0" />

        {/* rank badge */}
        <div className="absolute right-3 top-3">
          <RankBadge rank={rank} color={rd.color} size={104} />
        </div>

        {/* name plate */}
        <div className="absolute bottom-3 left-3">
          <div className="font-display text-glow text-2xl font-extrabold">Jin Woo</div>
          <div className="text-[11px] tracking-[2px] text-cold/80">
            NÍVEL <b className="text-cyan">{level}</b> · {rd.name}
          </div>
        </div>

        {/* power tag */}
        <div className="absolute right-3 bottom-3 text-right">
          <div className="text-[9px] tracking-[2px] text-violet-soft/70">CORRUPÇÃO</div>
          <div className="font-num text-lg font-bold" style={{ color: corruption > 65 ? '#ff2d5e' : '#46e0ff' }}>
            {corruption}%
          </div>
        </div>
      </Holo>

      {/* XP bar */}
      <Holo className="mb-1 px-3 py-3">
        <div className="font-num mb-1.5 flex justify-between text-[11px] font-semibold tracking-[2px] text-violet-soft/70">
          <span>EXP</span>
          <span>
            {into.toLocaleString('pt-BR')} / {need.toLocaleString('pt-BR')}
          </span>
        </div>
        <EnergyBar value={(into / need) * 100} c1={rd.color} c2="#46e0ff" height={10} />
      </Holo>

      {/* ATTRIBUTES */}
      <SectionLabel right={<span className="text-[9px] tracking-wide text-violet-soft/50">HOLO · 7 atributos</span>}>
        ATRIBUTOS
      </SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        {ATTR_ORDER.map((key, i) => {
          const a = ATTRS[key]
          const v = attrs[key]
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.04, boxShadow: `0 0 22px ${a.color}66` }}
              className="glass relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2.5"
            >
              <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: a.color, boxShadow: `0 0 12px ${a.color}` }} />
              <span
                className="grid h-9 w-9 place-items-center rounded-lg text-base"
                style={{ background: `${a.color}22`, border: `1px solid ${a.color}55`, color: a.color }}
              >
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] uppercase tracking-wide text-violet-soft/60">{a.label}</div>
                <AnimatedNumber value={v} className="font-display text-lg font-extrabold" />
                <EnergyBar value={Math.min(100, v)} c1={a.color} c2={a.color} height={4} className="mt-1" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </Screen>
  )
}
