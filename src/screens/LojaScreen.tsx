import Screen from '../components/common/Screen'
import { ScreenTitle } from '../components/common/ui'
import RewardsShop from '../components/common/RewardsShop'

export default function LojaScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <ScreenTitle
        title="LOJA"
        sub="Recompensas da vida real"
        right={
          <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-xl border border-violet-glow/30 bg-white/5 text-xl leading-none text-cold">
            ‹
          </button>
        }
      />
      <RewardsShop />
    </Screen>
  )
}
