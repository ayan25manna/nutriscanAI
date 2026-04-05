import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

export default function MealLog({ onAddClick }) {
  const { loggedMeals } = useApp()

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-em-light/30 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-head font-bold text-gray-700 text-sm">Logged meals</h3>
        <motion.button
          whileHover={{ background: '#d1fae5' }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddClick}
          className="text-xs font-semibold text-em px-2.5 py-1.5 rounded-lg transition-colors"
        >
          + Add food
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {loggedMeals.map(meal => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex items-center gap-3 py-2.5 border-b border-em-light/40 last:border-b-0"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: meal.bg }}
            >
              {meal.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{meal.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{meal.meta}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono-num text-sm font-semibold text-gray-700">{meal.kcal}</p>
              <p className="text-[10px] text-gray-400">{meal.time}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
