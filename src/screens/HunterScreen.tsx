import { motion, type MotionValue } from 'framer-motion'
import { useState } from 'react'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, AnimatedNumber, Holo } from '../components/common/ui'
import Hunter from '../components/character/Hunter'
import { useGame, useLevelInfo, usePower, useCorruption } from '../store/useGame'
import { RANK_DATA, rankForLevel, rankTier } from '../data/game'
import { useAudio } from '../hooks/useAudio'

const SLOTS = [
  { ico: '⚔', tier: 'S', name: 'Lâmina Sombria', pos: 'left-3 top-6' },
  { ico: '🛡', tier: 'A', name: 'Égide do Vazio', pos: 'right-3 top-6' },
  { ico: '👑', tier: 'S', name: 'Coroa do Monarca', pos: 'left-1 top-1/2 -translate-y-1/2' },
  { ico: '💍', tier: 'B', name: 'Anel Arcano', pos: 'right-1 top-1/2 -translate-y-1/2' },
  { ico: '🧪', tier: 'C', name: 'Elixir', pos: 'left-3 bottom-6' },
  { ico: '📿', tier: 'A', name: 'Amuleto Espectral', pos: 'right-3 bottom-6' },
]

const AURAS = ['#8b3bff', '#46e0ff', '#ff5a7d', '#43ffb0', '#ffcb57']

export default function HunterScreen({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const { level } = useLevelInfo()
  const power = usePower()
  const corruption = useCorruption()
  const tier = rankTier(level)
  const [auraIdx, setAuraIdx] = useState(0)
  const accent = AURAS[auraIdx]
  const play = useAudio((s) => s.play)

  return (
    <Screen>
      <ScreenTitle
        title="CAÇADOR"
        sub="Equipamento · Loadout"
        right={
          <div className="flex gap-1.5">
            <span className="font-num rounded-full border border-violet-glow/30 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-violet-soft">
              ◆ 1.250
            </span>
            <span className="font-num rounded-full border border-violet-glow/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-gold">
              ⬡ 4.830
            </span>
          </div>
        }
      />

      <Holo className="relative mb-3 h-[360px] overflow-hidden scanlines" glow>
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(110% 80% at 50% 110%, ${accent}44, transparent 60%)` }}
        />
        <Hunter tier={tier} accent={accent} px={px} py={py} corrupt={corruption > 65} className="absolute inset-0" />

        {SLOTS.map((s) => (
          <motion.button
            key={s.name}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => play('ui')}
            className={`glass absolute grid h-14 w-14 place-items-center rounded-2xl text-2xl ${s.pos}`}
            style={{ boxShadow: `0 0 18px ${accent}55`, borderColor: `${accent}66` }}
          >
            {s.ico}
            <span
              className="font-display absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-md text-[8px] font-black text-white"
              style={{ background: `linear-gradient(135deg, ${accent}, #3b82f6)`, boxShadow: `0 0 8px ${accent}` }}
            >
              {s.tier}
            </span>
          </motion.button>
        ))}
      </Holo>

      {/* power total */}
      <div className="mb-3 text-center">
        <div className="text-[11px] tracking-[4px] text-violet-soft/60">PODER TOTAL</div>
        <AnimatedNumber
          value={power}
          className="font-display text-glow bg-gradient-to-b from-white to-violet-soft bg-clip-text text-5xl font-black text-transparent"
        />
        <div className="text-[11px] tracking-wide text-emerald">▲ aura {auraIdx + 1} equipada</div>
      </div>

      {/* aura selector */}
      <SectionLabel>AURA CONFIGURÁVEL</SectionLabel>
      <div className="mb-2 flex gap-2.5">
        {AURAS.map((c, i) => (
          <button
            key={c}
            onClick={() => {
              setAuraIdx(i)
              play('menu')
            }}
            className="relative h-12 flex-1 rounded-xl border transition"
            style={{
              background: `radial-gradient(circle, ${c}55, transparent 70%)`,
              borderColor: auraIdx === i ? c : 'rgba(139,92,255,.2)',
              boxShadow: auraIdx === i ? `0 0 18px ${c}` : 'none',
            }}
          >
            <span className="absolute inset-0 grid place-items-center text-lg" style={{ color: c }}>
              ✦
            </span>
          </button>
        ))}
      </div>

      <SectionLabel>SISTEMA</SectionLabel>
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { ico: '⚡', label: 'HABILIDADES' },
          { ico: '✦', label: 'AURA' },
          { ico: '⬡', label: 'ARTEFATOS' },
          { ico: '❒', label: 'CÓDEX' },
        ].map((t, i) => (
          <motion.button
            key={t.label}
            whileHover={{ scale: 1.06, boxShadow: `0 0 18px ${accent}66` }}
            onClick={() => play('ui')}
            className="glass flex flex-col items-center gap-1.5 rounded-2xl py-3"
            style={i === 1 ? { borderColor: accent, boxShadow: `0 0 16px ${accent}55` } : {}}
          >
            <span className="text-xl" style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }}>
              {t.ico}
            </span>
            <span className="text-[8px] font-semibold tracking-wide text-violet-soft/60">{t.label}</span>
          </motion.button>
        ))}
      </div>
    </Screen>
  )
}
