import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, GlowButton } from '../components/common/ui'
import HabitEditor from '../components/common/HabitEditor'
import { useGame } from '../store/useGame'
import { useAudio } from '../hooks/useAudio'
import { CATEGORIES, RARITY } from '../data/game'
import type { Habit } from '../types'

export default function ManageQuestsScreen({ onBack }: { onBack: () => void }) {
  const habits = useGame((s) => s.habits)
  const addHabit = useGame((s) => s.addHabit)
  const updateHabit = useGame((s) => s.updateHabit)
  const removeHabit = useGame((s) => s.removeHabit)
  const play = useAudio((s) => s.play)

  const [editing, setEditing] = useState<Habit | null>(null)
  const [open, setOpen] = useState(false)

  const sorted = [...habits].sort((a, b) => a.horario.localeCompare(b.horario))

  return (
    <Screen>
      <ScreenTitle
        title="GERENCIAR MISSÕES"
        sub={`${habits.length} missões`}
        right={
          <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-xl border border-violet-glow/30 bg-white/5 text-xl leading-none text-cold">
            ‹
          </button>
        }
      />

      <SectionLabel right={<span className="text-[9px] text-violet-soft/50">toque para editar</span>}>
        <button onClick={() => { setEditing(null); setOpen(true); play('ui') }} className="font-display text-[12px] tracking-[3px] text-emerald">
          + NOVA MISSÃO
        </button>
      </SectionLabel>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {sorted.map((h) => {
            const rar = RARITY[h.raridade]
            const cat = CATEGORIES[h.categoria]
            return (
              <motion.button
                key={h.id}
                layout
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18, height: 0 }}
                onClick={() => { setEditing(h); setOpen(true); play('ui') }}
                className="glass flex items-center gap-3 rounded-2xl p-3 text-left"
                style={{ borderColor: `${rar.color}33` }}
              >
                <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-xl" style={{ background: `${rar.color}1f`, border: `1px solid ${rar.color}55` }}>
                  {h.icone}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{h.nome}</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase" style={{ background: `${rar.color}22`, color: rar.color, border: `1px solid ${rar.color}55` }}>
                      {rar.label}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                    <span style={{ color: cat.color }}>{cat.icon} {cat.label}</span>
                    <span className="text-cyan">⏱ {h.horario}</span>
                    <span className="text-violet-soft/50">{h.repeticao}</span>
                  </div>
                </div>
                <span className="font-num text-sm font-bold text-violet-soft">+{h.xp}</span>
                <span className="text-lg text-violet-soft/40">›</span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {habits.length === 0 && (
        <div className="mt-10 text-center text-violet-soft/50">
          <div className="mb-3 text-4xl opacity-60">🗒</div>
          <p className="text-sm">Nenhuma missão ainda.</p>
          <div className="mt-4">
            <GlowButton onClick={() => { setEditing(null); setOpen(true) }} className="!px-5">CRIAR PRIMEIRA MISSÃO</GlowButton>
          </div>
        </div>
      )}

      <HabitEditor
        open={open}
        initial={editing ?? undefined}
        onClose={() => setOpen(false)}
        onSave={(draft) => {
          if (editing) updateHabit(editing.id, draft)
          else addHabit(draft)
          play('levelup')
          setOpen(false)
        }}
        onDelete={editing ? () => { removeHabit(editing.id); setOpen(false) } : undefined}
      />
    </Screen>
  )
}
