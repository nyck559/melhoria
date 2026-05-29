import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'
import { BLUE } from '../visuals'

/**
 * Cinematic 3-point neon rig: cool key, blue rim, and a rank-reactive back
 * light in the live aura colour that breathes and flares on tap/burst.
 */
export default function Lighting() {
  const { cfg, glow, rim, pulse } = useChar()
  const key = useRef<THREE.PointLight>(null)
  const fill = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const p = pulse.current
    if (key.current) key.current.intensity = (7 + Math.sin(time * 1.5) * 1.2) * cfg.aura + p * 14
    if (fill.current) fill.current.intensity = 3 + p * 4
  })

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[2, 4, 3]} intensity={0.5} color="#cfd8ff" castShadow />
      {/* back neon key in the aura colour */}
      <pointLight ref={key} position={[-2.2, 1.2, -1.5]} intensity={9 * cfg.aura} color={glow} distance={10} />
      {/* blue rim */}
      <pointLight position={[2.2, 0.4, -1.5]} intensity={6} color={rim || BLUE} distance={9} />
      {/* front fill in aura colour */}
      <pointLight ref={fill} position={[0, -0.6, 2.2]} intensity={3} color={glow} distance={7} />
    </>
  )
}
