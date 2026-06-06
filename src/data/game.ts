import type { RewardCategory } from '../types'

/** Blue-forward palette used across the charts. */
export const BLUE = '#5b9cff'
export const BLUE_DEEP = '#3b82f6'
export const GOOD = '#5fd08a'
export const BAD = '#f0726a'
export const WARN = '#e8b34a'

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const REWARD_CATEGORIES: Record<RewardCategory, { label: string; icon: string; color: string }> = {
  dinheiro: { label: 'Dinheiro', icon: '💵', color: '#5fd08a' },
  doce: { label: 'Doce', icon: '🍫', color: '#e8a0c0' },
  lazer: { label: 'Lazer', icon: '🎮', color: '#5b9cff' },
  descanso: { label: 'Descanso', icon: '🛌', color: '#8fbcff' },
  outro: { label: 'Outro', icon: '✦', color: '#a09d94' },
}

export const COIN = '🪙'
