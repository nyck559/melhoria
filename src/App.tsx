import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParallax } from './hooks/useParallax'
import { useAudio } from './hooks/useAudio'
import { useGame, useLevelInfo, useCorruption, useCoins, useCrystals } from './store/useGame'
import { RANK_DATA, rankForLevel } from './data/game'
import type { BossReward } from './types'
import Atmosphere from './components/atmosphere/Atmosphere'
import BottomNav, { type ScreenKey } from './components/nav/BottomNav'
import FxOverlay from './components/hud/FxOverlay'
import Reminders from './components/hud/Reminders'
import PenaltyOverlay from './components/hud/PenaltyOverlay'
import StatusScreen from './screens/StatusScreen'
import QuestsScreen from './screens/QuestsScreen'
import HunterScreen from './screens/HunterScreen'
import DungeonsScreen from './screens/DungeonsScreen'
import BossScreen from './screens/BossScreen'
import SinsScreen from './screens/SinsScreen'
import RankScreen from './screens/RankScreen'
import ProfileScreen from './screens/ProfileScreen'
import LojaScreen from './screens/LojaScreen'
import ManageQuestsScreen from './screens/ManageQuestsScreen'

type View = ScreenKey | 'boss' | 'rank' | 'profile' | 'loja' | 'manage'

const NAV_KEYS: ScreenKey[] = ['status', 'quests', 'hunter', 'dungeons', 'sins']

export default function App() {
  const { x: px, y: py } = useParallax()
  const [view, setView] = useState<View>('status')
  const [boss, setBoss] = useState<{ reward: BossReward; name: string }>({
    reward: { xp: 1200, coins: 300, crystals: 1, attrs: { forca: 2, vitalidade: 1 } },
    name: 'Cavaleiro de Ferro',
  })
  const navKey: ScreenKey = NAV_KEYS.includes(view as ScreenKey) ? (view as ScreenKey) : 'status'

  // daily reset (covers fresh load and app left open past midnight)
  const checkDailyReset = useGame((s) => s.checkDailyReset)
  useEffect(() => {
    checkDailyReset()
    const iv = setInterval(checkDailyReset, 60_000)
    return () => clearInterval(iv)
  }, [checkDailyReset])

  const { level } = useLevelInfo()
  const corruption = useCorruption()
  const coins = useCoins()
  const crystals = useCrystals()
  const rank = rankForLevel(level)
  const rd = RANK_DATA[rank]
  const corrupt = corruption > 65
  const accent = corrupt ? '#ff2d5e' : rd.color
  const audio = useAudio()

  return (
    <div className="h-full w-full bg-void">
      {/* fullscreen root */}
      <div className="relative h-full w-full overflow-hidden bg-void">
        {/* GLOBAL ATMOSPHERE */}
        <Atmosphere px={px} py={py} accent={accent} corrupt={corrupt} hue={corrupt ? 345 : 268} />

        {/* corruption vignette */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-40"
          animate={{ boxShadow: `inset 0 0 ${corruption * 1.8}px rgba(255,45,94,${corruption / 220})` }}
          transition={{ duration: 0.6 }}
        />

        {/* top mini HUD */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-3">
          <button
            onClick={() => setView('rank')}
            className="glass flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ borderColor: `${rd.color}66` }}
          >
            <span className="font-display text-sm font-black" style={{ color: rd.color, textShadow: `0 0 12px ${rd.color}` }}>
              {rank}
            </span>
            <span className="text-[10px] tracking-wide text-cold/70">RANK</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('loja')}
              className="glass font-num flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold"
              title="Abrir Loja de Recompensas"
            >
              <span className="text-gold">⬡ {coins.toLocaleString('pt-BR')}</span>
              <span className="text-violet-soft">◆ {crystals}</span>
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
        </div>

        {/* SCREENS */}
        <AnimatePresence>
          {view === 'status' && <StatusScreen key="status" px={px} py={py} />}
          {view === 'quests' && <QuestsScreen key="quests" onManage={() => setView('manage')} />}
          {view === 'hunter' && <HunterScreen key="hunter" px={px} py={py} onOpenLoja={() => setView('loja')} />}
          {view === 'dungeons' && (
            <DungeonsScreen
              key="dungeons"
              onEnter={(reward, name) => { setBoss({ reward, name }); setView('boss') }}
            />
          )}
          {view === 'boss' && <BossScreen key="boss" px={px} py={py} reward={boss.reward} name={boss.name} onBack={() => setView('dungeons')} />}
          {view === 'sins' && <SinsScreen key="sins" />}
          {view === 'rank' && <RankScreen key="rank" />}
          {view === 'profile' && <ProfileScreen key="profile" onNav={(k) => setView(k)} />}
          {view === 'loja' && <LojaScreen key="loja" onBack={() => setView('hunter')} />}
          {view === 'manage' && <ManageQuestsScreen key="manage" onBack={() => setView('quests')} />}
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
