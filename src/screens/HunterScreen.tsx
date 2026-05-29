import { motion, type MotionValue } from 'framer-motion'
import { useState } from 'react'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, AnimatedNumber, Holo, GlowButton } from '../components/common/ui'
import Hunter from '../components/character/Hunter'
import { useGame, useLevelInfo, usePower, useCorruption, useEquippedAura, useCoins, useCrystals } from '../store/useGame'
import { rankTier, ATTRS, CURRENCY } from '../data/game'
import { EQUIPMENT } from '../data/equipment'
import type { AttrKey, EquipSlot } from '../types'
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
  const ownedEquip = useGame((s) => s.ownedEquip)
  const equipItem = useGame((s) => s.equipItem)
  const buyEquip = useGame((s) => s.buyEquip)
  const equippedAura = useEquippedAura()
  const coins = useCoins()
  const crystals = useCrystals()
  const [auraIdx, setAuraIdx] = useState(0)
  const accent = equippedAura ?? AURAS[auraIdx]
  const play = useAudio((s) => s.play)

  const equippedCount = Object.keys(equipped).length
  const gearPower = EQUIPMENT.filter((e) => equipped[e.slot] === e.id).reduce((a, e) => a + e.power, 0)
  const balance = (m: 'coins' | 'crystals') => (m === 'coins' ? coins : crystals)

  return (
    <Screen>
      <ScreenTitle
        title="CAÇADOR"
        sub="Equipamento · Artefatos"
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

      <Holo className="relative mb-3 h-[340px] overflow-hidden scanlines" glow>
        <div className="absolute inset-0" style={{ background: `radial-gradient(110% 80% at 50% 110%, ${accent}44, transparent 60%)` }} />
        <Hunter tier={tier} accent={accent} px={px} py={py} corrupt={corruption > 65} className="absolute inset-0" />

        {EQUIPMENT.map((item) => {
          const isOn = equipped[item.slot] === item.id
          const owned = ownedEquip.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => { if (owned) { equipItem(item.slot, isOn ? null : item.id); play('ui') } }}
              className={`glass absolute grid h-13 w-13 place-items-center rounded-2xl text-2xl ${SLOT_POS[item.slot]}`}
              style={{
                width: 52, height: 52,
                opacity: isOn ? 1 : owned ? 0.7 : 0.4,
                filter: isOn ? 'none' : 'grayscale(.6)',
                boxShadow: isOn ? `0 0 20px ${accent}aa` : 'none',
                borderColor: isOn ? accent : 'rgba(139,92,255,.25)',
              }}
              title={owned ? item.nome : `${item.nome} (bloqueado)`}
            >
              {owned ? item.icone : '🔒'}
            </button>
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

      {/* ARTIFACT SHOP — buy then equip */}
      <SectionLabel right={<span className="text-[9px] text-violet-soft/50">compre com moedas</span>}>⬡ ARTEFATOS</SectionLabel>
      <div className="flex flex-col gap-2.5">
        {EQUIPMENT.map((item) => {
          const owned = ownedEquip.includes(item.id)
          const isOn = equipped[item.slot] === item.id
          const cur = CURRENCY[item.moeda]
          const poor = balance(item.moeda) < item.custo
          return (
            <div key={item.id} className="glass flex items-center gap-3 rounded-2xl p-3" style={{ borderColor: isOn ? `${accent}66` : undefined }}>
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-xl" style={{ background: 'rgba(106,0,255,.14)', border: `1px solid ${isOn ? accent : 'rgba(139,92,255,.3)'}` }}>
                {owned ? item.icone : '🔒'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{item.nome}</span>
                  <span className="font-display rounded px-1 text-[8px] font-black text-white" style={{ background: `linear-gradient(135deg, ${accent}, #3b82f6)` }}>{item.tier}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] text-violet-soft/70">
                  <span className="text-emerald">▲ {item.power} poder</span>
                  {Object.entries(item.attrBonus).map(([k, v]) => (
                    <span key={k} style={{ color: ATTRS[k as AttrKey].color }}>+{v} {ATTRS[k as AttrKey].label}</span>
                  ))}
                </div>
              </div>
              {!owned ? (
                <GlowButton
                  variant={poor ? 'ghost' : 'gold'}
                  sound="xp"
                  onClick={() => { if (!poor) { buyEquip(item.id); play('levelup') } }}
                  className={`!px-3 !py-2 text-[10px] ${poor ? 'opacity-50' : ''}`}
                >
                  {poor ? 'SEM SALDO' : `COMPRAR ${cur.icon}${item.custo}`}
                </GlowButton>
              ) : (
                <GlowButton
                  variant={isOn ? 'ghost' : 'primary'}
                  sound="ui"
                  onClick={() => { equipItem(item.slot, isOn ? null : item.id); play('ui') }}
                  className="!px-3 !py-2 text-[10px]"
                >
                  {isOn ? 'EQUIPADO ✓' : 'EQUIPAR'}
                </GlowButton>
              )}
            </div>
          )
        })}
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

      <div className="mt-3">
        <GlowButton variant="gold" onClick={onOpenLoja} className="w-full">🎁 ABRIR LOJA DE RECOMPENSAS</GlowButton>
      </div>
    </Screen>
  )
}
