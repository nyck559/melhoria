import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'
import { RED } from '../visuals'

/**
 * Drifting dark-smoke billboards at the feet. Volume grows with rank's `smoke`
 * and with corruption (the darkness "rises"), tinting blood-red when corrupt.
 */
export default function Smoke() {
  const { cfg, glow, corrupt } = useChar()
  const grp = useRef<THREE.Group>(null)
  const n = 6
  const color = corrupt > 0.4 ? RED : glow

  const puffs = useMemo(
    () =>
      Array.from({ length: n }).map((_, i) => ({
        a: (i / n) * Math.PI * 2,
        r: 0.35 + Math.random() * 0.4,
        speed: 0.4 + Math.random() * 0.4,
        size: 0.6 + Math.random() * 0.5,
        phase: Math.random() * 10,
      })),
    [],
  )

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const vol = cfg.smoke + corrupt * 0.6
    grp.current?.children.forEach((m, i) => {
      const p = puffs[i]
      const t = (time * p.speed + p.phase) % 3
      const mesh = m as THREE.Mesh
      mesh.position.set(Math.cos(p.a + time * 0.2) * p.r, -1.0 + t * 0.9, Math.sin(p.a + time * 0.2) * p.r)
      const k = 1 - t / 3
      mesh.scale.setScalar(p.size * (0.6 + t * 0.5))
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = k * 0.4 * vol
    })
  })

  return (
    <group ref={grp}>
      {puffs.map((_, i) => (
        <sprite key={i}>
          <spriteMaterial color={color} transparent opacity={0.2} blending={corrupt > 0.4 ? THREE.AdditiveBlending : THREE.NormalBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
