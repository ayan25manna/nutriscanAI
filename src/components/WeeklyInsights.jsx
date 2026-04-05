import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWeeklyInsights } from '../services/aiService.js'

const WEEK_DATA = [1820, 2100, 2380, 2560, 2200, 1240, 0]

const typeStyle = {
  win:     { bg:'bg-em-light',    text:'text-em-dark',    border:'border-em/20',    icon:'✅' },
  warning: { bg:'bg-coral-light', text:'text-coral-dark', border:'border-coral/20', icon:'⚠️' },
  tip:     { bg:'bg-blue-50',     text:'text-blue-700',   border:'border-blue-200', icon:'💡' },
}

function ScoreMeter({ score }) {
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C'
  const color = score >= 75 ? '#059669' : score >= 55 ? '#f59e0b' : '#f97316'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="110" viewBox="0 0 110 110" className="ring-pulse">
        <circle cx="55" cy="55" r="44" fill="none" stroke="#d1fae5" strokeWidth="12" />
        <motion.circle
          cx="55" cy="55" r="44" fill="none" strokeWidth="12"
          stroke={color} strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 44}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '55px 55px' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="font-mono-num font-bold text-3xl"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-400 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

export default function WeeklyInsights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [open, setOpen]         = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateWeeklyInsights(WEEK_DATA, {
        profession: 'Software Engineer',
        goal: 'Maintain weight',
        calorieGoal: 2400,
      })
      setInsights(result)
    } catch (e) {
      setError('Could not generate insights. Check your AI connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-em-light/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-head font-bold text-gray-700 text-sm">AI Weekly Report</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Claude analyzes your 7-day performance</p>
        </div>
        <motion.button
          whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(5,150,105,0.3)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { generate(); setOpen(true) }}
          disabled={loading}
          className="btn-em px-4 py-2 rounded-xl text-white text-xs font-bold font-head flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block">⚙️</motion.span>
              Analyzing...
            </>
          ) : '✨ Generate Report'}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {loading && (
              <div className="py-8 flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-5xl"
                >🧠</motion.div>
                <div className="text-center">
                  <p className="font-head font-semibold text-gray-600 text-sm">Claude is analyzing your week...</p>
                  <p className="text-xs text-gray-400 mt-1">Checking calories, macros, patterns</p>
                </div>
                <div className="flex gap-1.5">
                  {[0,1,2,3].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-em"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-coral-light text-coral-dark rounded-xl p-4 text-sm text-center">
                {error}
              </div>
            )}

            {insights && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                {/* Score + headline */}
                <div className="flex items-center gap-5 mb-5 p-4 rounded-xl bg-em-xl border border-em/10">
                  <div className="relative flex-shrink-0">
                    <ScoreMeter score={insights.score} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono-num text-2xl font-bold text-em-dark">{insights.grade}</span>
                      <span className="text-xs bg-em-light text-em-dark font-bold px-2 py-0.5 rounded-full font-head">This week</span>
                    </div>
                    <p className="font-head font-semibold text-gray-700 text-sm leading-snug">{insights.headline}</p>
                    <p className="text-xs text-em mt-1.5 font-medium">🎯 {insights.nextWeekGoal}</p>
                  </div>
                </div>

                {/* Insights */}
                <div className="flex flex-col gap-2.5 mb-3">
                  {insights.insights?.map((ins, i) => {
                    const s = typeStyle[ins.type] || typeStyle.tip
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className={`flex gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{ins.emoji || s.icon}</span>
                        <div>
                          <p className={`font-head font-bold text-xs ${s.text}`}>{ins.title}</p>
                          <p className={`text-xs mt-0.5 leading-relaxed ${s.text} opacity-80`}>{ins.body}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {insights.streakMessage && (
                  <div className="text-center py-2 text-xs text-em font-semibold">
                    🔥 {insights.streakMessage}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
