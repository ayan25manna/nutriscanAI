export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        head: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        em: { DEFAULT:'#059669', 2:'#10b981', light:'#d1fae5', xl:'#f0fdf4', dark:'#065f46' },
        coral: { DEFAULT:'#f97316', light:'#fff7ed', dark:'#c2410c' },
        teal: { DEFAULT:'#0d9488', light:'#ccfbf1', dark:'#0f766e' },
      },
      animation: {
        'pulse-dot':'pulseDot 2s ease-in-out infinite',
        'float':'float 3s ease-in-out infinite',
        'scanline':'scanline 2.8s ease-in-out infinite',
        'ring-glow':'ringGlow 2.3s ease-in-out infinite',
        'toast-in':'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'plus-burst':'plusBurst 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        pulseDot:{'0%,100%':{opacity:'1',transform:'scale(1)'},'50%':{opacity:'0.4',transform:'scale(1.6)'}},
        float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-9px)'}},
        scanline:{'0%':{top:'14%',opacity:'0'},'8%':{opacity:'1'},'92%':{opacity:'1'},'100%':{top:'83%',opacity:'0'}},
        ringGlow:{'0%,100%':{filter:'drop-shadow(0 0 0px transparent)'},'50%':{filter:'drop-shadow(0 0 12px rgba(5,150,105,0.5))'}},
        toastIn:{from:{opacity:'0',transform:'translateY(14px) scale(0.9)'},to:{opacity:'1',transform:'translateY(0) scale(1)'}},
        plusBurst:{'0%':{opacity:'1',transform:'scale(0.4) translateY(0)'},'55%':{opacity:'1',transform:'scale(1.7) translateY(-28px)'},'100%':{opacity:'0',transform:'scale(2.4) translateY(-60px)'}},
      },
    },
  },
  plugins: [],
}
