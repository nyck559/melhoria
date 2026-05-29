import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../store/useGame'
import { useAudio } from '../../hooks/useAudio'
import type { Habit } from '../../types'

const pad = (n: number) => String(n).padStart(2, '0')

interface Toast {
  id: number
  habit: Habit
}

/**
 * In-app reminder scheduler. While enabled and the app is open, fires an OS
 * Notification (if permitted) + an in-app toast + sound when a mission's time
 * has arrived and it isn't done yet (once per day per mission).
 */
export default function Reminders() {
  const habits = useGame((s) => s.habits)
  const reminders = useGame((s) => s.reminders)
  const play = useAudio((s) => s.play)
  const [toasts, setToasts] = useState<Toast[]>([])
  const notified = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!reminders) return
    const tick = () => {
      const now = new Date()
      const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`
      const day = now.toISOString().slice(0, 10)
      for (const h of habits) {
        if (h.concluidoHoje || !h.horario) continue
        const key = `${day}-${h.id}`
        if (notified.current.has(key)) continue
        if (hhmm >= h.horario) {
          notified.current.add(key)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification(`⚔ ${h.nome}`, { body: `Hora da missão · ${h.horario}`, silent: false })
            } catch {
              /* ignore */
            }
          }
          play('menu')
          const id = Date.now() + Math.random()
          setToasts((t) => [...t, { id, habit: h }])
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6500)
        }
      }
    }
    tick()
    const iv = setInterval(tick, 30_000)
    return () => clearInterval(iv)
  }, [reminders, habits, play])

  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="glass pointer-events-auto flex w-full max-w-[340px] items-center gap-3 rounded-2xl border border-cyan/40 px-3 py-2.5"
            style={{ boxShadow: '0 0 22px rgba(70,224,255,.35)' }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan/15 text-lg">{t.habit.icone}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] tracking-[2px] text-cyan">⏰ LEMBRETE · {t.habit.horario}</div>
              <div className="truncate text-sm font-semibold">{t.habit.nome}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
