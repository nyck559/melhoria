import type { IncomeTipo, RewardCategory } from '../types'

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

/** Flat coins per completed task. */
export const COINS_PER_TASK = 5

/**
 * Coin value in R$ grows with accumulated agency revenue: +5% per R$1.000.
 * Starts at R$0,10 → ~R$0,16 at R$10k → ~R$0,26 at R$20k (smooth RPG progression).
 */
export function coinValue(faturamento: number): number {
  return 0.1 * Math.pow(1.05, Math.max(0, faturamento) / 1000)
}

export const INCOME_TIPOS: Record<IncomeTipo, { label: string; coins: number; icon: string; color: string }> = {
  fechado: { label: 'Cliente fechado', coins: 50, icon: '🤝', color: GOOD },
  renovado: { label: 'Cliente renovado', coins: 30, icon: '🔄', color: BLUE },
  meta: { label: 'Meta mensal batida', coins: 200, icon: '🎯', color: WARN },
  outro: { label: 'Outra entrada', coins: 0, icon: '💰', color: BLUE_DEEP },
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
