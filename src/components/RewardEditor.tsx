import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Reward, RewardCategory } from '../types'
import { REWARD_CATEGORIES } from '../data/game'
import { BlueButton } from './kit'

const EMPTY = { nome: '', icone: '🎁', custo: 100, categoria: 'lazer' as RewardCategory, limitePorDia: 0 }
const CATS = Object.keys(REWARD_CATEGORIES) as RewardCategory[]

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
  onSave: (r: Omit<Reward, 'id' | 'resgatadosHoje'>) => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (open) setForm(initial ? { nome: initial.nome, icone: initial.icone, custo: initial.custo, categoria: initial.categoria, limitePorDia: initial.limitePorDia ?? 0 } : EMPTY)
  }, [open, initial])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl border-t border-line bg-surface p-5 pb-8" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
            <h3 className="mb-4 text-[17px] font-bold">{initial ? 'Editar recompensa' : 'Nova recompensa'}</h3>

            <div className="flex gap-2">
              <input value={form.icone} onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value.slice(0, 2) }))} className="w-14 rounded-xl border border-line bg-surface2 py-2.5 text-center text-xl" />
              <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome da recompensa" className="flex-1 rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] uppercase tracking-wide text-muted">Custo (🪙)</label>
                <input type="number" value={form.custo} onChange={(e) => setForm((f) => ({ ...f, custo: Math.max(0, +e.target.value) }))} className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wide text-muted">Limite/dia (0 = livre)</label>
                <input type="number" value={form.limitePorDia} onChange={(e) => setForm((f) => ({ ...f, limitePorDia: Math.max(0, +e.target.value) }))} className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none" />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-muted">Categoria</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {CATS.map((c) => {
                  const on = form.categoria === c
                  return (
                    <button key={c} onClick={() => setForm((f) => ({ ...f, categoria: c }))} className="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition" style={{ background: on ? 'var(--blue-deep)' : 'var(--surface-2)', color: on ? '#fff' : 'var(--muted)', border: '1px solid var(--border)' }}>
                      {REWARD_CATEGORIES[c].icon} {REWARD_CATEGORIES[c].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {onDelete && <BlueButton variant="ghost" onClick={onDelete} className="!text-bad">Excluir</BlueButton>}
              <div className="flex-1" />
              <BlueButton variant="ghost" onClick={onClose}>Cancelar</BlueButton>
              <BlueButton onClick={() => { if (form.nome.trim()) onSave({ ...form, limitePorDia: form.limitePorDia || undefined }) }}>Salvar</BlueButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
