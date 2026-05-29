import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { Currency, Reward, RewardCategory } from '../../types'
import { CURRENCY, REWARD_CATEGORIES } from '../../data/game'
import { GlowButton } from './ui'

type Draft = Omit<Reward, 'id' | 'resgatadosHoje'>

const ICONS = ['📱', '🍫', '📺', '🎮', '💵', '🛌', '☕', '🍕', '🎧', '🛍', '🚗', '🏖', '🎬', '🍦', '⌚', '✦']

const EMPTY: Draft = {
  nome: '',
  descricao: '',
  icone: '🎁',
  custo: 100,
  moeda: 'coins',
  categoria: 'lazer',
  limitePorDia: undefined,
}

export default function RewardEditor({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean
  initial?: Reward
  onClose: () => void
  onSave: (d: Draft) => void
  onDelete?: () => void
}) {
  const [d, setD] = useState<Draft>(EMPTY)
  const [seeded, setSeeded] = useState<string | null>(null)

  if (open && seeded !== (initial?.id ?? 'new')) {
    setSeeded(initial?.id ?? 'new')
    setD(initial ? { ...initial } : EMPTY)
  }
  if (!open && seeded !== null) setSeeded(null)

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))
  const cur = CURRENCY[d.moeda]

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="holo relative max-h-[88%] w-full overflow-y-auto rounded-t-3xl px-4 pb-6 pt-5"
            style={{ borderColor: `${cur.color}66`, boxShadow: `0 -10px 40px ${cur.color}44` }}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
            <h2 className="font-display mb-4 text-lg font-bold tracking-wide" style={{ color: cur.color }}>
              {initial ? 'EDITAR RECOMPENSA' : 'NOVA RECOMPENSA'}
            </h2>

            <div className="mb-3 flex gap-1.5 overflow-x-auto rounded-xl bg-black/30 p-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => set('icone', ic)}
                  className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-lg ${d.icone === ic ? 'bg-gold/40' : 'bg-white/5'}`}
                >
                  {ic}
                </button>
              ))}
            </div>

            <Field label="NOME">
              <input value={d.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex: Rede social 30 min" className="rinp" />
            </Field>
            <Field label="DESCRIÇÃO">
              <input value={d.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Ex: scroll sem culpa" className="rinp" />
            </Field>

            <Field label="CATEGORIA">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(REWARD_CATEGORIES) as RewardCategory[]).map((c) => (
                  <Chip key={c} active={d.categoria === c} color={REWARD_CATEGORIES[c].color} onClick={() => set('categoria', c)}>
                    {REWARD_CATEGORIES[c].icon} {REWARD_CATEGORIES[c].label}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="MOEDA">
              <div className="flex gap-1.5">
                {(Object.keys(CURRENCY) as Currency[]).map((c) => (
                  <Chip key={c} active={d.moeda === c} color={CURRENCY[c].color} onClick={() => set('moeda', c)}>
                    {CURRENCY[c].icon} {CURRENCY[c].label}
                  </Chip>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="CUSTO">
                <input type="number" min={1} value={d.custo} onChange={(e) => set('custo', Math.max(1, +e.target.value))} className="rinp" />
              </Field>
              <Field label="LIMITE / DIA (0 = livre)">
                <input
                  type="number"
                  min={0}
                  value={d.limitePorDia ?? 0}
                  onChange={(e) => set('limitePorDia', +e.target.value > 0 ? +e.target.value : undefined)}
                  className="rinp"
                />
              </Field>
            </div>

            <div className="mt-5 flex gap-2">
              {onDelete && (
                <GlowButton variant="danger" onClick={onDelete} className="flex-1">
                  EXCLUIR
                </GlowButton>
              )}
              <GlowButton variant="ghost" onClick={onClose} className="flex-1">
                CANCELAR
              </GlowButton>
              <GlowButton
                variant="gold"
                onClick={() => {
                  if (!d.nome.trim()) return
                  onSave(d)
                }}
                className="flex-[1.4]"
              >
                SALVAR
              </GlowButton>
            </div>
          </motion.div>

          <style>{`
            .rinp { width:100%; background:rgba(0,0,0,.4); border:1px solid rgba(139,92,255,.25); border-radius:10px;
              padding:9px 11px; color:#eef0ff; font-size:13px; outline:none; }
            .rinp:focus { border-color:#ffcb57; box-shadow:0 0 14px rgba(255,203,87,.35); }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[10px] font-semibold tracking-[2px] text-violet-soft/60">{label}</div>
      {children}
    </div>
  )
}

function Chip({ children, active, color, onClick }: { children: React.ReactNode; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition"
      style={{
        background: active ? `${color}33` : 'rgba(255,255,255,.04)',
        border: `1px solid ${active ? color : 'rgba(139,92,255,.18)'}`,
        color: active ? '#fff' : '#9aa0c9',
        boxShadow: active ? `0 0 12px ${color}66` : 'none',
      }}
    >
      {children}
    </button>
  )
}
