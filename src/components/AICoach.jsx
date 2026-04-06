import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getChatResponse } from '../services/edamamService.js'
import { useApp } from '../context/AppContext.jsx'

const QUICK = [
  {emoji:'📊',text:'How many calories do I have left?'},
  {emoji:'💪',text:'How do I hit my protein goal today?'},
  {emoji:'🍽️',text:'What should I eat for dinner?'},
  {emoji:'⚡',text:'Best snacks for energy and focus?'},
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-tl-sm w-fit shadow-sm border border-em-light/30">
      {[0,1,2].map(i=>(
        <motion.div key={i} className="w-2 h-2 rounded-full bg-em"
          animate={{y:[0,-6,0],opacity:[0.4,1,0.4]}}
          transition={{duration:0.8,delay:i*0.15,repeat:Infinity}}/>
      ))}
    </div>
  )
}

function Message({msg}) {
  const isAI = msg.role==='assistant'
  return (
    <motion.div initial={{opacity:0,y:10,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
      transition={{type:'spring',stiffness:380,damping:28}}
      className={`flex gap-2.5 ${isAI?'':'flex-row-reverse'}`}>
      {isAI&&(
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end shadow-md"
          style={{background:'linear-gradient(135deg,#059669,#0d9488)'}}>NS</div>
      )}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
        ${isAI?'bg-white text-gray-700 rounded-tl-sm border border-em-light/30'
              :'bg-gradient-to-br from-em to-em2 text-white rounded-tr-sm'}`}>
        {msg.content.split('**').map((part,i)=>
          i%2===1?<strong key={i}>{part}</strong>:<span key={i}>{part}</span>
        )}
      </div>
      {!isAI&&(
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end shadow-md">U</div>
      )}
    </motion.div>
  )
}

export default function AICoach() {
  const {caloriesEaten,GOAL}=useApp()
  const [msgs,setMsgs]=useState([{role:'assistant',content:"Hey! 👋 I'm your NutriScan nutrition coach. I know your calorie goal, today's intake, and your profile. Ask me anything — meal ideas, protein tips, or what to eat next!"}])
  const [input,setInput]=useState('')
  const [loading,setLoading]=useState(false)
  const [open,setOpen]=useState(false)
  const bottomRef=useRef(null)
  const inputRef=useRef(null)

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[msgs,loading])

  const send=async(text)=>{
    const content=(text||input).trim(); if(!content||loading) return
    setInput('')
    const newMsg={role:'user',content}
    setMsgs(prev=>[...prev,newMsg])
    setLoading(true)
    await new Promise(r=>setTimeout(r,600))
    const reply=getChatResponse(content,{caloriesEaten,goal:GOAL,protein:48,proteinGoal:120})
    setMsgs(prev=>[...prev,{role:'assistant',content:reply}])
    setLoading(false)
  }

  return (
    <>
      <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.93}}
        onClick={()=>{setOpen(v=>!v);setTimeout(()=>inputRef.current?.focus(),300)}}
        className="fixed bottom-6 right-6 z-[998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl"
        style={{background:'linear-gradient(135deg,#059669,#0d9488)',boxShadow:'0 8px 32px rgba(5,150,105,0.45)'}}
        animate={open?{}:{y:[0,-4,0]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}>
        {open?'✕':'💬'}
        {!open&&(
          <motion.span className="absolute inset-0 rounded-full border-2 border-em"
            animate={{scale:[1,1.5],opacity:[0.6,0]}} transition={{duration:1.8,repeat:Infinity}}/>
        )}
      </motion.button>

      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:20,scale:0.92}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:20,scale:0.92}} transition={{type:'spring',stiffness:320,damping:26}}
            className="fixed bottom-24 right-4 sm:right-6 z-[997] w-[calc(100vw-32px)] sm:w-[380px] max-h-[560px]
              bg-[#f8fffe] rounded-3xl shadow-2xl border border-em-light/40 flex flex-col overflow-hidden"
            style={{boxShadow:'0 24px 80px rgba(5,150,105,0.18),0 4px 16px rgba(0,0,0,0.08)'}}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-em-light/30"
              style={{background:'linear-gradient(135deg,#059669,#0d9488)'}}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">💬</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 rounded-full border-2 border-em animate-pulse"/>
              </div>
              <div>
                <p className="text-white font-head font-bold text-sm">NutriScan Coach</p>
                <p className="text-white/70 text-xs">Smart nutrition guidance · Always free</p>
              </div>
              <div className="ml-auto bg-white/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-white font-head">FREE</div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {msgs.map((m,i)=><Message key={i} msg={m}/>)}
              {loading&&<TypingIndicator/>}
              <div ref={bottomRef}/>
            </div>

            {/* Quick prompts */}
            {msgs.length<=1&&(
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK.map(({emoji,text})=>(
                  <motion.button key={text} whileHover={{y:-2}} whileTap={{scale:0.95}} onClick={()=>send(text)}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-em-light text-em-dark text-[11px] font-semibold font-head px-3 py-2 rounded-full border border-em/20 whitespace-nowrap">
                    {emoji} {text}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-em-light/30 flex gap-2 bg-white">
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                placeholder="Ask about meals, protein, calories..."
                className="flex-1 bg-[#f0fdf4] rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none border-[1.5px] border-em/15 focus:border-em transition-all font-body"/>
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.93}} onClick={()=>send()}
                disabled={loading||!input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                style={{background:'linear-gradient(135deg,#059669,#10b981)'}}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
