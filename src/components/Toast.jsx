import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

export default function ToastContainer() {
  const { toasts } = useApp()
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 flex flex-col gap-2 z-[999] pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-xs sm:text-sm font-semibold font-head shadow-2xl
              ${t.type === 'w' ? 'bg-orange-800' : 'bg-em-dark'}`}
            style={{ boxShadow: '0 8px 32px rgba(5,150,105,0.38)' }}
          >
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs flex-shrink-0">
              {t.type === 'w' ? '⚠' : '✓'}
            </span>
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
