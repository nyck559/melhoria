import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen, PageTitle, CoinPill, BlueButton, SectionTitle } from '../components/kit'
import RewardEditor from '../components/RewardEditor'
import { useGame, isWeekend } from '../store/useGame'
import { REWARD_CATEGORIES } from '../data/game'
import type { Reward } from '../types'

function RewardRow({ r, coins, weekend, onRedeem, onEdit }: { r: Reward; coins: number; weekend: boolean; onRedeem: () => void; onEdit: () => void }) {
  const cat = REWARD_CATEGORIES[r.categoria]
  const limitHit = !!r.limitePorDia && r.resgatadosHoje >= r.limitePorDia
  const afford = coins >= r.custo
  const canRedeem = afford && !limitHit && weekend
  const pct = Math.min(100, (coins / r.custo) * 100)
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-xl" style={{ background: `${cat.color}1c`, border: `1px solid ${cat.color}44` }}>{r.icone}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold">{r.nome}</span>
            <button onClick={onEdit} className="px-1 text-[12px] text-muted">✎</button>
          </div>
          <div className="text-[12px] font-semibold text-blue">🪙 {r.custo.toLocaleString('pt-BR')}{r.limitePorDia ? ` · ${r.resgatadosHoje}/${r.limitePorDia} hoje` : ''}</div>
        </div>
        <BlueButton disabled={!canRedeem} onClick={onRedeem} className="!px-3 !py-2 !text-[12px]">
          {limitHit ? 'Limite' : !afford ? 'Faltam ' + (r.custo - coins) : !weekend ? '🔒 FDS' : 'Resgatar'}
        </BlueButton>
      </div>
      {!afford && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color }} />
        </div>
      )}
    </motion.div>
  )
}

export default function RewardsScreen() {
  const rewards = useGame((s) => s.rewards)
  const redemptions = useGame((s) => s.redemptions)
  const coins = useGame((s) => s.coins)
  const redeemReward = useGame((s) => s.redeemReward)
  const addReward = useGame((s) => s.addReward)
  const updateReward = useGame((s) => s.updateReward)
  const removeReward = useGame((s) => s.removeReward)

  const [editing, setEditing] = useState<Reward | null>(null)
  const [open, setOpen] = useState(false)
  const weekend = isWeekend()

  const list = [...rewards].sort((a, b) => a.custo - b.custo)

  return (
    <Screen>
      <PageTitle title="Recompensas" sub="Troque suas moedas" right={<CoinPill value={coins} />} />

      <div className="card mb-3 flex items-center gap-3 p-3" style={{ borderColor: weekend ? 'rgba(95,208,138,.4)' : 'rgba(91,156,255,.3)' }}>
        <span className="text-2xl">{weekend ? '🎉' : '📅'}</span>
        <div className="flex-1">
          <div className="text-[13px] font-semibold" style={{ color: weekend ? 'var(--blue)' : 'var(--text)' }}>
            {weekend ? 'Fim de semana — recompensas liberadas!' : 'Recompensas só nos fins de semana'}
          </div>
          <div className="text-[11px] text-muted">{weekend ? 'Aproveite o que você conquistou.' : 'Continue acumulando moedas durante a semana.'}</div>
        </div>
      </div>

      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted">Recompensas</h2>
        <BlueButton variant="ghost" onClick={() => { setEditing(null); setOpen(true) }} className="!px-3 !py-1.5 !text-[12px]">+ Nova</BlueButton>
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {list.map((r) => (
            <RewardRow key={r.id} r={r} coins={coins} weekend={weekend} onRedeem={() => redeemReward(r.id)} onEdit={() => { setEditing(r); setOpen(true) }} />
          ))}
        </AnimatePresence>
      </div>

      {redemptions.length > 0 && (
        <>
          <SectionTitle>Histórico</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {redemptions.slice(0, 12).map((h) => (
              <div key={h.id} className="card flex items-center gap-3 px-3 py-2">
                <span className="text-[15px]">{h.icone}</span>
                <span className="flex-1 truncate text-[13px]">{h.nome}</span>
                <span className="text-[12px] font-semibold text-bad">-{h.custo.toLocaleString('pt-BR')}</span>
                <span className="text-[11px] text-muted">{new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <RewardEditor
        open={open}
        initial={editing ?? undefined}
        onClose={() => setOpen(false)}
        onSave={(draft) => { if (editing) updateReward(editing.id, draft); else addReward(draft); setOpen(false) }}
        onDelete={editing ? () => { removeReward(editing.id); setOpen(false) } : undefined}
      />
    </Screen>
  )
}
