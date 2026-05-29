import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { CharCtx, type CharSignals } from './context'
import HunterBody from './parts/HunterBody'
import Aura from './fx/Aura'
import Smoke from './fx/Smoke'
import Ground from './fx/Ground'
import Gear from './gear/Gear'
import Lighting from './rig/Lighting'
import CameraRig from './rig/CameraRig'

/**
 * Everything that lives *inside* the R3F Canvas. Provides the shared signal
 * context and owns the drag/auto turntable that rotates the whole character.
 */
export default function Stage({ signals }: { signals: CharSignals }) {
  const turntable = useRef<THREE.Group>(null)
  const { spin, pulse } = signals

  useFrame((_, dt) => {
    // tap pulse decay
    pulse.current += (0 - pulse.current) * Math.min(1, dt * 4)
    // turntable: auto-rotate when idle, follow drag target while dragging
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
      <group ref={turntable}>
        <HunterBody />
        <Gear />
        <Aura />
        <Smoke />
        <Ground />
      </group>
    </CharCtx.Provider>
  )
}
