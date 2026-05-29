import { motion, type MotionValue, useTransform } from 'framer-motion'
import Particles from './Particles'

interface Props {
  hue?: number
  corrupt?: boolean
  px: MotionValue<number>
  py: MotionValue<number>
  accent?: string
}

/**
 * Full-screen layered atmosphere:
 * animated gradient → grid → ambient energy → crawling fog → particles → scanlines → vignette.
 */
export default function Atmosphere({ hue = 268, corrupt = false, px, py, accent = '#6a00ff' }: Props) {
  const bgX = useTransform(px, (v) => v * -14)
  const bgY = useTransform(py, (v) => v * -14)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* animated gradient base (parallax) */}
      <motion.div className="absolute inset-[-12%]" style={{ x: bgX, y: bgY }} aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: corrupt
              ? 'radial-gradient(1100px 760px at 50% -8%, #2a0612 0%, #0a0308 46%, #050308 100%)'
              : `radial-gradient(1100px 760px at 50% -8%, ${accent}22 0%, #0a0613 46%, #050308 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(106,0,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(106,0,255,.10) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            transform: 'perspective(620px) rotateX(64deg) translateY(-6%)',
            maskImage: 'radial-gradient(ellipse at 50% 28%, #000 12%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 28%, #000 12%, transparent 72%)',
          }}
        />
      </motion.div>

      {/* ambient energy blooms */}
      <motion.div
        className="absolute left-[-18%] top-[8%] h-[520px] w-[520px] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(circle, ${corrupt ? '#ff2d5e' : accent}, transparent 65%)` }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[4%] right-[-18%] h-[460px] w-[460px] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(circle, ${corrupt ? '#7a0a2a' : '#1f5bff'}, transparent 65%)` }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* crawling fog */}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            'radial-gradient(700px 360px at 18% 82%, rgba(46,12,96,.55), transparent 70%), radial-gradient(620px 320px at 82% 22%, rgba(12,34,96,.4), transparent 70%)',
        }}
        animate={{ x: [0, 50, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* particles */}
      <Particles density={1} hue={hue} corrupt={corrupt} />

      {/* scanlines + vignette */}
      <div className="scanlines absolute inset-0" />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 160px rgba(0,0,0,.85)' }} />
    </div>
  )
}
