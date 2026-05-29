import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
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
  fraco: { scale: 0.92, eye: 1.0, aura: 0.5, slouch: 0.12, spikes: false, hands: false, crown: false, thirdEye: false, cape: 0.7, parts: 70 },
  firme: { scale: 1.0, eye: 2.0, aura: 1.0, slouch: 0.02, spikes: false, hands: false, crown: false, thirdEye: false, cape: 0.9, parts: 110 },
  dominante: { scale: 1.06, eye: 3.0, aura: 1.4, slouch: -0.04, spikes: true, hands: true, crown: false, thirdEye: false, cape: 1.05, parts: 150 },
  transcendente: { scale: 1.12, eye: 4.0, aura: 2.0, slouch: -0.08, spikes: true, hands: true, crown: true, thirdEye: true, cape: 1.2, parts: 200 },
} as const

/** Dark standard material with a fresnel rim emissive (glows under bloom). */
function useRimMaterial(color: string, rim: string, rimStrength: number, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.35, ...opts })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uRimColor = { value: new THREE.Color(rim) }
      shader.uniforms.uRimStrength = { value: rimStrength }
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uRimColor;\nuniform float uRimStrength;')
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\nfloat rimF = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.6);\ntotalEmissiveRadiance += uRimColor * rimF * uRimStrength;',
        )
    }
    return m
  }, [color, rim, rimStrength])
}

function HunterModel({ tier, accent, corrupt, pulse }: { tier: RankTier; accent: string; corrupt: boolean; pulse: MutableRefObject<number> }) {
  const t = TIER[tier]
  const glow = corrupt ? '#ff2d5e' : accent
  const root = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const eyes = useRef<THREE.Group>(null)
  const aura = useRef<THREE.Points>(null)
  const ring = useRef<THREE.Mesh>(null)
  const crown = useRef<THREE.Group>(null)
  const beams = useRef<THREE.Group>(null)
  const cape = useRef<THREE.Mesh>(null)
  const capeBase = useRef<Float32Array | null>(null)

  const bodyMat = useRimMaterial('#171022', glow, 1.2)
  const coatMat = useRimMaterial('#0d0a18', glow, 1.7)
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8c6e0', roughness: 0.5 }), [])
  const hairMat = useRimMaterial('#0a0712', glow, 0.9, { metalness: 0.5 })
  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color(glow), emissiveIntensity: 2.2, toneMapped: false }), [glow])
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color('#ffcb57'), emissiveIntensity: 2.4, toneMapped: false }), [])
  const mkEye = () => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color(glow), emissiveIntensity: t.eye, toneMapped: false })

  const auraGeo = useMemo(() => {
    const n = t.parts
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.5 + Math.random() * 0.7
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (Math.random() - 0.45) * 2.4
      pos[i * 3 + 2] = Math.sin(a) * r
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [t.parts])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    pulse.current = THREE.MathUtils.lerp(pulse.current, 0, 0.06)
    const p = pulse.current
    if (root.current) {
      root.current.position.y = -0.02 + Math.sin(time * 1.3) * 0.03
      root.current.scale.setScalar(t.scale * (1 + p * 0.05))
    }
    if (torso.current) torso.current.scale.x = torso.current.scale.z = 1 + Math.sin(time * 1.6) * 0.012
    ;((eyes.current?.children ?? []) as THREE.Mesh[]).forEach((m) => {
      ;(m.material as THREE.MeshStandardMaterial).emissiveIntensity = t.eye * (1 + Math.sin(time * 3) * 0.25) + p * 8
    })
    if (aura.current) {
      aura.current.rotation.y = time * 0.45
      ;(aura.current.material as THREE.PointsMaterial).opacity = (0.45 + Math.sin(time * 2) * 0.18) * t.aura + p * 0.5
    }
    if (ring.current) {
      const s = 1 + Math.sin(time * 2) * 0.05 + p * 0.4
      ring.current.scale.set(s, s, s)
      ;(ring.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8 + p * 5
    }
    if (crown.current) crown.current.rotation.y = time * 0.9
    if (beams.current) beams.current.rotation.y = time * 0.15
    // cape sway
    const c = cape.current
    if (c) {
      const geo = c.geometry as THREE.PlaneGeometry
      const posAttr = geo.attributes.position as THREE.BufferAttribute
      if (!capeBase.current) capeBase.current = (posAttr.array as Float32Array).slice()
      const base = capeBase.current
      for (let i = 0; i < posAttr.count; i++) {
        const ix = i * 3
        const bx = base[ix]
        const by = base[ix + 1]
        const fall = (0.7 - by) / 1.4 // 0 at top → 1 at bottom
        const z = Math.sin(by * 3 + time * 2.2 + bx * 2.5) * 0.09 * fall - fall * 0.12
        posAttr.setZ(i, z)
        posAttr.setX(i, bx + Math.sin(time * 1.5 + by * 2) * 0.04 * fall)
      }
      posAttr.needsUpdate = true
      geo.computeVertexNormals()
    }
  })

  return (
    <group ref={root} scale={t.scale}>
      <group rotation={[t.slouch, 0, 0]}>
        {/* legs */}
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} material={bodyMat} position={[x, -0.62, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 0.8, 14]} />
          </mesh>
        ))}
        {[-0.12, 0.12].map((x) => (
          <mesh key={'b' + x} material={trimMat} position={[x, -1.02, 0.04]}>
            <boxGeometry args={[0.15, 0.1, 0.26]} />
          </mesh>
        ))}

        {/* coat skirt (long, flaring) */}
        <mesh material={coatMat} position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.15, 0.36, 0.98, 20, 1, true]} />
        </mesh>
        {/* coat front trim */}
        <mesh material={trimMat} position={[0, -0.5, 0.32]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.03, 0.85, 0.02]} />
        </mesh>

        {/* torso: chest wide, waist narrow */}
        <mesh ref={torso} material={coatMat} position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.21, 0.14, 0.62, 18]} />
        </mesh>
        {/* chest V trim */}
        <mesh material={trimMat} position={[-0.06, 0.2, 0.18]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.025, 0.34, 0.02]} />
        </mesh>
        <mesh material={trimMat} position={[0.06, 0.2, 0.18]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.025, 0.34, 0.02]} />
        </mesh>
        {/* core */}
        <mesh material={trimMat} position={[0, 0.06, 0.2]}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>

        {/* pauldrons */}
        {[-0.26, 0.26].map((x) => (
          <mesh key={'s' + x} material={bodyMat} position={[x, 0.42, 0]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.14, 18, 18]} />
          </mesh>
        ))}
        {t.spikes &&
          [-0.3, 0.3].map((x) => (
            <mesh key={'sp' + x} material={trimMat} position={[x, 0.56, 0]} rotation={[0, 0, x < 0 ? 0.4 : -0.4]}>
              <coneGeometry args={[0.06, 0.3, 8]} />
            </mesh>
          ))}

        {/* arms (upper + forearm) */}
        {[-1, 1].map((s) => (
          <group key={'arm' + s} position={[0.28 * s, 0.36, 0]} rotation={[0, 0, -0.18 * s]}>
            <mesh material={coatMat} position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.4, 12]} />
            </mesh>
            <mesh material={bodyMat} position={[0.03 * s, -0.5, 0]} rotation={[0, 0, 0.12 * s]}>
              <cylinderGeometry args={[0.055, 0.05, 0.4, 12]} />
            </mesh>
            <group position={[0.06 * s, -0.72, 0.02]}>
              <mesh material={skinMat}>
                <sphereGeometry args={[0.07, 12, 12]} />
              </mesh>
              {t.hands && (
                <mesh material={trimMat}>
                  <sphereGeometry args={[0.13, 16, 16]} />
                </mesh>
              )}
            </group>
          </group>
        ))}

        {/* neck */}
        <mesh material={skinMat} position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
        </mesh>
        {/* high collar */}
        <mesh material={coatMat} position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.22, 16, 1, true]} />
        </mesh>

        {/* head */}
        <group position={[0, 0.74, 0]} scale={[1, 1.12, 1]}>
          <mesh material={skinMat}>
            <sphereGeometry args={[0.17, 24, 24]} />
          </mesh>
          <group ref={eyes}>
            {[-0.06, 0.06].map((x) => (
              <mesh key={'e' + x} material={mkEye()} position={[x, 0.0, 0.15]} scale={[1.4, 0.7, 1]}>
                <sphereGeometry args={[0.03, 12, 12]} />
              </mesh>
            ))}
          </group>
          {t.thirdEye && (
            <mesh material={mkEye()} position={[0, 0.12, 0.15]}>
              <sphereGeometry args={[0.028, 12, 12]} />
            </mesh>
          )}
          {/* swept-back hair */}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2
            const back = Math.sin(a) < 0
            return (
              <mesh
                key={'hair' + i}
                material={hairMat}
                position={[Math.cos(a) * 0.12, 0.12 + (back ? 0.02 : 0.05), Math.sin(a) * 0.12 - 0.02]}
                rotation={[back ? 1.1 : -0.4, 0, -Math.cos(a) * 0.5]}
              >
                <coneGeometry args={[0.045, back ? 0.32 : 0.2, 6]} />
              </mesh>
            )
          })}
        </group>

        {/* crown */}
        {t.crown && (
          <group ref={crown} position={[0, 1.04, 0]}>
            <mesh material={goldMat} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.018, 8, 24]} />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2
              return (
                <mesh key={'c' + i} material={goldMat} position={[Math.cos(a) * 0.2, 0.06, Math.sin(a) * 0.2]}>
                  <coneGeometry args={[0.022, 0.12, 6]} />
                </mesh>
              )
            })}
          </group>
        )}
      </group>

      {/* flowing cape */}
      <mesh ref={cape} position={[0, 0.18, -0.16]}>
        <planeGeometry args={[0.7 * t.cape, 1.4, 14, 20]} />
        <meshStandardMaterial color="#0c0818" emissive={new THREE.Color(glow)} emissiveIntensity={0.5} side={THREE.DoubleSide} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* aura particles */}
      <points ref={aura} geometry={auraGeo}>
        <pointsMaterial size={0.045} color={glow} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      {/* ground ring */}
      <mesh ref={ring} position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.022, 8, 48]} />
        <meshStandardMaterial color="#000" emissive={new THREE.Color(glow)} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {/* inner rune ring */}
      <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.008, 6, 6]} />
        <meshStandardMaterial color="#000" emissive={new THREE.Color(glow)} emissiveIntensity={1.4} toneMapped={false} wireframe />
      </mesh>

      {/* light beams */}
      <group ref={beams}>
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <mesh key={'beam' + i} position={[Math.cos(a) * 0.7, 0.2, Math.sin(a) * 0.7]} rotation={[0, -a, 0.04]}>
              <planeGeometry args={[0.06, 2.4]} />
              <meshBasicMaterial color={glow} transparent opacity={0.12 * t.aura} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export default function Hunter3D({ tier, accent = '#8b3bff', corrupt = false, onTap, className }: Props) {
  const t = TIER[tier]
  const glow = corrupt ? '#ff2d5e' : accent
  const pulse = useRef(0)

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.2, 4], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ scene }) => { scene.fog = new THREE.FogExp2(0x06030f, 0.16) }}
        onClick={() => {
          pulse.current = 1
          onTap?.()
          try { navigator.vibrate?.(22) } catch { /* ignore */ }
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[2, 4, 3]} intensity={0.5} color="#cfd8ff" />
        {/* rim lights behind for glowing edges */}
        <pointLight position={[-2.2, 1.2, -1.5]} intensity={9 * t.aura} color={glow} distance={9} />
        <pointLight position={[2.2, 0.4, -1.5]} intensity={6} color="#3b82f6" distance={9} />
        <pointLight position={[0, -0.6, 2.2]} intensity={3} color={glow} distance={7} />

        <HunterModel tier={tier} accent={accent} corrupt={corrupt} pulse={pulse} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.9}
          minPolarAngle={Math.PI / 2.7}
          maxPolarAngle={Math.PI / 1.85}
        />

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.22} luminanceSmoothing={0.5} mipmapBlur radius={0.7} />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
