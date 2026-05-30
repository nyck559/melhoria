import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import { CharCtx, type CharSignals } from './context'
import HunterBody from './parts/HunterBody'
import Aura from './fx/Aura'
import Smoke from './fx/Smoke'
import Ground from './fx/Ground'
import Torches from './fx/Torch'
import Lighting from './rig/Lighting'
import CameraRig from './rig/CameraRig'

/**
 * Everything inside the R3F Canvas. Provides the shared signal context and
 * owns the drag/auto turntable that spins the character group.
 */
export default function Stage({ signals }: { signals: CharSignals }) {
  const turntable = useRef<THREE.Group>(null)
  const { spin, pulse } = signals

  useFrame((_, dt) => {
    pulse.current += (0 - pulse.current) * Math.min(1, dt * 4)
    if (spin.current.dragging) {
      spin.current.angle += (spin.current.target - spin.current.angle) * Math.min(1, dt * 12)
    } else {
      spin.current.angle += dt * 0.35
    }
    if (turntable.current) turntable.current.rotation.y = spin.current.angle
  })

  return (
    <CharCtx.Provider value={signals}>
      <Lighting />
      <CameraRig />

      {/* Torches are outside the turntable so they stay fixed in world space */}
      <Suspense fallback={null}>
        <Torches />
      </Suspense>

      <group ref={turntable}>
        {/* Character body loads in its own Suspense bubble */}
        <Suspense fallback={null}>
          <HunterBody />
        </Suspense>
        <Aura />
        <Smoke />
        <Ground />
      </group>
    </CharCtx.Provider>
  )
}
