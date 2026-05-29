import { useEffect } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

export interface Parallax {
  x: MotionValue<number>
  y: MotionValue<number>
}

/**
 * Pointer + device-orientation parallax source, smoothed with a spring.
 * Returns normalized -1..1 motion values. Multiply by a depth factor per layer.
 */
export function useParallax(): Parallax {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.6 })

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      rawX.set(nx)
      rawY.set(ny)
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      rawX.set(Math.max(-1, Math.min(1, e.gamma / 35)))
      rawY.set(Math.max(-1, Math.min(1, (e.beta - 45) / 35)))
    }

    window.addEventListener('pointermove', onPointer)
    window.addEventListener('deviceorientation', onOrient)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [rawX, rawY])

  return { x, y }
}
