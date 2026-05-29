import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'
import { itemById } from '../../../data/equipment'
import type { EquipSlot } from '../../../types'

/**
 * Visual equipment layer. Each equipped slot renders a floating, emissive
 * artifact that orbits/bobs around the hunter and contributes its own glow.
 */
export default function Gear() {
  const { equipped, glow } = useChar()
  const orbit = useRef<THREE.Group>(null)
  const blade = useRef<THREE.Group>(null)
  const halo = useRef<THREE.Mesh>(null)

  const has = (s: EquipSlot) => Boolean(equipped[s])
  const color = (s: EquipSlot) => itemById(equipped[s])?.aura ?? glow

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (orbit.current) orbit.current.rotation.y = time * 0.6
    if (blade.current) {
      blade.current.position.y = 0.1 + Math.sin(time * 1.4) * 0.06
      blade.current.rotation.z = 0.4 + Math.sin(time * 0.8) * 0.05
    }
    if (halo.current) {
      halo.current.rotation.z = time * 1.2
      ;(halo.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(time * 2) * 0.6
    }
  })

  return (
    <group>
      {/* ARMA — floating blade at the hunter's right hand */}
      {has('arma') && (
        <group ref={blade} position={[0.46, 0.1, 0.12]}>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[0.05, 0.7, 0.012]} />
            <meshStandardMaterial color="#000" emissive={new THREE.Color(color('arma'))} emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.18, 0.04, 0.04]} />
            <meshStandardMaterial color="#1a1430" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
            <meshStandardMaterial color="#0d0a18" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* ESCUDO — hex barrier on the left side */}
      {has('escudo') && (
        <mesh position={[-0.44, 0.18, 0.1]} rotation={[0, 0.4, 0]}>
          <circleGeometry args={[0.26, 6]} />
          <meshStandardMaterial color={color('escudo')} emissive={new THREE.Color(color('escudo'))} emissiveIntensity={0.9} transparent opacity={0.32} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}

      {/* COROA — halo ring above the head */}
      {has('coroa') && (
        <mesh ref={halo} position={[0, 1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.012, 8, 32]} />
          <meshStandardMaterial color="#000" emissive={new THREE.Color(color('coroa'))} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      )}

      {/* ANEL · AMULETO · ELIXIR — orbiting energy orbs */}
      <group ref={orbit}>
        {(['anel', 'amuleto', 'elixir'] as EquipSlot[]).map((slot, i) =>
          has(slot) ? (
            <mesh key={slot} position={[Math.cos((i / 3) * Math.PI * 2) * 0.62, 0.1 + i * 0.18, Math.sin((i / 3) * Math.PI * 2) * 0.62]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#000" emissive={new THREE.Color(color(slot))} emissiveIntensity={2.6} toneMapped={false} />
            </mesh>
          ) : null,
        )}
      </group>
    </group>
  )
}
