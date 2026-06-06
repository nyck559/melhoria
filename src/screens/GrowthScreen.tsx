import { useState } from 'react'
import { Screen, PageTitle, CoinPill, SegTabs, Stat, SectionTitle } from '../components/kit'
import { LineChart, BarChart, GroupedBars, Donut, Radar } from '../components/charts'
import { useGame, lastDays, localToday } from '../store/useGame'
import { BLUE, BLUE_DEEP, GOOD, BAD, REWARD_CATEGORIES } from '../data/game'
import type { RewardCategory } from '../types'

type Tab = 'geral' | 'pecados' | 'financas'
type Period = 7 | 14 | 30

/** Blank out crowded x-labels, keeping ~8 visible. */
function thin(labels: string[]): string[] {
  const keep = Math.ceil(labels.length / 8)
  return labels.map((l, i) => (i % keep === 0 || i === labels.length - 1 ? l : ''))
}

export default function GrowthScreen() {
  const [tab, setTab] = useState<Tab>('geral')
  const [period, setPeriod] = useState<Period>(7)

  const daily = useGame((s) => s.daily)
  const sinDaily = useGame((s) => s.sinDaily)
  const sins = useGame((s) => s.sins)
  const rewards = useGame((s) => s.rewards)
  const redemptions = useGame((s) => s.redemptions)
  const coins = useGame((s) => s.coins)
  const logSin = useGame((s) => s.logSin)

  const days = lastDays(period)
  const labels = thin(days.map((d) => d.label))

  return (
    <Screen>
      <PageTitle title="Crescimento" sub="Acompanhe sua evolução" right={<CoinPill value={coins} />} />

      <SegTabs
        value={tab}
        onChange={setTab}
        options={[{ value: 'geral', label: 'Geral' }, { value: 'pecados', label: 'Pecados' }, { value: 'financas', label: 'Finanças' }]}
      />

      <div className="mt-3">
        <SegTabs value={String(period)} onChange={(v) => setPeriod(Number(v) as Period)} options={[{ value: '7', label: '7 dias' }, { value: '14', label: '14 dias' }, { value: '30', label: '30 dias' }]} />
      </div>

      {tab === 'geral' && <Geral days={days} labels={labels} daily={daily} />}
      {tab === 'pecados' && <Pecados days={days} labels={labels} sins={sins} sinDaily={sinDaily} onLog={logSin} />}
      {tab === 'financas' && <Financas days={days} labels={labels} daily={daily} coins={coins} rewards={rewards} redemptions={redemptions} />}
    </Screen>
  )
}

/* ------------------------------- GERAL ------------------------------- */
function Geral({ days, labels, daily }: { days: ReturnType<typeof lastDays>; labels: string[]; daily: Record<string, { done: number; earned: number; spent: number }> }) {
  const done = days.map((d) => daily[d.date]?.done ?? 0)
  const earned = days.map((d) => daily[d.date]?.earned ?? 0)
  const todayDone = daily[localToday()]?.done ?? 0
  const totalDone = done.reduce((a, b) => a + b, 0)

  let streak = 0
  for (let i = done.length - 1; i >= 0; i--) {
    if (done[i] > 0) streak++
    else break
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Hoje" value={todayDone} accent={BLUE} />
        <Stat label="Sequência" value={`${streak}d`} accent={GOOD} />
        <Stat label="No período" value={totalDone} />
      </div>

      <SectionTitle>Tarefas concluídas por dia</SectionTitle>
      <div className="card p-3"><LineChart labels={labels} series={[{ name: 'tarefas', color: BLUE, values: done }]} /></div>

      <SectionTitle>Moedas ganhas por dia</SectionTitle>
      <div className="card p-3"><BarChart labels={labels} values={earned} color={BLUE_DEEP} /></div>
    </>
  )
}

/* ------------------------------- PECADOS ------------------------------- */
function Pecados({
  days,
  labels,
  sins,
  sinDaily,
  onLog,
}: {
  days: ReturnType<typeof lastDays>
  labels: string[]
  sins: { id: string; nome: string; icone: string; corrupcao: number }[]
  sinDaily: Record<string, Record<string, { resisted: number; fell: number }>>
  onLog: (id: string, kind: 'resisted' | 'fell') => void
}) {
  const get = (date: string, id: string) => sinDaily[date]?.[id] ?? { resisted: 0, fell: 0 }
  const lux = 's-luxuria'
  const luxFell = days.map((d) => get(d.date, lux).fell)
  const luxResistTotal = days.reduce((a, d) => a + get(d.date, lux).resisted, 0)
  const luxFellTotal = luxFell.reduce((a, b) => a + b, 0)

  const fellPerSin = sins.map((s) => ({ sin: s, total: days.reduce((a, d) => a + get(d.date, s.id).fell, 0) }))

  return (
    <>
      {/* quick log */}
      <SectionTitle>Registrar hoje</SectionTitle>
      <div className="flex flex-col gap-2">
        {sins.map((s) => (
          <div key={s.id} className="card flex items-center gap-3 p-2.5">
            <span className="text-[18px]">{s.icone}</span>
            <span className="flex-1 text-[13px] font-medium">{s.nome}</span>
            <button onClick={() => onLog(s.id, 'resisted')} className="rounded-lg px-3 py-1.5 text-[11px] font-semibold" style={{ background: 'rgba(95,208,138,.14)', color: GOOD, border: '1px solid rgba(95,208,138,.3)' }}>Resisti</button>
            <button onClick={() => onLog(s.id, 'fell')} className="rounded-lg px-3 py-1.5 text-[11px] font-semibold" style={{ background: 'rgba(240,114,106,.14)', color: BAD, border: '1px solid rgba(240,114,106,.3)' }}>Caí</button>
          </div>
        ))}
      </div>

      {/* Luxúria — two dedicated charts */}
      <SectionTitle>🔥 Luxúria</SectionTitle>
      <div className="card p-3">
        <div className="mb-1 text-[12px] font-semibold text-muted">Recaídas por dia</div>
        <LineChart labels={labels} series={[{ name: 'lux', color: BAD, values: luxFell }]} />
      </div>
      <div className="card mt-2 p-3">
        <div className="mb-2 text-[12px] font-semibold text-muted">Resistências vs recaídas (período)</div>
        <Donut
          data={[{ label: 'Resisti', value: luxResistTotal, color: GOOD }, { label: 'Caí', value: luxFellTotal, color: BAD }]}
          centerValue={`${Math.round((luxResistTotal / Math.max(1, luxResistTotal + luxFellTotal)) * 100)}%`}
          centerLabel="resistência"
        />
      </div>

      {/* all sins */}
      <SectionTitle>Recaídas por pecado</SectionTitle>
      <div className="card p-3"><BarChart labels={fellPerSin.map((f) => f.sin.icone)} values={fellPerSin.map((f) => f.total)} color={BAD} /></div>

      <SectionTitle>Corrupção atual</SectionTitle>
      <div className="card p-3"><Radar axes={sins.map((s) => ({ label: s.icone, value: s.corrupcao }))} color={BAD} max={100} /></div>
    </>
  )
}

/* ------------------------------- FINANÇAS ------------------------------- */
function Financas({
  days,
  labels,
  daily,
  coins,
  rewards,
  redemptions,
}: {
  days: ReturnType<typeof lastDays>
  labels: string[]
  daily: Record<string, { done: number; earned: number; spent: number }>
  coins: number
  rewards: { id: string; categoria: RewardCategory }[]
  redemptions: { rewardId: string; custo: number }[]
}) {
  const earned = days.map((d) => daily[d.date]?.earned ?? 0)
  const spent = days.map((d) => daily[d.date]?.spent ?? 0)
  const totalEarned = earned.reduce((a, b) => a + b, 0)
  const totalSpent = spent.reduce((a, b) => a + b, 0)

  // balance curve ending at the live coin total
  let bal = coins - days.reduce((a, d) => a + (daily[d.date]?.earned ?? 0) - (daily[d.date]?.spent ?? 0), 0)
  const balSeries = days.map((d) => {
    bal += (daily[d.date]?.earned ?? 0) - (daily[d.date]?.spent ?? 0)
    return Math.round(bal)
  })

  // spend grouped by category
  const byCat: Partial<Record<RewardCategory, number>> = {}
  for (const h of redemptions) {
    const cat = rewards.find((r) => r.id === h.rewardId)?.categoria ?? 'outro'
    byCat[cat] = (byCat[cat] ?? 0) + h.custo
  }
  const donutData = (Object.keys(byCat) as RewardCategory[])
    .map((c) => ({ label: REWARD_CATEGORIES[c].label, value: byCat[c] ?? 0, color: REWARD_CATEGORIES[c].color }))
    .sort((a, b) => b.value - a.value)

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Saldo" value={coins.toLocaleString('pt-BR')} accent={BLUE} />
        <Stat label="Ganho" value={totalEarned} accent={GOOD} />
        <Stat label="Gasto" value={totalSpent} accent={BAD} />
      </div>

      <SectionTitle>Saldo ao longo do tempo</SectionTitle>
      <div className="card p-3"><LineChart labels={labels} series={[{ name: 'saldo', color: BLUE, values: balSeries }]} /></div>

      <SectionTitle>Ganho vs gasto por dia</SectionTitle>
      <div className="card p-3">
        <GroupedBars labels={labels} series={[{ name: 'ganho', color: GOOD, values: earned }, { name: 'gasto', color: BAD, values: spent }]} />
        <div className="mt-2 flex justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: GOOD }} /> Ganho</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: BAD }} /> Gasto</span>
        </div>
      </div>

      <SectionTitle>Para onde foram as moedas</SectionTitle>
      <div className="card p-4">
        {donutData.length ? <Donut data={donutData} centerValue={String(totalSpent)} centerLabel="gasto" /> : <div className="py-4 text-center text-[13px] text-muted">Nenhuma recompensa resgatada ainda.</div>}
      </div>
    </>
  )
}
