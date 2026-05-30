import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, type PointerEvent as RPointerEvent } from 'react'
import * as THREE from 'three'
import type { EquipSlot, Rank } from '../../types'
import Stage from './Stage'
import PostFX from './PostFX'
import { CYAN, BLUE, RANK_VISUAL, resolveGlow } from './visuals'
import type { CharEvent, CharSignals } from './context'

export interface Hunter3DProps {
  /** Drives the entire visual evolution (E → SSS). */
  rank: Rank
  accent?: string
  /** 0..100 — pushes eyes/aura/smoke toward blood-red + glitches. */
  corruption?: number
  /** 0..100 — streak/discipline tints the aura calm-blue and steadies posture. */
  discipline?: number
  equipped?: Partial<Record<EquipSlot, string>>
  onTap?: () => void
  className?: string
  /** depth-of-field — disable on low-end devices for FPS. */
  dof?: boolean
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/**
 * AAA procedural 3D hunter — Solo Leveling flavoured. Modular scene with
 * cinematic camera, neon lighting, post-processing and a full evolution /
 * corruption / discipline / equipment reactive system.
 */
export default function Hunter3D({
  rank,
  accent = '#8b3bff',
  corruption = 0,
  discipline = 0,
  equipped = {},
  onTap,
  className,
  dof = true,
}: Hunter3DProps) {
  const corrupt = clamp01(corruption / 100)
  const disc = clamp01(discipline / 100)
  const cfg = RANK_VISUAL[rank]
  const glow = resolveGlow(accent, corrupt, disc)
  const rim = disc > 0.4 ? CYAN : BLUE

  // stable mutable handles shared with the scene
  const pulse = useRef(0)
  const event = useRef<CharEvent>({ type: 'idle', t: 0 })
  const spin = useRef({ angle: 0, target: 0, dragging: false })

  // rank-up cinematic (skip first mount)
  const firstRank = useRef(true)
  useEffect(() => {
    if (firstRank.current) {
      firstRank.current = false
      return
    }
    event.current = { type: 'rankup', t: performance.now() }
  }, [rank])

  const signals: CharSignals = {
    cfg,
    glow,
    rim,
    corrupt,
    discipline: disc,
    equipped,
    pulse,
    event,
    spin,
  }

  // ---- drag to rotate / tap to react (DOM layer, so it stacks over WebGL) ----
  const drag = useRef({ down: false, moved: false, sx: 0, startAngle: 0 })
  const onDown = (e: RPointerEvent) => {
    drag.current = { down: true, moved: false, sx: e.clientX, startAngle: spin.current.angle }
    spin.current.dragging = true
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: RPointerEvent) => {
    if (!drag.current.down) return
    const dx = e.clientX - drag.current.sx
    if (Math.abs(dx) > 5) drag.current.moved = true
    spin.current.target = drag.current.startAngle + dx * 0.01
  }
  const onUp = () => {
    if (!drag.current.down) return
    const wasTap = !drag.current.moved
    drag.current.down = false
    spin.current.dragging = false
    if (wasTap) {
      pulse.current = 1
      event.current = { type: 'burst', t: performance.now() }
      onTap?.()
      try {
        navigator.vibrate?.(22)
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div
      className={className}
      style={{ touchAction: 'none', cursor: 'grab' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.15, 4.6], fov: 36 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.FogExp2(0x06030f, 0.16)
        }}
      >
        <Stage signals={signals} />
        <PostFX bloom={cfg.bloom} corrupt={corrupt} dof={dof} />
      </Canvas>
    </div>
  )
}
