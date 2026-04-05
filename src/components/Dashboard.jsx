import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import Sidebar from './Sidebar.jsx'
import DateStrip from './DateStrip.jsx'
import HomeView from './HomeView.jsx'
import ScanHub from './ScanHub.jsx'
import ProfileWizard from './ProfileWizard.jsx'
import NutritionAnalyzer from './NutritionAnalyzer.jsx'
import Toast from './Toast.jsx'
import AICoach from './AICoach.jsx'

const NAV=[
  {id:'home',label:'Dashboard',icon:'🏠'},
  {id:'scan',label:'Scan food',icon:'📷'},
  {id:'analyze',label:'AI Analyzer',icon:'🔬'},
  {id:'profile',label:'Profile',icon:'👤'},
]

function TopBar() {
  const {page,setPage,weekendMode}=useApp()
  const [open,setOpen]=useState(false)
  return (
    <header className={`sticky top-0 z-50 bg-white border-b transition-colors duration-500 ${weekendMode?'border-teal/20':'border-em-light/30'}`}
      style={{boxShadow:'0 1px 0 rgba(5,150,105,0.07)'}}>
      <div className="flex items-center justify-between px-4 sm:px-7 py-3.5">
        <motion.div whileHover={{scale:1.03}} onClick={()=>setPage('home')}
          className="font-head font-extrabold text-em-dark text-lg sm:text-xl cursor-pointer tracking-tight select-none">
          Nutri<span className="text-em">Scan</span>
          <span className="ml-2 text-[10px] bg-em text-white font-bold px-2 py-0.5 rounded-full align-middle">AI</span>
        </motion.div>
        <nav className="hidden md:flex gap-1">
          {NAV.map(({id,label,icon})=>(
            <motion.button key={id} whileTap={{scale:0.96}} onClick={()=>setPage(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium font-head transition-all flex items-center gap-1.5
                ${page===id?'bg-em-light text-em-dark font-semibold':'text-gray-500 hover:bg-em-xl hover:text-em-dark'}`}>
              <span className="text-base">{icon}</span> {label}
            </motion.button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-head font-bold text-white text-xs"
              style={{background:'linear-gradient(135deg,#059669,#0d9488)'}}>AK</div>
            <span className="hidden lg:block font-medium">Arjun Kumar</span>
          </div>
          <motion.button whileTap={{scale:0.9}} onClick={()=>setOpen(v=>!v)}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-em-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                :<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
            transition={{duration:0.22}} className="overflow-hidden border-t border-em-light/30 bg-white md:hidden">
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV.map(({id,label,icon})=>(
                <motion.button key={id} whileTap={{scale:0.97}} onClick={()=>{setPage(id);setOpen(false)}}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold font-head flex items-center gap-2 transition-colors
                    ${page===id?'bg-em-light text-em-dark':'text-gray-500 hover:bg-em-xl hover:text-em-dark'}`}>
                  <span>{icon}</span>{label}
                </motion.button>
              ))}
              <MobileWeekendToggle/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function MobileWeekendToggle() {
  const {weekendMode,setWeekendMode,addToast}=useApp()
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-teal-light rounded-xl mt-1 border border-teal/20">
      <div>
        <p className="text-xs font-bold text-teal-dark font-head">🌙 Weekend mode</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{weekendMode?'2,600 kcal — relaxed 🌴':'2,400 kcal — focused'}</p>
      </div>
      <motion.button onClick={()=>{setWeekendMode(v=>!v);if(!weekendMode)addToast('Weekend mode on! +200 kcal unlocked 🌴','ok')}}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${weekendMode?'bg-teal':'bg-slate-300'}`}
        whileTap={{scale:0.95}}>
        <motion.span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{x:weekendMode?20:0}} transition={{type:'spring',stiffness:500,damping:32}}/>
      </motion.button>
    </div>
  )
}

const PV={initial:{opacity:0,y:12},animate:{opacity:1,y:0,transition:{duration:0.3}},exit:{opacity:0,y:-8,transition:{duration:0.2}}}

export default function Dashboard() {
  const {page,setPage}=useApp()
  return (
    <div className="min-h-screen bg-[#f8fffe] flex flex-col">
      <TopBar/>
      <DateStrip/>
      <div className="flex flex-1">
        <Sidebar/>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {page==='home'&&(
              <motion.div key="home" {...PV}>
                <HomeView onAddFood={()=>setPage('scan')}/>
              </motion.div>
            )}
            {page==='scan'&&(
              <motion.div key="scan" {...PV}>
                <h2 className="font-head font-bold text-gray-700 text-base sm:text-lg mb-4">📷 Scan & add food</h2>
                <ScanHub/>
              </motion.div>
            )}
            {page==='analyze'&&(
              <motion.div key="analyze" {...PV}>
                <h2 className="font-head font-bold text-gray-700 text-base sm:text-lg mb-4">🔬 AI deep nutrition analyzer</h2>
                <NutritionAnalyzer/>
              </motion.div>
            )}
            {page==='profile'&&(
              <motion.div key="profile" {...PV}>
                <h2 className="font-head font-bold text-gray-700 text-base sm:text-lg mb-4">👤 Profile wizard</h2>
                <ProfileWizard/>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Toast/>
      <AICoach/>
    </div>
  )
}
