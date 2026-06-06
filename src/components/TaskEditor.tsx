import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Task } from '../types'
import { WEEKDAYS } from '../data/game'
import { BlueButton } from './kit'

const EMPTY = { nome: '', icone: '✅', moedas: 10, dias: [1, 2, 3, 4, 5] as number[] }

export default function TaskEditor({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean
  initial?: Task
  onClose: () => void
  onSave: (t: Omit<Task, 'id' | 'ordem'>) => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (open) setForm(initial ? { nome: initial.nome, icone: initial.icone, moedas: initial.moedas, dias: initial.dias } : EMPTY)
  }, [open, initial])

  const toggleDay = (d: number) => setForm((f) => ({ ...f, dias: f.dias.includes(d) ? f.dias.filter((x) => x !== d) : [...f.dias, d].sort() }))

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl border-t border-line bg-surface p-5 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
            <h3 className="mb-4 text-[17px] font-bold">{initial ? 'Editar tarefa' : 'Nova tarefa'}</h3>

            <div className="flex gap-2">
              <input value={form.icone} onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value.slice(0, 2) }))} className="w-14 rounded-xl border border-line bg-surface2 py-2.5 text-center text-xl" />
              <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome da tarefa" className="flex-1 rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none" />
            </div>

            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-muted">Moedas ao concluir</label>
              <input type="number" value={form.moedas} onChange={(e) => setForm((f) => ({ ...f, moedas: Math.max(0, +e.target.value) }))} className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none" />
            </div>

            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-muted">Dias</label>
              <div className="mt-1.5 flex gap-1.5">
                {WEEKDAYS.map((w, i) => {
                  const on = form.dias.includes(i)
                  return (
                    <button key={i} onClick={() => toggleDay(i)} className="flex-1 rounded-lg py-2 text-[11px] font-semibold transition" style={{ background: on ? 'var(--blue-deep)' : 'var(--surface-2)', color: on ? '#fff' : 'var(--muted)', border: '1px solid var(--border)' }}>
                      {w}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {onDelete && <BlueButton variant="ghost" onClick={onDelete} className="!text-bad">Excluir</BlueButton>}
              <div className="flex-1" />
              <BlueButton variant="ghost" onClick={onClose}>Cancelar</BlueButton>
              <BlueButton onClick={() => { if (form.nome.trim()) onSave(form) }}>Salvar</BlueButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
