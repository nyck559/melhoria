import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, scale: 0.985, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -16 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-12">{children}</div>
    </motion.div>
  )
}
