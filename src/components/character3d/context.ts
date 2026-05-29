import { createContext, useContext, type MutableRefObject } from 'react'
import type { RankVisual } from './visuals'

export type CharEventType = 'idle' | 'summon' | 'rankup' | 'burst' | 'equip' | 'eyes'

export interface CharEvent {
  type: CharEventType
  t: number // performance.now() when fired
}

/** Mutable, per-frame interaction handles shared across every 3D sub-component. */
export interface CharSignals {
  cfg: RankVisual
  glow: string // live aura colour (accent ⇄ red/cyan)
  rim: string // secondary rim-light colour
  corrupt: number // 0..1
  discipline: number // 0..1
  equipped: Partial<Record<string, string>>
  /** tap recoil 0→1, decays each frame */
  pulse: MutableRefObject<number>
  /** last fired cinematic event (rank-up zoom, aura burst, …) */
  event: MutableRefObject<CharEvent>
  /** drag-to-rotate state for the stage turntable */
  spin: MutableRefObject<{ angle: number; target: number; dragging: boolean }>
}

export const CharCtx = createContext<CharSignals | null>(null)

export function useChar(): CharSignals {
  const c = useContext(CharCtx)
  if (!c) throw new Error('useChar must be used inside <Stage>')
  return c
}

/** Eased decay helper used by every fx component for the tap pulse. */
export function decay(ref: MutableRefObject<number>, rate = 0.06) {
  ref.current += (0 - ref.current) * rate
  return ref.current
}
