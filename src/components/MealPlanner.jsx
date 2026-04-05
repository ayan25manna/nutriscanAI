import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMealPlan } from '../services/aiService.js'
import { useApp } from '../context/AppContext.jsx'

const MEAL_COLORS = {
  'Breakfast':     { bg:'#fef3c7', dot:'#f59e0b' },
  'Morning Snack': { bg:'#d1fae5', dot:'#059669' },
  'Lunch':         { bg:'#dbeafe', dot:'#3b82f6' },
  'Evening Snack': { bg:'#ede9fe', dot:'#8b5cf6' },
  'Dinner':        { bg:'#fce7f3', dot:'#ec4899' },
}

export default function MealPlanner() {
  const { caloriesEaten, GOAL } = useApp()
  const [plan, setPlan]     = useState(null)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState(null)
  const remaining = Math.max(0, GOAL - caloriesEaten)

  const generate = async () => {
    setLoad(true); setError(null)
    try {
      const result = await generateMealPlan(
        { profession:'Software Engineer', city:'Jamshedpur, India', goal:'Maintain weight', diet:'No restriction' },
        remaining
      )
      setPlan(result)
    } catch {
      setError('Could not generate meal plan. Check AI connection.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-em-light/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-head font-bold text-gray-700 text-sm flex items-center gap-2">
            🍽️ Smart Meal Planner
            <span className="text-[10px] bg-em text-white font-bold px-2 py-0.5 rounded-full">AI</span>
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Claude plans your remaining meals for{' '}
            <span className="font-mono-num font-semibold text-em-dark">{remaining.toLocaleString()} kcal</span>
          </p>
        </div>
        <motion.button
          whileHover={{ y:-1 }}
          whileTap={{ scale:0.96 }}
          onClick={generate}
          disabled={loading}
          className="btn-em px-4 py-2 rounded-xl text-white text-xs font-bold font-head flex items-center gap-1.5 disabled:opacity-60"
        >
          {loading
            ? <motion.span animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}>⚙️</motion.span>
            : '✨'} Plan my day
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="load" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="py-8 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {['🥗','🍚','🫘','🥑'].map((e,i) => (
                <motion.span key={e} className="text-2xl"
                  animate={{ y:[0,-8,0] }}
                  transition={{ duration:0.8, delay:i*0.15, repeat:Infinity }}>
                  {e}
                </motion.span>
              ))}
            </div>
            <p className="font-head font-semibold text-gray-500 text-sm">Building your personalized plan...</p>
          </motion.div>
        )}

        {error && (
          <motion.div key="err" initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="bg-coral-light text-coral-dark rounded-xl p-3 text-xs text-center">{error}</motion.div>
        )}

        {plan && !loading && (
          <motion.div key="plan" initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <div className="flex flex-col gap-2.5 mb-3">
              {plan.plan?.map((meal, i) => {
                const c = MEAL_COLORS[meal.meal] || { bg:'#f0fdf4', dot:'#059669' }
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity:0, x:-12 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-3 p-3 rounded-xl border border-gray-100"
                    style={{ background: c.bg + '60' }}
                  >
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.dot }} />
                      {i < plan.plan.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 rounded-full min-h-[16px]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-head font-bold text-xs text-gray-700">{meal.meal}</span>
                        <span className="font-mono-num text-xs font-semibold text-em-dark">{meal.totalKcal} kcal</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {meal.items?.map((item, j) => (
                          <span key={j} className="text-[11px] bg-white rounded-lg px-2 py-1 border border-gray-100 text-gray-600 font-medium shadow-sm">
                            {item.emoji} {item.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 italic">{meal.whyThisMeal}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex items-center justify-between p-3 bg-em-xl rounded-xl border border-em/10 mb-2">
              <span className="font-head font-semibold text-em-dark text-xs">Total planned</span>
              <span className="font-mono-num font-bold text-em-dark">{plan.totalKcal} kcal</span>
            </div>

            {plan.tip && (
              <p className="text-[11px] text-gray-500 italic text-center leading-relaxed">💡 {plan.tip}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
