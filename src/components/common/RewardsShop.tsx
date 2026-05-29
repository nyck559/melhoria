import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useGame, useCoins, useCrystals } from '../../store/useGame'
import { useAudio } from '../../hooks/useAudio'
import { CURRENCY, REWARD_CATEGORIES } from '../../data/game'
import { AnimatedNumber, GlowButton, SectionLabel } from './ui'
import RewardEditor from './RewardEditor'
import type { Reward } from '../../types'

export default function RewardsShop() {
  const rewards = useGame((s) => s.rewards)
  const redemptions = useGame((s) => s.redemptions)
  const coins = useCoins()
  const crystals = useCrystals()
  const redeemReward = useGame((s) => s.redeemReward)
  const addReward = useGame((s) => s.addReward)
  const updateReward = useGame((s) => s.updateReward)
  const removeReward = useGame((s) => s.removeReward)
  const play = useAudio((s) => s.play)

  const [editing, setEditing] = useState<Reward | null>(null)
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const balance = (m: 'coins' | 'crystals') => (m === 'coins' ? coins : crystals)

  return (
    <div>
      {/* balances */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {(['coins', 'crystals'] as const).map((m) => (
          <div key={m} className="glass flex items-center justify-center gap-2 rounded-2xl py-3" style={{ boxShadow: `inset 0 0 18px ${CURRENCY[m].color}22` }}>
            <span className="text-xl" style={{ color: CURRENCY[m].color, filter: `drop-shadow(0 0 8px ${CURRENCY[m].color})` }}>
              {CURRENCY[m].icon}
            </span>
            <AnimatedNumber value={balance(m)} className="font-display text-xl font-extrabold" />
          </div>
        ))}
      </div>

      <SectionLabel
        right={
          <GlowButton sound="ui" onClick={() => { setEditing(null); setOpen(true) }} className="!px-3 !py-2 text-[10px]">
            + NOVO
          </GlowButton>
        }
      >
        RECOMPENSAS
      </SectionLabel>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {rewards.map((r) => {
            const cur = CURRENCY[r.moeda]
            const cat = REWARD_CATEGORIES[r.categoria]
            const bal = balance(r.moeda)
            const limitHit = !!r.limitePorDia && r.resgatadosHoje >= r.limitePorDia
            const poor = bal < r.custo
            const disabled = poor || limitHit
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="glass relative flex items-center gap-3 overflow-hidden rounded-2xl p-3"
                style={{ borderColor: `${cat.color}33` }}
              >
                <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: cat.color, boxShadow: `0 0 12px ${cat.color}` }} />
                <span
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-2xl"
                  style={{ background: `${cat.color}1f`, border: `1px solid ${cat.color}55` }}
                >
                  {r.icone}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{r.nome}</span>
                    <button
                      onClick={() => { setEditing(r); setOpen(true); play('ui') }}
                      className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg border border-violet-glow/30 bg-white/5 text-[11px] text-cold"
                    >
                      ✎
                    </button>
                  </div>
                  <div className="text-[11px] text-violet-soft/55">{r.descricao}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    <span style={{ color: cur.color }} className="font-num font-bold">
                      {cur.icon} {r.custo}
                    </span>
                    {r.limitePorDia ? (
                      <span className="text-violet-soft/50">{r.resgatadosHoje}/{r.limitePorDia} hoje</span>
                    ) : (
                      <span className="text-violet-soft/40">sem limite</span>
                    )}
                  </div>
                </div>
                <GlowButton
                  variant={disabled ? 'ghost' : 'gold'}
                  sound="xp"
                  onClick={() => {
                    if (disabled) return
                    redeemReward(r.id)
                    play('levelup')
                    setFlash(r.id)
                    setTimeout(() => setFlash((f) => (f === r.id ? null : f)), 900)
                  }}
                  className={`!px-3 !py-2 text-[10px] ${disabled ? 'opacity-50' : ''}`}
                >
                  {limitHit ? 'LIMITE' : poor ? 'SEM SALDO' : 'RESGATAR'}
                </GlowButton>

                <AnimatePresence>
                  {flash === r.id && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.9 }}
                      style={{ background: `radial-gradient(circle at 85% 50%, ${cur.color}66, transparent 60%)` }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {redemptions.length > 0 && (
        <>
          <SectionLabel>HISTÓRICO</SectionLabel>
          <div className="flex flex-col gap-2">
            {redemptions.slice(0, 8).map((h) => (
              <div key={h.id} className="glass flex items-center gap-3 rounded-xl px-3 py-2">
                <span className="text-base">{h.icone}</span>
                <span className="flex-1 truncate text-[12px]">{h.nome}</span>
                <span className="font-num text-[11px]" style={{ color: CURRENCY[h.moeda].color }}>
                  -{h.custo} {CURRENCY[h.moeda].icon}
                </span>
                <span className="text-[10px] text-violet-soft/40">
                  {new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <RewardEditor
        open={open}
        initial={editing ?? undefined}
        onClose={() => setOpen(false)}
        onSave={(draft) => {
          if (editing) updateReward(editing.id, draft)
          else addReward(draft)
          play('levelup')
          setOpen(false)
        }}
        onDelete={editing ? () => { removeReward(editing.id); setOpen(false) } : undefined}
      />
    </div>
  )
}
