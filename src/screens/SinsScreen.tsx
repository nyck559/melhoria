import { motion } from 'framer-motion'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, GlowButton, EnergyBar } from '../components/common/ui'
import SinList from '../components/common/SinList'
import { useGame, useCorruption, useSinBlocked } from '../store/useGame'
import { useAudio } from '../hooks/useAudio'

export default function SinsScreen() {
  const confess = useGame((s) => s.confess)
  const resetSins = useGame((s) => s.resetSins)
  const corruption = useCorruption()
  const blocked = useSinBlocked()
  const play = useAudio((s) => s.play)

  return (
    <Screen>
      <ScreenTitle
        title="PECADOS"
        sub="Confissão · Corrupção"
        right={
          <GlowButton variant="ghost" onClick={() => { resetSins(); play('ui') }} className="!px-3 !py-2 text-[10px]">
            RESETAR
          </GlowButton>
        }
      />

      {/* CONFESSION GATE */}
      {blocked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 overflow-hidden rounded-2xl border p-4"
          style={{ borderColor: 'rgba(255,45,94,.55)', background: 'linear-gradient(160deg, rgba(60,8,24,.9), rgba(12,4,10,.94))', boxShadow: '0 0 24px rgba(255,45,94,.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div className="flex-1">
              <div className="font-display text-sm font-black text-corrupt">RECOMPENSAS BLOQUEADAS</div>
              <div className="text-[11px] text-violet-soft/65">Você caiu em um pecado. Confesse para liberar a loja.</div>
            </div>
          </div>
          <GlowButton variant="primary" onClick={() => { confess(); play('levelup') }} className="mt-3 w-full">
            🕊 CONFESSAR E LIBERAR
          </GlowButton>
        </motion.div>
      )}

      {/* total corruption */}
      <div
        className="relative mb-4 overflow-hidden rounded-2xl border p-4"
        style={{ borderColor: `rgba(255,45,94,${0.2 + corruption / 200})`, background: 'linear-gradient(160deg, rgba(40,6,18,.85), rgba(8,3,8,.92))' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[3px] text-corrupt/80">CORRUPÇÃO TOTAL</div>
            <div className="font-display text-glow-corrupt text-4xl font-black text-corrupt">{corruption}%</div>
          </div>
          <span className="text-5xl" style={{ filter: `drop-shadow(0 0 ${corruption / 6}px #ff2d5e)` }}>👁</span>
        </div>
        <div className="mt-3"><EnergyBar value={corruption} c1="#7a0a2a" c2="#ff2d5e" height={10} /></div>
        <p className="mt-2 text-[10px] text-violet-soft/55">
          Marque <b className="text-emerald">RESISTI</b> para baixar a corrupção, ou <b className="text-corrupt">CAÍ</b> se cedeu — isso tranca as recompensas até a confissão.
        </p>
      </div>

      <SectionLabel>FRAQUEZAS INTERNAS</SectionLabel>
      <SinList />
    </Screen>
  )
}
