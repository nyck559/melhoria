import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'

/** Rising aura particles + rotating god-ray beams. Scales with rank & pulse. */
export default function Aura() {
  const { cfg, glow, pulse, event } = useChar()
  const points = useRef<THREE.Points>(null)
  const beams = useRef<THREE.Group>(null)
  const burst = useRef(0)

  const geo = useMemo(() => {
    const n = cfg.parts
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.5 + Math.random() * 0.7
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (Math.random() - 0.45) * 2.4
      pos[i * 3 + 2] = Math.sin(a) * r
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.userData.seed = seed
    g.userData.base = pos.slice()
    return g
  }, [cfg.parts])

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime
    // aura burst event
    if (event.current.type === 'burst' || event.current.type === 'summon') {
      if (performance.now() - event.current.t < 60) burst.current = 1
    }
    burst.current += (0 - burst.current) * 0.04
    const energy = cfg.aura + burst.current * 1.5 + pulse.current

    const pts = points.current
    if (pts) {
      pts.rotation.y = time * 0.45
      const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute
      const base = pts.geometry.userData.base as Float32Array
      const seed = pts.geometry.userData.seed as Float32Array
      for (let i = 0; i < seed.length; i++) {
        const iy = i * 3 + 1
        let y = base[iy] + ((time * (0.3 + seed[i] * 0.5)) % 3.2)
        if (y > 1.4) y -= 3.2
        posAttr.array[iy] = y
      }
      posAttr.needsUpdate = true
      const mat = pts.material as THREE.PointsMaterial
      mat.opacity = (0.4 + Math.sin(time * 2) * 0.18) * energy
      mat.size = 0.04 + burst.current * 0.05
    }
    if (beams.current) {
      beams.current.rotation.y = time * 0.15
      beams.current.scale.setScalar(1 + burst.current * 0.4)
      beams.current.children.forEach((m) => {
        const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial
        mat.opacity = (0.1 + Math.sin(time * 1.5) * 0.04) * energy
      })
    }
  })

  return (
    <group>
      <points ref={points} geometry={geo}>
        <pointsMaterial size={0.045} color={glow} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={beams}>
        {Array.from({ length: cfg.beams }).map((_, i) => {
          const a = (i / Math.max(1, cfg.beams)) * Math.PI * 2
          return (
            <mesh key={'beam' + i} position={[Math.cos(a) * 0.7, 0.2, Math.sin(a) * 0.7]} rotation={[0, -a, 0.04]}>
              <planeGeometry args={[0.06, 2.4]} />
              <meshBasicMaterial color={glow} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
