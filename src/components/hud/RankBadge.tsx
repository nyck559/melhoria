import type { Rank } from '../../types'

interface Props {
  rank: Rank
  color: string
  size?: number
  rings?: boolean
}

export default function RankBadge({ rank, color, size = 120, rings = true }: Props) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* static glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{ background: `radial-gradient(circle, ${color}, transparent 65%)` }}
      />
      {rings && (
        <>
          <div className="absolute rounded-full border" style={{ inset: 2, borderColor: `${color}88`, borderStyle: 'dashed' }} />
          <div
            className="absolute rounded-full border-2"
            style={{ inset: size * 0.12, borderColor: `${color}55`, borderTopColor: color, borderRightColor: 'transparent' }}
          />
        </>
      )}
      <div
        className="relative grid place-items-center rounded-full"
        style={{
          inset: '24%',
          width: size * 0.62,
          height: size * 0.62,
          background: 'radial-gradient(circle at 50% 35%, rgba(26,17,52,.9), rgba(8,5,16,.95))',
          border: `1px solid ${color}66`,
          boxShadow: `0 0 24px ${color}66, inset 0 0 18px ${color}33`,
        }}
      >
        <span
          className="font-display font-black leading-none"
          style={{
            fontSize: size * (rank.length > 1 ? 0.3 : 0.46),
            color: '#fff',
            textShadow: `0 0 22px ${color}, 0 0 50px ${color}`,
          }}
        >
          {rank}
        </span>
      </div>
    </div>
  )
}
