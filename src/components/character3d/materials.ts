import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Dark PBR material with a fresnel rim-emissive injected into the shader so
 * silhouette edges catch the neon rim-light and glow under bloom.
 */
export function useRimMaterial(
  color: string,
  rim: string,
  rimStrength: number,
  opts?: Partial<THREE.MeshStandardMaterialParameters>,
) {
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

/** Pure additive-emissive material (energy trims, runes, cores) — ignores tone-mapping so it blooms hard. */
export function useEmissive(color: string, intensity: number) {
  return useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color(color), emissiveIntensity: intensity, toneMapped: false }),
    [color, intensity],
  )
}
