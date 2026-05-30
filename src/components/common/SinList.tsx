import { useGame } from '../../store/useGame'
import { useAudio } from '../../hooks/useAudio'
import { EnergyBar } from './ui'

/**
 * Pecados list. Each sin has two daily actions:
 *  • RESISTI — lowers corruption (and clears any fall mark)
 *  • CAÍ — raises corruption and LOCKS the rewards shop until confession
 */
export default function SinList() {
  const sins = useGame((s) => s.sins)
  const toggleResist = useGame((s) => s.toggleResist)
  const fallSin = useGame((s) => s.fallSin)
  const play = useAudio((s) => s.play)

  return (
    <div className="flex flex-col gap-2.5">
      {sins.map((s) => {
        const resisted = s.resistidoHoje
        const fell = s.caiuHoje
        const edge = fell ? '#ff2d5e' : resisted ? '#43ffb0' : '#ff8a3d'
        return (
          <div
            key={s.id}
            className="relative overflow-hidden rounded-2xl border p-3"
            style={{
              borderColor: fell ? 'rgba(255,45,94,.5)' : resisted ? 'rgba(67,255,176,.4)' : 'rgba(255,138,61,.22)',
              background: 'linear-gradient(160deg, rgba(26,8,16,.9), rgba(8,4,10,.94))',
            }}
          >
            <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: edge, boxShadow: `0 0 12px ${edge}` }} />
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-lg"
                style={{ background: `radial-gradient(circle, ${edge}33, transparent 70%)`, border: `1px solid ${edge}` }}
              >
                {s.icone}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-sm font-bold">{s.nome}</span>
                  <span className="font-num text-[11px] font-bold" style={{ color: edge }}>
                    {s.corrupcao}%
                  </span>
                </div>
                <div className="text-[10px] text-violet-soft/50">{fell ? 'Você caiu — confesse para liberar recompensas' : s.descricao}</div>
              </div>
            </div>

            <div className="mt-2.5"><EnergyBar value={s.corrupcao} c1="#7a0a2a" c2={edge} height={8} /></div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                onClick={() => { toggleResist(s.id); play('ui') }}
                className="font-display rounded-xl border py-2 text-[10px] font-bold tracking-wide transition"
                style={{
                  background: resisted ? 'linear-gradient(135deg, rgba(67,255,176,.35), rgba(45,212,255,.12))' : 'rgba(255,255,255,.04)',
                  borderColor: resisted ? '#43ffb0' : 'rgba(67,255,176,.35)',
                  color: resisted ? '#eafff5' : '#9affd0',
                  boxShadow: resisted ? '0 0 14px rgba(67,255,176,.4)' : 'none',
                }}
              >
                {resisted ? '✓ RESISTI' : 'RESISTI'}
              </button>
              <button
                onClick={() => { fallSin(s.id); play('ui') }}
                className="font-display rounded-xl border py-2 text-[10px] font-bold tracking-wide transition"
                style={{
                  background: fell ? 'linear-gradient(135deg, rgba(255,45,94,.4), rgba(122,10,42,.2))' : 'rgba(255,255,255,.04)',
                  borderColor: fell ? '#ff2d5e' : 'rgba(255,45,94,.4)',
                  color: fell ? '#fff' : '#ff8aa0',
                  boxShadow: fell ? '0 0 14px rgba(255,45,94,.5)' : 'none',
                }}
              >
                {fell ? '✗ CAÍ' : 'CAÍ'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
