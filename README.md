# NutriScan — AI-Powered Nutrition App
### React 18 · Vite · Tailwind CSS · Framer Motion · Claude API

## Quick Start

```bash
cd nutriscan
npm install
npm run dev          # → http://localhost:5173
```

## AI Features (powered by Claude API)

| Feature | File | What it does |
|---|---|---|
| 🔬 Deep Nutrition Analyzer | `NutritionAnalyzer.jsx` | Type any food → Claude returns full macro/micro/vitamin/allergen breakdown + health score + profession-specific tip |
| 🧠 AI Nutrition Coach | `AICoach.jsx` | Floating chat bubble → real-time conversation with Claude about your meals, goals, and today's intake |
| 🍽️ Smart Meal Planner | `MealPlanner.jsx` | Click once → Claude generates a full remaining-day meal plan using local Indian foods |
| 📊 Weekly Insights | `WeeklyInsights.jsx` | Claude analyzes your 7-day calorie history → health score, grade, wins, warnings, tips |
| 📦 Packed Food Analyzer | `aiService.js` → `analyzePacked()` | AI reads ingredients, flags additives, gives safety score + healthier alternative |
| 👩‍🍳 Recipe Suggester | `aiService.js` → `suggestRecipe()` | Generates a quick recipe to fill remaining macros |

## Project Structure

```
src/
├── App.jsx                     # Root — Hero ↔ Dashboard
├── index.css                   # Tailwind + custom animations
├── context/
│   └── AppContext.jsx          # Global state + food DB
├── hooks/
│   └── useRingCanvas.js        # Canvas ring chart hook
├── services/
│   └── aiService.js            # All Claude API calls
└── components/
    ├── Hero.jsx                # Landing — 3D apple + particle field
    ├── Dashboard.jsx           # Shell — topbar, page switcher, AI coach
    ├── Sidebar.jsx             # Desktop nav + weekend toggle
    ├── DateStrip.jsx           # Scrollable date picker
    ├── HomeView.jsx            # Dashboard — rings, alerts, log, AI sections
    ├── RingChart.jsx           # Reusable canvas ring
    ├── MealLog.jsx             # Animated meal list
    ├── WeeklyBars.jsx          # Animated bar chart
    ├── AICoach.jsx             # 🧠 Floating AI chat coach
    ├── NutritionAnalyzer.jsx   # 🔬 Deep AI food analysis
    ├── MealPlanner.jsx         # 🍽️ AI meal plan generator
    ├── WeeklyInsights.jsx      # 📊 AI weekly report
    ├── ProfileWizard.jsx       # 4-step wizard
    └── Toast.jsx               # Framer Motion toasts
```

## Animations Used

- **3D Apple** — Canvas 2D polygon sphere with mouse-reactive rotation (no Three.js)
- **Particle Field** — Canvas particle network on hero background
- **Scroll reveals** — `useInView` + Framer Motion on dashboard cards
- **Spring transitions** — all page transitions and list entries use spring physics
- **Ring glow pulse** — CSS animation on main calorie ring
- **Scan line** — CSS keyframe animation on viewfinder
- **Card flips** — CSS 3D `rotateY(180deg)` on food scan results
- **Floating tags** — sinusoidal Y animation on hero food tags
- **Toast stack** — `AnimatePresence` slide-in/out with spring
- **Bar growth** — Staggered spring animation on weekly bars
- **Macro rings** — Canvas rings drawn on mount

## Responsive

- **Mobile (< 640px)** — hamburger menu, stacked layout, full-width cards
- **Tablet (640–1024px)** — 2-column grids, wider padding
- **Desktop (> 1024px)** — sidebar visible, multi-column dashboard

## Adding Real API Connections

### Barcode → Open Food Facts (free, has Indian products)
```js
const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
```

### Camera → AI Vision
Use Claude's vision API — send base64 image to `analyzeFood()` in `aiService.js`.

### Authentication
Add Supabase or Firebase for real user accounts and persistent meal history.
