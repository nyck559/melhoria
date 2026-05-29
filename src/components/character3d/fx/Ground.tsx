import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'

/** Pulsing summoning circle: outer torus ring + counter-rotating rune ring. */
export default function Ground() {
  const { glow, pulse, cfg } = useChar()
  const ring = useRef<THREE.Mesh>(null)
  const rune = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const p = pulse.current
    if (ring.current) {
      const s = 1 + Math.sin(time * 2) * 0.05 + p * 0.4
      ring.current.scale.set(s, s, s)
      ;(ring.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8 + p * 5
    }
    if (rune.current) {
      rune.current.rotation.z = -time * 0.3
      ;(rune.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (1.2 + Math.sin(time * 1.5) * 0.4) * cfg.aura
    }
  })

  return (
    <group>
      <mesh ref={ring} position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.022, 8, 48]} />
        <meshStandardMaterial color="#000" emissive={new THREE.Color(glow)} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh ref={rune} position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.008, 6, 6]} />
        <meshStandardMaterial color="#000" emissive={new THREE.Color(glow)} emissiveIntensity={1.4} toneMapped={false} wireframe />
      </mesh>
      {/* soft ground glow disc */}
      <mesh position={[0, -1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color={glow} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
