// ---- Tasks (daily checklist) ----
export interface Task {
  id: string
  nome: string
  icone: string
  moedas: number
  dias: number[] // weekdays scheduled: 0=Dom … 6=Sáb
  ordem: number
}

// ---- Rewards (real-life, bought with coins) ----
export type RewardCategory = 'lazer' | 'doce' | 'descanso' | 'dinheiro' | 'outro'

export interface Reward {
  id: string
  nome: string
  icone: string
  custo: number
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
  data: string // ISO timestamp
}

// ---- Agency income (drives revenue + coin value) ----
export type IncomeTipo = 'fechado' | 'renovado' | 'meta' | 'outro'

export interface Income {
  id: string
  tipo: IncomeTipo
  valor: number // R$
  desc?: string
  data: string // ISO timestamp
}

// ---- Cashing coins out for real money ----
export interface Exchange {
  id: string
  coins: number
  valor: number // R$ received
  data: string // ISO timestamp
}

// ---- Sins (tracked for the dashboards) ----
export interface Sin {
  id: string
  nome: string
  icone: string
  descricao: string
  corrupcao: number // 0..100 current level
}

// ---- Historical records (drive the charts) ----
export interface DayRecord {
  done: number // tasks completed
  earned: number // coins earned
  spent: number // coins spent
}

export interface SinDay {
  resisted: number
  fell: number
}

export interface GameState {
  coins: number
  tasks: Task[]
  doneToday: string[] // task ids completed today
  rewards: Reward[]
  redemptions: Redemption[]
  incomes: Income[]
  exchanges: Exchange[]
  sins: Sin[]
  daily: Record<string, DayRecord> // 'YYYY-MM-DD' → totals
  sinDaily: Record<string, Record<string, SinDay>> // date → sinId → counts
  lastResetDate: string
  reminders: boolean
  // actions
  toggleTask: (id: string) => void
  addTask: (t: Omit<Task, 'id' | 'ordem'>) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  redeemReward: (id: string) => void
  addReward: (r: Omit<Reward, 'id' | 'resgatadosHoje'>) => void
  updateReward: (id: string, patch: Partial<Reward>) => void
  removeReward: (id: string) => void
  addIncome: (i: Omit<Income, 'id' | 'data'>) => void
  removeIncome: (id: string) => void
  exchangeCoins: (coins: number) => void
  logSin: (id: string, kind: 'resisted' | 'fell') => void
  setSinLevel: (id: string, corrupcao: number) => void
  checkDailyReset: () => void
  toggleReminders: () => void
}
