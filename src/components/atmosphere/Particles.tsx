import { useEffect, useRef } from 'react'

interface P {
  x: number; y: number; r: number; vx: number; vy: number; a: number; hue: number; life: number; max: number
}

interface Props {
  density?: number
  hue?: number // base hue; particles vary around it
  corrupt?: boolean
}

/** Canvas particle field: energy motes, drifting ash, occasional sparks. */
export default function Particles({ density = 1, hue = 268, corrupt = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let w = 0, h = 0, raf = 0
    let parts: P[] = []

    const baseHue = corrupt ? 345 : hue

    const spawn = (fromBottom = false): P => ({
      x: Math.random() * w,
      y: fromBottom ? h + 10 : Math.random() * h,
      r: Math.random() * 2.1 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.55 - 0.12,
      a: Math.random() * 0.55 + 0.15,
      hue: baseHue + (Math.random() * 40 - 20) * (Math.random() > 0.5 ? 1 : -1),
      life: 0,
      max: Math.random() * 400 + 200,
    })

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.floor((w * h) / 14000 * density)
      parts = Array.from({ length: count }, () => spawn())
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.life++
        const fade = 1 - p.life / p.max
        if (p.life > p.max || p.y < -20) Object.assign(p, spawn(true))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},100%,72%,${p.a * fade})`
        ctx.shadowBlur = 10
        ctx.shadowColor = `hsla(${p.hue},100%,60%,.9)`
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [density, hue, corrupt])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />
}
