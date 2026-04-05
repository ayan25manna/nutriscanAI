import { useState } from 'react'
import { motion } from 'framer-motion'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const KCAL = { 1:2100, 3:1820, 4:2380, 5:null, 6:null }

export default function DateStrip() {
  const [active, setActive] = useState(2)

  return (
    <div className="bg-white border-b border-em-light/30 px-4 sm:px-7 py-3 flex gap-2 overflow-x-auto no-scrollbar">
      {Array.from({ length: 14 }, (_, i) => i + 1).map(d => {
        const dt = new Date(2026, 3, d)
        const dow = dt.getDay()
        const isWe = dow === 0 || dow === 6
        const isT = d === 2
        const isAc = d === active

        return (
          <motion.button
            key={d}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActive(d)}
            className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-full border-[1.5px] text-center transition-all min-w-[60px] cursor-pointer
              ${isAc
                ? 'border-em bg-em-light'
                : isWe
                ? 'border-teal/20 bg-teal-light'
                : 'border-transparent hover:border-em/30 hover:bg-em-xl'}`}
          >
            <span className="text-[10px] font-medium text-gray-400">{DAYS[dow]}</span>
            <span className={`font-mono-num text-[15px] font-semibold mt-0.5
              ${isAc ? 'text-em-dark' : isWe ? 'text-teal' : 'text-gray-700'}`}>
              {d}
            </span>
            <span className={`text-[10px] mt-0.5 ${isAc ? 'text-em' : 'text-gray-400'}`}>
              {KCAL[d] ? `${KCAL[d]}` : isT ? 'today' : '—'}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
