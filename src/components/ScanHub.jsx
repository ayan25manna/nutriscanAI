import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchFood } from '../services/edamamService.js'
import { useApp } from '../context/AppContext.jsx'

const MODES=[
  {id:'cam',  label:'Camera / AI', icon:'📷'},
  {id:'bar',  label:'Barcode',     icon:'📦'},
  {id:'man',  label:'Search food', icon:'🔍'},
]

function PlusBurst({x,y,onDone}) {
  return (
    <motion.div className="fixed pointer-events-none font-extrabold text-em2 z-[9999] text-3xl"
      style={{left:x-16,top:y-10}}
      initial={{opacity:1,scale:0.4,y:0}} animate={{opacity:0,scale:2.4,y:-60}}
      transition={{duration:0.8,ease:[0.34,1.56,0.64,1]}} onAnimationComplete={onDone}>+</motion.div>
  )
}

function NutriTile({label,value}) {
  return (
    <div className="bg-white/70 rounded-xl p-2 text-center">
      <div className="font-mono-num text-sm font-semibold text-em-dark">{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

function FlipCard({food,name,badge,ctx,ctxWarn,onLog}) {
  const [flipped,setFlipped]=useState(false)
  return (
    <div className="mt-4">
      {!flipped?(
        <motion.div whileHover={{scale:1.01}} onClick={()=>setFlipped(true)}
          className="bg-gradient-to-br from-em-xl to-[#dcfce7] border border-em/20 rounded-2xl p-5 text-center cursor-pointer">
          <div className="text-4xl mb-2">{food.emoji}</div>
          <p className="text-sm font-semibold text-em-dark font-head">Tap to reveal nutrition</p>
          <p className="text-xs text-em/60 mt-1">{name}</p>
        </motion.div>
      ):(
        <motion.div initial={{rotateY:180,opacity:0}} animate={{rotateY:0,opacity:1}}
          transition={{duration:0.55,ease:[0.4,0,0.2,1]}}
          className="bg-gradient-to-br from-em-xl to-[#dcfce7] border border-em/20 rounded-2xl p-5">
          <p className="font-head font-bold text-em-dark text-sm">{name}</p>
          <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#a7f3d0] text-em-dark font-head mt-1 mb-3">{badge}</span>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <NutriTile label="Calories" value={food.calories}/>
            <NutriTile label="Protein"  value={`${food.protein}g`}/>
            <NutriTile label="Carbs"    value={`${food.carbs}g`}/>
            <NutriTile label="Fiber"    value={`${food.fiber}g`}/>
            <NutriTile label="Fat"      value={`${food.fat}g`}/>
            <NutriTile label="Per"      value={food.per}/>
          </div>
          {ctx&&(
            <div className={`rounded-xl px-3 py-2.5 text-xs mb-3 border-l-[3px] leading-relaxed
              ${ctxWarn?'bg-coral-light border-coral text-coral-dark':'bg-em/8 border-em text-em-dark'}`}>
              {ctx}
            </div>
          )}
          <motion.button whileHover={{y:-2}} whileTap={{scale:0.97}} onClick={onLog}
            className="btn-em w-full py-3 rounded-xl text-white text-sm font-bold font-head">
            + Add to today's log
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default function ScanHub() {
  const {logFood}=useApp()
  const [mode,setMode]=useState('cam')
  const [scanned,setScanned]=useState(false)
  const [barDone,setBarDone]=useState(false)
  const [query,setQuery]=useState('')
  const [results,setResults]=useState([])
  const [selected,setSelected]=useState(null)
  const [searching,setSearching]=useState(false)
  const [burst,setBurst]=useState(null)
  const debounceRef=useRef(null)

  const doLog=(e,name,kcal,emoji)=>{
    const r=e.currentTarget.getBoundingClientRect()
    setBurst({x:r.left+r.width/2,y:r.top})
    logFood(name,kcal,emoji)
  }

  const handleSearch=async(val)=>{
    setQuery(val); setSelected(null)
    if(debounceRef.current) clearTimeout(debounceRef.current)
    if(val.length<2){setResults([]);return}
    debounceRef.current=setTimeout(async()=>{
      setSearching(true)
      try{
        const data=await searchFood(val)
        setResults(data)
      }catch{setResults([])}
      finally{setSearching(false)}
    },500)
  }

  const PACKED_FOOD={emoji:'🍪',calories:418,protein:6.7,carbs:76,fat:11.4,fiber:1.2,per:'100g'}

  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      {burst&&<PlusBurst x={burst.x} y={burst.y} onDone={()=>setBurst(null)}/>}
      <div className="bg-white rounded-2xl overflow-hidden card-shadow border border-em-light/30">
        {/* Tabs */}
        <div className="grid grid-cols-3">
          {MODES.map(({id,label,icon})=>(
            <motion.button key={id} whileTap={{scale:0.97}}
              onClick={()=>{setMode(id);setScanned(false);setBarDone(false);setResults([]);setSelected(null)}}
              className={`flex flex-col items-center gap-2 py-4 sm:py-5 text-xs sm:text-sm font-semibold font-head border-b-[3px] transition-all
                ${mode===id?'bg-white border-em text-em-dark':'bg-gray-50 border-transparent text-gray-400 hover:bg-em-xl hover:text-em-dark'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${mode===id?'bg-em-light':'bg-gray-100'}`}>{icon}</div>
              <span className="hidden sm:block">{label}</span>
              <span className="sm:hidden">{label.split('/')[0].trim()}</span>
            </motion.button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* Camera */}
            {mode==='cam'&&(
              <motion.div key="cam" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="relative w-full h-48 bg-[#0b1120] rounded-xl overflow-hidden mb-4 cursor-pointer"
                  onClick={()=>setScanned(true)}>
                  <div className="absolute top-3 left-3 w-6 h-6 vf-corner-tl"/>
                  <div className="absolute top-3 right-3 w-6 h-6 vf-corner-tr"/>
                  <div className="absolute bottom-3 left-3 w-6 h-6 vf-corner-bl"/>
                  <div className="absolute bottom-3 right-3 w-6 h-6 vf-corner-br"/>
                  <div className="scanline-animate"/>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-slate-400 text-sm font-semibold font-head">Tap to activate camera</p>
                    <p className="text-slate-500 text-xs mt-1.5">Point at any fresh food or fruit</p>
                  </div>
                  <AnimatePresence>
                    {scanned&&(
                      <motion.div initial={{opacity:0,scale:0.8,x:20}} animate={{opacity:1,scale:1,x:0}}
                        className="absolute right-4 top-[28%] glass rounded-xl px-3 py-2 text-white text-xs font-semibold">
                        🥭 Mango · <span className="text-emerald-400 font-mono-num">99 kcal</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {scanned&&(
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                      <FlipCard
                        food={{emoji:'🥭',calories:99,protein:1.4,carbs:25,fat:0.6,fiber:2.6,per:'150g'}}
                        name="Alphonso Mango (est. 150g)"
                        badge="🌿 Fresh fruit · Camera identified"
                        ctx="Great snack for a software engineer! Vitamin C boosts focus. Pair with sattu drink for a protein hit."
                        onLog={e=>doLog(e,'Mango (150g)',99,'🥭')}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Barcode */}
            {mode==='bar'&&(
              <motion.div key="bar" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="relative w-full h-44 bg-[#0b1120] rounded-xl overflow-hidden mb-4 cursor-pointer"
                  onClick={()=>setBarDone(true)}>
                  <div className="absolute top-3 left-3 w-6 h-6 vf-corner-tl"/>
                  <div className="absolute top-3 right-3 w-6 h-6 vf-corner-tr"/>
                  <div className="absolute bottom-3 left-3 w-6 h-6 vf-corner-bl"/>
                  <div className="absolute bottom-3 right-3 w-6 h-6 vf-corner-br"/>
                  <div className="scanline-animate"/>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex gap-1 mb-2">
                      {[2,4,2,5,2,3,4,2,4,3].map((w,i)=>(
                        <div key={i} className="rounded-sm" style={{width:w+'px',height:'38px',background:i===5?'#34d399':'#334155'}}/>
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs font-semibold font-head">Tap to scan barcode</p>
                  </div>
                </div>
                <AnimatePresence>
                  {barDone&&(
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
                      <FlipCard
                        food={PACKED_FOOD}
                        name="Parle-G Biscuits (100g)"
                        badge="📦 Packed food · Barcode detected"
                        ctx="⚠ High sugar snack. As a desk worker, swap one serving for roasted peanuts for better sustained energy."
                        ctxWarn
                        onLog={e=>doLog(e,'Parle-G (100g)',418,'🍪')}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Search — Edamam Food DB */}
            {mode==='man'&&(
              <motion.div key="man" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="relative mb-3">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input type="text" value={query} onChange={e=>handleSearch(e.target.value)}
                    placeholder="Search from 900,000+ foods — 'paneer', 'idli', 'oats'..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-[1.5px] border-em/18 text-sm text-gray-700 bg-white outline-none
                      focus:border-em focus:ring-2 focus:ring-em/10 transition-all font-body"
                    autoComplete="off"/>
                  {searching&&(
                    <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-em text-sm">⚙️</motion.div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mb-3">Powered by Edamam Food Database — 900,000+ foods</p>

                <AnimatePresence>
                  {results.length>0&&!selected&&(
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                      className="bg-white border-[1.5px] border-em/14 rounded-xl overflow-hidden mb-3 shadow-lg">
                      {results.map((food,i)=>(
                        <motion.button key={food.foodId||i} whileHover={{background:'#f0fdf4'}} whileTap={{scale:0.98}}
                          onClick={()=>setSelected(food)}
                          className="w-full flex items-center gap-3 px-4 py-3 border-b border-em/5 last:border-b-0 text-left">
                          <motion.div whileHover={{scale:1.2,rotate:-10}}
                            className="w-11 h-11 rounded-xl bg-em-xl flex items-center justify-center text-xl flex-shrink-0">
                            {food.emoji}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="font-head font-semibold text-sm text-gray-700 truncate">{food.label}</div>
                            <div className="text-[11px] text-gray-400">{food.category}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-mono-num text-sm font-bold text-em-dark">{food.calories}</div>
                            <div className="text-[10px] text-gray-400">kcal/100g</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selected&&(
                  <motion.div key={selected.foodId} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-em-dark font-head">Selected: {selected.label}</p>
                      <button onClick={()=>setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Clear</button>
                    </div>
                    <FlipCard
                      food={selected}
                      name={`${selected.label} (100g)`}
                      badge="🔬 Edamam food database"
                      ctx={`Per 100g: ${selected.protein}g protein · ${selected.carbs}g carbs · ${selected.fat}g fat · ${selected.fiber}g fiber`}
                      onLog={e=>doLog(e,`${selected.label} (100g)`,selected.calories,selected.emoji)}/>
                  </motion.div>
                )}

                {query.length>=2&&!searching&&results.length===0&&(
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-3xl mb-2">🤔</div>
                    <p className="text-sm font-head font-semibold">No results for "{query}"</p>
                    <p className="text-xs mt-1">Try simpler terms — "rice", "chicken", "banana"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
