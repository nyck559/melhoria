import { motion } from 'framer-motion'

const BLUE = '#5b9cff'
const GRID = 'rgba(255,255,255,.07)'
const AXIS = 'rgba(255,255,255,.35)'

export interface Pt { label: string; value: number }
export interface Series { name: string; color: string; values: number[] }

/* ------------------------------- Line chart ------------------------------- */
export function LineChart({
  labels,
  series,
  height = 150,
  area = true,
  yMax,
  suffix = '',
}: {
  labels: string[]
  series: Series[]
  height?: number
  area?: boolean
  yMax?: number
  suffix?: string
}) {
  const W = 320
  const H = height
  const padL = 26
  const padR = 10
  const padT = 12
  const padB = 20
  const n = labels.length
  const max = Math.max(1, yMax ?? Math.max(...series.flatMap((s) => s.values), 1))
  const stepX = (W - padL - padR) / Math.max(1, n - 1)
  const x = (i: number) => padL + i * stepX
  const y = (v: number) => H - padB - (v / max) * (H - padT - padB)
  const ticks = 4

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = (max / ticks) * i
        return (
          <g key={i}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 4} y={y(v) + 3} textAnchor="end" fontSize="7.5" fill={AXIS}>
              {Math.round(v)}{suffix}
            </text>
          </g>
        )
      })}

      {series.map((s, si) => {
        const pts = s.values.map((v, i) => [x(i), y(v)] as const)
        const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
        const areaPath = `${line} L${x(n - 1)},${H - padB} L${x(0)},${H - padB} Z`
        return (
          <g key={s.name}>
            {area && si === 0 && (
              <>
                <defs>
                  <linearGradient id={`area-${si}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#area-${si})`} />
              </>
            )}
            <motion.path
              d={line}
              fill="none"
              stroke={s.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 ? 3 : 2} fill={s.color} />
            ))}
          </g>
        )
      })}

      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="7.5" fill={AXIS}>
          {l}
        </text>
      ))}
    </svg>
  )
}

/* ------------------------------- Bar chart ------------------------------- */
export function BarChart({ labels, values, color = BLUE, height = 150, suffix = '' }: { labels: string[]; values: number[]; color?: string; height?: number; suffix?: string }) {
  const W = 320
  const H = height
  const padL = 26
  const padB = 20
  const padT = 12
  const max = Math.max(1, ...values)
  const slot = (W - padL - 10) / values.length
  const bw = Math.min(26, slot * 0.6)
  const y = (v: number) => H - padB - (v / max) * (H - padT - padB)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const v = (max / 4) * i
        return <line key={i} x1={padL} y1={y(v)} x2={W - 10} y2={y(v)} stroke={GRID} strokeWidth="1" />
      })}
      {values.map((v, i) => {
        const cx = padL + slot * i + slot / 2
        return (
          <g key={i}>
            <motion.rect
              x={cx - bw / 2}
              width={bw}
              rx={3}
              initial={{ height: 0, y: H - padB }}
              animate={{ height: Math.max(0, H - padB - y(v)), y: y(v) }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              fill={color}
              opacity={0.9}
            />
            <text x={cx} y={y(v) - 3} textAnchor="middle" fontSize="7.5" fill={AXIS}>{v > 0 ? v + suffix : ''}</text>
            <text x={cx} y={H - 6} textAnchor="middle" fontSize="7.5" fill={AXIS}>{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* --------------------------- Grouped bar chart --------------------------- */
export function GroupedBars({ labels, series, height = 150 }: { labels: string[]; series: Series[]; height?: number }) {
  const W = 320
  const H = height
  const padL = 26
  const padB = 20
  const padT = 12
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const slot = (W - padL - 10) / labels.length
  const bw = Math.min(12, (slot * 0.62) / series.length)
  const y = (v: number) => H - padB - (v / max) * (H - padT - padB)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const v = (max / 4) * i
        return <line key={i} x1={padL} y1={y(v)} x2={W - 10} y2={y(v)} stroke={GRID} strokeWidth="1" />
      })}
      {labels.map((l, i) => {
        const groupX = padL + slot * i + slot / 2
        const totalW = bw * series.length + 2 * (series.length - 1)
        return (
          <g key={i}>
            {series.map((s, si) => {
              const v = s.values[i] ?? 0
              const bx = groupX - totalW / 2 + si * (bw + 2)
              return (
                <motion.rect
                  key={s.name}
                  x={bx}
                  width={bw}
                  rx={2}
                  initial={{ height: 0, y: H - padB }}
                  animate={{ height: Math.max(0, H - padB - y(v)), y: y(v) }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  fill={s.color}
                />
              )
            })}
            <text x={groupX} y={H - 6} textAnchor="middle" fontSize="7.5" fill={AXIS}>{l}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------- Donut ------------------------------- */
export function Donut({ data, size = 150, thickness = 22, centerLabel, centerValue }: { data: { label: string; value: number; color: string }[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total
          const len = frac * circ
          const el = (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
        {centerValue && <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="700" fill="#ecebe4">{centerValue}</text>}
        {centerLabel && <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fill={AXIS}>{centerLabel}</text>}
      </svg>
      <div className="flex flex-1 flex-col gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-[11px]">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 truncate text-muted">{d.label}</span>
            <span className="font-semibold text-text">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------- Radar ------------------------------- */
export function Radar({ axes, color = BLUE, size = 200, max = 100 }: { axes: { label: string; value: number }[]; color?: string; size?: number; max?: number }) {
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 26
  const n = axes.length
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (i: number, v: number) => [cx + Math.cos(ang(i)) * R * (v / max), cy + Math.sin(ang(i)) * R * (v / max)] as const
  const poly = axes.map((a, i) => pt(i, a.value).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ height: size }}>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon
          key={i}
          points={axes.map((_, j) => [cx + Math.cos(ang(j)) * R * f, cy + Math.sin(ang(j)) * R * f].join(',')).join(' ')}
          fill="none"
          stroke={GRID}
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [ex, ey] = [cx + Math.cos(ang(i)) * R, cy + Math.sin(ang(i)) * R]
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke={GRID} strokeWidth="1" />
      })}
      <motion.polygon points={poly} fill={`${color}33`} stroke={color} strokeWidth="2" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: 'center' }} />
      {axes.map((a, i) => {
        const [lx, ly] = [cx + Math.cos(ang(i)) * (R + 14), cy + Math.sin(ang(i)) * (R + 14)]
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" fontSize="8" fill={AXIS} dominantBaseline="middle">
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
