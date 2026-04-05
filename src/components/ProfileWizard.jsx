import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

const PROFESSIONS = [
  { em:'👨‍💻', name:'Software Engineer', kcal:'2,200–2,600 kcal' },
  { em:'🏃',   name:'Athlete',           kcal:'3,000–4,500 kcal' },
  { em:'👷',   name:'Construction',      kcal:'3,000–3,500 kcal' },
  { em:'👨‍⚕️', name:'Healthcare',         kcal:'2,400–3,000 kcal' },
  { em:'👩‍🏫', name:'Teacher',            kcal:'2,000–2,400 kcal' },
  { em:'🎓',   name:'Student',           kcal:'1,800–2,400 kcal' },
  { em:'🧑‍🍳', name:'Chef / F&B',         kcal:'2,400–2,800 kcal' },
  { em:'🚀',   name:'Other',             kcal:'Custom goal' },
]

const STEPS = ['Profession','Personal','Goals','Done']

function StepDot({ i, current }) {
  const done = i < current
  const active = i === current
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <motion.div
        animate={done ? { background:'#059669', borderColor:'#059669', color:'#fff' }
          : active ? { borderColor:'#059669', color:'#059669' }
          : { borderColor:'#e5e7eb', color:'#9ca3af' }}
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono-num font-bold text-sm bg-white"
        style={{ boxShadow: active ? '0 0 0 4px rgba(5,150,105,0.15)' : 'none' }}
      >
        {done ? '✓' : i + 1}
      </motion.div>
      <span className={`text-[10px] font-semibold font-head hidden sm:block
        ${active || done ? 'text-em-dark' : 'text-gray-400'}`}>
        {STEPS[i]}
      </span>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-head">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `w-full px-3 py-2.5 border-[1.5px] border-em/14 rounded-xl text-sm text-gray-700
  font-body bg-white outline-none focus:border-em focus:ring-2 focus:ring-em/10 transition-all`

export default function ProfileWizard() {
  const { setPage, addToast } = useApp()
  const [step, setStep] = useState(0)
  const [prof, setProf] = useState(0)
  const [form, setForm] = useState({
    name:'Arjun Kumar', age:'25', gender:'Male',
    weight:'72', height:'175', activity:'Sedentary (desk/office)',
    goal:'Maintain weight', diet:'No restriction',
    city:'Jamshedpur', state:'Jharkhand',
  })

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const next = () => {
    if (step === 2) addToast('Profile saved! Targets updated.', 'ok')
    setStep(s => Math.min(s + 1, 3))
  }

  const pageVariants = {
    enter:  { opacity: 0, x:  30 },
    center: { opacity: 1, x:   0 },
    exit:   { opacity: 0, x: -30 },
  }

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
      <div className="bg-white rounded-2xl p-5 sm:p-7 card-shadow border border-em-light/30">

        {/* Steps indicator */}
        <div className="relative flex mb-7">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0" />
          {STEPS.map((_, i) => <StepDot key={i} i={i} current={step} />)}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0 — Profession */}
          {step === 0 && (
            <motion.div key="s0" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <p className="font-head font-semibold text-gray-700 text-sm mb-4">
                Select your profession — your calorie target adapts automatically
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {PROFESSIONS.map(({ em, name, kcal }, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ y: -3, boxShadow:'0 10px 28px rgba(5,150,105,0.15)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setProf(i)}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all
                      ${prof === i
                        ? 'border-em bg-em-xl shadow-[0_4px_18px_rgba(5,150,105,0.22)]'
                        : 'border-em/10 hover:border-em/40 bg-white'}`}
                  >
                    <motion.span
                      animate={prof === i ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                      className="text-4xl sm:text-5xl block leading-none mb-2"
                    >
                      {em}
                    </motion.span>
                    <div className="font-head font-bold text-[11px] sm:text-xs text-gray-700">{name}</div>
                    <div className="font-mono-num text-[10px] text-em mt-1">{kcal}</div>
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-end">
                <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={next}
                  className="btn-em px-6 py-2.5 rounded-xl text-white font-bold font-head text-sm">
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 1 — Personal */}
          {step === 1 && (
            <motion.div key="s1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <FormField label="Full name"><input className={inputCls} value={form.name} onChange={upd('name')} /></FormField>
                <FormField label="Age"><input className={inputCls} type="number" value={form.age} onChange={upd('age')} /></FormField>
                <FormField label="Gender">
                  <select className={inputCls} value={form.gender} onChange={upd('gender')}>
                    {['Male','Female','Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>
                <FormField label="Weight (kg)"><input className={inputCls} type="number" value={form.weight} onChange={upd('weight')} /></FormField>
                <FormField label="Height (cm)"><input className={inputCls} type="number" value={form.height} onChange={upd('height')} /></FormField>
                <FormField label="Activity level">
                  <select className={inputCls} value={form.activity} onChange={upd('activity')}>
                    {['Sedentary (desk/office)','Lightly active','Moderately active','Very active'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-xl border-[1.5px] border-em/20 text-gray-500 font-semibold font-head text-sm hover:bg-em-xl transition-colors">← Back</button>
                <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={next} className="btn-em px-6 py-2.5 rounded-xl text-white font-bold font-head text-sm">Continue →</motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Goals */}
          {step === 2 && (
            <motion.div key="s2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <FormField label="Primary goal">
                  <select className={inputCls} value={form.goal} onChange={upd('goal')}>
                    {['Maintain weight','Lose weight','Gain muscle','Improve energy'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>
                <FormField label="Diet preference">
                  <select className={inputCls} value={form.diet} onChange={upd('diet')}>
                    {['No restriction','Vegetarian','Vegan','Non-vegetarian'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>
                <FormField label="City"><input className={inputCls} value={form.city} onChange={upd('city')} /></FormField>
                <FormField label="State / region"><input className={inputCls} value={form.state} onChange={upd('state')} /></FormField>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border-[1.5px] border-em/20 text-gray-500 font-semibold font-head text-sm hover:bg-em-xl transition-colors">← Back</button>
                <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={next} className="btn-em px-6 py-2.5 rounded-xl text-white font-bold font-head text-sm">Save profile →</motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <motion.div key="s3" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
              className="text-center py-10">
              <motion.div
                animate={{ y: [0,-9,0] }}
                transition={{ duration: 2, ease:'easeInOut', repeat: Infinity }}
                className="text-6xl mb-5 inline-block"
              >🎉</motion.div>
              <h2 className="font-head font-extrabold text-em-dark text-xl mb-2">Profile complete!</h2>
              <p className="text-gray-400 text-sm mb-7 leading-relaxed">
                Your personalized daily target is{' '}
                <span className="font-mono-num font-bold text-em">2,400 kcal</span>
                {' '}— tailored for a {PROFESSIONS[prof].name} in {form.city}, {form.state}.
              </p>
              <motion.button
                whileHover={{ y:-2, boxShadow:'0 14px 42px rgba(5,150,105,0.55)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPage('home')}
                className="btn-em px-8 py-3.5 rounded-xl text-white font-bold font-head text-sm"
              >
                Go to dashboard 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
