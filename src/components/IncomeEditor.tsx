import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { IncomeTipo } from '../types'
import { INCOME_TIPOS } from '../data/game'
import { BlueButton } from './kit'

const TIPOS = Object.keys(INCOME_TIPOS) as IncomeTipo[]

export default function IncomeEditor({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (i: { tipo: IncomeTipo; valor: number; desc?: string }) => void
}) {
  const [tipo, setTipo] = useState<IncomeTipo>('fechado')
  const [valor, setValor] = useState('')
  const [desc, setDesc] = useState('')

  useEffect(() => {
    if (open) { setTipo('fechado'); setValor(''); setDesc('') }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl border-t border-line bg-surface p-5 pb-8" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
            <h3 className="mb-1 text-[17px] font-bold">Registrar entrada</h3>
            <p className="mb-4 text-[12px] text-muted">Cliente fechado, renovação ou meta batida.</p>

            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map((t) => {
                const on = tipo === t
                const meta = INCOME_TIPOS[t]
                return (
                  <button key={t} onClick={() => setTipo(t)} className="rounded-xl border p-3 text-left transition" style={{ borderColor: on ? meta.color : 'var(--border)', background: on ? `${meta.color}1c` : 'var(--surface-2)' }}>
                    <div className="text-[15px]">{meta.icon} <span className="text-[13px] font-semibold">{meta.label}</span></div>
                    <div className="mt-0.5 text-[11px] text-muted">+{meta.coins} moedas</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-muted">Valor fechado (R$)</label>
              <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0,00" className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[15px] outline-none" />
            </div>
            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-muted">Cliente / descrição (opcional)</label>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex.: Loja do João" className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-[14px] outline-none" />
            </div>

            <div className="mt-5 flex gap-2">
              <div className="flex-1" />
              <BlueButton variant="ghost" onClick={onClose}>Cancelar</BlueButton>
              <BlueButton onClick={() => { const v = parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0; onSave({ tipo, valor: v, desc: desc.trim() || undefined }) }}>Registrar</BlueButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
