import { motion } from 'framer-motion'
import { useDailyHistory } from '../../store/useGame'

/**
 * Minimal neon line chart of missions completed per day (last `days`).
 * Pure SVG — no chart lib, scales to its container.
 */
export default function DailyChart({ days = 7, accent = '#8b3bff' }: { days?: number; accent?: string }) {
  const data = useDailyHistory(days)
  const W = 320
  const H = 110
  const padX = 14
  const padY = 16
  const max = Math.max(3, ...data.map((d) => d.value))
  const stepX = (W - padX * 2) / Math.max(1, data.length - 1)
  const x = (i: number) => padX + i * stepX
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2)

  const pts = data.map((d, i) => [x(i), y(d.value)] as const)
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - padY} L${x(0).toFixed(1)},${H - padY} Z`
  const total = data.reduce((a, d) => a + d.value, 0)
  const todayVal = data[data.length - 1]?.value ?? 0
  const yesterdayVal = data[data.length - 2]?.value ?? 0
  const trend = todayVal - yesterdayVal

  return (
    <div className="glass rounded-2xl p-3">
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className="text-[10px] tracking-[3px] text-violet-soft/60">EVOLUÇÃO DIÁRIA</div>
          <div className="font-display text-glow text-2xl font-black">
            {todayVal} <span className="text-[12px] font-semibold text-violet-soft/60">missões hoje</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-num text-[11px]" style={{ color: trend >= 0 ? '#43ffb0' : '#ff5a7d' }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} vs ontem
          </div>
          <div className="text-[10px] text-violet-soft/45">{total} na semana</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
        <defs>
          <linearGradient id="dc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dc-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor="#46e0ff" />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="rgba(139,92,255,.18)" strokeWidth="1" />

        <motion.path d={area} fill="url(#dc-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#dc-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }}
        />

        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.6} fill={i === pts.length - 1 ? '#fff' : accent} style={{ filter: `drop-shadow(0 0 5px ${accent})` }} />
            <text x={p[0]} y={H - 4} textAnchor="middle" fontSize="8" fill="rgba(200,200,230,.5)">
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
