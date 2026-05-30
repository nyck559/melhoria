import { useThree, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useChar } from '../context'

/**
 * Hand-built cinematic camera (no OrbitControls so we can stack effects):
 *  • slow parallax that follows the pointer
 *  • a gentle dolly breathing in/out
 *  • punch-in zoom on rank-up / summon
 *  • positional shake on burst / rank-up events
 */
export default function CameraRig() {
  const { camera, pointer } = useThree()
  const { event } = useChar()
  const zoom = useRef(0) // 0 → resting, 1 → zoomed in
  const shake = useRef(0)
  const lastEvent = useRef(0)

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime

    // react to fresh cinematic events
    const ev = event.current
    if (ev.t !== lastEvent.current) {
      lastEvent.current = ev.t
      if (ev.type === 'rankup' || ev.type === 'summon') {
        zoom.current = 1
        shake.current = 1
      } else if (ev.type === 'burst' || ev.type === 'eyes') {
        shake.current = 0.6
      }
    }
    zoom.current += (0 - zoom.current) * Math.min(1, dt * 1.6)
    shake.current += (0 - shake.current) * Math.min(1, dt * 4)

    const baseZ = 4.6 - zoom.current * 0.9
    const baseY = 0.2 + Math.sin(time * 0.4) * 0.05
    const sx = (Math.random() - 0.5) * shake.current * 0.18
    const sy = (Math.random() - 0.5) * shake.current * 0.18

    // parallax — ease camera toward a small pointer-driven offset
    camera.position.x += (pointer.x * 0.5 + sx - camera.position.x) * Math.min(1, dt * 3)
    camera.position.y += (baseY + pointer.y * 0.3 + sy - camera.position.y) * Math.min(1, dt * 3)
    camera.position.z += (baseZ - camera.position.z) * Math.min(1, dt * 2)
    camera.lookAt(0, 0.05, 0)

    const cam = camera as THREE.PerspectiveCamera
    const targetFov = 32 - zoom.current * 4
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov += (targetFov - cam.fov) * Math.min(1, dt * 3)
      cam.updateProjectionMatrix()
    }
  })

  return null
}
