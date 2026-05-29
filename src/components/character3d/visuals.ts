import type { Rank } from '../../types'

/**
 * Per-RANK visual blueprint. The character evolves automatically across the 8
 * ranks (E → SSS): posture straightens, eyes/aura intensify, hair grows wilder,
 * spikes / crown / third-eye unlock, particle & beam counts climb.
 */
export interface RankVisual {
  scale: number
  slouch: number // forward lean. +tired (E) → -proud/monarch (S+)
  eye: number // eye emissive base
  aura: number // aura strength multiplier
  parts: number // aura particle count
  pauldronSpikes: boolean
  shoulderSpikes: boolean
  crown: boolean
  thirdEye: boolean
  cape: number // cape width factor (0 = no cape)
  hair: 'short' | 'swept' | 'wild'
  beams: number // god-ray beam count
  smoke: number // ambient smoke base 0..1
  bloom: number // bloom intensity hint for this rank
  build: number // body mass (thin E → broad S+)
}

export const RANK_VISUAL: Record<Rank, RankVisual> = {
  E:   { scale: 0.90, slouch:  0.17, eye: 0.8, aura: 0.35, parts: 50,  pauldronSpikes: false, shoulderSpikes: false, crown: false, thirdEye: false, cape: 0.0,  hair: 'short', beams: 0, smoke: 0.12, bloom: 0.9,  build: 0.86 },
  D:   { scale: 0.94, slouch:  0.10, eye: 1.3, aura: 0.55, parts: 72,  pauldronSpikes: false, shoulderSpikes: false, crown: false, thirdEye: false, cape: 0.6,  hair: 'short', beams: 0, smoke: 0.18, bloom: 1.0,  build: 0.92 },
  C:   { scale: 0.98, slouch:  0.04, eye: 1.8, aura: 0.80, parts: 100, pauldronSpikes: false, shoulderSpikes: false, crown: false, thirdEye: false, cape: 0.82, hair: 'swept', beams: 3, smoke: 0.24, bloom: 1.15, build: 1.0 },
  B:   { scale: 1.02, slouch:  0.00, eye: 2.4, aura: 1.05, parts: 132, pauldronSpikes: true,  shoulderSpikes: false, crown: false, thirdEye: false, cape: 0.95, hair: 'swept', beams: 4, smoke: 0.30, bloom: 1.3,  build: 1.06 },
  A:   { scale: 1.06, slouch: -0.05, eye: 3.0, aura: 1.40, parts: 162, pauldronSpikes: true,  shoulderSpikes: true,  crown: false, thirdEye: false, cape: 1.05, hair: 'wild',  beams: 5, smoke: 0.46, bloom: 1.5,  build: 1.12 },
  S:   { scale: 1.10, slouch: -0.08, eye: 3.6, aura: 1.70, parts: 200, pauldronSpikes: true,  shoulderSpikes: true,  crown: true,  thirdEye: false, cape: 1.16, hair: 'wild',  beams: 6, smoke: 0.56, bloom: 1.7,  build: 1.18 },
  SS:  { scale: 1.14, slouch: -0.10, eye: 4.2, aura: 2.00, parts: 240, pauldronSpikes: true,  shoulderSpikes: true,  crown: true,  thirdEye: true,  cape: 1.26, hair: 'wild',  beams: 7, smoke: 0.66, bloom: 1.9,  build: 1.24 },
  SSS: { scale: 1.18, slouch: -0.12, eye: 5.0, aura: 2.40, parts: 300, pauldronSpikes: true,  shoulderSpikes: true,  crown: true,  thirdEye: true,  cape: 1.36, hair: 'wild',  beams: 8, smoke: 0.82, bloom: 2.1,  build: 1.30 },
}

/* ----------------------------- colour helpers ----------------------------- */

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')

/** Linear blend between two hex colours (t = 0 → a, t = 1 → b). */
export function mixHex(a: string, b: string, t: number): string {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  return `#${toHex(x.r + (y.r - x.r) * t)}${toHex(x.g + (y.g - x.g) * t)}${toHex(x.b + (y.b - x.b) * t)}`
}

export const RED = '#ff2d5e'
export const CYAN = '#46e0ff'
export const BLUE = '#3b82f6'
export const GOLD = '#ffcb57'

/**
 * Resolve the live aura/glow colour from accent + corruption + discipline.
 * Corruption pulls hard toward blood-red; discipline tints toward calm cyan.
 */
export function resolveGlow(accent: string, corrupt: number, discipline: number): string {
  if (corrupt > 0.05) return mixHex(accent, RED, Math.min(1, corrupt * 1.1))
  if (discipline > 0.05) return mixHex(accent, CYAN, discipline * 0.6)
  return accent
}
