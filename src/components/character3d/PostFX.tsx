import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Glitch, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import { useMemo } from 'react'
import { Vector2 } from 'three'

interface Props {
  bloom: number
  corrupt: number // 0..1
  dof?: boolean // depth-of-field is the heaviest pass — off on low-end
}

/**
 * Cinematic post stack. Always: bloom + chromatic aberration + vignette.
 * Corruption adds film-grain noise and a sporadic digital glitch.
 * Depth-of-field is gated behind `dof` for Android performance.
 */
export default function PostFX({ bloom, corrupt, dof = true }: Props) {
  const ca = useMemo(() => new Vector2(0.0006 + corrupt * 0.0022, 0.0004 + corrupt * 0.0016), [corrupt])
  const glitchDelay = useMemo(() => new Vector2(2.5, 5), [])
  const glitchDur = useMemo(() => new Vector2(0.1, 0.3), [])
  const glitchStr = useMemo(() => new Vector2(0.2, 0.5), [])

  return (
    <EffectComposer multisampling={0}>
      {dof ? (
        <DepthOfField focusDistance={0.015} focalLength={0.06} bokehScale={2.2} />
      ) : (
        <></>
      )}
      <Bloom intensity={bloom} luminanceThreshold={0.2} luminanceSmoothing={0.5} mipmapBlur radius={0.72} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={ca} radialModulation modulationOffset={0.35} />
      {corrupt > 0.2 ? <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={corrupt * 0.35} /> : <></>}
      {corrupt > 0.55 ? (
        <Glitch delay={glitchDelay} duration={glitchDur} strength={glitchStr} mode={GlitchMode.SPORADIC} active ratio={0.85} />
      ) : (
        <></>
      )}
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  )
}
