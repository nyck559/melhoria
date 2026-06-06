import { useState } from 'react'
import { useGame, useFaturamento } from '../store/useGame'
import { coinValue, brl } from '../data/game'
import { BlueButton } from './kit'

/** Convert coins into real money at the live rate (1 coin = R$0,10, grows with revenue). */
export default function ExchangeCard() {
  const coins = useGame((s) => s.coins)
  const exchanges = useGame((s) => s.exchanges)
  const exchangeCoins = useGame((s) => s.exchangeCoins)
  const faturamento = useFaturamento()
  const rate = coinValue(faturamento)

  const [amount, setAmount] = useState('')
  const n = Math.min(coins, Math.max(0, Math.floor(Number(amount) || 0)))
  const valor = n * rate

  const trade = () => {
    if (n <= 0) return
    exchangeCoins(n)
    setAmount('')
  }

  return (
    <div className="card mb-3 p-4" style={{ borderColor: 'rgba(95,208,138,.35)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">💵</span>
        <span className="text-[14px] font-semibold">Trocar moedas por dinheiro</span>
      </div>
      <div className="mt-1 text-[12px] text-muted">
        1 moeda = <b className="text-good">{brl(rate)}</b> · suas {coins.toLocaleString('pt-BR')} moedas valem <b className="text-good">{brl(coins * rate)}</b>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Qtd. de moedas"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none"
        />
        <div className="flex gap-1.5">
          {[100, 500].map((q) => (
            <button key={q} onClick={() => setAmount(String(Math.min(coins, q)))} className="rounded-lg border border-line bg-surface2 px-2.5 py-2 text-[12px] font-semibold text-muted">{q}</button>
          ))}
          <button onClick={() => setAmount(String(coins))} className="rounded-lg border border-line bg-surface2 px-2.5 py-2 text-[12px] font-semibold text-blue">Tudo</button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[13px]">
          Você recebe <b className="text-[16px] text-good">{brl(valor)}</b>
          {n > 0 && <span className="text-muted"> por {n} moedas</span>}
        </div>
        <BlueButton disabled={n <= 0} onClick={trade} className="!px-4 !py-2 !text-[13px]">Trocar</BlueButton>
      </div>

      {exchanges.length > 0 && (
        <div className="mt-3 border-t border-line pt-2">
          {exchanges.slice(0, 3).map((e) => (
            <div key={e.id} className="flex items-center gap-2 py-1 text-[12px]">
              <span>💵</span>
              <span className="flex-1 text-muted">{e.coins} moedas → <b className="text-good">{brl(e.valor)}</b></span>
              <span className="text-[11px] text-muted">{new Date(e.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
