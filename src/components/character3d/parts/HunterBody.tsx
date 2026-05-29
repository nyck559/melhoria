import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'
import { useRimMaterial, useEmissive } from '../materials'

/**
 * The hunter's body — fully procedural so it can morph by rank without art
 * assets. Drives: breathing (torso scale), idle float, eye glow pulse, hair
 * sway, cloth/cape simulation, tap-recoil punch and a corruption flicker.
 */
export default function HunterBody() {
  const { cfg, glow, corrupt, pulse } = useChar()
  const b = cfg.build

  const root = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const eyes = useRef<THREE.Group>(null)
  const hair = useRef<THREE.Group>(null)
  const crown = useRef<THREE.Group>(null)
  const cape = useRef<THREE.Mesh>(null)
  const capeBase = useRef<Float32Array | null>(null)

  const bodyMat = useRimMaterial('#171022', glow, 1.2)
  const coatMat = useRimMaterial('#0d0a18', glow, 1.7)
  const hairMat = useRimMaterial('#0a0712', glow, 0.9, { metalness: 0.5 })
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8c6e0', roughness: 0.5 }), [])
  const trimMat = useEmissive(glow, 2.2)
  const goldMat = useEmissive('#ffcb57', 2.4)
  const mkEye = () => new THREE.MeshStandardMaterial({ color: '#fff', emissive: new THREE.Color(glow), emissiveIntensity: cfg.eye, toneMapped: false })

  // hair tufts laid out once
  const hairTufts = useMemo(() => {
    const n = cfg.hair === 'short' ? 8 : cfg.hair === 'swept' ? 10 : 13
    return Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2
      const back = Math.sin(a) < 0
      const len = cfg.hair === 'wild' ? (back ? 0.42 : 0.26) : cfg.hair === 'swept' ? (back ? 0.32 : 0.2) : back ? 0.22 : 0.14
      return { a, back, len, x: Math.cos(a) * 0.12, z: Math.sin(a) * 0.12 - 0.02 }
    })
  }, [cfg.hair])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const p = pulse.current
    // corruption flicker — subtle strobe on the rim glow
    const flick = corrupt > 0.5 ? 1 + Math.sin(time * 22) * 0.12 * corrupt : 1

    if (root.current) {
      root.current.position.y = -0.02 + Math.sin(time * 1.3) * 0.03 // idle float
      root.current.scale.setScalar(cfg.scale * (1 + p * 0.05))
    }
    if (torso.current) torso.current.scale.x = torso.current.scale.z = 1 + Math.sin(time * 1.6) * 0.012 // breathing
    ;((eyes.current?.children ?? []) as THREE.Mesh[]).forEach((m) => {
      ;(m.material as THREE.MeshStandardMaterial).emissiveIntensity = cfg.eye * flick * (1 + Math.sin(time * 3) * 0.25) + p * 8
    })
    if (hair.current) {
      hair.current.rotation.z = Math.sin(time * 1.1) * 0.05 + Math.sin(time * 2.3) * 0.02
      hair.current.rotation.x = Math.sin(time * 0.9) * 0.03
    }
    if (crown.current) crown.current.rotation.y = time * 0.9

    const c = cape.current
    if (c && cfg.cape > 0) {
      const geo = c.geometry as THREE.PlaneGeometry
      const posAttr = geo.attributes.position as THREE.BufferAttribute
      if (!capeBase.current) capeBase.current = (posAttr.array as Float32Array).slice()
      const base = capeBase.current
      for (let i = 0; i < posAttr.count; i++) {
        const ix = i * 3
        const bx = base[ix]
        const by = base[ix + 1]
        const fall = (0.7 - by) / 1.4
        posAttr.setZ(i, Math.sin(by * 3 + time * 2.2 + bx * 2.5) * 0.09 * fall - fall * 0.12)
        posAttr.setX(i, bx + Math.sin(time * 1.5 + by * 2) * 0.04 * fall)
      }
      posAttr.needsUpdate = true
      geo.computeVertexNormals()
    }
  })

  return (
    <group ref={root} scale={cfg.scale}>
      <group rotation={[cfg.slouch, 0, 0]}>
        {/* legs */}
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} material={bodyMat} position={[x * b, -0.62, 0]}>
            <cylinderGeometry args={[0.07 * b, 0.1 * b, 0.8, 14]} />
          </mesh>
        ))}
        {[-0.12, 0.12].map((x) => (
          <mesh key={'boot' + x} material={trimMat} position={[x * b, -1.02, 0.04]}>
            <boxGeometry args={[0.15, 0.1, 0.26]} />
          </mesh>
        ))}

        {/* long flaring coat skirt */}
        <mesh material={coatMat} position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.15 * b, 0.36 * b, 0.98, 20, 1, true]} />
        </mesh>
        <mesh material={trimMat} position={[0, -0.5, 0.32 * b]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.03, 0.85, 0.02]} />
        </mesh>

        {/* torso — broad chest, narrow waist (mass grows with rank) */}
        <mesh ref={torso} material={coatMat} position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.21 * b, 0.14 * b, 0.62, 18]} />
        </mesh>
        <mesh material={trimMat} position={[-0.06, 0.2, 0.18]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.025, 0.34, 0.02]} />
        </mesh>
        <mesh material={trimMat} position={[0.06, 0.2, 0.18]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.025, 0.34, 0.02]} />
        </mesh>
        <mesh material={trimMat} position={[0, 0.06, 0.2]}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>

        {/* pauldrons + optional spikes */}
        {[-0.26, 0.26].map((x) => (
          <mesh key={'pa' + x} material={bodyMat} position={[x * b, 0.42, 0]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.14 * b, 18, 18]} />
          </mesh>
        ))}
        {cfg.pauldronSpikes &&
          [-0.3, 0.3].map((x) => (
            <mesh key={'sp' + x} material={trimMat} position={[x * b, 0.56, 0]} rotation={[0, 0, x < 0 ? 0.4 : -0.4]}>
              <coneGeometry args={[0.06, 0.3, 8]} />
            </mesh>
          ))}
        {cfg.shoulderSpikes &&
          [-0.34, 0.34].map((x) => (
            <mesh key={'ss' + x} material={trimMat} position={[x * b, 0.46, -0.08]} rotation={[0.5, 0, x < 0 ? 0.7 : -0.7]}>
              <coneGeometry args={[0.04, 0.22, 6]} />
            </mesh>
          ))}

        {/* arms */}
        {[-1, 1].map((s) => (
          <group key={'arm' + s} position={[0.28 * b * s, 0.36, 0]} rotation={[0, 0, -0.18 * s]}>
            <mesh material={coatMat} position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.07 * b, 0.06 * b, 0.4, 12]} />
            </mesh>
            <mesh material={bodyMat} position={[0.03 * s, -0.5, 0]} rotation={[0, 0, 0.12 * s]}>
              <cylinderGeometry args={[0.055 * b, 0.05 * b, 0.4, 12]} />
            </mesh>
            <group position={[0.06 * s, -0.72, 0.02]}>
              <mesh material={skinMat}>
                <sphereGeometry args={[0.07, 12, 12]} />
              </mesh>
            </group>
          </group>
        ))}

        {/* neck + high collar */}
        <mesh material={skinMat} position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
        </mesh>
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
              <mesh key={'e' + x} material={mkEye()} position={[x, 0, 0.15]} scale={[1.4, 0.7, 1]}>
                <sphereGeometry args={[0.03, 12, 12]} />
              </mesh>
            ))}
          </group>
          {cfg.thirdEye && (
            <mesh material={mkEye()} position={[0, 0.12, 0.15]}>
              <sphereGeometry args={[0.028, 12, 12]} />
            </mesh>
          )}
          {/* hair */}
          <group ref={hair}>
            {hairTufts.map((h, i) => (
              <mesh
                key={'hair' + i}
                material={hairMat}
                position={[h.x, 0.12 + (h.back ? 0.02 : 0.05), h.z]}
                rotation={[h.back ? 1.1 : -0.4, 0, -Math.cos(h.a) * 0.5]}
              >
                <coneGeometry args={[0.045, h.len, 6]} />
              </mesh>
            ))}
          </group>
        </group>

        {/* monarch crown */}
        {cfg.crown && (
          <group ref={crown} position={[0, 1.04, 0]}>
            <mesh material={goldMat} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.018, 8, 24]} />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2
              return (
                <mesh key={'cr' + i} material={goldMat} position={[Math.cos(a) * 0.2, 0.06, Math.sin(a) * 0.2]}>
                  <coneGeometry args={[0.022, 0.12, 6]} />
                </mesh>
              )
            })}
          </group>
        )}
      </group>

      {/* flowing cape */}
      {cfg.cape > 0 && (
        <mesh ref={cape} position={[0, 0.18, -0.16]}>
          <planeGeometry args={[0.7 * cfg.cape, 1.4, 14, 20]} />
          <meshStandardMaterial color="#0c0818" emissive={new THREE.Color(glow)} emissiveIntensity={0.5} side={THREE.DoubleSide} roughness={0.6} metalness={0.3} />
        </mesh>
      )}
    </group>
  )
}
