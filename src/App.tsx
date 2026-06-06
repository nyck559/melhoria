import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGame } from './store/useGame'
import BottomNav, { type ScreenKey } from './components/nav/BottomNav'
import GrowthScreen from './screens/GrowthScreen'
import ChecklistScreen from './screens/ChecklistScreen'
import RewardsScreen from './screens/RewardsScreen'

export default function App() {
  const [view, setView] = useState<ScreenKey>('crescimento')
  const checkDailyReset = useGame((s) => s.checkDailyReset)

  useEffect(() => {
    checkDailyReset()
    const iv = setInterval(checkDailyReset, 60_000)
    return () => clearInterval(iv)
  }, [checkDailyReset])

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      <AnimatePresence mode="wait">
        {view === 'crescimento' && <GrowthScreen key="crescimento" />}
        {view === 'checklist' && <ChecklistScreen key="checklist" />}
        {view === 'recompensas' && <RewardsScreen key="recompensas" />}
      </AnimatePresence>

      <BottomNav active={view} onChange={setView} />
    </div>
  )
}
