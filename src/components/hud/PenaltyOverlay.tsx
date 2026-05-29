import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../../store/useGame'
import { GlowButton } from '../common/ui'

/** Cinematic "previous day penalty" report shown when missions were missed. */
export default function PenaltyOverlay() {
  const lastPenalty = useGame((s) => s.lastPenalty)
  const clearPenalty = useGame((s) => s.clearPenalty)

  return (
    <AnimatePresence>
      {lastPenalty && (
        <motion.div
          className="absolute inset-0 z-[80] grid place-items-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={clearPenalty} />
          <motion.div
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="relative w-full max-w-[340px] overflow-hidden rounded-3xl border border-corrupt/50 p-6 text-center"
            style={{
              background: 'radial-gradient(120% 100% at 50% 0%, rgba(255,45,94,.25), rgba(10,3,8,.95))',
              boxShadow: '0 0 50px rgba(255,45,94,.4)',
            }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              style={{ background: 'radial-gradient(circle at 50% 120%, rgba(255,45,94,.4), transparent 60%)' }}
            />
            <motion.div
              className="relative text-5xl"
              animate={{ scale: [1, 1.12, 1], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 18px #ff2d5e)' }}
            >
              ⚠
            </motion.div>
            <h2 className="font-display text-glow-corrupt mt-2 text-2xl font-black text-corrupt">PENALIDADE</h2>
            <p className="relative mt-1 text-[12px] text-cold/80">
              Você falhou <b className="text-white">{lastPenalty.missed}</b> {lastPenalty.missed === 1 ? 'missão' : 'missões'} ontem.
            </p>

            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-corrupt/30 bg-black/30 py-3">
                <div className="text-[9px] tracking-wide text-violet-soft/60">MOEDAS PERDIDAS</div>
                <div className="font-display mt-1 text-lg font-bold text-gold">-{lastPenalty.coins} ⬡</div>
              </div>
              <div className="rounded-xl border border-corrupt/30 bg-black/30 py-3">
                <div className="text-[9px] tracking-wide text-violet-soft/60">CORRUPÇÃO</div>
                <div className="font-display mt-1 text-lg font-bold text-corrupt">▲ +{lastPenalty.corruption}%</div>
              </div>
            </div>

            <div className="relative mt-5">
              <GlowButton variant="danger" onClick={clearPenalty} className="w-full">
                ENTENDIDO
              </GlowButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
