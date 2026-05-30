import { useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'

const FLAME_OFFSET_Y = 1.3 // light sits above base after auto-scale

/** Single torch instance, placed at `position`. */
function TorchMesh({ position }: { position: [number, number, number] }) {
  const { glow } = useChar()
  const raw = useFBX('/models/torch.fbx')
  const light = useRef<THREE.PointLight>(null)

  const cloned = useMemo(() => {
    const c = raw.clone(true)
    // auto-scale: fit within 1.4 units tall (handles any FBX unit)
    const box = new THREE.Box3().setFromObject(c)
    const size = new THREE.Vector3(); box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) c.scale.setScalar(1.4 / maxDim)
    // shift so base sits at y=0
    box.setFromObject(c)
    c.position.y = -box.min.y
    // tint all emissive materials with warm orange
    c.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const mat = obj.material as THREE.MeshStandardMaterial
      if (!mat?.isMeshStandardMaterial) return
      mat.emissive = new THREE.Color('#ff6a00')
      mat.emissiveIntensity = 0.6
    })
    return c
  }, [raw])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (light.current) {
      // organic flame flicker: layered sines at different frequencies
      light.current.intensity =
        4.5
        + Math.sin(time * 7.3) * 0.9
        + Math.sin(time * 13.1) * 0.5
        + Math.sin(time * 21.7) * 0.25
    }
  })

  return (
    <group position={position}>
      <primitive object={cloned} />
      {/* flame point light — orange-amber, close range */}
      <pointLight
        ref={light}
        position={[0, FLAME_OFFSET_Y, 0]}
        intensity={4.5}
        distance={4.5}
        color="#ff8a2b"
      />
      {/* small ambient neon fill near base in aura colour */}
      <pointLight position={[0, 0.2, 0]} intensity={0.6} distance={2} color={glow} />
      {/* tiny rising sprite embers */}
      <EmberSprites x={position[0]} />
    </group>
  )
}

/** A handful of small additive sprites that drift upward like embers. */
function EmberSprites({ x }: { x: number }) {
  const grp = useRef<THREE.Group>(null)
  const n = 6
  const seeds = useMemo(
    () => Array.from({ length: n }).map((_, i) => ({ phase: i * 1.1, r: Math.random() * 0.12 })),
    [],
  )

  useFrame((state) => {
    const time = state.clock.elapsedTime
    grp.current?.children.forEach((m, i) => {
      const s = seeds[i]
      const t = ((time * 0.8 + s.phase) % 2) / 2 // 0..1 loop
      const mesh = m as THREE.Mesh
      mesh.position.set(Math.sin(s.phase * 5 + time) * 0.08, FLAME_OFFSET_Y + t * 0.8, s.r)
      mesh.scale.setScalar((1 - t) * 0.04)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.85
    })
  })

  void x
  return (
    <group ref={grp}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 4, 4]} />
          <meshBasicMaterial color="#ffcb57" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Two torches flanking the hunter, left and right. */
export default function Torches() {
  return (
    <>
      <TorchMesh position={[-1.1, -1.0, 0.2]} />
      <TorchMesh position={[ 1.1, -1.0, 0.2]} />
    </>
  )
}

useFBX.preload('/models/torch.fbx')
