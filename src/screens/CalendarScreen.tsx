import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Screen, PageTitle, CoinPill } from '../components/kit'
import { useGame } from '../store/useGame'
import { brl, coinValue } from '../data/game'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WD = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const pad = (n: number) => String(n).padStart(2, '0')
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

export default function CalendarScreen() {
  const daily = useGame((s) => s.daily)
  const redemptions = useGame((s) => s.redemptions)
  const coins = useGame((s) => s.coins)
  const incomes = useGame((s) => s.incomes)

  const now = new Date()
  const curY = now.getFullYear()
  const [y, setY] = useState(curY)
  const [m, setM] = useState(now.getMonth())
  const [sel, setSel] = useState<string | null>(keyOf(curY, now.getMonth(), now.getDate()))

  const years = Array.from({ length: 11 }, (_, i) => curY + i) // próximos 10 anos

  const valorMoeda = coinValue(incomes.reduce((a, i) => a + i.valor, 0))

  const redByDate = useMemo(() => {
    const map: Record<string, { icone: string; nome: string; custo: number }[]> = {}
    for (const r of redemptions) {
      const k = r.data.slice(0, 10)
      ;(map[k] ??= []).push({ icone: r.icone, nome: r.nome, custo: r.custo })
    }
    return map
  }, [redemptions])

  const first = new Date(y, m, 1).getDay()
  const daysIn = new Date(y, m + 1, 0).getDate()
  const todayKey = keyOf(curY, now.getMonth(), now.getDate())

  const shift = (delta: number) => {
    let nm = m + delta
    let ny = y
    if (nm < 0) { nm = 11; ny-- }
    if (nm > 11) { nm = 0; ny++ }
    if (ny < curY) return
    if (ny > curY + 10) return
    setY(ny); setM(nm)
  }

  const selDate = sel ? new Date(sel + 'T00:00:00') : null
  const selDay = sel ? daily[sel] : undefined
  const selRed = sel ? redByDate[sel] ?? [] : []
  const selWeekend = selDate ? selDate.getDay() === 0 || selDate.getDay() === 6 : false

  return (
    <Screen>
      <PageTitle title="Calendário" sub="Próximos 10 anos · recompensas no fim de semana" right={<CoinPill value={coins} />} />

      {/* month nav */}
      <div className="card flex items-center justify-between p-3">
        <button onClick={() => shift(-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted">‹</button>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold">{MESES[m]}</span>
          <select value={y} onChange={(e) => setY(Number(e.target.value))} className="rounded-lg border border-line bg-surface2 px-2 py-1 text-[14px] font-semibold text-text outline-none">
            {years.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
          </select>
        </div>
        <button onClick={() => shift(1)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted">›</button>
      </div>

      {/* weekday header */}
      <div className="mt-3 grid grid-cols-7 gap-1.5 px-0.5">
        {WD.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold" style={{ color: i === 0 || i === 6 ? 'var(--blue)' : 'var(--muted)' }}>{w}</div>
        ))}
      </div>

      {/* day grid */}
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: first }).map((_, i) => <div key={'b' + i} />)}
        {Array.from({ length: daysIn }).map((_, i) => {
          const d = i + 1
          const k = keyOf(y, m, d)
          const wd = new Date(y, m, d).getDay()
          const weekend = wd === 0 || wd === 6
          const isToday = k === todayKey
          const isSel = k === sel
          const act = daily[k]?.done ?? 0
          const hasRed = !!redByDate[k]
          return (
            <button
              key={k}
              onClick={() => setSel(k)}
              className="relative aspect-square rounded-xl border text-[13px] font-medium transition"
              style={{
                background: isSel ? 'var(--blue-deep)' : weekend ? 'rgba(91,156,255,.10)' : 'var(--surface)',
                borderColor: isToday ? 'var(--blue)' : isSel ? 'var(--blue-deep)' : 'var(--border)',
                color: isSel ? '#fff' : weekend ? 'var(--blue-soft)' : 'var(--text)',
              }}
            >
              {d}
              <span className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-0.5">
                {act > 0 && <span className="h-1 w-1 rounded-full" style={{ background: isSel ? '#fff' : 'var(--good)' }} />}
                {hasRed && <span className="text-[8px] leading-none">🎁</span>}
              </span>
            </button>
          )
        })}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={{ background: 'rgba(91,156,255,.18)' }} /> Fim de semana (recompensas)</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--good)' }} /> Tarefas feitas</span>
        <span className="flex items-center gap-1.5">🎁 Recompensa resgatada</span>
      </div>

      {/* selected day detail */}
      {selDate && (
        <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card mt-4 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold">{selDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: selWeekend ? 'rgba(95,208,138,.16)' : 'rgba(255,255,255,.06)', color: selWeekend ? 'var(--good)' : 'var(--muted)' }}>
              {selWeekend ? '🎉 Dia de recompensa' : 'Dia de foco'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="card-2 rounded-xl p-2.5 text-center">
              <div className="text-[18px] font-bold text-blue">{selDay?.done ?? 0}</div>
              <div className="text-[10px] text-muted">tarefas</div>
            </div>
            <div className="card-2 rounded-xl p-2.5 text-center">
              <div className="text-[18px] font-bold text-good">{selDay?.earned ?? 0}</div>
              <div className="text-[10px] text-muted">moedas ganhas</div>
            </div>
            <div className="card-2 rounded-xl p-2.5 text-center">
              <div className="text-[18px] font-bold text-bad">{selDay?.spent ?? 0}</div>
              <div className="text-[10px] text-muted">moedas gastas</div>
            </div>
          </div>

          {!!selDay?.earned && <div className="mt-2 text-[11px] text-muted">≈ {brl((selDay.earned) * valorMoeda)} em valor de moeda</div>}

          {selRed.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="text-[11px] uppercase tracking-wide text-muted">Recompensas resgatadas</div>
              {selRed.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span>{r.icone}</span><span className="flex-1 truncate">{r.nome}</span><span className="text-bad">-{r.custo}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Screen>
  )
}
