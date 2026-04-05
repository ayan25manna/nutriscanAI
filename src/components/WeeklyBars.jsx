import { motion } from 'framer-motion'

const DATA  = [1820, 2100, 2380, 2560, 2200, 1240, 0]
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const GOAL  = 2400
const MAX   = Math.max(...DATA, GOAL)

export default function WeeklyBars() {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-em-light/30 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-head font-bold text-gray-700 text-sm">Weekly overview</h3>
        <span className="font-mono-num text-[11px] text-gray-400">goal {GOAL.toLocaleString()}</span>
      </div>

      <div className="flex items-end gap-2 h-24 mt-1 mb-1.5">
        {DATA.map((v, i) => {
          const pct  = v ? Math.round((v / MAX) * 100) : 4
          const isT  = i === 5
          const over = v > GOAL && !isT
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-full flex-1 bg-gray-100 rounded-md overflow-hidden flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ delay: i * 0.06, duration: 0.55, ease: [0.34,1.56,0.64,1] }}
                  className={`w-full rounded-md ${
                    isT  ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                    : over ? 'bg-gradient-to-t from-coral to-orange-400'
                    :        'bg-gradient-to-t from-em to-em2'
                  }`}
                />
              </div>
              <span className="font-mono-num text-[9px] text-gray-400">
                {v ? Math.round(v / 100) / 10 + 'k' : '—'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        {DAYS.map(d => (
          <div key={d} className="flex-1 text-center text-[10px] font-semibold text-gray-400">{d}</div>
        ))}
      </div>

      <div className="flex gap-4 mt-3 flex-wrap">
        {[
          { color:'bg-em', label:'Within goal' },
          { color:'bg-coral', label:'Over goal' },
          { color:'bg-blue-500', label:'Today' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className={`w-2 h-2 rounded-sm ${color} inline-block`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
