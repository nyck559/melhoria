import type { AttrKey, Category, Difficulty, Rank, RankTier, Rarity } from '../types'

/* ----------------------------- ATTRIBUTES ----------------------------- */
export const ATTRS: Record<AttrKey, { label: string; icon: string; color: string }> = {
  forca:        { label: 'Força',        icon: '⚔', color: '#ff5a7d' },
  vitalidade:   { label: 'Vitalidade',   icon: '❤', color: '#43ffb0' },
  inteligencia: { label: 'Inteligência', icon: '🧠', color: '#3b82f6' },
  disciplina:   { label: 'Disciplina',   icon: '🛡', color: '#8b3bff' },
  foco:         { label: 'Foco',         icon: '◎', color: '#46e0ff' },
  energia:      { label: 'Energia',      icon: '⚡', color: '#ffcb57' },
  carisma:      { label: 'Carisma',      icon: '✦', color: '#b98bff' },
}

export const ATTR_ORDER: AttrKey[] = [
  'forca', 'vitalidade', 'inteligencia', 'disciplina', 'foco', 'energia', 'carisma',
]

/* ----------------------------- CATEGORIES ----------------------------- */
export const CATEGORIES: Record<Category, { label: string; icon: string; color: string; attrs: AttrKey[] }> = {
  corpo:         { label: 'Corpo',         icon: '💪', color: '#ff5a7d', attrs: ['forca', 'vitalidade'] },
  mente:         { label: 'Mente',         icon: '🧠', color: '#3b82f6', attrs: ['inteligencia', 'foco'] },
  riqueza:       { label: 'Riqueza',       icon: '💎', color: '#ffcb57', attrs: ['disciplina', 'foco'] },
  disciplina:    { label: 'Disciplina',    icon: '🛡', color: '#8b3bff', attrs: ['disciplina', 'energia'] },
  social:        { label: 'Social',        icon: '🗣', color: '#46e0ff', attrs: ['carisma'] },
  espiritual:    { label: 'Espiritual',    icon: '🌙', color: '#b98bff', attrs: ['energia', 'foco'] },
  produtividade: { label: 'Produtividade', icon: '⚙', color: '#43ffb0', attrs: ['disciplina', 'inteligencia'] },
}

/* ----------------------------- RARITY / DIFFICULTY ----------------------------- */
export const RARITY: Record<Rarity, { label: string; color: string; glow: string; xpMul: number }> = {
  comum:    { label: 'Comum',    color: '#9aa0c9', glow: 'rgba(154,160,201,.5)', xpMul: 1 },
  raro:     { label: 'Raro',     color: '#3b82f6', glow: 'rgba(59,130,246,.7)',  xpMul: 1.5 },
  epico:    { label: 'Épico',    color: '#8b3bff', glow: 'rgba(139,59,255,.8)',  xpMul: 2.2 },
  lendario: { label: 'Lendário', color: '#ffcb57', glow: 'rgba(255,203,87,.85)', xpMul: 3.4 },
}

export const DIFFICULTY: Record<Difficulty, { label: string; color: string }> = {
  comum:    { label: 'Comum',    color: '#9aa0c9' },
  raro:     { label: 'Raro',     color: '#3b82f6' },
  epico:    { label: 'Épico',    color: '#8b3bff' },
  lendario: { label: 'Lendário', color: '#ffcb57' },
}

/* ----------------------------- RANKS ----------------------------- */
export const RANKS: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

export const RANK_DATA: Record<Rank, { name: string; sub: string; minLevel: number; color: string; tier: RankTier }> = {
  E:   { name: 'Iniciante',  sub: 'Despertos recentes',   minLevel: 1,  color: '#9aa0c9', tier: 'fraco' },
  D:   { name: 'Aprendiz',   sub: 'Caçadores ativos',     minLevel: 8,  color: '#7fb0ff', tier: 'fraco' },
  C:   { name: 'Veterano',   sub: 'Combatentes',          minLevel: 16, color: '#46e0ff', tier: 'firme' },
  B:   { name: 'Elite',      sub: 'Linha de frente',      minLevel: 26, color: '#8b3bff', tier: 'firme' },
  A:   { name: 'Mestre',     sub: 'Guildas de topo',      minLevel: 38, color: '#b98bff', tier: 'dominante' },
  S:   { name: 'Lendário',   sub: 'Monarcas em ascensão', minLevel: 52, color: '#ffcb57', tier: 'dominante' },
  SS:  { name: 'Soberano',   sub: 'O ápice do sistema',   minLevel: 70, color: '#ff8a3d', tier: 'transcendente' },
  SSS: { name: 'Monarca',    sub: 'Além da existência',   minLevel: 90, color: '#ff2d5e', tier: 'transcendente' },
}

export function rankForLevel(level: number): Rank {
  let r: Rank = 'E'
  for (const k of RANKS) if (level >= RANK_DATA[k].minLevel) r = k
  return r
}

export function rankTier(level: number): RankTier {
  return RANK_DATA[rankForLevel(level)].tier
}

/* ----------------------------- XP CURVE ----------------------------- */
export function xpForLevel(level: number): number {
  return Math.round(120 * Math.pow(level, 1.45))
}

export function levelFromXp(totalXp: number): { level: number; into: number; need: number } {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  return { level, into: remaining, need: xpForLevel(level) }
}
