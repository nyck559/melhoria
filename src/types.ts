export type AttrKey =
  | 'forca'
  | 'vitalidade'
  | 'inteligencia'
  | 'disciplina'
  | 'foco'
  | 'energia'
  | 'carisma'

export type Category =
  | 'corpo'
  | 'mente'
  | 'riqueza'
  | 'disciplina'
  | 'social'
  | 'espiritual'
  | 'produtividade'

export type Rarity = 'comum' | 'raro' | 'epico' | 'lendario'

export type Difficulty = 'comum' | 'raro' | 'epico' | 'lendario'

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS'

export type RankTier = 'fraco' | 'firme' | 'dominante' | 'transcendente'

export interface Habit {
  id: string
  nome: string
  descricao: string
  categoria: Category
  dificuldade: Difficulty
  xp: number
  atributos: AttrKey[]
  streak: number
  horario: string
  repeticao: string
  raridade: Rarity
  icone: string
  penalidade: number
  recompensa: string
  concluidoHoje: boolean
}

export interface Sin {
  id: string
  nome: string
  icone: string
  descricao: string
  nivel: number
  corrupcao: number // 0..100
  resistidoHoje: boolean
}

export type RewardCategory = 'dinheiro' | 'doce' | 'social' | 'lazer' | 'descanso' | 'outro'
export type Currency = 'coins' | 'crystals'
export type EquipSlot = 'arma' | 'escudo' | 'coroa' | 'anel' | 'elixir' | 'amuleto'

export interface Reward {
  id: string
  nome: string
  descricao: string
  icone: string
  custo: number
  moeda: Currency
  categoria: RewardCategory
  limitePorDia?: number
  resgatadosHoje: number
}

export interface Redemption {
  id: string
  rewardId: string
  nome: string
  icone: string
  custo: number
  moeda: Currency
  data: string // ISO timestamp
}

export interface EquipItem {
  id: string
  slot: EquipSlot
  nome: string
  icone: string
  tier: Rank
  power: number
  attrBonus: Partial<Record<AttrKey, number>>
  aura?: string
}

export interface BossReward {
  xp: number
  coins: number
  crystals: number
  attrs: Partial<Record<AttrKey, number>>
}

export interface PenaltyReport {
  date: string
  missed: number
  coins: number
  corruption: number // average corruption gained
}

export interface GameState {
  xp: number
  level: number
  attrs: Record<AttrKey, number>
  habits: Habit[]
  sins: Sin[]
  corruption: number // 0..100 derived/clamped
  coins: number
  crystals: number
  rewards: Reward[]
  redemptions: Redemption[]
  equipped: Partial<Record<EquipSlot, string>>
  lastResetDate: string // 'YYYY-MM-DD'
  reminders: boolean
  lastPenalty: PenaltyReport | null
  // actions
  completeHabit: (id: string) => void
  uncompleteHabit: (id: string) => void
  addHabit: (h: Omit<Habit, 'id' | 'streak' | 'concluidoHoje'>) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  removeHabit: (id: string) => void
  setSin: (id: string, corrupcao: number) => void
  toggleResist: (id: string) => void
  resetSins: () => void
  resetDay: () => void
  redeemReward: (id: string) => void
  addReward: (r: Omit<Reward, 'id' | 'resgatadosHoje'>) => void
  updateReward: (id: string, patch: Partial<Reward>) => void
  removeReward: (id: string) => void
  defeatBoss: (reward: BossReward) => void
  equipItem: (slot: EquipSlot, itemId: string | null) => void
  checkDailyReset: () => void
  toggleReminders: () => void
  clearPenalty: () => void
}
