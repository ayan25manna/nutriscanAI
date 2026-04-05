import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import RingChart from './RingChart.jsx'
import MealLog from './MealLog.jsx'
import WeeklyBars from './WeeklyBars.jsx'
import WeeklyInsights from './WeeklyInsights.jsx'
import MealPlanner from './MealPlanner.jsx'

const NOTIFS=[
  {type:'w',icon:'⚠',text:'Protein at 40% — add paneer or eggs to hit 120g today.'},
  {type:'g',icon:'✓',text:'Calories on track — great discipline today!'},
  {type:'t',icon:'☽',text:'Weekend tomorrow — +200 kcal flex available.'},
]
const LOCAL=[
  {icon:'🥛',text:'Sattu drink nearby — 120 kcal, high protein. Perfect for your desk shift!'},
  {icon:'🌿',text:'Guava in season locally — one serving hits your entire fiber gap.'},
]
const MACRO=[
  {label:'Protein',pct:40,val:'48/120g',color:'#f59e0b',track:'#fef3c7'},
  {label:'Carbs',pct:60,val:'180/300g',color:'#3b82f6',track:'#dbeafe'},
  {label:'Fats',pct:40,val:'30/75g',color:'#8b5cf6',track:'#ede9fe'},
]
const niC={w:'bg-coral-light text-coral-dark',g:'bg-em-light text-em-dark',b:'bg-blue-50 text-blue-700',t:'bg-teal-light text-teal-dark'}
const niB={w:'bg-orange-200',g:'bg-[#a7f3d0]',b:'bg-blue-200',t:'bg-[#99f6e4]'}

function FadeIn({children,delay=0,className=''}) {
  const ref=useRef(null); const inView=useInView(ref,{once:true,margin:'-60px'})
  return (
    <motion.div ref={ref} initial={{opacity:0,y:22}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:0.45,delay,ease:[0.34,1.56,0.64,1]}} className={className}>
      {children}
    </motion.div>
  )
}

export default function HomeView({onAddFood}) {
  const {caloriesEaten,GOAL}=useApp()
  const remaining=Math.max(0,GOAL-caloriesEaten)
  const pct=Math.min(100,Math.round((caloriesEaten/GOAL)*100))
  return (
    <div className="flex flex-col gap-4">
      {/* Ring hero + macros */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <FadeIn>
          <div className="bg-white rounded-2xl p-5 sm:p-6 card-shadow border border-em-light/30 flex flex-col items-center relative overflow-hidden h-full">
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(5,150,105,0.07),transparent 70%)'}}/>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-head mb-3">Calories remaining</p>
            <RingChart pct={pct} color="#059669" trackColor="#d1fae5" lineWidth={13} size={150} pulse>
              <motion.span key={remaining} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}
                className="font-mono-num text-2xl font-semibold text-em-dark leading-none">
                {remaining.toLocaleString()}
              </motion.span>
              <span className="text-[11px] text-gray-400 mt-1">kcal left</span>
            </RingChart>
            <div className="flex gap-4 sm:gap-5 mt-3">
              {[[GOAL.toLocaleString(),'Goal'],[caloriesEaten.toLocaleString(),'Eaten','text-em'],['312','Burned','text-coral']].map(([v,l,c='text-gray-700'])=>(
                <div key={l} className="text-center">
                  <div className={`font-mono-num text-[13px] font-semibold ${c}`}>{v}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <div className="flex flex-col gap-3">
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-3 gap-3">
              {MACRO.map(({label,pct,val,color,track},i)=>(
                <motion.div key={label} whileHover={{y:-3,boxShadow:'0 10px 28px rgba(5,150,105,0.14)'}}
                  className="bg-white rounded-2xl p-3 sm:p-4 card-shadow border border-em-light/30 flex flex-col items-center cursor-default">
                  <RingChart pct={pct} color={color} trackColor={track} lineWidth={9} size={66}>
                    <span className="font-mono-num text-xs font-semibold" style={{color}}>{pct}%</span>
                  </RingChart>
                  <div className="font-head font-bold text-xs text-gray-700 mt-1.5">{label}</div>
                  <div className="font-mono-num text-[10px] text-gray-400">{val}</div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 card-shadow border border-em-light/30">
                <h3 className="font-head font-bold text-gray-700 text-sm mb-3">Today's smart alerts</h3>
                {NOTIFS.map((n,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                    className={`flex gap-2.5 px-2.5 py-2 rounded-xl text-xs mb-1.5 last:mb-0 items-start leading-relaxed ${niC[n.type]}`}>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] mt-0.5 ${niB[n.type]}`}>{n.icon}</span>
                    {n.text}
                  </motion.div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-4 card-shadow border border-em-light/30">
                <h3 className="font-head font-bold text-gray-700 text-sm mb-3">📍 Local picks · Jamshedpur</h3>
                {LOCAL.map((p,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}
                    className={`flex gap-2.5 px-2.5 py-2 rounded-xl text-xs mb-1.5 last:mb-0 items-start leading-relaxed ${niC[i===0?'b':'t']}`}>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] mt-0.5 ${niB[i===0?'b':'t']}`}>{p.icon}</span>
                    {p.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Meal log + weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <FadeIn delay={0.08}><MealLog onAddClick={onAddFood}/></FadeIn>
        <FadeIn delay={0.12}><WeeklyBars/></FadeIn>
      </div>

      {/* AI Planner + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FadeIn delay={0.1}><MealPlanner/></FadeIn>
        <FadeIn delay={0.14}><WeeklyInsights/></FadeIn>
      </div>
    </div>
  )
}
