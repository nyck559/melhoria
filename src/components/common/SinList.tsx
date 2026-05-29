import { useGame } from '../../store/useGame'
import { useAudio } from '../../hooks/useAudio'
import { EnergyBar } from './ui'

/** Pecados list with a daily "não caí" (resisted) toggle that lowers the bar. */
export default function SinList() {
  const sins = useGame((s) => s.sins)
  const toggleResist = useGame((s) => s.toggleResist)
  const play = useAudio((s) => s.play)

  return (
    <div className="flex flex-col gap-2.5">
      {sins.map((s) => {
        const resisted = s.resistidoHoje
        return (
          <div
            key={s.id}
            className="relative overflow-hidden rounded-2xl border p-3"
            style={{
              borderColor: resisted ? 'rgba(67,255,176,.4)' : 'rgba(255,45,94,.25)',
              background: 'linear-gradient(160deg, rgba(26,8,16,.9), rgba(8,4,10,.94))',
            }}
          >
            <span
              className="absolute left-0 top-0 h-full w-[3px]"
              style={{ background: resisted ? '#43ffb0' : '#ff2d5e', boxShadow: `0 0 12px ${resisted ? '#43ffb0' : '#ff2d5e'}` }}
            />
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-lg"
                style={{
                  background: `radial-gradient(circle, ${resisted ? 'rgba(67,255,176,.2)' : 'rgba(255,45,94,.22)'}, transparent 70%)`,
                  border: `1px solid ${resisted ? '#43ffb0' : '#ff2d5e'}`,
                }}
              >
                {s.icone}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-sm font-bold">{s.nome}</span>
                  <span className="font-num text-[11px] font-bold" style={{ color: resisted ? '#43ffb0' : '#ff2d5e' }}>
                    {s.corrupcao}%
                  </span>
                </div>
                <div className="text-[10px] text-violet-soft/50">{s.descricao}</div>
              </div>
              <button
                onClick={() => { toggleResist(s.id); play('ui') }}
                className="font-display flex-shrink-0 rounded-xl border px-3 py-2 text-[10px] font-bold tracking-wide transition"
                style={{
                  background: resisted ? 'linear-gradient(135deg, rgba(67,255,176,.35), rgba(45,212,255,.12))' : 'rgba(255,255,255,.04)',
                  borderColor: resisted ? '#43ffb0' : 'rgba(255,45,94,.4)',
                  color: resisted ? '#eafff5' : '#ff8aa0',
                  boxShadow: resisted ? '0 0 14px rgba(67,255,176,.4)' : 'none',
                }}
              >
                {resisted ? '✓ NÃO CAÍ' : 'NÃO CAÍ'}
              </button>
            </div>
            <div className="mt-2.5">
              <EnergyBar value={s.corrupcao} c1="#7a0a2a" c2={resisted ? '#43ffb0' : '#ff2d5e'} height={8} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
