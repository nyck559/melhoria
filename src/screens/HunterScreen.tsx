import { motion, type MotionValue } from 'framer-motion'
import { useState } from 'react'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, AnimatedNumber, Holo } from '../components/common/ui'
import Hunter from '../components/character/Hunter'
import { useGame, useLevelInfo, usePower, useCorruption, useEquippedAura, useCoins, useCrystals } from '../store/useGame'
import { rankTier } from '../data/game'
import { EQUIPMENT, itemForSlot } from '../data/equipment'
import type { EquipSlot } from '../types'
import { useAudio } from '../hooks/useAudio'

const SLOT_POS: Record<EquipSlot, string> = {
  arma: 'left-3 top-6',
  escudo: 'right-3 top-6',
  coroa: 'left-1 top-1/2 -translate-y-1/2',
  anel: 'right-1 top-1/2 -translate-y-1/2',
  elixir: 'left-3 bottom-6',
  amuleto: 'right-3 bottom-6',
}

const AURAS = ['#8b3bff', '#46e0ff', '#ff5a7d', '#43ffb0', '#ffcb57']

export default function HunterScreen({ px, py, onOpenLoja }: { px: MotionValue<number>; py: MotionValue<number>; onOpenLoja: () => void }) {
  const { level } = useLevelInfo()
  const power = usePower()
  const corruption = useCorruption()
  const tier = rankTier(level)
  const equipped = useGame((s) => s.equipped)
  const equipItem = useGame((s) => s.equipItem)
  const equippedAura = useEquippedAura()
  const coins = useCoins()
  const crystals = useCrystals()
  const [auraIdx, setAuraIdx] = useState(0)
  const accent = equippedAura ?? AURAS[auraIdx]
  const play = useAudio((s) => s.play)

  const equippedCount = Object.keys(equipped).length
  const gearPower = EQUIPMENT.filter((e) => equipped[e.slot] === e.id).reduce((a, e) => a + e.power, 0)

  return (
    <Screen>
      <ScreenTitle
        title="CAÇADOR"
        sub="Equipamento · Loadout"
        right={
          <button onClick={onOpenLoja} className="flex gap-1.5" title="Abrir Loja">
            <span className="font-num rounded-full border border-violet-glow/30 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-violet-soft">
              ◆ <AnimatedNumber value={crystals} />
            </span>
            <span className="font-num rounded-full border border-violet-glow/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-gold">
              ⬡ <AnimatedNumber value={coins} />
            </span>
          </button>
        }
      />

      <Holo className="relative mb-3 h-[360px] overflow-hidden scanlines" glow>
        <div className="absolute inset-0" style={{ background: `radial-gradient(110% 80% at 50% 110%, ${accent}44, transparent 60%)` }} />
        <Hunter tier={tier} accent={accent} px={px} py={py} corrupt={corruption > 65} className="absolute inset-0" />

        {EQUIPMENT.map((item) => {
          const isOn = equipped[item.slot] === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { equipItem(item.slot, isOn ? null : item.id); play('ui') }}
              className={`glass absolute grid h-14 w-14 place-items-center rounded-2xl text-2xl ${SLOT_POS[item.slot]}`}
              style={{
                opacity: isOn ? 1 : 0.5,
                filter: isOn ? 'none' : 'grayscale(.6)',
                boxShadow: isOn ? `0 0 20px ${accent}aa` : `0 0 8px ${accent}33`,
                borderColor: isOn ? accent : 'rgba(139,92,255,.25)',
              }}
              title={`${item.nome} · +${item.power} poder`}
            >
              {item.icone}
              <span
                className="font-display absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-md text-[8px] font-black text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, #3b82f6)`, boxShadow: `0 0 8px ${accent}` }}
              >
                {item.tier}
              </span>
            </motion.button>
          )
        })}
      </Holo>

      {/* power total */}
      <div className="mb-3 text-center">
        <div className="text-[11px] tracking-[4px] text-violet-soft/60">PODER TOTAL</div>
        <AnimatedNumber value={power} className="font-display text-glow bg-gradient-to-b from-white to-violet-soft bg-clip-text text-5xl font-black text-transparent" />
        <div className="text-[11px] tracking-wide text-emerald">
          {equippedCount}/6 equipados {gearPower > 0 && `· ▲ +${gearPower} do equipamento`}
        </div>
      </div>

      {/* aura selector */}
      <SectionLabel right={equippedAura ? <span className="text-[9px] text-violet-soft/50">aura do equipamento ativa</span> : undefined}>
        AURA CONFIGURÁVEL
      </SectionLabel>
      <div className="mb-2 flex gap-2.5">
        {AURAS.map((c, i) => (
          <button
            key={c}
            onClick={() => { setAuraIdx(i); play('menu') }}
            className="relative h-12 flex-1 rounded-xl border transition"
            style={{
              background: `radial-gradient(circle, ${c}55, transparent 70%)`,
              borderColor: !equippedAura && auraIdx === i ? c : 'rgba(139,92,255,.2)',
              boxShadow: !equippedAura && auraIdx === i ? `0 0 18px ${c}` : 'none',
              opacity: equippedAura ? 0.55 : 1,
            }}
          >
            <span className="absolute inset-0 grid place-items-center text-lg" style={{ color: c }}>✦</span>
          </button>
        ))}
      </div>

      <SectionLabel>SISTEMA</SectionLabel>
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { ico: '⚡', label: 'HABILIDADES' },
          { ico: '✦', label: 'AURA' },
          { ico: '🎁', label: 'LOJA', action: onOpenLoja },
          { ico: '❒', label: 'CÓDEX' },
        ].map((t) => (
          <motion.button
            key={t.label}
            whileHover={{ scale: 1.06, boxShadow: `0 0 18px ${accent}66` }}
            onClick={() => (t.action ? t.action() : play('ui'))}
            className="glass flex flex-col items-center gap-1.5 rounded-2xl py-3"
          >
            <span className="text-xl" style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }}>{t.ico}</span>
            <span className="text-[8px] font-semibold tracking-wide text-violet-soft/60">{t.label}</span>
          </motion.button>
        ))}
      </div>
    </Screen>
  )
}
