import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Hero from './components/Hero.jsx'
import Dashboard from './components/Dashboard.jsx'

function AppInner() {
  const { page } = useApp()
  const onDash = page !== 'hero'
  return (
    <AnimatePresence mode="wait">
      {!onDash ? (
        <motion.div key="hero" initial={{opacity:0}} animate={{opacity:1}}
          exit={{opacity:0,scale:0.97}} transition={{duration:0.4}}>
          <Hero/>
        </motion.div>
      ) : (
        <motion.div key="dash" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          exit={{opacity:0}} transition={{duration:0.4,ease:'easeOut'}}>
          <Dashboard/>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner/>
    </AppProvider>
  )
}
