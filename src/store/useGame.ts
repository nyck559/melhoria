import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Reward, Task } from '../types'
import { INITIAL_REWARDS, INITIAL_SINS, INITIAL_TASKS } from '../data/initial'

const uid = () => Math.random().toString(36).slice(2, 10)
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 0,
      tasks: INITIAL_TASKS,
      doneToday: [],
      rewards: INITIAL_REWARDS,
      redemptions: [],
      sins: INITIAL_SINS,
      daily: {},
      sinDaily: {},
      lastResetDate: todayStr(),
      reminders: false,

      /* ---------------- tasks ---------------- */
      toggleTask: (id) => {
        const s = get()
        const task = s.tasks.find((t) => t.id === id)
        if (!task) return
        const today = todayStr()
        const isDone = s.doneToday.includes(id)
        const day = s.daily[today] ?? { done: 0, earned: 0, spent: 0 }
        if (isDone) {
          set({
            coins: Math.max(0, s.coins - task.moedas),
            doneToday: s.doneToday.filter((x) => x !== id),
            daily: { ...s.daily, [today]: { ...day, done: Math.max(0, day.done - 1), earned: Math.max(0, day.earned - task.moedas) } },
          })
        } else {
          set({
            coins: s.coins + task.moedas,
            doneToday: [...s.doneToday, id],
            daily: { ...s.daily, [today]: { ...day, done: day.done + 1, earned: day.earned + task.moedas } },
          })
        }
      },

      addTask: (t) => set((s) => ({ tasks: [...s.tasks, { ...t, id: uid(), ordem: s.tasks.length }] })),
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), doneToday: s.doneToday.filter((x) => x !== id) })),

      /* ---------------- rewards ---------------- */
      redeemReward: (id) => {
        const s = get()
        const r = s.rewards.find((x) => x.id === id)
        if (!r || s.coins < r.custo) return
        if (r.limitePorDia && r.resgatadosHoje >= r.limitePorDia) return
        const today = todayStr()
        const day = s.daily[today] ?? { done: 0, earned: 0, spent: 0 }
        set({
          coins: s.coins - r.custo,
          rewards: s.rewards.map((x) => (x.id === id ? { ...x, resgatadosHoje: x.resgatadosHoje + 1 } : x)),
          redemptions: [
            { id: uid(), rewardId: r.id, nome: r.nome, icone: r.icone, custo: r.custo, data: new Date().toISOString() },
            ...s.redemptions,
          ].slice(0, 200),
          daily: { ...s.daily, [today]: { ...day, spent: day.spent + r.custo } },
        })
      },

      addReward: (r) => set((s) => ({ rewards: [...s.rewards, { ...r, id: uid(), resgatadosHoje: 0 } as Reward] })),
      updateReward: (id, patch) => set((s) => ({ rewards: s.rewards.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeReward: (id) => set((s) => ({ rewards: s.rewards.filter((x) => x.id !== id) })),

      /* ---------------- sins ---------------- */
      logSin: (id, kind) => {
        const s = get()
        const today = todayStr()
        const dayMap = s.sinDaily[today] ?? {}
        const cur = dayMap[id] ?? { resisted: 0, fell: 0 }
        const next = kind === 'resisted' ? { ...cur, resisted: cur.resisted + 1 } : { ...cur, fell: cur.fell + 1 }
        set({
          sinDaily: { ...s.sinDaily, [today]: { ...dayMap, [id]: next } },
          sins: s.sins.map((x) =>
            x.id === id ? { ...x, corrupcao: Math.max(0, Math.min(100, x.corrupcao + (kind === 'fell' ? 12 : -10))) } : x,
          ),
        })
      },
      setSinLevel: (id, corrupcao) =>
        set((s) => ({ sins: s.sins.map((x) => (x.id === id ? { ...x, corrupcao: Math.max(0, Math.min(100, corrupcao)) } : x)) })),

      /* ---------------- daily reset ---------------- */
      checkDailyReset: () => {
        const today = todayStr()
        const s = get()
        if (s.lastResetDate === today) return
        set({
          lastResetDate: today,
          doneToday: [],
          rewards: s.rewards.map((r) => ({ ...r, resgatadosHoje: 0 })),
        })
      },

      toggleReminders: () => set((s) => ({ reminders: !s.reminders })),
    }),
    {
      name: 'crescimento-v1',
      partialize: (s) => ({
        coins: s.coins,
        tasks: s.tasks,
        doneToday: s.doneToday,
        rewards: s.rewards,
        redemptions: s.redemptions,
        sins: s.sins,
        daily: s.daily,
        sinDaily: s.sinDaily,
        lastResetDate: s.lastResetDate,
        reminders: s.reminders,
      }),
      onRehydrateStorage: () => (state) => {
        state?.checkDailyReset()
      },
    },
  ),
)

/* ----------------------------- helpers / selectors ----------------------------- */
export const localToday = todayStr

/** Tasks scheduled for a given weekday (default: today), sorted. */
export function tasksForDay(tasks: Task[], weekday = new Date().getDay()): Task[] {
  return tasks.filter((t) => t.dias.includes(weekday)).sort((a, b) => a.ordem - b.ordem)
}

export const useCoins = () => useGame((s) => s.coins)

/** Last `days` day-keys with labels, oldest → newest. */
export function lastDays(days: number): { date: string; label: string; weekday: number }[] {
  const out: { date: string; label: string; weekday: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push({ date, label: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()], weekday: d.getDay() })
  }
  return out
}
