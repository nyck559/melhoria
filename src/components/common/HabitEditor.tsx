import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { AttrKey, Category, Difficulty, Habit, Rarity } from '../../types'
import { ATTRS, ATTR_ORDER, CATEGORIES, DIFFICULTY, RARITY } from '../../data/game'
import { GlowButton } from './ui'

type Draft = Omit<Habit, 'id' | 'streak' | 'concluidoHoje'>

const ICONS = ['🏋', '📖', '💼', '📚', '🌙', '🧘', '🏃', '💧', '🥗', '🎯', '🧠', '💎', '⚔', '🛡', '🔥', '⚡']

const EMPTY: Draft = {
  nome: '',
  descricao: '',
  categoria: 'corpo',
  dificuldade: 'comum',
  xp: 80,
  atributos: ['forca'],
  horario: '08:00',
  repeticao: 'Diário',
  raridade: 'comum',
  icone: '🎯',
  penalidade: 10,
  recompensa: '+80 XP',
}

export default function HabitEditor({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean
  initial?: Habit
  onClose: () => void
  onSave: (d: Draft) => void
  onDelete?: () => void
}) {
  const [d, setD] = useState<Draft>(EMPTY)
  const [seeded, setSeeded] = useState<string | null>(null)

  // seed form when opening
  if (open && seeded !== (initial?.id ?? 'new')) {
    setSeeded(initial?.id ?? 'new')
    setD(initial ? { ...initial } : EMPTY)
  }
  if (!open && seeded !== null) setSeeded(null)

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  const toggleAttr = (a: AttrKey) =>
    setD((p) => ({
      ...p,
      atributos: p.atributos.includes(a) ? p.atributos.filter((x) => x !== a) : [...p.atributos, a],
    }))

  const rar = RARITY[d.raridade]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="holo relative max-h-[88%] w-full overflow-y-auto rounded-t-3xl px-4 pb-6 pt-5"
            style={{ borderColor: `${rar.color}66`, boxShadow: `0 -10px 40px ${rar.glow}` }}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
            <h2 className="font-display mb-4 text-lg font-bold tracking-wide" style={{ color: rar.color }}>
              {initial ? 'EDITAR HÁBITO' : 'NOVO HÁBITO'}
            </h2>

            {/* nome + icone */}
            <div className="mb-3 flex gap-2">
              <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-black/30 p-1.5">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => set('icone', ic)}
                    className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-lg ${
                      d.icone === ic ? 'bg-violet-neon/40' : 'bg-white/5'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <Field label="NOME">
              <input
                value={d.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="Ex: Academia"
                className="inp"
              />
            </Field>
            <Field label="DESCRIÇÃO">
              <input
                value={d.descricao}
                onChange={(e) => set('descricao', e.target.value)}
                placeholder="Ex: Treino de força · 60 min"
                className="inp"
              />
            </Field>

            {/* categoria */}
            <Field label="CATEGORIA">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CATEGORIES) as Category[]).map((c) => (
                  <Chip key={c} active={d.categoria === c} color={CATEGORIES[c].color} onClick={() => set('categoria', c)}>
                    {CATEGORIES[c].icon} {CATEGORIES[c].label}
                  </Chip>
                ))}
              </div>
            </Field>

            {/* dificuldade + raridade */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="DIFICULDADE">
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(DIFFICULTY) as Difficulty[]).map((c) => (
                    <Chip key={c} active={d.dificuldade === c} color={DIFFICULTY[c].color} onClick={() => set('dificuldade', c)}>
                      {DIFFICULTY[c].label}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="RARIDADE">
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(RARITY) as Rarity[]).map((c) => (
                    <Chip key={c} active={d.raridade === c} color={RARITY[c].color} onClick={() => set('raridade', c)}>
                      {RARITY[c].label}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>

            {/* atributos */}
            <Field label="ATRIBUTOS AFETADOS">
              <div className="flex flex-wrap gap-1.5">
                {ATTR_ORDER.map((a) => (
                  <Chip key={a} active={d.atributos.includes(a)} color={ATTRS[a].color} onClick={() => toggleAttr(a)}>
                    {ATTRS[a].icon} {ATTRS[a].label}
                  </Chip>
                ))}
              </div>
            </Field>

            {/* xp / penalidade / horario */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="XP">
                <input type="number" value={d.xp} onChange={(e) => set('xp', +e.target.value)} className="inp" />
              </Field>
              <Field label="PENALIDADE">
                <input type="number" value={d.penalidade} onChange={(e) => set('penalidade', +e.target.value)} className="inp" />
              </Field>
              <Field label="HORÁRIO">
                <input type="time" value={d.horario} onChange={(e) => set('horario', e.target.value)} className="inp" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="REPETIÇÃO">
                <select value={d.repeticao} onChange={(e) => set('repeticao', e.target.value)} className="inp">
                  <option>Diário</option>
                  <option>Dias úteis</option>
                  <option>Fins de semana</option>
                  <option>Semanal</option>
                </select>
              </Field>
              <Field label="RECOMPENSA">
                <input value={d.recompensa} onChange={(e) => set('recompensa', e.target.value)} className="inp" />
              </Field>
            </div>

            <div className="mt-5 flex gap-2">
              {onDelete && (
                <GlowButton variant="danger" onClick={onDelete} className="flex-1">
                  EXCLUIR
                </GlowButton>
              )}
              <GlowButton variant="ghost" onClick={onClose} className="flex-1">
                CANCELAR
              </GlowButton>
              <GlowButton
                variant="primary"
                onClick={() => {
                  if (!d.nome.trim()) return
                  if (!d.atributos.length) return
                  onSave(d)
                }}
                className="flex-[1.4]"
              >
                SALVAR
              </GlowButton>
            </div>
          </motion.div>

          <style>{`
            .inp { width:100%; background:rgba(0,0,0,.4); border:1px solid rgba(139,92,255,.25); border-radius:10px;
              padding:9px 11px; color:#eef0ff; font-size:13px; outline:none; }
            .inp:focus { border-color:#8b3bff; box-shadow:0 0 14px rgba(139,59,255,.4); }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[10px] font-semibold tracking-[2px] text-violet-soft/60">{label}</div>
      {children}
    </div>
  )
}

function Chip({
  children,
  active,
  color,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition"
      style={{
        background: active ? `${color}33` : 'rgba(255,255,255,.04)',
        border: `1px solid ${active ? color : 'rgba(139,92,255,.18)'}`,
        color: active ? '#fff' : '#9aa0c9',
        boxShadow: active ? `0 0 12px ${color}66` : 'none',
      }}
    >
      {children}
    </button>
  )
}
