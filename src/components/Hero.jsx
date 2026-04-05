import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

function ParticleField() {
  const cvRef = useRef(null)
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const resize = () => { cv.width = cv.offsetWidth*dpr; cv.height = cv.offsetHeight*dpr }
    resize(); window.addEventListener('resize', resize)
    const ctx = cv.getContext('2d')
    const pts = Array.from({ length:55 }, () => ({
      x: Math.random(), y: Math.random(),
      vx:(Math.random()-0.5)*0.0003, vy:(Math.random()-0.5)*0.0003,
      r: Math.random()*1.8+0.5, a: Math.random()*0.4+0.1,
    }))
    let raf
    const frame = () => {
      const W=cv.width,H=cv.height
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,W,H)
      for(const p of pts){
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0)p.x=1; if(p.x>1)p.x=0; if(p.y<0)p.y=1; if(p.y>1)p.y=0
        ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r*dpr,0,Math.PI*2)
        ctx.fillStyle=`rgba(52,211,153,${p.a})`; ctx.fill()
      }
      for(let i=0;i<pts.length;i++){for(let j=i+1;j<pts.length;j++){
        const dx=(pts[i].x-pts[j].x)*W, dy=(pts[i].y-pts[j].y)*H
        const d=Math.sqrt(dx*dx+dy*dy)
        if(d<80*dpr){
          ctx.beginPath(); ctx.moveTo(pts[i].x*W,pts[i].y*H); ctx.lineTo(pts[j].x*W,pts[j].y*H)
          ctx.strokeStyle=`rgba(52,211,153,${0.055*(1-d/(80*dpr))})`; ctx.lineWidth=0.5; ctx.stroke()
        }
      }}
      raf=requestAnimationFrame(frame)
    }
    raf=requestAnimationFrame(frame)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={cvRef} className="absolute inset-0 w-full h-full pointer-events-none"/>
}

function Apple3D() {
  const cvRef=useRef(null), mouseRef=useRef({x:0,y:0}), stateRef=useRef({rx:0,ry:0,t:0}), rafRef=useRef(null)
  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return
    const dpr=window.devicePixelRatio||1
    const rs=()=>{ cv.width=cv.offsetWidth*dpr; cv.height=cv.offsetHeight*dpr }
    rs(); window.addEventListener('resize',rs)
    const mv=e=>{const r=cv.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;mouseRef.current.x=(cx-r.left)/r.width*2-1;mouseRef.current.y=(cy-r.top)/r.height*2-1}
    const ml=()=>{mouseRef.current.x=0;mouseRef.current.y=0}
    cv.addEventListener('mousemove',mv); cv.addEventListener('touchmove',mv,{passive:true})
    cv.addEventListener('mouseleave',ml); cv.addEventListener('touchend',ml)
    const proj=(x,y,z,rx,ry,cx,cy)=>{
      const cX=Math.cos(rx*Math.PI/180),sX=Math.sin(rx*Math.PI/180)
      const cY=Math.cos(ry*Math.PI/180),sY=Math.sin(ry*Math.PI/180)
      const ry2=y*cX-z*sX,rz=y*sX+z*cX,rx2=x*cY+rz*sY,rz2=-x*sY+rz*cY
      const f=300,d=f/(f+rz2+270); return{x:cx+rx2*d,y:cy+ry2*d,s:d}
    }
    const frame=()=>{
      const ctx=cv.getContext('2d'),W=cv.width/dpr,H=cv.height/dpr
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H)
      const s=stateRef.current,m=mouseRef.current
      s.t+=0.013; s.rx+=(m.y*15-s.rx)*0.07; s.ry+=(m.x*20+s.t*28-s.ry)*0.07
      const cx=W/2,cy=H/2+10,R=Math.min(W,H)*0.19
      const NL=20,NS=16,faces=[]
      for(let i=0;i<NL;i++)for(let j=0;j<NS;j++){
        const ph1=(j/NS)*Math.PI,ph2=((j+1)/NS)*Math.PI,th1=(i/NL)*Math.PI*2,th2=((i+1)/NL)*Math.PI*2
        const A=proj(R*Math.sin(ph1)*Math.cos(th1),R*Math.cos(ph1),R*Math.sin(ph1)*Math.sin(th1),s.rx,s.ry,cx,cy)
        const B=proj(R*Math.sin(ph2)*Math.cos(th1),R*Math.cos(ph2),R*Math.sin(ph2)*Math.sin(th1),s.rx,s.ry,cx,cy)
        const C=proj(R*Math.sin(ph2)*Math.cos(th2),R*Math.cos(ph2),R*Math.sin(ph2)*Math.sin(th2),s.rx,s.ry,cx,cy)
        const D=proj(R*Math.sin(ph1)*Math.cos(th2),R*Math.cos(ph1),R*Math.sin(ph1)*Math.sin(th2),s.rx,s.ry,cx,cy)
        faces.push({A,B,C,D,z:(A.s+B.s+C.s+D.s)/4})
      }
      faces.sort((a,b)=>a.z-b.z)
      for(const f of faces){
        const br=0.18+0.82*f.z,rr=Math.round(4+br*224),gg=Math.round(128+br*92),bb=Math.round(5+br*24)
        ctx.beginPath(); ctx.moveTo(f.A.x,f.A.y); ctx.lineTo(f.B.x,f.B.y); ctx.lineTo(f.C.x,f.C.y); ctx.lineTo(f.D.x,f.D.y); ctx.closePath()
        ctx.fillStyle=`rgb(${rr},${gg},${bb})`; ctx.fill()
        ctx.strokeStyle='rgba(0,50,10,0.07)'; ctx.lineWidth=0.3; ctx.stroke()
      }
      const s0=proj(0,-R-1,0,s.rx,s.ry,cx,cy),s1=proj(0,-R-28,0,s.rx,s.ry,cx,cy)
      ctx.beginPath(); ctx.moveTo(s0.x,s0.y); ctx.lineTo(s1.x,s1.y)
      ctx.strokeStyle='#5d4037'; ctx.lineWidth=4*s0.s; ctx.lineCap='round'; ctx.stroke()
      const la=proj(-16,-R-18,0,s.rx,s.ry,cx,cy),lb=proj(-46,-R-8,0,s.rx,s.ry,cx,cy),lc=proj(-27,-R-5,0,s.rx,s.ry,cx,cy)
      ctx.beginPath(); ctx.moveTo(la.x,la.y); ctx.quadraticCurveTo(lb.x,lb.y,lc.x,lc.y)
      ctx.fillStyle='#2e7d32'; ctx.fill()
      const g=ctx.createRadialGradient(cx+10,cy-12,0,cx+10,cy-12,R*0.5)
      g.addColorStop(0,'rgba(255,255,255,0.22)'); g.addColorStop(1,'rgba(255,255,255,0)')
      ctx.beginPath(); ctx.arc(cx,cy,R+2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      ctx.setTransform(1,0,0,1,0,0); rafRef.current=requestAnimationFrame(frame)
    }
    rafRef.current=requestAnimationFrame(frame)
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener('resize',rs);cv.removeEventListener('mousemove',mv);cv.removeEventListener('touchmove',mv);cv.removeEventListener('mouseleave',ml);cv.removeEventListener('touchend',ml)}
  },[])
  return <canvas ref={cvRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none" style={{minHeight:280}}/>
}

const FEATURES=[
  {icon:'🔬',title:'AI Deep Analysis',sub:'Claude breaks down every nutrient'},
  {icon:'📷',title:'Live Food Scan',sub:'Camera + barcode + AI vision'},
  {icon:'🧠',title:'AI Nutrition Coach',sub:'Real-time Claude chat coach'},
  {icon:'📅',title:'Smart Scheduling',sub:'Weekend mode + calorie flex'},
]

export default function Hero() {
  const { setPage } = useApp()
  const [hov, setHov] = useState(null)
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0b1120] overflow-hidden">
      <ParticleField/>
      <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none opacity-30" style={{background:'radial-gradient(circle,rgba(5,150,105,0.25),transparent 70%)'}}/>
      <div className="absolute bottom-[-80px] left-[-60px] w-80 h-80 rounded-full pointer-events-none opacity-20" style={{background:'radial-gradient(circle,rgba(37,99,235,0.3),transparent 70%)'}}/>
      <div className="flex flex-col lg:flex-row flex-1 relative z-10">
        <motion.div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 pt-20 lg:pt-0 pb-8 max-w-2xl"
          initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}} transition={{duration:0.8,ease:'easeOut'}}>
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="glass-green inline-flex items-center gap-2 rounded-full px-4 py-2 w-fit mb-6">
            <motion.span className="w-2 h-2 rounded-full bg-emerald-400" animate={{scale:[1,1.5,1],opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}}/>
            <span className="text-emerald-400 text-xs font-semibold font-head tracking-wide">AI-powered · Claude-enhanced · Production ready</span>
          </motion.div>
          <motion.h1 className="font-head font-extrabold text-white leading-[1.05] tracking-[-0.05em] mb-5"
            style={{fontSize:'clamp(2.2rem,5vw,3.8rem)'}}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
            The smartest way<br/>to track your<br/><span className="text-gradient">nutrition.</span>
          </motion.h1>
          <motion.p className="text-slate-400 leading-relaxed mb-8 max-w-md text-sm sm:text-base"
            initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
            Real AI nutrition coaching powered by Claude. Scan any food, get deep analysis, plan meals, and hit your goals — personalized for your profession and location.
          </motion.p>
          <motion.div className="flex flex-wrap gap-3 mb-10" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
            <motion.button whileHover={{y:-3,boxShadow:'0 16px 44px rgba(5,150,105,0.55)'}} whileTap={{scale:0.96}}
              onClick={()=>setPage('home')} className="btn-em rounded-2xl px-7 py-3.5 text-white font-bold font-head text-sm sm:text-base transition-all">
              🚀 Start tracking free
            </motion.button>
            <motion.button whileHover={{background:'rgba(255,255,255,0.14)'}} whileTap={{scale:0.96}}
              onClick={()=>setPage('scan')} className="rounded-2xl px-7 py-3.5 text-white font-semibold font-head text-sm sm:text-base border border-white/15 bg-white/7 transition-all">
              Try AI scanner →
            </motion.button>
          </motion.div>
          <motion.div className="flex gap-6 sm:gap-10 mb-10" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}>
            {[['2,400','Avg kcal goal'],['50k+','Foods in AI DB'],['98%','AI accuracy']].map(([v,l])=>(
              <div key={l}><div className="font-mono-num text-2xl sm:text-3xl font-semibold text-emerald-400">{v}</div><div className="text-xs text-slate-500 mt-0.5">{l}</div></div>
            ))}
          </motion.div>
          <motion.div className="grid grid-cols-2 gap-2.5 max-w-md" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
            {FEATURES.map(({icon,title,sub},i)=>(
              <motion.div key={title} whileHover={{y:-2}} onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}
                className="glass rounded-2xl p-3.5 cursor-default transition-all"
                style={{background:hov===i?'rgba(5,150,105,0.18)':'rgba(255,255,255,0.05)'}}>
                <div className="text-xl mb-1.5">{icon}</div>
                <div className="text-white text-xs font-bold font-head">{title}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div className="flex-shrink-0 w-full lg:w-[460px] min-h-[300px] lg:min-h-screen relative flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4,duration:1}}>
          <Apple3D/>
          {[{label:'🍎 Apple',kcal:'95 kcal',pos:'top-[20%] left-[3%]',delay:0},{label:'🫐 Blueberries',kcal:'84 kcal',pos:'bottom-[28%] left-[2%]',delay:1.5},{label:'AI identified ✓',kcal:'98% sure',pos:'top-[30%] right-[3%]',delay:0.8}].map(({label,kcal,pos,delay})=>(
            <motion.div key={label} animate={{y:[0,-8,0]}} transition={{duration:3,ease:'easeInOut',repeat:Infinity,delay}}
              className={`absolute glass rounded-xl px-3 py-2 text-white text-xs font-semibold z-10 pointer-events-none whitespace-nowrap ${pos}`}>
              {label} · <span className="text-emerald-400 font-mono-num">{kcal}</span>
            </motion.div>
          ))}
          <div className="scanline-animate z-20"/>
          <motion.div animate={{opacity:[0.7,1,0.7]}} transition={{duration:2.5,repeat:Infinity}}
            className="absolute bottom-8 right-4 glass-green rounded-full px-4 py-2 flex items-center gap-2 text-emerald-400 text-xs font-semibold font-head z-10">
            <motion.span className="w-2 h-2 rounded-full bg-emerald-400" animate={{scale:[1,1.4,1]}} transition={{duration:1.4,repeat:Infinity}}/>
            Claude AI active
          </motion.div>
        </motion.div>
      </div>
      <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10"
        animate={{y:[0,6,0]}} transition={{duration:2,repeat:Infinity}}>
        <p className="text-slate-500 text-[10px] font-semibold tracking-widest">SCROLL TO EXPLORE</p>
        <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center p-1">
          <motion.div className="w-1 h-2 bg-em rounded-full" animate={{y:[0,10,0]}} transition={{duration:1.6,repeat:Infinity}}/>
        </div>
      </motion.div>
    </div>
  )
}
