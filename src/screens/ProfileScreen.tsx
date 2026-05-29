import { motion } from 'framer-motion'
import Screen from '../components/common/Screen'
import { ScreenTitle, SectionLabel } from '../components/common/ui'
import { useGame, useLevelInfo, usePower } from '../store/useGame'
import { useAudio } from '../hooks/useAudio'
import { RANK_DATA, rankForLevel } from '../data/game'

export default function ProfileScreen({ onNav }: { onNav: (k: 'rank') => void }) {
  const { level } = useLevelInfo()
  const power = usePower()
  const rank = rankForLevel(level)
  const rd = RANK_DATA[rank]
  const resetDay = useGame((s) => s.resetDay)
  const reminders = useGame((s) => s.reminders)
  const toggleReminders = useGame((s) => s.toggleReminders)
  const audio = useAudio()

  const onToggleReminders = () => {
    if (!reminders && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
    toggleReminders()
  }

  const rows = [
    { ico: '👤', name: 'Personalização', sub: 'Avatar, título, aura', arrow: true },
    { ico: '🏆', name: 'Ranking Global', sub: `Você é RANK ${rank}`, action: () => onNav('rank') },
    { ico: '⏰', name: 'Lembretes', sub: 'Alertas das missões no horário', toggle: true, on: reminders, action: onToggleReminders },
    { ico: '🔊', name: 'Som & Ambiente', sub: 'Drone, SFX do sistema', toggle: true, on: audio.enabled, action: () => audio.toggle() },
    { ico: '🔄', name: 'Resetar Dia', sub: 'Zerar quests de hoje', action: resetDay },
    { ico: '🌐', name: 'Idioma', sub: 'Português (BR)', arrow: true },
    { ico: '🛡', name: 'Privacidade & Dados', sub: 'Conta e segurança', arrow: true },
  ]

  return (
    <Screen>
      <ScreenTitle title="PERFIL" sub="Configurações do caçador" />

      <motion.div
        className="relative mb-5 overflow-hidden rounded-3xl border border-violet-glow/25 p-4 scanlines"
        style={{ background: `radial-gradient(120% 120% at 100% 0%, ${rd.color}33, transparent 60%), rgba(20,14,38,.55)` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 overflow-hidden rounded-2xl"
            style={{ border: `1px solid ${rd.color}66`, boxShadow: `0 0 20px ${rd.color}55` }}
          >
            <img
              src={`${import.meta.env.BASE_URL}art/hunter_dominant.webp`}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: 'center top' }}
            />
          </div>
          <div>
            <div className="font-display text-glow text-xl font-extrabold">Jin Woo</div>
            <div className="text-[11px] tracking-wide" style={{ color: rd.color }}>
              RANK {rank} · {rd.name}
            </div>
            <div className="font-num mt-1 text-[11px] text-violet-soft/60">Nível {level} · Poder {power.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </motion.div>

      <SectionLabel>SISTEMA</SectionLabel>
      <div className="flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <motion.button
            key={r.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.01, boxShadow: '0 0 18px rgba(106,0,255,.4)' }}
            onClick={r.action}
            className="glass flex items-center gap-3 rounded-2xl p-3.5 text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-violet-glow/20 bg-violet-neon/15 text-base text-violet-soft">
              {r.ico}
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold">{r.name}</div>
              <div className="text-[10px] text-violet-soft/55">{r.sub}</div>
            </div>
            {r.toggle ? (
              <span
                className="relative h-6 w-11 rounded-full border transition"
                style={{
                  background: r.on ? 'linear-gradient(90deg,#6a00ff,#3b82f6)' : 'rgba(255,255,255,.1)',
                  borderColor: r.on ? '#8b3bff' : 'rgba(139,92,255,.2)',
                  boxShadow: r.on ? '0 0 14px rgba(106,0,255,.6)' : 'none',
                }}
              >
                <motion.span
                  className="absolute top-0.5 rounded-full bg-white"
                  style={{ width: 18, height: 18 }}
                  animate={{ left: r.on ? 22 : 2 }}
                />
              </span>
            ) : (
              <span className="text-lg text-violet-soft/50">›</span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 text-center text-[10px] tracking-wide text-violet-soft/40">
        SISTEMA · Solo Leveling Life System · v1.0
      </div>
    </Screen>
  )
}
