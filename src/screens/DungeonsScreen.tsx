import { motion } from 'framer-motion'
import { useState } from 'react'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel, GlowButton } from '../components/common/ui'
import { useAudio } from '../hooks/useAudio'

interface Dungeon {
  id: string
  name: string
  rank: string
  lv: string
  tags: string[]
  reward: string
  c1: string
  c2: string
  hue: number
  locked?: boolean
}

const DUNGEONS: Dungeon[] = [
  { id: 'ferro', name: 'Masmorra de Ferro', rank: 'C', lv: 'Lv. 18–24', tags: ['HORDA', '30 min'], reward: '◆ x2 · +1.2k XP', c1: '#9a6bff', c2: '#7a3bff', hue: 0 },
  { id: 'goblin', name: 'Caverna dos Goblins', rank: 'D', lv: 'Lv. 12–16', tags: ['SWARM', '20 min'], reward: '⬡ 500 · +800 XP', c1: '#46e0ff', c2: '#2a6bff', hue: 200 },
  { id: 'cristal', name: 'Portão de Cristal', rank: 'B', lv: 'Lv. 26–32', tags: ['ELITE', '45 min'], reward: '◆ x4 · +2.4k XP', c1: '#b98bff', c2: '#6a00ff', hue: 60 },
  { id: 'almas', name: 'Torre das Almas', rank: 'A', lv: 'Lv. 40+', tags: ['BOSS', '60 min'], reward: 'BLOQUEADO', c1: '#ff5a7d', c2: '#7a0a86', hue: 300, locked: true },
]

const base = import.meta.env.BASE_URL

function Portal({ c1, hue }: { c1: string; hue: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <img
        src={base + 'art/portal_gate.webp'}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
        style={{ filter: `hue-rotate(${hue}deg) saturate(1.15)` }}
      />
      {/* pulsing core glow */}
      <motion.div
        className="absolute left-1/2 top-[38%] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
        style={{ background: c1 }}
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="absolute inset-0 rounded-xl" style={{ boxShadow: `inset 0 0 16px ${c1}55` }} />
    </div>
  )
}

export default function DungeonsScreen({ onEnter }: { onEnter: (id: string) => void }) {
  const [seg, setSeg] = useState(0)
  const play = useAudio((s) => s.play)

  return (
    <Screen>
      <ScreenTitle title="MASMORRAS" sub="Entradas hoje · 5/5" />

      <div className="glass mb-4 flex gap-1.5 rounded-2xl p-1.5">
        {['MASMORRAS', 'BOSS', 'LOJA'].map((s, i) => (
          <button
            key={s}
            onClick={() => {
              setSeg(i)
              play('menu')
            }}
            className="font-display relative flex-1 rounded-xl py-2.5 text-[11px] font-bold tracking-wide"
            style={{ color: seg === i ? '#fff' : '#7d7aa0' }}
          >
            {seg === i && (
              <motion.span
                layoutId="seg"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-neon to-violet-deep shadow-glow"
              />
            )}
            <span className="relative">{s}</span>
          </button>
        ))}
      </div>

      <SectionLabel>PORTAIS ATIVOS</SectionLabel>
      <div className="flex flex-col gap-3">
        {DUNGEONS.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={!d.locked ? { scale: 1.015, boxShadow: `0 0 22px ${d.c1}66` } : {}}
            className={`glass relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 ${d.locked ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="h-[78px] w-[78px] flex-shrink-0">
              <Portal c1={d.c1} hue={d.hue} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold tracking-wide">{d.name}</div>
              <div className="my-1.5 flex flex-wrap gap-1.5">
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ color: d.c1, border: `1px solid ${d.c1}66`, background: `${d.c1}1a` }}>
                  RANK {d.rank}
                </span>
                {d.tags.map((t) => (
                  <span key={t} className="rounded-full border border-violet-glow/20 bg-violet-neon/10 px-2 py-0.5 text-[9px] text-cold">
                    {t}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-violet-soft/60">{d.lv}</div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {d.locked ? (
                <span className="text-[10px] tracking-wide text-violet-soft/50">🔒 Lv. 40</span>
              ) : (
                <>
                  <GlowButton sound="challenge" onClick={() => onEnter(d.id)} className="!px-4 !py-2 text-[10px]">
                    ENTRAR
                  </GlowButton>
                  <span className="text-[9px] text-violet-soft/60">{d.reward}</span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Screen>
  )
}
