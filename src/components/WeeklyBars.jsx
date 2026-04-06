import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeWeeklyData } from '../services/edamamService.js'

const WEEK_DATA=[1820,2100,2380,2560,2200,1240,0]
const typeStyle={
  win:    {bg:'bg-em-light',    text:'text-em-dark',    border:'border-em/20'},
  warning:{bg:'bg-coral-light', text:'text-coral-dark', border:'border-coral/20'},
  tip:    {bg:'bg-blue-50',     text:'text-blue-700',   border:'border-blue-200'},
}

export default function WeeklyInsights() {
  const [insights,setInsights]=useState(null)
  const [open,setOpen]=useState(false)

  const generate=()=>{
    const result=analyzeWeeklyData(WEEK_DATA,{profession:'Software Engineer',goal:'Maintain weight',calorieGoal:2400})
    setInsights(result); setOpen(true)
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-em-light/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-head font-bold text-gray-700 text-sm">📊 Weekly Performance Report</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Analyzes your 7-day calorie and consistency data</p>
        </div>
        <motion.button whileHover={{y:-1}} whileTap={{scale:0.96}} onClick={generate}
          className="btn-em px-4 py-2 rounded-xl text-white text-xs font-bold font-head flex items-center gap-1.5">
          ✨ Generate report
        </motion.button>
      </div>

      <AnimatePresence>
        {open&&insights&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
            exit={{height:0,opacity:0}} transition={{duration:0.35,ease:'easeInOut'}} className="overflow-hidden">

            {/* Score */}
            <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-em-xl border border-em/10">
              <div className="relative flex-shrink-0">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#d1fae5" strokeWidth="10"/>
                  <motion.circle cx="40" cy="40" r="32" fill="none" strokeWidth="10"
                    stroke="#059669" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*32}`}
                    initial={{strokeDashoffset:2*Math.PI*32}}
                    animate={{strokeDashoffset:2*Math.PI*32*(1-insights.score/100)}}
                    transition={{duration:1.4,ease:[0.34,1.56,0.64,1],delay:0.2}}
                    style={{transform:'rotate(-90deg)',transformOrigin:'40px 40px'}}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono-num font-bold text-xl text-em-dark">{insights.score}</span>
                  <span className="text-[9px] text-gray-400">/ 100</span>
                </div>
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

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                [`${insights.stats.loggedDays}/7`,'Days logged','#059669'],
                [`${insights.stats.avg.toLocaleString()}`,'Avg kcal/day','#3b82f6'],
                [`${insights.stats.consistency}%`,'Consistency','#8b5cf6'],
              ].map(([v,l,c])=>(
                <div key={l} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                  <div className="font-mono-num text-base font-bold" style={{color:c}}>{v}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="flex flex-col gap-2.5 mb-3">
              {insights.insights?.map((ins,i)=>{
                const s=typeStyle[ins.type]||typeStyle.tip
                return (
                  <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.08}}
                    className={`flex gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                    <span className="text-lg flex-shrink-0 mt-0.5">{ins.emoji}</span>
                    <div>
                      <p className={`font-head font-bold text-xs ${s.text}`}>{ins.title}</p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${s.text} opacity-80`}>{ins.body}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="text-center py-2 text-xs text-em font-semibold">
              🔥 {insights.streakMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
