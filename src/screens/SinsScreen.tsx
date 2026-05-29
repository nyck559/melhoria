import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, GlowButton, EnergyBar } from '../components/common/ui'
import SinList from '../components/common/SinList'
import { useGame, useCorruption } from '../store/useGame'
import { useAudio } from '../hooks/useAudio'

export default function SinsScreen() {
  const resetSins = useGame((s) => s.resetSins)
  const corruption = useCorruption()
  const play = useAudio((s) => s.play)

  return (
    <Screen>
      <ScreenTitle
        title="PECADOS"
        sub="Corrupção interna"
        right={
          <GlowButton variant="danger" onClick={() => { resetSins(); play('ui') }} className="!px-3 !py-2 text-[10px]">
            RESETAR
          </GlowButton>
        }
      />

      {/* total corruption (static) */}
      <div
        className="relative mb-4 overflow-hidden rounded-2xl border p-4"
        style={{
          borderColor: `rgba(255,45,94,${0.2 + corruption / 200})`,
          background: 'linear-gradient(160deg, rgba(40,6,18,.85), rgba(8,3,8,.92))',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[3px] text-corrupt/80">CORRUPÇÃO TOTAL</div>
            <div className="font-display text-glow-corrupt text-4xl font-black text-corrupt">{corruption}%</div>
          </div>
          <span className="text-5xl" style={{ filter: `drop-shadow(0 0 ${corruption / 6}px #ff2d5e)` }}>👁</span>
        </div>
        <div className="mt-3">
          <EnergyBar value={corruption} c1="#7a0a2a" c2="#ff2d5e" height={10} />
        </div>
        <p className="mt-2 text-[10px] text-violet-soft/55">
          Marque <b className="text-emerald">NÃO CAÍ</b> nos pecados que resistiu hoje — a barra desce.
        </p>
      </div>

      <SectionLabel>FRAQUEZAS INTERNAS</SectionLabel>
      <SinList />
    </Screen>
  )
}
