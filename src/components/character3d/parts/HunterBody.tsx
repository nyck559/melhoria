import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useChar, decay } from '../context'

type ShaderUniforms = { uRimColor: THREE.IUniform<THREE.Color>; uRimStr: THREE.IUniform<number> }

/** Rim-fresnel emissive injected into a MeshStandardMaterial via onBeforeCompile. */
function injectRim(mat: THREE.MeshStandardMaterial, refs: ShaderUniforms[]): void {
  mat.onBeforeCompile = (shader) => {
    const uRimColor: THREE.IUniform<THREE.Color> = { value: new THREE.Color('#8b3bff') }
    const uRimStr: THREE.IUniform<number> = { value: 1.8 }
    shader.uniforms.uRimColor = uRimColor
    shader.uniforms.uRimStr = uRimStr
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 uRimColor;\nuniform float uRimStr;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\nfloat rimF = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.8);\ntotalEmissiveRadiance += uRimColor * rimF * uRimStr;',
      )
    refs.push({ uRimColor, uRimStr })
  }
  mat.needsUpdate = true
}

export default function HunterBody() {
  const { cfg, glow, corrupt, pulse } = useChar()
  const { scene } = useGLTF('/models/hunter.glb')

  const rimRefs = useRef<ShaderUniforms[]>([])
  const root = useRef<THREE.Group>(null)

  const cloned = useMemo(() => {
    rimRefs.current = []
    const c = scene.clone(true)

    // auto-scale: fit within 2.4 units (camera distance = 4, model fills frame nicely)
    const box = new THREE.Box3().setFromObject(c)
    const size = new THREE.Vector3(); box.getSize(size)
    const center = new THREE.Vector3(); box.getCenter(center)
    const sc = 2.4 / Math.max(size.x, size.y, size.z)
    c.scale.setScalar(sc)
    // center XZ, plant feet at y = -1.0 (where the ground ring sits)
    c.position.set(-center.x * sc, -box.min.y * sc - 1.0, -center.z * sc)

    c.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const mat = obj.material as THREE.MeshStandardMaterial
      if (!mat?.isMeshStandardMaterial) return
      // inject rim on the real skin/cloth materials
      if (mat.name === 'Body.001' || mat.name === 'Clothes.004') {
        injectRim(mat, rimRefs.current)
      }
      // bump outline materials' emissive slightly for neon edge pop
      if (mat.name.startsWith('OH_Outline')) {
        mat.emissiveIntensity = 0.4
      }
    })

    return c
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const p = decay(pulse, 0.06)
    const flick = corrupt > 0.5 ? 1 + Math.sin(time * 22) * 0.08 * corrupt : 1

    if (root.current) {
      // idle float + gentle sway (makes static mesh feel alive)
      root.current.position.y = Math.sin(time * 1.3) * 0.05
      root.current.rotation.y = Math.sin(time * 0.6) * 0.04
      root.current.rotation.z = Math.sin(time * 0.9) * 0.015
      root.current.scale.setScalar(cfg.scale * (1 + p * 0.07)) // tap punch
    }

    // update live rim colour + strength each frame (after shader compiled)
    for (const u of rimRefs.current) {
      u.uRimColor.value.set(glow)
      u.uRimStr.value = 1.8 * flick * cfg.aura * (1 + p * 3)
    }

    // outline glow on corruption
    if (corrupt > 0.25) {
      cloned.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        const mat = obj.material as THREE.MeshStandardMaterial
        if (mat?.name?.startsWith('OH_Outline')) {
          mat.emissive.set(glow)
          mat.emissiveIntensity = 0.4 + corrupt * 1.4 * flick
        }
      })
    }
  })

  return <group ref={root}><primitive object={cloned} /></group>
}

useGLTF.preload('/models/hunter.glb')
