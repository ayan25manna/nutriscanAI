import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export const FOOD_DB = {
  apple:   { e:'🍎', c:52,  carb:14,  fib:2.4, p:0.3, s:10,  f:0.2 },
  banana:  { e:'🍌', c:89,  carb:23,  fib:2.6, p:1.1, s:12,  f:0.3 },
  mango:   { e:'🥭', c:60,  carb:15,  fib:1.6, p:0.8, s:14,  f:0.4 },
  papaya:  { e:'🍈', c:43,  carb:11,  fib:1.7, p:0.5, s:8,   f:0.3 },
  guava:   { e:'🍀', c:68,  carb:14,  fib:5.4, p:2.6, s:9,   f:1.0 },
  moong:   { e:'🫘', c:116, carb:20,  fib:8.0, p:9.0, s:2,   f:0.4 },
  dal:     { e:'🍲', c:116, carb:20,  fib:8.0, p:9.0, s:2,   f:0.4 },
  rice:    { e:'🍚', c:130, carb:28,  fib:0.4, p:2.7, s:0,   f:0.3 },
  idli:    { e:'🫓', c:39,  carb:8,   fib:0.5, p:2.0, s:0,   f:0.2 },
  orange:  { e:'🍊', c:47,  carb:12,  fib:2.4, p:0.9, s:9,   f:0.1 },
  spinach: { e:'🥬', c:23,  carb:3.6, fib:2.2, p:2.9, s:0.4, f:0.4 },
  egg:     { e:'🥚', c:155, carb:1.1, fib:0,   p:13,  s:1.1, f:11  },
  paneer:  { e:'🧀', c:265, carb:3.4, fib:0,   p:18.3,s:3.4, f:20.8},
}

export function AppProvider({ children }) {
  const [page, setPage]               = useState('hero')       // 'hero' | 'home' | 'scan' | 'profile'
  const [weekendMode, setWeekendMode] = useState(false)
  const [caloriesEaten, setCaloriesEaten] = useState(1240)
  const [toasts, setToasts]           = useState([])
  const [loggedMeals, setLoggedMeals] = useState([
    { id:1, name:'Idli with sambar',  icon:'🍚', bg:'#d1fae5', kcal:210, time:'7:30 AM',  meta:'Breakfast' },
    { id:2, name:'Banana (1 medium)', icon:'🍌', bg:'#fef3c7', kcal:89,  time:'10:15 AM', meta:'Snack · fruit' },
    { id:3, name:'Dal rice (bowl)',   icon:'🍛', bg:'#dbeafe', kcal:380, time:'1:00 PM',  meta:'Lunch' },
    { id:4, name:'Parle-G (60g)',     icon:'🍪', bg:'#fff7ed', kcal:254, time:'3:45 PM',  meta:'Snack · packed' },
    { id:5, name:'Apple (1 medium)', icon:'🍎', bg:'#d1fae5', kcal:95,  time:'6:30 PM',  meta:'Snack · fruit' },
  ])

  const GOAL = weekendMode ? 2600 : 2400

  const addToast = useCallback((msg, type = 'ok') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800)
  }, [])

  const logFood = useCallback((name, kcal, icon = '🍽️') => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
    setLoggedMeals(prev => [
      ...prev,
      { id: Date.now(), name, icon, bg:'#d1fae5', kcal, time, meta:'Just added' }
    ])
    setCaloriesEaten(prev => prev + kcal)
    addToast(`${name} logged! −${kcal} kcal remaining.`, 'ok')
  }, [addToast])

  return (
    <AppContext.Provider value={{
      page, setPage,
      weekendMode, setWeekendMode,
      caloriesEaten, GOAL,
      loggedMeals,
      toasts,
      addToast, logFood,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
