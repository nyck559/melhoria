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
  lastStreakMilestone: { nome: string; days: number; ts: number } | null
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

export const useGame = create<FullState>()(
  persist(
    (set, get) => ({
      xp: 0,
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
      ownedEquip: [],
      lastResetDate: todayStr(),
      reminders: false,
      lastPenalty: null,
      sinBlocked: false,
      history: {},
      lastXpGain: 0,
      lastLevelUp: 0,
      lastStreakMilestone: null,

      completeHabit: (id) => {
        const { habits, xp, attrs, coins, crystals, history } = get()
        const h = habits.find((x) => x.id === id)
        if (!h || h.concluidoHoje) return
        const beforeLvl = levelFromXp(xp).level
        const newXp = xp + h.xp
        const afterLvl = levelFromXp(newXp).level
        const newAttrs = { ...attrs }
        h.atributos.forEach((a) => (newAttrs[a] = clamp(newAttrs[a] + (1 + Math.floor(h.xp / 120)))))
        const newStreak = h.streak + 1
        const milestone = STREAK_MILESTONES.includes(newStreak)
        const today = todayStr()
        set({
          xp: newXp,
          attrs: newAttrs,
          coins: coins + coinsForHabit(h),
          crystals: crystals + crystalsForHabit(h),
          habits: habits.map((x) => (x.id === id ? { ...x, concluidoHoje: true, streak: newStreak } : x)),
          history: { ...history, [today]: (history[today] ?? 0) + 1 },
          lastXpGain: h.xp,
          lastLevelUp: afterLvl > beforeLvl ? afterLvl : get().lastLevelUp,
          lastStreakMilestone: milestone ? { nome: h.nome, days: newStreak, ts: Date.now() } : get().lastStreakMilestone,
        })
      },

      uncompleteHabit: (id) => {
        const { habits, xp, attrs, coins, history } = get()
        const h = habits.find((x) => x.id === id)
        if (!h || !h.concluidoHoje) return
        const newAttrs = { ...attrs }
        h.atributos.forEach((a) => (newAttrs[a] = clamp(newAttrs[a] - (1 + Math.floor(h.xp / 120)))))
        const today = todayStr()
        set({
          xp: clamp(xp - h.xp, 0, 9_999_999),
          attrs: newAttrs,
          // refund coins; crystals are not revoked (premium)
          coins: Math.max(0, coins - coinsForHabit(h)),
          habits: habits.map((x) =>
            x.id === id ? { ...x, concluidoHoje: false, streak: Math.max(0, x.streak - 1) } : x,
          ),
          history: { ...history, [today]: Math.max(0, (history[today] ?? 0) - 1) },
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

      // marking "não caí" (resisted) lowers the bar; un-marking restores it. Never auto-raises here.
      toggleResist: (id) =>
        set((s) => ({
          sins: s.sins.map((x) => {
            if (x.id !== id) return x
            const resist = !x.resistidoHoje
            return {
              ...x,
              resistidoHoje: resist,
              caiuHoje: resist ? false : x.caiuHoje, // resisting clears a prior fall mark
              corrupcao: clamp(x.corrupcao + (resist ? -12 : 12), 0, 100),
            }
          }),
        })),

      // falling into a sin raises corruption and LOCKS rewards until confession
      fallSin: (id) =>
        set((s) => ({
          sinBlocked: true,
          sins: s.sins.map((x) =>
            x.id === id ? { ...x, caiuHoje: true, resistidoHoje: false, corrupcao: clamp(x.corrupcao + 18, 0, 100) } : x,
          ),
        })),

      // confession lifts the lock, clears fall marks and grants a little relief
      confess: () =>
        set((s) => ({
          sinBlocked: false,
          sins: s.sins.map((x) => ({ ...x, caiuHoje: false, corrupcao: clamp(x.corrupcao - 8, 0, 100) })),
        })),

      resetSins: () =>
        set((s) => ({ sinBlocked: false, sins: s.sins.map((x) => ({ ...x, corrupcao: 0, nivel: 1, resistidoHoje: false, caiuHoje: false })) })),

      resetDay: () =>
        set((s) => ({
          habits: s.habits.map((x) => ({ ...x, concluidoHoje: false })),
          rewards: s.rewards.map((r) => ({ ...r, resgatadosHoje: 0 })),
        })),

      /* ---------- rewards economy ---------- */
      redeemReward: (id) => {
        const { rewards, coins, crystals, redemptions, sinBlocked } = get()
        if (sinBlocked) return // locked until confession
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
      buyEquip: (itemId) => {
        const it = itemById(itemId)
        if (!it) return
        const s = get()
        if (s.ownedEquip.includes(itemId)) return
        const bal = it.moeda === 'coins' ? s.coins : s.crystals
        if (bal < it.custo) return
        set({
          [it.moeda]: bal - it.custo,
          ownedEquip: [...s.ownedEquip, itemId],
          equipped: { ...s.equipped, [it.slot]: itemId }, // auto-equip on purchase
        } as Partial<FullState>)
      },

      equipItem: (slot, itemId) =>
        set((s) => {
          // can only equip something you own
          if (itemId && !s.ownedEquip.includes(itemId)) return {}
          const next = { ...s.equipped }
          if (itemId) next[slot] = itemId
          else delete next[slot]
          return { equipped: next }
        }),

      /* ---------- daily reset (+ penalty for missed missions) ---------- */
      checkDailyReset: () => {
        const today = todayStr()
        const s = get()
        if (s.lastResetDate === today) return

        const missed = s.habits.filter((h) => !h.concluidoHoje)
        const coinsLost = missed.reduce((a, h) => a + (h.penalidade || 0), 0)
        const n = missed.length

        // missing missions feeds corruption (Preguiça most, Gula a bit)
        const avg = (arr: { corrupcao: number }[]) =>
          arr.length ? arr.reduce((a, x) => a + x.corrupcao, 0) / arr.length : 0
        const newSins = s.sins.map((sin) => {
          const base = { ...sin, resistidoHoje: false } // new day: reset resist marks
          if (sin.id === 's-preguica') return { ...base, corrupcao: clamp(sin.corrupcao + n * 8, 0, 100) }
          if (sin.id === 's-gula') return { ...base, corrupcao: clamp(sin.corrupcao + n * 4, 0, 100) }
          return base
        })
        const corruptionGain = Math.round(avg(newSins) - avg(s.sins))

        set({
          lastResetDate: today,
          coins: Math.max(0, s.coins - coinsLost),
          sins: newSins,
          habits: s.habits.map((h) => ({
            ...h,
            concluidoHoje: false,
            streak: h.concluidoHoje ? h.streak : Math.max(0, h.streak - 1),
          })),
          rewards: s.rewards.map((r) => ({ ...r, resgatadosHoje: 0 })),
          lastPenalty: n > 0 ? { date: today, missed: n, coins: coinsLost, corruption: corruptionGain } : s.lastPenalty,
        })
      },

      toggleReminders: () => set((s) => ({ reminders: !s.reminders })),

      clearPenalty: () => set({ lastPenalty: null }),
    }),
    {
      name: 'sl-life-system-v4',
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
        ownedEquip: s.ownedEquip,
        lastResetDate: s.lastResetDate,
        reminders: s.reminders,
        lastPenalty: s.lastPenalty,
        sinBlocked: s.sinBlocked,
        history: s.history,
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

/** Last `days` of daily missions-completed counts, oldest → newest. */
export const useDailyHistory = (days = 7) => {
  const history = useGame((s) => s.history) ?? {}
  const habits = useGame((s) => s.habits)
  const out: { date: string; label: string; value: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    // today's count comes live from concluidoHoje so it reacts instantly
    const value = i === 0 ? habits.filter((h) => h.concluidoHoje).length : history[key] ?? 0
    out.push({ date: key, label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3), value })
  }
  return out
}

export const useSinBlocked = () => useGame((s) => s.sinBlocked)

/** Discipline 0..100 for the 3D aura — driven by the disciplina attribute + best streak. */
export const useDiscipline = () => {
  const disc = useGame((s) => s.attrs.disciplina)
  const habits = useGame((s) => s.habits)
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0)
  return Math.max(0, Math.min(100, disc + bestStreak * 3))
}

export type { AttrKey }
