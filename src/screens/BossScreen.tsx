import { motion, type MotionValue, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { GlowButton, EnergyBar } from '../components/common/ui'
import { useAudio } from '../hooks/useAudio'
import { useGame } from '../store/useGame'
import type { BossReward } from '../types'

const base = import.meta.env.BASE_URL

/** Colossal illustrated boss splash — intimidating, with pulsing energy. */
function Colossus({ px, py }: { px?: MotionValue<number>; py?: MotionValue<number> }) {
  const fbX = useMotionValue(0)
  const fbY = useMotionValue(0)
  const x = useTransform(px ?? fbX, (v) => v * 14)
  const y = useTransform(py ?? fbY, (v) => v * 10)

  return (
    <motion.div style={{ x, y }} className="absolute inset-0">
      {/* threatening aura */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[80%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(106,0,255,.6), rgba(255,45,94,.22) 45%, transparent 70%)' }}
        animate={{ opacity: [0.5, 0.95, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative h-full w-full"
        animate={{ y: [0, -8, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={base + 'art/boss_iron.webp'}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none"
          style={{
            objectFit: 'contain',
            objectPosition: 'center top',
            filter: 'drop-shadow(0 10px 40px rgba(255,45,94,.45))',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 88%, transparent)',
            maskImage: 'linear-gradient(to bottom, #000 88%, transparent)',
          }}
        />
        {/* ominous red pulse wash */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: 'radial-gradient(50% 40% at 50% 35%, rgba(255,45,94,.25), transparent 70%)' }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        {/* rising embers */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute bottom-[12%] h-1.5 w-1.5 rounded-full"
            style={{ left: `${15 + ((i * 31) % 70)}%`, background: i % 2 ? '#ff5a7d' : '#8b3bff', boxShadow: '0 0 8px #ff5a7d' }}
            animate={{ y: [0, -260], opacity: [0, 1, 0] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function BossScreen({
  px,
  py,
  onBack,
  reward,
  name = 'Cavaleiro de Ferro',
}: {
  px: MotionValue<number>
  py: MotionValue<number>
  onBack: () => void
  reward: BossReward
  name?: string
}) {
  const play = useAudio((s) => s.play)
  const defeatBoss = useGame((s) => s.defeatBoss)
  const [shake, setShake] = useState(false)
  const [hp, setHp] = useState(100)
  const [defeated, setDefeated] = useState(false)

  const challenge = () => {
    if (defeated) return
    setShake(true)
    play('challenge')
    const nextHp = Math.max(0, hp - (40 + Math.floor(Math.random() * 25)))
    setHp(nextHp)
    setTimeout(() => setShake(false), 600)
    if (nextHp <= 0) {
      setDefeated(true)
      setTimeout(() => { defeatBoss(reward); play('levelup') }, 400)
    }
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={shake ? { duration: 0.5 } : { duration: 0.5 }}
    >
      {/* boss-specific dark-red atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 28%, rgba(255,45,94,.22), transparent 60%), radial-gradient(90% 70% at 50% 80%, rgba(106,0,255,.42), transparent 65%), linear-gradient(180deg,#0a0510,#05030a)',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'repeating-linear-gradient(0deg, rgba(255,45,94,.05) 0 2px, transparent 2px 5px)' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />

      <div className="relative z-10 flex items-center justify-between px-4 pt-12">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-xl border border-violet-glow/30 bg-black/40 text-2xl leading-none text-cold">
          ‹
        </button>
        <span className="font-display max-w-[60%] truncate rounded-full border border-corrupt/40 bg-corrupt/10 px-3 py-1.5 text-[10px] tracking-[2px] text-corrupt shadow-glow-corrupt">
          CHEFE · {name.toUpperCase()}
        </span>
      </div>

      <div className="relative z-0 h-[42%]">
        <Colossus px={px} py={py} />
      </div>

      <div className="relative z-10 mt-auto px-4 pb-28">
        <div className="text-center">
          <div className="font-display text-sm tracking-[5px] text-cold">CAVALEIRO DE</div>
          <motion.h2
            className="font-display bg-gradient-to-b from-white to-corrupt bg-clip-text text-[42px] font-black leading-none text-transparent"
            style={{ textShadow: '0 0 34px rgba(255,45,94,.6)' }}
            animate={{ textShadow: ['0 0 20px rgba(255,45,94,.5)', '0 0 44px rgba(255,45,94,.9)', '0 0 20px rgba(255,45,94,.5)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            FERRO
          </motion.h2>
        </div>

        <div className="mb-3 mt-3">
          <div className="font-num mb-1.5 flex justify-between text-[11px] font-bold tracking-wide text-cold">
            <span>HP</span>
            <span>{Math.round((hp / 100) * 184000).toLocaleString('pt-BR')} / 184.000</span>
          </div>
          <EnergyBar key={hp} value={hp} c1="#ff2d5e" c2="#ff7a3d" height={12} />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2.5">
          {[
            { k: 'XP', v: `+${reward.xp.toLocaleString('pt-BR')}` },
            { k: 'MOEDAS', v: `⬡ ${reward.coins}` },
            { k: 'CRISTAIS', v: `◆ ${reward.crystals}` },
          ].map((b) => (
            <div key={b.k} className="glass rounded-xl py-2.5 text-center">
              <div className="text-[8px] tracking-wide text-violet-soft/60">{b.k}</div>
              <div className="font-display mt-1 text-sm font-bold">{b.v}</div>
            </div>
          ))}
        </div>

        {defeated ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl border border-emerald/50 bg-emerald/10 py-4 text-center"
            style={{ boxShadow: '0 0 22px rgba(67,255,176,.4)' }}
          >
            <div className="font-display text-glow-cyan text-lg font-black text-emerald">VITÓRIA</div>
            <div className="mt-1 text-[11px] text-cold/80">Recompensas coletadas · toque ‹ para voltar</div>
          </motion.div>
        ) : (
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <GlowButton variant="danger" sound="challenge" onClick={challenge} className="w-full !py-4 text-base">
              DESAFIAR ⚔ {hp < 100 ? `· HP ${hp}%` : '-2'}
            </GlowButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
