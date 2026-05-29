import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AttrKey, EquipSlot, GameState, Habit } from '../types'
import { INITIAL_ATTRS, INITIAL_HABITS, INITIAL_REWARDS, INITIAL_SINS } from '../data/initial'
import { coinsForHabit, crystalsForHabit, levelFromXp } from '../data/game'
import { itemById } from '../data/equipment'

const uid = () => Math.random().toString(36).slice(2, 10)
const todayStr = () => new Date().toISOString().slice(0, 10)

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
      coins: 120,
      crystals: 5,
      rewards: INITIAL_REWARDS,
      redemptions: [],
      equipped: {},
      lastResetDate: todayStr(),
      lastXpGain: 0,
      lastLevelUp: 0,

      completeHabit: (id) => {
        const { habits, xp, attrs, coins, crystals } = get()
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
          coins: coins + coinsForHabit(h),
          crystals: crystals + crystalsForHabit(h),
          habits: habits.map((x) =>
            x.id === id ? { ...x, concluidoHoje: true, streak: x.streak + 1 } : x,
          ),
          lastXpGain: h.xp,
          lastLevelUp: afterLvl > beforeLvl ? afterLvl : get().lastLevelUp,
        })
      },

      uncompleteHabit: (id) => {
        const { habits, xp, attrs, coins } = get()
        const h = habits.find((x) => x.id === id)
        if (!h || !h.concluidoHoje) return
        const newAttrs = { ...attrs }
        h.atributos.forEach((a) => (newAttrs[a] = clamp(newAttrs[a] - (1 + Math.floor(h.xp / 120)))))
        set({
          xp: clamp(xp - h.xp, 0, 9_999_999),
          attrs: newAttrs,
          // refund coins; crystals are not revoked (premium)
          coins: Math.max(0, coins - coinsForHabit(h)),
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
        set((s) => ({
          habits: s.habits.map((x) => ({ ...x, concluidoHoje: false })),
          rewards: s.rewards.map((r) => ({ ...r, resgatadosHoje: 0 })),
        })),

      /* ---------- rewards economy ---------- */
      redeemReward: (id) => {
        const { rewards, coins, crystals, redemptions } = get()
        const r = rewards.find((x) => x.id === id)
        if (!r) return
        const bal = r.moeda === 'coins' ? coins : crystals
        if (bal < r.custo) return
        if (r.limitePorDia && r.resgatadosHoje >= r.limitePorDia) return
        set({
          [r.moeda]: bal - r.custo,
          rewards: rewards.map((x) => (x.id === id ? { ...x, resgatadosHoje: x.resgatadosHoje + 1 } : x)),
          redemptions: [
            { id: uid(), rewardId: r.id, nome: r.nome, icone: r.icone, custo: r.custo, moeda: r.moeda, data: new Date().toISOString() },
            ...redemptions,
          ].slice(0, 100),
        } as Partial<FullState>)
      },

      addReward: (r) =>
        set((s) => ({ rewards: [...s.rewards, { ...r, id: uid(), resgatadosHoje: 0 }] })),

      updateReward: (id, patch) =>
        set((s) => ({ rewards: s.rewards.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      removeReward: (id) => set((s) => ({ rewards: s.rewards.filter((x) => x.id !== id) })),

      /* ---------- boss ---------- */
      defeatBoss: (reward) => {
        const { xp, attrs, coins, crystals } = get()
        const beforeLvl = levelFromXp(xp).level
        const newXp = xp + reward.xp
        const afterLvl = levelFromXp(newXp).level
        const newAttrs = { ...attrs }
        for (const [k, v] of Object.entries(reward.attrs)) {
          newAttrs[k as AttrKey] = clamp(newAttrs[k as AttrKey] + (v ?? 0))
        }
        set({
          xp: newXp,
          attrs: newAttrs,
          coins: coins + reward.coins,
          crystals: crystals + reward.crystals,
          lastXpGain: reward.xp,
          lastLevelUp: afterLvl > beforeLvl ? afterLvl : get().lastLevelUp,
        })
      },

      /* ---------- equipment ---------- */
      equipItem: (slot, itemId) =>
        set((s) => {
          const next = { ...s.equipped }
          if (itemId) next[slot] = itemId
          else delete next[slot]
          return { equipped: next }
        }),

      /* ---------- daily reset ---------- */
      checkDailyReset: () => {
        const today = todayStr()
        if (get().lastResetDate === today) return
        set((s) => ({
          lastResetDate: today,
          habits: s.habits.map((h) => ({
            ...h,
            concluidoHoje: false,
            // break streak for habits that were not completed
            streak: h.concluidoHoje ? h.streak : Math.max(0, h.streak - 1),
          })),
          rewards: s.rewards.map((r) => ({ ...r, resgatadosHoje: 0 })),
        }))
      },
    }),
    {
      name: 'sl-life-system',
      partialize: (s) => ({
        xp: s.xp,
        attrs: s.attrs,
        habits: s.habits,
        sins: s.sins,
        coins: s.coins,
        crystals: s.crystals,
        rewards: s.rewards,
        redemptions: s.redemptions,
        equipped: s.equipped,
        lastResetDate: s.lastResetDate,
      }),
      onRehydrateStorage: () => (state) => {
        state?.checkDailyReset()
      },
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

/** Total power = attributes (incl. equipment attr bonuses) * 6 + base + equipment power. */
export const usePower = () => {
  const attrs = useGame((s) => s.attrs)
  const equipped = useGame((s) => s.equipped)
  let attrTotal = (Object.values(attrs) as number[]).reduce((a, b) => a + b, 0)
  let gearPower = 0
  for (const id of Object.values(equipped)) {
    const it = itemById(id)
    if (!it) continue
    gearPower += it.power
    attrTotal += (Object.values(it.attrBonus) as number[]).reduce((a, b) => a + b, 0)
  }
  return attrTotal * 6 + 320 + gearPower
}

/** Attribute totals including equipped gear bonuses (for display). */
export const useAttrsWithGear = (): Record<AttrKey, number> => {
  const attrs = useGame((s) => s.attrs)
  const equipped = useGame((s) => s.equipped)
  const out = { ...attrs }
  for (const id of Object.values(equipped)) {
    const it = itemById(id)
    if (!it) continue
    for (const [k, v] of Object.entries(it.attrBonus)) out[k as AttrKey] += v ?? 0
  }
  return out
}

/** Aura color from the equipped coroa/amuleto/anel (first that defines one). */
export const useEquippedAura = (): string | undefined => {
  const equipped = useGame((s) => s.equipped)
  const order: EquipSlot[] = ['coroa', 'amuleto', 'anel']
  for (const slot of order) {
    const it = itemById(equipped[slot])
    if (it?.aura) return it.aura
  }
  return undefined
}

export const useCoins = () => useGame((s) => s.coins)
export const useCrystals = () => useGame((s) => s.crystals)

export type { AttrKey }
