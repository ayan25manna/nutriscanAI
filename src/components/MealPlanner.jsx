import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMealRecommendations } from '../services/edamamService.js'
import { useApp } from '../context/AppContext.jsx'

const MEAL_COLORS={
  'Breakfast':     {bg:'#fef3c7',dot:'#f59e0b'},
  'Lunch':         {bg:'#dbeafe',dot:'#3b82f6'},
  'Afternoon snack':{bg:'#ede9fe',dot:'#8b5cf6'},
  'Dinner':        {bg:'#d1fae5',dot:'#059669'},
  'Evening snack': {bg:'#fce7f3',dot:'#ec4899'},
}

export default function MealPlanner() {
  const {caloriesEaten,GOAL,addToast}=useApp()
  const [plan,setPlan]=useState(null)
  const remaining=Math.max(0,GOAL-caloriesEaten)

  const generate=()=>{
    const result=generateMealRecommendations(remaining,{profession:'Software Engineer',city:'Jamshedpur',goal:'Maintain weight'})
    setPlan(result)
    addToast('Meal plan generated! 🍽️','ok')
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-em-light/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-head font-bold text-gray-700 text-sm flex items-center gap-2">
            🍽️ Smart Meal Suggestions
            <span className="text-[10px] bg-em-light text-em-dark font-bold px-2 py-0.5 rounded-full font-head">FREE</span>
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Personalized for your remaining <span className="font-mono-num font-semibold text-em-dark">{remaining.toLocaleString()} kcal</span>
          </p>
        </div>
        <motion.button whileHover={{y:-1}} whileTap={{scale:0.96}} onClick={generate}
          className="btn-em px-4 py-2 rounded-xl text-white text-xs font-bold font-head flex items-center gap-1.5">
          ✨ Suggest meals
        </motion.button>
      </div>

      <AnimatePresence>
        {plan&&(
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div className="bg-em-xl rounded-xl px-4 py-2.5 mb-3 border border-em/10 flex items-center justify-between">
              <div>
                <p className="font-head font-bold text-em-dark text-xs">{plan.mealTime} suggestions</p>
                <p className="text-[11px] text-em/70 mt-0.5">{remaining} kcal remaining today</p>
              </div>
              <span className="text-2xl">{plan.mealTime==='Breakfast'?'🌅':plan.mealTime==='Lunch'?'☀️':plan.mealTime==='Dinner'?'🌙':'⚡'}</span>
            </div>

            <div className="flex flex-col gap-2.5 mb-3">
              {plan.suggestions.map((meal,i)=>{
                const c=MEAL_COLORS[plan.mealTime]||{bg:'#f0fdf4',dot:'#059669'}
                return (
                  <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                    className="flex gap-3 p-3 rounded-xl border border-gray-100"
                    style={{background:c.bg+'60'}}>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                      <div className="w-3 h-3 rounded-full" style={{background:c.dot}}/>
                      {i<plan.suggestions.length-1&&<div className="w-0.5 flex-1 bg-gray-200 rounded-full min-h-[16px]"/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-head font-bold text-xs text-gray-700">{meal.emoji} {meal.name}</span>
                        <span className="font-mono-num text-xs font-semibold text-em-dark">{meal.kcal} kcal</span>
                      </div>
                      <p className="text-[10px] text-gray-500 italic">{meal.reason}</p>
                      {meal.protein>0&&<span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full mt-1 inline-block border border-yellow-100">{meal.protein}g protein</span>}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {plan.localFavorite&&(
              <div className="bg-teal-light rounded-xl p-3 border border-teal/15 mb-2">
                <p className="text-[10px] font-bold text-teal-dark mb-0.5 font-head">📍 LOCAL FAVOURITE · JAMSHEDPUR</p>
                <p className="text-xs text-teal-dark">{plan.localFavorite} — a delicious local option for variety!</p>
              </div>
            )}
            <p className="text-[11px] text-gray-500 italic text-center">💡 {plan.tip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
