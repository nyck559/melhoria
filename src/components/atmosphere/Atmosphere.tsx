import type { MotionValue } from 'framer-motion'

interface Props {
  hue?: number
  corrupt?: boolean
  px?: MotionValue<number>
  py?: MotionValue<number>
  accent?: string
}

/**
 * STATIC layered atmosphere (no continuous animation — kept cheap for mobile):
 * gradient base + perspective grid + two soft glows + vignette.
 * Animation in the app is reserved for characters and dungeons only.
 */
export default function Atmosphere({ corrupt = false, accent = '#6a00ff' }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: corrupt
            ? 'radial-gradient(1100px 760px at 50% -8%, #2a0612 0%, #0a0308 46%, #050308 100%)'
            : `radial-gradient(1100px 760px at 50% -8%, ${accent}22 0%, #0a0613 46%, #050308 100%)`,
        }}
      />
      {/* perspective grid (static) */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(106,0,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(106,0,255,.10) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          transform: 'perspective(620px) rotateX(64deg) translateY(-6%)',
          maskImage: 'radial-gradient(ellipse at 50% 28%, #000 12%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 28%, #000 12%, transparent 72%)',
        }}
      />
      {/* soft static glows */}
      <div
        className="absolute left-[-18%] top-[8%] h-[420px] w-[420px] rounded-full blur-[90px] opacity-50"
        style={{ background: `radial-gradient(circle, ${corrupt ? '#ff2d5e' : accent}, transparent 65%)` }}
      />
      <div
        className="absolute bottom-[6%] right-[-18%] h-[380px] w-[380px] rounded-full blur-[90px] opacity-40"
        style={{ background: `radial-gradient(circle, ${corrupt ? '#7a0a2a' : '#1f5bff'}, transparent 65%)` }}
      />
      {/* vignette */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 160px rgba(0,0,0,.85)' }} />
    </div>
  )
}
