import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

const NAV=[
  {id:'home',    label:'Dashboard',    icon:'🏠'},
  {id:'scan',    label:'Scan & search',icon:'📷'},
  {id:'analyze', label:'AI Analyzer',  icon:'🔬'},
  {id:'profile', label:'Profile wizard',icon:'👤'},
]

export default function Sidebar() {
  const {page,setPage,weekendMode,setWeekendMode,addToast}=useApp()
  return (
    <motion.aside initial={{x:-220,opacity:0}} animate={{x:0,opacity:1}}
      transition={{type:'spring',stiffness:260,damping:26}}
      className="hidden md:flex flex-col w-[210px] flex-shrink-0 bg-white border-r border-em-light/30
        sticky top-[114px] h-[calc(100vh-114px)] overflow-y-auto py-5 px-3.5">
      {NAV.map(({id,icon,label})=>(
        <motion.button key={id} whileHover={{x:3}} whileTap={{scale:0.97}} onClick={()=>setPage(id)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium font-head mb-1 transition-colors text-left w-full
            ${page===id?'bg-em-light text-em-dark font-semibold':'text-gray-500 hover:bg-em-xl hover:text-em-dark'}`}>
          <span className="text-base">{icon}</span>{label}
          {id==='analyze'&&<span className="ml-auto text-[9px] bg-em text-white font-bold px-1.5 py-0.5 rounded-full">AI</span>}
        </motion.button>
      ))}
      <div className="mt-auto bg-teal-light rounded-xl p-3 border border-teal/20">
        <div className="text-[11px] font-bold text-teal-dark font-head mb-2.5">🌙 Weekend mode</div>
        <div className="flex items-center gap-2.5">
          <motion.button onClick={()=>{setWeekendMode(v=>!v);if(!weekendMode)addToast('Weekend mode on! +200 kcal unlocked 🌴','ok')}}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${weekendMode?'bg-teal':'bg-slate-300'}`}
            whileTap={{scale:0.95}}>
            <motion.span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              animate={{x:weekendMode?20:0}} transition={{type:'spring',stiffness:500,damping:32}}/>
          </motion.button>
          <span className="text-xs font-medium text-gray-700">{weekendMode?'On':'Off'}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
          {weekendMode?'Weekend: 2,600 kcal 🌴':'Weekday: 2,400 kcal'}
        </p>
      </div>
    </motion.aside>
  )
}
