import { Suspense, lazy } from 'react'
import type { Hunter3DProps } from '../character3d/Hunter3D'

/** Lazy entry point — the Three.js bundle is code-split out of the main chunk. */
const Inner = lazy(() => import('../character3d/Hunter3D'))

export type { Hunter3DProps }

export default function Hunter3D(props: Hunter3DProps) {
  return (
    <Suspense fallback={<div className={props.className} />}>
      <Inner {...props} />
    </Suspense>
  )
}
