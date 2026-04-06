import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeFood } from '../services/edamamService.js'
import { useApp } from '../context/AppContext.jsx'

const VERDICT_STYLE = {
  'Excellent':{ bg:'bg-em-light',    text:'text-em-dark',    bar:'#059669' },
  'Good':     { bg:'bg-blue-50',     text:'text-blue-700',   bar:'#3b82f6' },
  'Okay':     { bg:'bg-yellow-50',   text:'text-yellow-700', bar:'#f59e0b' },
  'Limit':    { bg:'bg-orange-50',   text:'text-orange-700', bar:'#f97316' },
  'Avoid':    { bg:'bg-red-50',      text:'text-red-700',    bar:'#ef4444' },
}

function NutrientBar({ label, value, unit, color, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-mono-num font-semibold text-gray-700">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
          transition={{duration:0.7,ease:[0.34,1.56,0.64,1],delay:0.2}}
          className="h-full rounded-full" style={{background:color}}/>
      </div>
    </div>
  )
}

function ScoreRing({ score }) {
  const color = score>=7?'#059669':score>=5?'#f59e0b':'#f97316'
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#d1fae5" strokeWidth="8"/>
        <motion.circle cx="32" cy="32" r="26" fill="none" strokeWidth="8"
          stroke={color} strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*26}`}
          initial={{strokeDashoffset:2*Math.PI*26}}
          animate={{strokeDashoffset:2*Math.PI*26*(1-score*10/100)}}
          transition={{duration:1,ease:[0.34,1.56,0.64,1]}}
          style={{transform:'rotate(-90deg)',transformOrigin:'32px 32px'}}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono-num font-bold text-sm" style={{color}}>{score}</span>
      </div>
    </div>
  )
}

const EXAMPLE_FOODS=['Brown rice','Chicken breast','Spinach','Banana','Paneer','Oats','Moong dal','Almonds']

export default function NutritionAnalyzer() {
  const { logFood } = useApp()
  const [query,setQuery]   = useState('')
  const [grams,setGrams]   = useState(100)
  const [result,setResult] = useState(null)
  const [loading,setLoad]  = useState(false)
  const [error,setError]   = useState(null)
  const [tab,setTab]       = useState('macro')

  const analyze = async (foodName) => {
    const name = foodName || query
    if (!name.trim()) return
    setQuery(name); setLoad(true); setError(null); setResult(null); setTab('macro')
    try {
      const data = await analyzeFood(name, grams, { profession:'Software Engineer', goal:'Maintain weight' })
      setResult(data)
    } catch(e) {
      setError(e.message || 'Could not analyze. Try a simpler food name like "apple" or "brown rice".')
    } finally { setLoad(false) }
  }

  const verdict = result ? (VERDICT_STYLE[result.verdict] || VERDICT_STYLE['Okay']) : null

  return (
    <div className="bg-white rounded-2xl card-shadow border border-em-light/30 overflow-hidden">
      <div className="px-5 py-4 border-b border-em-light/30 flex items-center gap-3"
        style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)'}}>
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-xl shadow-sm">🔬</div>
        <div>
          <h3 className="font-head font-bold text-em-dark text-sm">Nutrition Analyzer</h3>
          <p className="text-[11px] text-em/70">Powered by Edamam — 900,000+ foods</p>
        </div>
        <div className="ml-auto bg-em text-white text-[10px] font-bold px-2.5 py-1 rounded-full font-head">FREE ✓</div>
      </div>

      <div className="px-5 py-4 border-b border-em-light/20">
        <div className="flex gap-2 mb-3">
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&analyze()}
            placeholder='Search any food — "paneer", "brown rice", "banana"...'
            className="flex-1 px-4 py-2.5 rounded-xl border-[1.5px] border-em/18 text-sm text-gray-700 outline-none
              focus:border-em focus:ring-2 focus:ring-em/10 transition-all font-body bg-[#f8fffe]"/>
          <div className="flex items-center gap-1 bg-[#f0fdf4] border border-em/20 rounded-xl px-3">
            <input type="number" value={grams} onChange={e=>setGrams(Number(e.target.value))}
              className="w-12 bg-transparent text-sm font-mono-num text-gray-700 outline-none" min="10" max="1000"/>
            <span className="text-xs text-gray-400">g</span>
          </div>
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.96}} onClick={()=>analyze()}
            disabled={loading||!query.trim()}
            className="btn-em px-5 py-2.5 rounded-xl text-white text-sm font-bold font-head flex items-center gap-2 disabled:opacity-50">
            {loading?<motion.span animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}>⚙️</motion.span>:'🔬'} Analyze
          </motion.button>
        </div>

        {/* Example food pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium mr-1 self-center">Try:</span>
          {EXAMPLE_FOODS.map(f=>(
            <motion.button key={f} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
              onClick={()=>analyze(f)}
              className="text-[11px] bg-em-xl text-em-dark font-semibold px-2.5 py-1 rounded-full border border-em/15 hover:bg-em-light transition-colors">
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading&&(
          <motion.div key="load" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="py-12 flex flex-col items-center gap-4 px-5">
            <motion.div animate={{rotate:[0,15,-15,0],scale:[1,1.1,1]}} transition={{duration:2,repeat:Infinity}} className="text-5xl">
              {['🍎','🥦','🫘','🥑','🍚','🥚'][Math.floor(Math.random()*6)]}
            </motion.div>
            <div className="text-center">
              <p className="font-head font-semibold text-gray-600 text-sm">Analyzing "{query}"...</p>
              <p className="text-xs text-gray-400 mt-1">Fetching macros, vitamins, minerals from Edamam</p>
            </div>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-em to-em2 rounded-full"
                animate={{x:['-100%','100%']}} transition={{duration:1.4,repeat:Infinity,ease:'easeInOut'}}/>
            </div>
          </motion.div>
        )}

        {error&&(
          <motion.div key="err" initial={{opacity:0}} animate={{opacity:1}} className="p-5">
            <div className="bg-coral-light text-coral-dark rounded-xl p-4 text-sm">
              <p className="font-bold mb-1">⚠ Could not analyze</p>
              <p>{error}</p>
              <p className="text-xs mt-2 opacity-70">Tip: Use simple English names like "chicken breast 100g" or "brown rice"</p>
            </div>
          </motion.div>
        )}

        {result&&!loading&&(
          <motion.div key="result" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.35}} className="p-5">
            {/* Food headline */}
            <div className="flex items-center gap-3 mb-4">
              <motion.span initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:400,delay:0.1}} className="text-4xl">{result.emoji}</motion.span>
              <div className="flex-1">
                <h4 className="font-head font-bold text-gray-800 text-sm">{result.name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-head ${verdict.bg} ${verdict.text}`}>{result.verdict}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">GI: {result.glycemicIndex}</span>
                  {result.dietLabels?.slice(0,2).map(d=>(
                    <span key={d} className="text-[10px] text-em-dark bg-em-xl px-2 py-1 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
              <ScoreRing score={result.healthScore}/>
            </div>

            {/* Calorie hero */}
            <div className="flex items-baseline gap-1.5 mb-4 px-4 py-3 bg-em-xl rounded-xl border border-em/10">
              <span className="font-mono-num text-3xl font-bold text-em-dark">{result.calories}</span>
              <span className="text-em font-semibold text-sm">kcal</span>
              <span className="text-gray-400 text-xs ml-auto">per {grams}g serving</span>
            </div>

            {/* Quick macro pills */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[['Protein',result.protein,'g','#f59e0b'],['Carbs',result.carbs,'g','#3b82f6'],['Fat',result.fat,'g','#8b5cf6'],['Fiber',result.fiber,'g','#059669']].map(([l,v,u,c])=>(
                <div key={l} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                  <div className="font-mono-num text-base font-bold" style={{color:c}}>{v}{u}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
              {['macro','vitamins','insights'].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg font-head capitalize transition-all
                    ${tab===t?'bg-white text-em-dark shadow-sm':'text-gray-400 hover:text-gray-600'}`}>
                  {t==='macro'?'📊 Macros':t==='vitamins'?'💊 Nutrients':'💡 Insights'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab==='macro'&&(
                <motion.div key="m" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                  <NutrientBar label="Protein"       value={result.protein}     unit="g" color="#f59e0b" max={50}/>
                  <NutrientBar label="Carbohydrates" value={result.carbs}       unit="g" color="#3b82f6" max={100}/>
                  <NutrientBar label="Fat"           value={result.fat}         unit="g" color="#8b5cf6" max={50}/>
                  <NutrientBar label="Fiber"         value={result.fiber}       unit="g" color="#059669" max={20}/>
                  <NutrientBar label="Sugar"         value={result.sugar}       unit="g" color="#f97316" max={50}/>
                  <NutrientBar label="Sodium"        value={result.sodium}      unit="mg" color="#64748b" max={800}/>
                </motion.div>
              )}
              {tab==='vitamins'&&(
                <motion.div key="v" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                  {result.vitamins?.length>0&&(
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vitamins</p>
                      <div className="grid grid-cols-2 gap-2">
                        {result.vitamins.map(v=>(
                          <div key={v.name} className="bg-blue-50 rounded-lg px-3 py-2 flex justify-between border border-blue-100">
                            <span className="text-xs font-semibold text-blue-700">{v.name}</span>
                            <span className="font-mono-num text-xs text-blue-500">{v.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.minerals?.length>0&&(
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Minerals</p>
                      <div className="grid grid-cols-2 gap-2">
                        {result.minerals.map(m=>(
                          <div key={m.name} className="bg-purple-50 rounded-lg px-3 py-2 flex justify-between border border-purple-100">
                            <span className="text-xs font-semibold text-purple-700">{m.name}</span>
                            <span className="font-mono-num text-xs text-purple-500">{m.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.vitamins?.length===0&&result.minerals?.length===0&&(
                    <p className="text-sm text-gray-400 text-center py-4">No detailed micronutrient data for this food.</p>
                  )}
                </motion.div>
              )}
              {tab==='insights'&&(
                <motion.div key="i" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} className="flex flex-col gap-2.5">
                  {result.benefits?.map((b,i)=>(
                    <div key={i} className="flex gap-2.5 items-start bg-em-xl rounded-xl p-2.5 border border-em/10">
                      <span className="text-em font-bold text-sm flex-shrink-0">✓</span>
                      <span className="text-xs text-em-dark leading-relaxed">{b}</span>
                    </div>
                  ))}
                  {result.professionTip&&(
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-500 mb-1 font-head">FOR YOU · SOFTWARE ENGINEER</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{result.professionTip}</p>
                    </div>
                  )}
                  {result.pairWith?.length>0&&(
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 mb-2 font-head">PAIR WITH</p>
                      <div className="flex gap-2 flex-wrap">
                        {result.pairWith.map(f=>(
                          <span key={f} className="text-xs bg-white text-gray-600 font-semibold px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`rounded-xl p-3 border text-xs leading-relaxed ${verdict.bg} ${verdict.text}`}>
                    <strong>Verdict:</strong> {result.verdictReason}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{y:-2}} whileTap={{scale:0.97}}
              onClick={()=>logFood(result.name, result.calories, result.emoji)}
              className="btn-em w-full mt-4 py-3 rounded-xl text-white font-bold font-head text-sm">
              + Log {result.calories} kcal to today
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
