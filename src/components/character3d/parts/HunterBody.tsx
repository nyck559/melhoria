import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { useChar, decay } from '../context'

type RimUniforms = { uRimColor: THREE.IUniform<THREE.Color>; uRimStr: THREE.IUniform<number> }

const GLB = '/models/sungjinwoo.glb'

/** Inject a fresnel rim-emissive into a standard material so edges glow under bloom. */
function injectRim(mat: THREE.MeshStandardMaterial, sink: RimUniforms[]) {
  mat.onBeforeCompile = (shader) => {
    const uRimColor: THREE.IUniform<THREE.Color> = { value: new THREE.Color('#8b3bff') }
    const uRimStr: THREE.IUniform<number> = { value: 1.5 }
    shader.uniforms.uRimColor = uRimColor
    shader.uniforms.uRimStr = uRimStr
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uRimColor;\nuniform float uRimStr;')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\nfloat rimF = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 3.0);\ntotalEmissiveRadiance += uRimColor * rimF * uRimStr;',
      )
    sink.push({ uRimColor, uRimStr })
  }
  mat.needsUpdate = true
}

/**
 * Sung Jinwoo — real GLB mesh (Draco). We keep only the highest LOD per part,
 * wire the colour textures by mesh-name, make the eyes glow, and inject a rim
 * shader that pulses with the live aura colour + tap recoil. Idle sway keeps
 * the static mesh feeling alive.
 */
export default function HunterBody() {
  const { cfg, glow, corrupt, pulse } = useChar()
  const { scene } = useGLTF(GLB, '/draco/')
  const [bodyCO, bodyNM, faceCO, hairCO] = useTexture([
    '/models/tex/body_co.jpg',
    '/models/tex/body_nm.jpg',
    '/models/tex/face_co.jpg',
    '/models/tex/hair_co.jpg',
  ])

  const root = useRef<THREE.Group>(null)
  const rims = useRef<RimUniforms[]>([])
  const eyeMats = useRef<THREE.MeshStandardMaterial[]>([])

  const cloned = useMemo(() => {
    rims.current = []
    eyeMats.current = []
    for (const t of [bodyCO, faceCO, hairCO]) {
      t.colorSpace = THREE.SRGBColorSpace
      t.flipY = false
    }
    bodyNM.flipY = false

    const c = skeletonClone(scene)

    // pose the biped out of its T-pose into a relaxed idle stance
    const poseBone = (name: string, x: number, y: number, z: number) => {
      const bone = c.getObjectByName(name)
      if (bone) bone.rotation.set(bone.rotation.x + x, bone.rotation.y + y, bone.rotation.z + z)
    }
    poseBone('Bip001 L UpperArm', 0, 0.15, -1.18) // drop left arm to side
    poseBone('Bip001 R UpperArm', 0, -0.15, 1.18) // drop right arm to side
    poseBone('Bip001 L Forearm', 0, 0.35, 0.12) // slight elbow bend
    poseBone('Bip001 R Forearm', 0, -0.35, -0.12)

    c.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const name = obj.name
      // keep only the highest-detail LOD; hide the rest + the low mesh
      if (/_NLOD[1-9]/.test(name) || /Lowmesh/i.test(name)) {
        obj.visible = false
        return
      }
      obj.castShadow = false
      obj.receiveShadow = false

      let mat: THREE.MeshStandardMaterial
      if (name.startsWith('SungJinWoo_Eye')) {
        // glowing hunter eyes
        mat = new THREE.MeshStandardMaterial({ color: '#dff3ff', emissive: new THREE.Color('#8b3bff'), emissiveIntensity: 2.4, toneMapped: false })
        eyeMats.current.push(mat)
      } else if (name.startsWith('_Face')) {
        mat = new THREE.MeshStandardMaterial({ map: faceCO, roughness: 0.62, metalness: 0.05 })
        injectRim(mat, rims.current)
      } else if (name.startsWith('SungJinWoo_Hair')) {
        mat = new THREE.MeshStandardMaterial({ map: hairCO, roughness: 0.5, metalness: 0.2 })
        injectRim(mat, rims.current)
      } else {
        // body / coat
        mat = new THREE.MeshStandardMaterial({ map: bodyCO, normalMap: bodyNM, roughness: 0.55, metalness: 0.25 })
        injectRim(mat, rims.current)
      }
      obj.material = mat
    })

    // Measure inside a throwaway scene so every descendant's world matrix updates.
    const measure = () => {
      const probe = new THREE.Scene()
      probe.add(c)
      probe.updateMatrixWorld(true)
      const b = new THREE.Box3().setFromObject(c)
      probe.remove(c)
      return b
    }
    // Model is already Y-up. Scale so it's ~2.3 tall and plant feet at y = -1.0.
    let box = measure()
    const size = box.getSize(new THREE.Vector3())
    const sc = 2.3 / (size.y || 1)
    c.scale.setScalar(sc)
    box = measure()
    const ctr = box.getCenter(new THREE.Vector3())
    c.position.x -= ctr.x
    c.position.z -= ctr.z
    c.position.y -= box.min.y + 1.0
    return c
  }, [scene, bodyCO, bodyNM, faceCO, hairCO])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const p = decay(pulse, 0.06)
    const flick = corrupt > 0.5 ? 1 + Math.sin(time * 22) * 0.08 * corrupt : 1

    if (root.current) {
      root.current.position.y = Math.sin(time * 1.3) * 0.04
      root.current.rotation.y = Math.sin(time * 0.6) * 0.04
      root.current.rotation.z = Math.sin(time * 0.9) * 0.012
      root.current.scale.setScalar(cfg.scale * (1 + p * 0.06))
    }
    for (const u of rims.current) {
      u.uRimColor.value.set(glow)
      u.uRimStr.value = 1.4 * flick * cfg.aura * (1 + p * 3)
    }
    for (const m of eyeMats.current) {
      m.emissive.set(glow)
      m.emissiveIntensity = cfg.eye * flick * (1 + Math.sin(time * 3) * 0.2) + p * 6
    }
  })

  return <group ref={root}><primitive object={cloned} /></group>
}

useGLTF.preload(GLB, '/draco/')
