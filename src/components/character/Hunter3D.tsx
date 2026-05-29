import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { RankTier } from '../../types'

interface Props {
  tier: RankTier
  accent?: string
  corrupt?: boolean
  onTap?: () => void
  className?: string
}

const TIER = {
  fraco: { scale: 0.92, eye: 0.7, aura: 0.45, headTilt: 0.18, spikes: false, hands: false, crown: false, thirdEye: false },
  firme: { scale: 1.0, eye: 1.4, aura: 0.9, headTilt: 0.05, spikes: false, hands: false, crown: false, thirdEye: false },
  dominante: { scale: 1.06, eye: 2.0, aura: 1.3, headTilt: -0.05, spikes: true, hands: true, crown: false, thirdEye: false },
  transcendente: { scale: 1.12, eye: 2.8, aura: 1.8, headTilt: -0.1, spikes: true, hands: true, crown: true, thirdEye: true },
} as const

function Figure({ tier, accent, corrupt, pulse }: { tier: RankTier; accent: string; corrupt: boolean; pulse: MutableRefObject<number> }) {
  const t = TIER[tier]
  const glowColor = corrupt ? '#ff2d5e' : accent
  const group = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const eyes = useRef<THREE.Group>(null)
  const auraPts = useRef<THREE.Points>(null)
  const ring = useRef<THREE.Mesh>(null)
  const crown = useRef<THREE.Group>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    pulse.current = THREE.MathUtils.lerp(pulse.current, 0, 0.07)
    const p = pulse.current
    if (group.current) {
      group.current.position.y = -0.05 + Math.sin(time * 1.4) * 0.03
      const s = t.scale * (1 + p * 0.06)
      group.current.scale.setScalar(s)
    }
    if (torso.current) torso.current.scale.x = torso.current.scale.z = 1 + Math.sin(time * 1.6) * 0.012
    ;((eyes.current?.children ?? []) as THREE.Mesh[]).forEach((m) => {
      ;(m.material as THREE.MeshStandardMaterial).emissiveIntensity = t.eye * (1.4 + Math.sin(time * 3) * 0.4) + p * 6
    })
    if (auraPts.current) {
      auraPts.current.rotation.y = time * 0.4
      ;(auraPts.current.material as THREE.PointsMaterial).opacity = (0.5 + Math.sin(time * 2) * 0.2) * t.aura + p * 0.5
    }
    if (ring.current) {
      const s = 1 + Math.sin(time * 2) * 0.06 + p * 0.4
      ring.current.scale.set(s, s, s)
      ;(ring.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + p * 4
    }
    if (crown.current) crown.current.rotation.y = time * 0.8
  })

  const auraGeo = useMemo(() => {
    const n = 120
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.45 + Math.random() * 0.5
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (Math.random() - 0.4) * 2.0
      pos[i * 3 + 2] = Math.sin(a) * r
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15101f', roughness: 0.65, metalness: 0.25 }), [])
  const coatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0d0a18', roughness: 0.7, metalness: 0.2 }), [])
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9c7e0', roughness: 0.5 }), [])
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#080610', roughness: 0.5, metalness: 0.4 }), [])
  const trimMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color(glowColor), emissiveIntensity: 1.6, toneMapped: false }),
    [glowColor],
  )
  const mkEye = () => new THREE.MeshStandardMaterial({ color: '#fff', emissive: new THREE.Color(glowColor), emissiveIntensity: 2, toneMapped: false })

  return (
    <group ref={group} scale={t.scale} position={[0, -0.05, 0]}>
      {/* legs */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} material={bodyMat} position={[x, -0.58, 0]}>
          <cylinderGeometry args={[0.1, 0.13, 0.78, 12]} />
        </mesh>
      ))}
      {[-0.16, 0.16].map((x) => (
        <mesh key={'b' + x} material={trimMat} position={[x, -0.96, 0.03]}>
          <boxGeometry args={[0.18, 0.1, 0.26]} />
        </mesh>
      ))}

      {/* coat skirt */}
      <mesh material={coatMat} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.52, 0.85, 16, 1, true]} />
      </mesh>

      {/* torso */}
      <mesh ref={torso} material={coatMat} position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.74, 16]} />
      </mesh>
      <mesh material={trimMat} position={[0, 0.18, 0.27]}>
        <boxGeometry args={[0.04, 0.5, 0.03]} />
      </mesh>
      <mesh material={trimMat} position={[0, -0.12, 0.3]}>
        <boxGeometry args={[0.16, 0.05, 0.03]} />
      </mesh>

      {/* shoulders */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={'s' + x} material={bodyMat} position={[x, 0.44, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>
      ))}
      {t.spikes &&
        [-0.32, 0.32].map((x) => (
          <mesh key={'sp' + x} material={trimMat} position={[x, 0.58, 0]} rotation={[0, 0, x < 0 ? 0.3 : -0.3]}>
            <coneGeometry args={[0.07, 0.26, 8]} />
          </mesh>
        ))}

      {/* arms */}
      {[-0.34, 0.34].map((x) => (
        <mesh key={'a' + x} material={coatMat} position={[x, 0.12, 0]} rotation={[0, 0, x < 0 ? 0.12 : -0.12]}>
          <cylinderGeometry args={[0.08, 0.1, 0.66, 12]} />
        </mesh>
      ))}
      {[-0.36, 0.36].map((x) => (
        <group key={'h' + x} position={[x, -0.22, 0.02]}>
          <mesh material={skinMat}>
            <sphereGeometry args={[0.08, 12, 12]} />
          </mesh>
          {t.hands && (
            <mesh material={trimMat}>
              <sphereGeometry args={[0.14, 16, 16]} />
            </mesh>
          )}
        </group>
      ))}

      {/* neck */}
      <mesh material={skinMat} position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 12]} />
      </mesh>

      {/* head */}
      <group position={[0, 0.74, 0]} rotation={[t.headTilt, 0, 0]}>
        <mesh material={skinMat}>
          <sphereGeometry args={[0.2, 24, 24]} />
        </mesh>
        <mesh material={coatMat} position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.16, 16, 1, true]} />
        </mesh>
        <group ref={eyes}>
          {[-0.07, 0.07].map((x) => (
            <mesh key={'e' + x} material={mkEye()} position={[x, 0.02, 0.18]}>
              <sphereGeometry args={[0.035, 12, 12]} />
            </mesh>
          ))}
        </group>
        {t.thirdEye && (
          <mesh material={mkEye()} position={[0, 0.12, 0.18]}>
            <sphereGeometry args={[0.03, 12, 12]} />
          </mesh>
        )}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh
              key={'hair' + i}
              material={hairMat}
              position={[Math.cos(a) * 0.12, 0.16, Math.sin(a) * 0.12 - 0.02]}
              rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]}
            >
              <coneGeometry args={[0.06, 0.24, 6]} />
            </mesh>
          )
        })}
      </group>

      {/* crown */}
      {t.crown && (
        <group ref={crown} position={[0, 1.12, 0]}>
          <mesh material={trimMat} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.02, 8, 24]} />
          </mesh>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh key={'c' + i} material={trimMat} position={[Math.cos(a) * 0.22, 0.06, Math.sin(a) * 0.22]}>
                <coneGeometry args={[0.025, 0.12, 6]} />
              </mesh>
            )
          })}
        </group>
      )}

      {/* aura particles */}
      <points ref={auraPts} geometry={auraGeo}>
        <pointsMaterial size={0.05} color={glowColor} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      {/* ground ring */}
      <mesh ref={ring} position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.025, 8, 40]} />
        <meshStandardMaterial color="#000" emissive={new THREE.Color(glowColor)} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {/* soft glow shell */}
      <mesh>
        <sphereGeometry args={[1.25, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.05 * t.aura} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function Hunter3D({ tier, accent = '#8b3bff', corrupt = false, onTap, className }: Props) {
  const t = TIER[tier]
  const glowColor = corrupt ? '#ff2d5e' : accent
  const pulse = useRef(0)

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.15, 3.5], fov: 34 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onClick={() => {
          pulse.current = 1
          onTap?.()
          try { navigator.vibrate?.(20) } catch { /* ignore */ }
        }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 3, 4]} intensity={0.7} color="#cfd8ff" />
        <pointLight position={[-2, 1, 2]} intensity={6 * t.aura} color={glowColor} distance={8} />
        <pointLight position={[2, -0.5, 2]} intensity={4} color="#3b82f6" distance={8} />
        <Figure tier={tier} accent={accent} corrupt={corrupt} pulse={pulse} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
    </div>
  )
}
