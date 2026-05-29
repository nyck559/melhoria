import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AttrKey, GameState, Habit } from '../types'
import { INITIAL_ATTRS, INITIAL_HABITS, INITIAL_SINS } from '../data/initial'
import { levelFromXp } from '../data/game'

const uid = () => Math.random().toString(36).slice(2, 10)

function clamp(n: number, lo = 0, hi = 999) {
  return Math.max(lo, Math.min(hi, n))
}

interface FullState extends GameState {
  lastXpGain: number
  lastLevelUp: number
}

export const useGame = create<FullState>()(
  persist(
    (set, get) => ({
      xp: INITIAL_HABITS.filter((h) => h.concluidoHoje).reduce((a, h) => a + h.xp, 1820),
      level: 1,
      attrs: { ...INITIAL_ATTRS },
      habits: INITIAL_HABITS,
      sins: INITIAL_SINS,
      corruption: 0,
      lastXpGain: 0,
      lastLevelUp: 0,

      completeHabit: (id) => {
        const { habits, xp, attrs } = get()
        const h = habits.find((x) => x.id === id)
        if (!h || h.concluidoHoje) return
        const beforeLvl = levelFromXp(xp).level
        const newXp = xp + h.xp
        const afterLvl = levelFromXp(newXp).level
        const newAttrs = { ...attrs }
        h.atributos.forEach((a) => (newAttrs[a] = clamp(newAttrs[a] + (1 + Math.floor(h.xp / 120)))))
        set({
          xp: newXp,
          attrs: newAttrs,
          habits: habits.map((x) =>
            x.id === id ? { ...x, concluidoHoje: true, streak: x.streak + 1 } : x,
          ),
          lastXpGain: h.xp,
          lastLevelUp: afterLvl > beforeLvl ? afterLvl : get().lastLevelUp,
        })
      },

      uncompleteHabit: (id) => {
        const { habits, xp, attrs } = get()
        const h = habits.find((x) => x.id === id)
        if (!h || !h.concluidoHoje) return
        const newAttrs = { ...attrs }
        h.atributos.forEach((a) => (newAttrs[a] = clamp(newAttrs[a] - (1 + Math.floor(h.xp / 120)))))
        set({
          xp: clamp(xp - h.xp, 0, 9_999_999),
          attrs: newAttrs,
          habits: habits.map((x) =>
            x.id === id ? { ...x, concluidoHoje: false, streak: Math.max(0, x.streak - 1) } : x,
          ),
        })
      },

      addHabit: (h) =>
        set((s) => ({
          habits: [...s.habits, { ...h, id: uid(), streak: 0, concluidoHoje: false } as Habit],
        })),

      updateHabit: (id, patch) =>
        set((s) => ({ habits: s.habits.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      removeHabit: (id) => set((s) => ({ habits: s.habits.filter((x) => x.id !== id) })),

      setSin: (id, corrupcao) =>
        set((s) => ({
          sins: s.sins.map((x) => (x.id === id ? { ...x, corrupcao: clamp(corrupcao, 0, 100) } : x)),
        })),

      resetSins: () => set((s) => ({ sins: s.sins.map((x) => ({ ...x, corrupcao: 0, nivel: 1 })) })),

      resetDay: () =>
        set((s) => ({ habits: s.habits.map((x) => ({ ...x, concluidoHoje: false })) })),
    }),
    {
      name: 'sl-life-system',
      partialize: (s) => ({
        xp: s.xp,
        attrs: s.attrs,
        habits: s.habits,
        sins: s.sins,
      }),
    },
  ),
)

/* ---------- selectors ---------- */
export const useLevelInfo = () => {
  const xp = useGame((s) => s.xp)
  return levelFromXp(xp)
}

export const useCorruption = () => {
  const sins = useGame((s) => s.sins)
  if (!sins.length) return 0
  return Math.round(sins.reduce((a, s) => a + s.corrupcao, 0) / sins.length)
}

export const usePower = () => {
  const attrs = useGame((s) => s.attrs)
  const total = (Object.values(attrs) as number[]).reduce((a, b) => a + b, 0)
  return total * 6 + 320
}

export type { AttrKey }
