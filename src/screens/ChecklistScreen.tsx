import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen, PageTitle, CoinPill, BlueButton } from '../components/kit'
import TaskEditor from '../components/TaskEditor'
import { useGame, tasksForDay } from '../store/useGame'
import { WEEKDAYS_FULL } from '../data/game'
import type { Task } from '../types'

export default function ChecklistScreen() {
  const tasks = useGame((s) => s.tasks)
  const doneToday = useGame((s) => s.doneToday)
  const coins = useGame((s) => s.coins)
  const toggleTask = useGame((s) => s.toggleTask)
  const addTask = useGame((s) => s.addTask)
  const updateTask = useGame((s) => s.updateTask)
  const removeTask = useGame((s) => s.removeTask)

  const [editing, setEditing] = useState<Task | null>(null)
  const [open, setOpen] = useState(false)

  const today = new Date()
  const list = tasksForDay(tasks)
  const done = list.filter((t) => doneToday.includes(t.id)).length
  const earnedToday = list.filter((t) => doneToday.includes(t.id)).reduce((a, t) => a + t.moedas, 0)
  const possible = list.reduce((a, t) => a + t.moedas, 0)
  const pct = Math.round((done / Math.max(1, list.length)) * 100)

  const dateStr = `${WEEKDAYS_FULL[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}`

  return (
    <Screen>
      <PageTitle title="Checklist" sub={dateStr} right={<CoinPill value={coins} />} />

      {/* progress card */}
      <div className="card p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[28px] font-bold leading-none">
              {done}<span className="text-[16px] text-muted"> / {list.length}</span>
            </div>
            <div className="mt-1 text-[12px] text-muted">tarefas concluídas hoje</div>
          </div>
          <div className="text-right">
            <div className="text-[18px] font-bold text-blue">🪙 {earnedToday}</div>
            <div className="text-[11px] text-muted">de {possible} possíveis</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div className="h-full rounded-full" style={{ background: 'var(--blue-deep)' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <div className="mb-2 mt-5 flex items-center justify-between">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted">Tarefas de hoje</h2>
        <BlueButton variant="ghost" onClick={() => { setEditing(null); setOpen(true) }} className="!px-3 !py-1.5 !text-[12px]">+ Nova</BlueButton>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {list.map((t) => {
            const isDone = doneToday.includes(t.id)
            return (
              <motion.div key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex items-center gap-3 p-3">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border-2 transition"
                  style={{ borderColor: isDone ? 'var(--blue)' : 'var(--border)', background: isDone ? 'var(--blue-deep)' : 'transparent' }}
                >
                  {isDone && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[14px] text-white">✓</motion.span>}
                </button>
                <button onClick={() => toggleTask(t.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                  <span className="text-[18px]">{t.icone}</span>
                  <span className={`truncate text-[14px] ${isDone ? 'text-muted line-through' : 'text-text'}`}>{t.nome}</span>
                </button>
                <span className="flex-shrink-0 text-[12px] font-semibold text-blue">🪙 {t.moedas}</span>
                <button onClick={() => { setEditing(t); setOpen(true) }} className="flex-shrink-0 px-1 text-[13px] text-muted">✎</button>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {!list.length && <div className="card p-6 text-center text-[13px] text-muted">Nenhuma tarefa para hoje. Aproveite o descanso 🌙</div>}
      </div>

      <TaskEditor
        open={open}
        initial={editing ?? undefined}
        onClose={() => setOpen(false)}
        onSave={(draft) => { if (editing) updateTask(editing.id, draft); else addTask(draft); setOpen(false) }}
        onDelete={editing ? () => { removeTask(editing.id); setOpen(false) } : undefined}
      />
    </Screen>
  )
}
