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
}

export interface GameState {
  xp: number
  level: number
  attrs: Record<AttrKey, number>
  habits: Habit[]
  sins: Sin[]
  corruption: number // 0..100 derived/clamped
  // actions
  completeHabit: (id: string) => void
  uncompleteHabit: (id: string) => void
  addHabit: (h: Omit<Habit, 'id' | 'streak' | 'concluidoHoje'>) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  removeHabit: (id: string) => void
  setSin: (id: string, corrupcao: number) => void
  resetSins: () => void
  resetDay: () => void
}
