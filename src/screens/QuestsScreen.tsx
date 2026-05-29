import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, GlowButton, EnergyBar } from '../components/common/ui'
import HabitEditor from '../components/common/HabitEditor'
import { useGame } from '../store/useGame'
import { useAudio } from '../hooks/useAudio'
import { CATEGORIES, RARITY } from '../data/game'
import type { Habit } from '../types'

export default function QuestsScreen() {
  const habits = useGame((s) => s.habits)
  const completeHabit = useGame((s) => s.completeHabit)
  const uncompleteHabit = useGame((s) => s.uncompleteHabit)
  const addHabit = useGame((s) => s.addHabit)
  const updateHabit = useGame((s) => s.updateHabit)
  const removeHabit = useGame((s) => s.removeHabit)
  const play = useAudio((s) => s.play)

  const [editing, setEditing] = useState<Habit | null>(null)
  const [open, setOpen] = useState(false)

  const done = habits.filter((h) => h.concluidoHoje).length

  return (
    <Screen>
      <ScreenTitle
        title="QUESTS DIÁRIAS"
        sub={`${done}/${habits.length} concluídas`}
        right={
          <GlowButton
            sound="ui"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
            className="!px-3 !py-2 text-[10px]"
          >
            + NOVO
          </GlowButton>
        }
      />

      <SectionLabel right={<span className="text-[9px] text-violet-soft/50">toque para concluir · segure ✎ p/ editar</span>}>
        MISSÕES ATIVAS
      </SectionLabel>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {habits.map((h) => {
            const rar = RARITY[h.raridade]
            const cat = CATEGORIES[h.categoria]
            return (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, height: 0 }}
                className="relative overflow-hidden rounded-2xl p-[1.4px]"
                style={{ background: `linear-gradient(120deg, ${rar.color}, transparent 60%, ${rar.color}88)` }}
              >
                {/* animated border sweep */}
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{ background: `linear-gradient(120deg, transparent, ${rar.glow}, transparent)` }}
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="glass relative flex items-center gap-3 rounded-2xl p-3">
                  {/* complete toggle */}
                  <button
                    onClick={() => {
                      if (h.concluidoHoje) {
                        uncompleteHabit(h.id)
                      } else {
                        completeHabit(h.id)
                        play('xp')
                      }
                    }}
                    className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-xl"
                    style={{
                      background: h.concluidoHoje
                        ? 'linear-gradient(135deg, rgba(67,255,176,.35), rgba(45,212,255,.12))'
                        : `linear-gradient(135deg, ${rar.color}33, rgba(59,130,246,.1))`,
                      border: `1px solid ${h.concluidoHoje ? '#43ffb0' : rar.color}`,
                      boxShadow: `0 0 14px ${h.concluidoHoje ? 'rgba(67,255,176,.5)' : rar.glow}`,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {h.concluidoHoje ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                          className="text-emerald"
                        >
                          ✓
                        </motion.span>
                      ) : (
                        <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          {h.icone}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{h.nome}</span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
                        style={{ background: `${rar.color}22`, color: rar.color, border: `1px solid ${rar.color}55` }}
                      >
                        {rar.label}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-violet-soft/55">{h.descricao}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: cat.color }}>
                        {cat.icon} {cat.label}
                      </span>
                      <span className="text-[10px] text-gold">🔥 {h.streak}d</span>
                      <span className="text-[10px] text-cyan">⏱ {h.horario}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-num text-sm font-bold text-violet-soft">+{h.xp}</span>
                    <button
                      onClick={() => {
                        setEditing(h)
                        setOpen(true)
                        play('ui')
                      }}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-violet-glow/30 bg-white/5 text-xs text-cold"
                    >
                      ✎
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* daily progress */}
      <SectionLabel>PROGRESSO DIÁRIO</SectionLabel>
      <div className="glass rounded-2xl px-4 py-3">
        <div className="font-num mb-2 flex justify-between text-[11px] tracking-wide text-violet-soft/70">
          <span>RECOMPENSA DIÁRIA</span>
          <span>{Math.round((done / Math.max(1, habits.length)) * 100)}%</span>
        </div>
        <EnergyBar value={(done / Math.max(1, habits.length)) * 100} c1="#6a00ff" c2="#43ffb0" height={10} />
        <div className="mt-3 flex gap-2">
          {['◆', '⬡', '🔮', '🎁'].map((r, i) => (
            <motion.div
              key={i}
              animate={done / habits.length > (i + 1) / 4 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="grid flex-1 place-items-center rounded-xl border border-violet-glow/20 bg-black/30 py-3 text-xl"
              style={{ opacity: done / habits.length > i / 4 ? 1 : 0.35 }}
            >
              {r}
            </motion.div>
          ))}
        </div>
      </div>

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
        onDelete={
          editing
            ? () => {
                removeHabit(editing.id)
                setOpen(false)
              }
            : undefined
        }
      />
    </Screen>
  )
}
