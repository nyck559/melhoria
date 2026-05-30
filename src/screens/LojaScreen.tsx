import Screen from '../components/common/Screen'
import { ScreenTitle } from '../components/common/ui'
import RewardsShop from '../components/common/RewardsShop'

export default function LojaScreen({ onGoConfess }: { onGoConfess?: () => void }) {
  return (
    <Screen>
      <ScreenTitle title="RECOMPENSAS" sub="Conquiste com suas moedas" />
      <RewardsShop onGoConfess={onGoConfess} />
    </Screen>
  )
}
