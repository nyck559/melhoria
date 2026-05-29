import { motion } from 'framer-motion'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, GlowButton, EnergyBar } from '../components/common/ui'
import { useGame, useCorruption } from '../store/useGame'
import { useAudio } from '../hooks/useAudio'

export default function SinsScreen() {
  const sins = useGame((s) => s.sins)
  const setSin = useGame((s) => s.setSin)
  const resetSins = useGame((s) => s.resetSins)
  const corruption = useCorruption()
  const play = useAudio((s) => s.play)

  return (
    <Screen>
      <ScreenTitle
        title="PECADOS"
        sub="Corrupção interna"
        right={
          <GlowButton
            variant="danger"
            onClick={() => {
              resetSins()
              play('ui')
            }}
            className="!px-3 !py-2 text-[10px]"
          >
            RESETAR
          </GlowButton>
        }
      />

      {/* total corruption meter */}
      <motion.div
        className="relative mb-4 overflow-hidden rounded-2xl border p-4"
        style={{
          borderColor: `rgba(255,45,94,${0.2 + corruption / 200})`,
          background: `linear-gradient(160deg, rgba(40,6,18,.7), rgba(8,3,8,.8))`,
          boxShadow: `inset 0 0 ${corruption}px rgba(255,45,94,${corruption / 200})`,
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle at 50% 120%, rgba(255,45,94,.4), transparent 60%)' }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[3px] text-corrupt/80">CORRUPÇÃO TOTAL</div>
            <div className="font-display text-glow-corrupt text-4xl font-black text-corrupt">{corruption}%</div>
          </div>
          <motion.span
            className="text-5xl"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 ${corruption / 5}px #ff2d5e)` }}
          >
            👁
          </motion.span>
        </div>
        <div className="relative mt-3">
          <EnergyBar value={corruption} c1="#7a0a2a" c2="#ff2d5e" height={10} />
        </div>
        {corruption > 65 && (
          <motion.div
            className="relative mt-2 text-[11px] text-corrupt"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ⚠ ALTA CORRUPÇÃO · sua aura está sendo consumida
          </motion.div>
        )}
      </motion.div>

      <SectionLabel>FRAQUEZAS INTERNAS</SectionLabel>
      <div className="flex flex-col gap-3">
        {sins.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-corrupt/20 bg-gradient-to-br from-[#1a0610]/70 to-[#0a0308]/70 p-3 backdrop-blur"
          >
            <span
              className="absolute left-0 top-0 h-full w-[3px]"
              style={{ background: '#ff2d5e', boxShadow: `0 0 14px rgba(255,45,94,${s.corrupcao / 100})` }}
            />
            <div className="flex items-center gap-3">
              <motion.span
                className="grid h-11 w-11 place-items-center rounded-full text-xl"
                style={{
                  background: `radial-gradient(circle, rgba(255,45,94,${0.2 + s.corrupcao / 200}), transparent 70%)`,
                  border: '1px solid rgba(255,45,94,.5)',
                  boxShadow: `0 0 ${s.corrupcao / 5}px rgba(255,45,94,.5)`,
                }}
                animate={s.corrupcao > 50 ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {s.icone}
              </motion.span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-sm font-bold">{s.nome}</span>
                  <span className="font-num text-[11px] font-bold text-corrupt">NÍVEL {s.nivel}</span>
                </div>
                <div className="text-[10px] text-violet-soft/50">{s.descricao}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={s.corrupcao}
                onChange={(e) => setSin(s.id, +e.target.value)}
                className="sin-range flex-1"
                style={{ accentColor: '#ff2d5e' }}
              />
              <span className="font-num w-10 text-right text-xs font-bold text-corrupt">{s.corrupcao}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .sin-range { height: 4px; border-radius: 99px; background: rgba(255,45,94,.18); }
      `}</style>
    </Screen>
  )
}
