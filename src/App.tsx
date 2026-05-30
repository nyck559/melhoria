import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParallax } from './hooks/useParallax'
import { useAudio } from './hooks/useAudio'
import { useGame, useCorruption, useCoins } from './store/useGame'
import Atmosphere from './components/atmosphere/Atmosphere'
import BottomNav, { type ScreenKey } from './components/nav/BottomNav'
import FxOverlay from './components/hud/FxOverlay'
import Reminders from './components/hud/Reminders'
import PenaltyOverlay from './components/hud/PenaltyOverlay'
import StatusScreen from './screens/StatusScreen'
import QuestsScreen from './screens/QuestsScreen'
import SinsScreen from './screens/SinsScreen'
import ProfileScreen from './screens/ProfileScreen'
import LojaScreen from './screens/LojaScreen'
import ManageQuestsScreen from './screens/ManageQuestsScreen'

type View = ScreenKey | 'profile' | 'manage'

const NAV_KEYS: ScreenKey[] = ['inicio', 'missoes', 'recompensas', 'pecados']

export default function App() {
  const { x: px, y: py } = useParallax()
  const [view, setView] = useState<View>('inicio')
  const navKey: ScreenKey = NAV_KEYS.includes(view as ScreenKey) ? (view as ScreenKey) : 'inicio'

  // daily reset (covers fresh load and app left open past midnight)
  const checkDailyReset = useGame((s) => s.checkDailyReset)
  useEffect(() => {
    checkDailyReset()
    const iv = setInterval(checkDailyReset, 60_000)
    return () => clearInterval(iv)
  }, [checkDailyReset])

  const corruption = useCorruption()
  const coins = useCoins()
  const corrupt = corruption > 65
  const accent = corrupt ? '#ff2d5e' : '#8b3bff'
  const audio = useAudio()

  return (
    <div className="h-full w-full bg-void">
      <div className="relative h-full w-full overflow-hidden bg-void">
        {/* GLOBAL ATMOSPHERE */}
        <Atmosphere px={px} py={py} accent={accent} corrupt={corrupt} hue={corrupt ? 345 : 268} />

        {/* corruption vignette */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-40"
          animate={{ boxShadow: `inset 0 0 ${corruption * 1.8}px rgba(255,45,94,${corruption / 220})` }}
          transition={{ duration: 0.6 }}
        />

        {/* top mini HUD — coins + settings */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-end gap-2 px-4 pt-3">
          <button
            onClick={() => setView('recompensas')}
            className="glass font-num flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold"
            title="Abrir Recompensas"
          >
            <span className="text-gold">⬡ {coins.toLocaleString('pt-BR')}</span>
          </button>
          <button
            onClick={() => audio.toggle()}
            className="glass grid h-8 w-8 place-items-center rounded-full text-sm"
            style={{ color: audio.enabled ? '#46e0ff' : '#565273' }}
            title="Áudio ambiente"
          >
            {audio.enabled ? '🔊' : '🔈'}
          </button>
          <button onClick={() => setView('profile')} className="glass grid h-8 w-8 place-items-center rounded-full text-sm">
            ⚙
          </button>
        </div>

        {/* SCREENS */}
        <AnimatePresence>
          {view === 'inicio' && <StatusScreen key="inicio" px={px} py={py} />}
          {view === 'missoes' && <QuestsScreen key="missoes" onManage={() => setView('manage')} />}
          {view === 'recompensas' && <LojaScreen key="recompensas" onGoConfess={() => setView('pecados')} />}
          {view === 'pecados' && <SinsScreen key="pecados" />}
          {view === 'profile' && <ProfileScreen key="profile" />}
          {view === 'manage' && <ManageQuestsScreen key="manage" onBack={() => setView('missoes')} />}
        </AnimatePresence>

        {/* cinematic FX + reminders + penalty report */}
        <FxOverlay />
        <Reminders />
        <PenaltyOverlay />

        {/* BOTTOM NAV */}
        <BottomNav active={navKey} onChange={(k) => setView(k)} accent={accent} />
      </div>
    </div>
  )
}
