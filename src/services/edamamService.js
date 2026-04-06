// ─────────────────────────────────────────────────────────────────────────────
// Edamam API Service — Free Tier
// Nutrition Analysis API  → analyzes ingredients / meals
// Food Database API       → search food items by name
// ─────────────────────────────────────────────────────────────────────────────

// const NUTRITION_APP_ID  = import.meta.env.VITE_EDAMAM_NUTRITION_APP_ID
// const NUTRITION_APP_KEY = import.meta.env.VITE_EDAMAM_NUTRITION_APP_KEY
// const FOOD_APP_ID       = import.meta.env.VITE_EDAMAM_FOOD_APP_ID
// const FOOD_APP_KEY      = import.meta.env.VITE_EDAMAM_FOOD_APP_KEY

// const NUTRITION_URL = 'https://api.edamam.com/api/nutrition-details'
// const FOOD_URL      = 'https://api.edamam.com/api/food-database/v2/parser'
// const NUTRIENTS_URL = 'https://api.edamam.com/api/food-database/v2/nutrients'

// Add this to your existing IDs/Keys section
const MEAL_PLAN_URL = 'https://api.edamam.com/api/meal-planner/v1'

// Note: Meal Planner usually uses its own App ID/Key. 
// If your plan covers all, use the existing ones.
const MEAL_APP_ID = import.meta.env.VITE_EDAMAM_MEAL_APP_ID || FOOD_APP_ID
const MEAL_APP_KEY = import.meta.env.VITE_EDAMAM_MEAL_APP_KEY || FOOD_APP_KEY

// ── Helpers ──────────────────────────────────────────────────────────────────

function round(n, dp = 1) {
  return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp)
}

function getNutrient(nutrients, key) {
  return nutrients?.[key]?.quantity ?? 0
}

// Map Edamam nutrient keys → readable labels
const VITAMIN_KEYS = {
  VITA_RAE: 'Vitamin A', VITC:    'Vitamin C', VITD:  'Vitamin D',
  VITE:     'Vitamin E', VITK1:   'Vitamin K', THIAMIN:'Vitamin B1',
  RIBF:     'Vitamin B2',NIA:     'Niacin B3', VITB6A:'Vitamin B6',
  FOLDFE:   'Folate B9', VITB12:  'Vitamin B12',
}
const MINERAL_KEYS = {
  CA: 'Calcium', FE: 'Iron', MG: 'Magnesium', P: 'Phosphorus',
  K:  'Potassium', NA:'Sodium', ZN:'Zinc', CU:'Copper', MN:'Manganese',
}

function extractVitamins(totalNutrients) {
  return Object.entries(VITAMIN_KEYS)
    .map(([key, name]) => ({ name, amount: totalNutrients?.[key]?.quantity, unit: totalNutrients?.[key]?.unit }))
    .filter(v => v.amount && v.amount > 0)
    .map(v => ({ name: v.name, amount: `${round(v.amount)} ${v.unit}` }))
}

function extractMinerals(totalNutrients) {
  return Object.entries(MINERAL_KEYS)
    .map(([key, name]) => ({ name, amount: totalNutrients?.[key]?.quantity, unit: totalNutrients?.[key]?.unit }))
    .filter(m => m.amount && m.amount > 0)
    .map(m => ({ name: m.name, amount: `${round(m.amount)} ${m.unit}` }))
}

function calcHealthScore(nutrients) {
  let score = 5
  const fiber   = getNutrient(nutrients, 'FIBTG')
  const protein = getNutrient(nutrients, 'PROCNT')
  const sugar   = getNutrient(nutrients, 'SUGAR')
  const sat     = getNutrient(nutrients, 'FASAT')
  const sodium  = getNutrient(nutrients, 'NA')
  const cal     = getNutrient(nutrients, 'ENERC_KCAL')

  if (fiber   > 5)   score += 1.5
  if (protein > 10)  score += 1.5
  if (sugar   < 5)   score += 1
  if (sugar   > 20)  score -= 1.5
  if (sat     > 5)   score -= 1
  if (sodium  > 600) score -= 1
  if (cal     < 200) score += 0.5
  if (cal     > 500) score -= 0.5

  return Math.min(10, Math.max(1, Math.round(score)))
}

function getVerdict(healthScore) {
  if (healthScore >= 9) return 'Excellent'
  if (healthScore >= 7) return 'Good'
  if (healthScore >= 5) return 'Okay'
  if (healthScore >= 3) return 'Limit'
  return 'Avoid'
}

function getGI(foodLabel = '', totalNutrients) {
  const sugar = getNutrient(totalNutrients, 'SUGAR')
  const fiber = getNutrient(totalNutrients, 'FIBTG')
  const carbs = getNutrient(totalNutrients, 'CHOCDF')
  const label = foodLabel.toLowerCase()
  if (label.includes('sugar') || label.includes('candy') || label.includes('soda')) return 'High'
  if (label.includes('oat') || label.includes('bean') || label.includes('lentil')) return 'Low'
  if (fiber > 4) return 'Low'
  if (sugar > 15) return 'High'
  if (carbs > 40) return 'Medium'
  return 'Low'
}

function getBenefits(nutrients, label = '') {
  const benefits = []
  const fiber   = getNutrient(nutrients, 'FIBTG')
  const protein = getNutrient(nutrients, 'PROCNT')
  const vitC    = nutrients?.VITC?.quantity ?? 0
  const iron    = nutrients?.FE?.quantity   ?? 0
  const calcium = nutrients?.CA?.quantity   ?? 0
  const potass  = nutrients?.K?.quantity    ?? 0

  if (protein > 8)  benefits.push('Good source of protein — supports muscle repair and satiety')
  if (fiber   > 3)  benefits.push('High in dietary fiber — improves digestion and gut health')
  if (vitC    > 10) benefits.push('Rich in Vitamin C — boosts immunity and collagen production')
  if (iron    > 2)  benefits.push('Contains iron — supports healthy blood and energy levels')
  if (calcium > 50) benefits.push('Good calcium source — strengthens bones and teeth')
  if (potass  > 300)benefits.push('High potassium — supports heart health and blood pressure')
  if (benefits.length === 0) benefits.push('Provides energy and essential nutrients for daily function')
  return benefits.slice(0, 3)
}

function getFoodEmoji(label = '') {
  const l = label.toLowerCase()
  if (l.includes('apple'))     return '🍎'
  if (l.includes('banana'))    return '🍌'
  if (l.includes('mango'))     return '🥭'
  if (l.includes('orange'))    return '🍊'
  if (l.includes('chicken'))   return '🍗'
  if (l.includes('rice'))      return '🍚'
  if (l.includes('egg'))       return '🥚'
  if (l.includes('milk'))      return '🥛'
  if (l.includes('bread'))     return '🍞'
  if (l.includes('fish'))      return '🐟'
  if (l.includes('spinach') || l.includes('kale') || l.includes('greens')) return '🥬'
  if (l.includes('carrot'))    return '🥕'
  if (l.includes('tomato'))    return '🍅'
  if (l.includes('potato'))    return '🥔'
  if (l.includes('paneer') || l.includes('cheese')) return '🧀'
  if (l.includes('dal') || l.includes('lentil'))    return '🫘'
  if (l.includes('chapati') || l.includes('roti'))  return '🫓'
  if (l.includes('coffee'))    return '☕'
  if (l.includes('tea'))       return '🍵'
  if (l.includes('water'))     return '💧'
  return '🍽️'
}

// ── 1. Nutrition Analysis API — analyze any food text ────────────────────────
// Uses the Nutrition Analysis endpoint (POST) — parses ingredient strings
export async function analyzeFood(foodName, grams = 100, userProfile = {}) {
  const ingr = `${grams}g ${foodName}`

  const res = await fetch(
    `${NUTRITION_URL}?app_id=${NUTRITION_APP_ID}&app_key=${NUTRITION_APP_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingr: [ingr] }),
    }
  )

  if (!res.ok) {
    // Edamam returns 555 when it can't parse — give a helpful error
    const text = await res.text()
    if (res.status === 555) throw new Error('Food not recognized. Try a more specific name, e.g. "chicken breast" or "brown rice".')
    throw new Error(`Edamam API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const n    = data.totalNutrients
  const calories = Math.round(getNutrient(n, 'ENERC_KCAL'))
  const protein  = round(getNutrient(n, 'PROCNT'))
  const carbs    = round(getNutrient(n, 'CHOCDF'))
  const fat      = round(getNutrient(n, 'FAT'))
  const fiber    = round(getNutrient(n, 'FIBTG'))
  const sugar    = round(getNutrient(n, 'SUGAR'))
  const sodium   = round(getNutrient(n, 'NA'))
  const cholest  = round(getNutrient(n, 'CHOLE'))

  const healthScore = calcHealthScore(n)
  const profession  = userProfile.profession || 'Software Engineer'

  const professionTips = {
    'Software Engineer': `As a software engineer who sits for long hours, this ${healthScore >= 7 ? 'is a smart choice' : 'should be eaten in moderation'}. ${fiber > 3 ? 'The fiber keeps you full without the afternoon crash.' : 'Pair it with high-fiber food to avoid energy dips mid-code.'}`,
    'Athlete': `For an athlete, this ${protein > 15 ? 'is excellent — good protein for muscle recovery' : 'should be combined with a protein source post-workout'}.`,
    'Construction': `For physical work, this ${calories > 300 ? 'gives solid sustained energy for demanding tasks' : 'works as a light snack — add more calorie-dense food for full shifts'}.`,
    'Healthcare': `For long hospital shifts, this ${sugar < 10 ? 'gives steady energy without a spike-crash cycle' : 'may cause an energy crash — opt for lower sugar options during shifts'}.`,
    'Teacher': `For a teacher, this ${healthScore >= 6 ? 'keeps energy stable for classroom focus' : 'is okay occasionally but look for more nutritious alternatives'}.`,
    'Student': `For a student, this ${protein > 8 ? 'supports brain function and concentration' : 'is fine as a snack — add nuts or eggs for better focus fuel'}.`,
  }

  return {
    name:          `${foodName} (${grams}g)`,
    emoji:         getFoodEmoji(foodName),
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    cholesterol:   cholest,
    vitamins:      extractVitamins(n),
    minerals:      extractMinerals(n),
    healthScore,
    glycemicIndex: getGI(foodName, n),
    allergens:     data.cautions  ?? [],
    dietLabels:    data.dietLabels ?? [],
    healthLabels:  data.healthLabels?.slice(0, 6) ?? [],
    benefits:      getBenefits(n, foodName),
    warnings:      healthScore <= 4 ? ['High in unhealthy components — consume in moderation'] : [],
    professionTip: professionTips[profession] ?? `For a ${profession}, this provides ${calories} kcal of ${healthScore >= 6 ? 'good' : 'moderate'} nutritional value.`,
    bestTimeToEat: calories > 400 ? 'Best at breakfast or lunch for full energy utilization'
                 : fiber   > 4   ? 'Great any time — fiber keeps hunger away'
                 : protein > 15  ? 'Ideal post-workout or at lunch'
                 :                  'Works well as a snack or light meal component',
    pairWith: fiber < 3 && protein < 8
      ? ['Brown rice or oats (fiber)', 'Eggs or dal (protein)']
      : protein < 8
      ? ['Paneer or chickpeas', 'Greek yogurt']
      : ['Fresh salad or vegetables', 'Whole grain roti'],
    verdict:       getVerdict(healthScore),
    verdictReason: `Health score ${healthScore}/10. ${
      healthScore >= 8 ? 'Excellent nutritional profile — eat freely.'
    : healthScore >= 6 ? 'Good overall — fine as a regular part of your diet.'
    : healthScore >= 4 ? 'Moderate nutritional value — balance with healthier foods.'
    : 'Low nutritional density — limit consumption and choose better alternatives.'}`,
    totalWeight:   data.totalWeight ?? grams,
    servings:      data.yield       ?? 1,
  }
}

// ── 2. Food Database Search — search by name ──────────────────────────────────
// Returns a list of matching foods with basic nutrition info
export async function searchFood(query) {
  if (!query || query.trim().length < 2) return []

  const params = new URLSearchParams({
    app_id:  FOOD_APP_ID,
    app_key: FOOD_APP_KEY,
    ingr:    query,
    'nutrition-type': 'logging',
  })

  const res = await fetch(`${FOOD_URL}?${params}`)
  if (!res.ok) throw new Error(`Food search error ${res.status}`)

  const data = await res.json()

  return (data.hints ?? []).slice(0, 8).map(hint => {
    const f   = hint.food
    const n   = f.nutrients
    return {
      foodId:   f.foodId,
      label:    f.label,
      emoji:    getFoodEmoji(f.label),
      category: f.category ?? 'Generic foods',
      calories: Math.round(n.ENERC_KCAL ?? 0),
      protein:  round(n.PROCNT ?? 0),
      carbs:    round(n.CHOCDF ?? 0),
      fat:      round(n.FAT    ?? 0),
      fiber:    round(n.FIBTG  ?? 0),
      // Note: Edamam food DB returns nutrients per 100g
      per:      '100g',
      measures: hint.measures ?? [],
    }
  })
}

// ── 3. Get full nutrients for a specific food by foodId ───────────────────────
export async function getFoodNutrients(foodId, measureURI, grams = 100) {
  const params = new URLSearchParams({
    app_id:  FOOD_APP_ID,
    app_key: FOOD_APP_KEY,
  })

  const body = {
    ingredients: [{
      quantity: grams / 100,
      measureURI: measureURI || 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
      foodId,
    }],
  }

  const res = await fetch(`${NUTRIENTS_URL}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Nutrients API error ${res.status}`)

  const data = await res.json()
  const n    = data.totalNutrients

  return {
    calories: Math.round(getNutrient(n, 'ENERC_KCAL')),
    protein:  round(getNutrient(n, 'PROCNT')),
    carbs:    round(getNutrient(n, 'CHOCDF')),
    fat:      round(getNutrient(n, 'FAT')),
    fiber:    round(getNutrient(n, 'FIBTG')),
    sugar:    round(getNutrient(n, 'SUGAR')),
    vitamins: extractVitamins(n),
    minerals: extractMinerals(n),
  }
}

// ── 4. Smart Meal Recommendations (rule-based, no API cost) ──────────────────
// Generates personalized suggestions based on remaining macros + profession
export function generateMealRecommendations(remainingKcal, userProfile = {}, loggedMeals = []) {
  const profession = userProfile.profession || 'Software Engineer'
  const goal       = userProfile.goal       || 'Maintain weight'
  const city       = userProfile.city       || 'India'
  const timeHour   = new Date().getHours()

  const mealTime = timeHour < 11 ? 'Breakfast'
                 : timeHour < 14 ? 'Lunch'
                 : timeHour < 17 ? 'Afternoon snack'
                 : timeHour < 20 ? 'Dinner'
                 :                  'Evening snack'

  const indiaLocalFoods = {
    'Jamshedpur': ['Litti Chokha', 'Sattu drink', 'Chhena poda', 'Peanut chikki'],
    'Mumbai':     ['Vada pav', 'Poha', 'Bhel puri', 'Misal pav'],
    'Delhi':      ['Chole bhature', 'Dal makhani', 'Paratha', 'Rajma chawal'],
    'Kolkata':    ['Macher jhol', 'Dal puri', 'Mishti doi', 'Aloo posto'],
    'default':    ['Idli sambar', 'Dal rice', 'Roti sabzi', 'Moong dal khichdi'],
  }
  const localFoods = indiaLocalFoods[city] || indiaLocalFoods.default

  const professionMeals = {
    'Software Engineer': [
      { name:'Almonds (30g)', emoji:'🥜', kcal:174, protein:6,  reason:'Healthy fats + protein for sustained coding focus' },
      { name:'Greek yogurt', emoji:'🥛', kcal:100, protein:10, reason:'Protein-rich snack that keeps you full without a crash' },
      { name:'Boiled eggs (2)', emoji:'🥚', kcal:148, protein:12, reason:'Complete protein for brain energy and muscle health' },
      { name:'Banana + peanut butter', emoji:'🍌', kcal:210, protein:6, reason:'Quick carbs + fat for sustained energy at your desk' },
    ],
    'Athlete': [
      { name:'Chicken breast (150g)', emoji:'🍗', kcal:248, protein:46, reason:'Lean protein for muscle recovery post-workout' },
      { name:'Brown rice (200g)', emoji:'🍚', kcal:216, protein:5,  reason:'Complex carbs for sustained athletic performance' },
      { name:'Banana (2 medium)', emoji:'🍌', kcal:178, protein:2,  reason:'Quick carbs + potassium for muscle function' },
      { name:'Eggs + milk', emoji:'🥛', kcal:230, protein:18, reason:'Complete amino acid profile for muscle synthesis' },
    ],
    'Healthcare': [
      { name:'Oats with fruit', emoji:'🥣', kcal:280, protein:8,  reason:'Sustained energy for long hospital shifts' },
      { name:'Moong dal soup', emoji:'🫘', kcal:105, protein:7,  reason:'Light protein that won\'t weigh you down on shifts' },
      { name:'Mixed nuts (40g)', emoji:'🥜', kcal:240, protein:7,  reason:'Energy-dense snack for busy schedules' },
      { name:'Chapati + sabzi', emoji:'🫓', kcal:260, protein:7,  reason:'Balanced meal for long demanding shifts' },
    ],
    'default': [
      { name:'Dal rice', emoji:'🍚', kcal:350, protein:12, reason:'Complete protein and carbs for energy' },
      { name:'Fruit bowl', emoji:'🍎', kcal:120, protein:2,  reason:'Natural vitamins and fiber' },
      { name:'Paneer sabzi', emoji:'🧀', kcal:220, protein:14, reason:'High protein vegetarian meal' },
      { name:'Roti + dal', emoji:'🫓', kcal:280, protein:10, reason:'Balanced traditional meal' },
    ],
  }

  const meals = professionMeals[profession] || professionMeals.default

  // Filter to meals that fit remaining calories
  const suitable = meals.filter(m => m.kcal <= remainingKcal * 0.6)

  return {
    mealTime,
    suggestions: suitable.length > 0 ? suitable : meals.slice(0, 2),
    localFavorite: localFoods[Math.floor(Math.random() * localFoods.length)],
    tip: remainingKcal < 300
      ? 'You\'re close to your goal — choose a light snack to finish the day strong!'
      : remainingKcal > 1000
      ? `You have ${remainingKcal} kcal left — time for a proper ${mealTime.toLowerCase()}.`
      : `${remainingKcal} kcal remaining — a balanced ${mealTime.toLowerCase()} will hit your target perfectly.`,
    remainingKcal,
  }
}

// ── 5. Weekly Insights (rule-based, no API cost) ─────────────────────────────
export function analyzeWeeklyData(weekData = [], userProfile = {}) {
  const goal    = userProfile.calorieGoal || 2400
  const valid   = weekData.filter(v => v > 0)
  if (valid.length === 0) return null

  const avg     = Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
  const overDays = weekData.filter(v => v > goal).length
  const underDays= weekData.filter(v => v > 0 && v < goal * 0.7).length
  const loggedDays = weekData.filter(v => v > 0).length
  const consistency = Math.round((loggedDays / 7) * 100)
  const avgDiff  = avg - goal

  let score = 70
  if (consistency >= 85) score += 15
  else if (consistency >= 70) score += 8
  if (Math.abs(avgDiff) < 150) score += 10
  else if (Math.abs(avgDiff) > 400) score -= 10
  if (overDays <= 1) score += 5
  if (overDays >= 4) score -= 15
  if (underDays >= 3) score -= 10
  score = Math.min(100, Math.max(10, score))

  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C'

  const insights = []

  if (consistency >= 85) {
    insights.push({ type:'win',     emoji:'🔥', title:'Great consistency!',       body:`You logged meals ${loggedDays} out of 7 days. Consistent tracking is the #1 predictor of success.` })
  } else {
    insights.push({ type:'warning', emoji:'📋', title:'Improve your tracking',    body:`Only ${loggedDays}/7 days logged. Try setting a daily reminder — even rough estimates help.` })
  }

  if (overDays >= 3) {
    insights.push({ type:'warning', emoji:'⚡', title:'Frequent over-eating',     body:`You exceeded your ${goal} kcal goal on ${overDays} days. Try front-loading calories earlier in the day.` })
  } else if (overDays <= 1) {
    insights.push({ type:'win',     emoji:'✅', title:'Calorie control is solid', body:`Only ${overDays} day(s) over goal this week. Your portion awareness is paying off.` })
  }

  if (avg > goal + 200) {
    insights.push({ type:'tip',     emoji:'💡', title:'Weekly average is high',   body:`Your average (${avg} kcal) is ${avg - goal} kcal above target. Try adding more fiber-rich vegetables to feel full with fewer calories.` })
  } else if (Math.abs(avgDiff) < 150) {
    insights.push({ type:'win',     emoji:'🎯', title:'Right on target!',         body:`Your weekly average of ${avg} kcal is nearly perfect. This is exactly the consistency that drives results.` })
  }

  insights.push({ type:'tip', emoji:'🥗', title:'Next week focus',
    body: underDays >= 2
      ? 'Some days were very low — make sure you\'re eating enough. Under-eating slows metabolism.'
      : overDays >= 2
      ? 'Prep your meals on Sunday to avoid high-calorie days mid-week.'
      : 'Keep this momentum — try adding 10 min of walking to boost results further.'
  })

  const streakMessages = [
    `${loggedDays} days logged this week 🔥`,
    loggedDays >= 6 ? 'Perfect week almost achieved — one more day!' : `${7 - loggedDays} more days to a perfect tracking week`,
    avg < goal ? `You saved ${goal - avg} kcal below goal on average — great discipline!` : `${avg - goal} kcal above daily average — tighten up next week`,
  ]

  return {
    score,
    grade,
    headline: score >= 80 ? 'You crushed it this week! 💪'
            : score >= 65 ? 'Solid week — a few tweaks will make it great'
            : 'Room to improve — small changes add up',
    insights: insights.slice(0, 4),
    nextWeekGoal: overDays >= 3 ? 'Focus on hitting your calorie target 5 out of 7 days'
                : consistency < 70 ? 'Log every meal for 7 straight days — consistency is everything'
                : 'Maintain this consistency and add strength training for better results',
    streakMessage: streakMessages[0],
    stats: { avg, overDays, underDays, loggedDays, consistency, score },
  }
}

// ── 6. Smart Chatbot Responses (rule-based, no API cost) ─────────────────────
// Simple intent-matching nutrition coach — no API calls needed
export function getChatResponse(userMessage, context = {}) {
  const msg = userMessage.toLowerCase()
  const { caloriesEaten = 0, goal = 2400, protein = 0, proteinGoal = 120 } = context
  const remaining = Math.max(0, goal - caloriesEaten)
  const proteinRemaining = Math.max(0, proteinGoal - protein)
  const pct = Math.round((caloriesEaten / goal) * 100)

  // Calorie queries
  if (msg.includes('calorie') || msg.includes('how much') || msg.includes('remaining') || msg.includes('left')) {
    return `You've eaten **${caloriesEaten} kcal** so far, which is **${pct}%** of your daily goal. You have **${remaining} kcal** remaining today. ${remaining > 800 ? '🍽️ Plenty of room for a good meal!' : remaining > 300 ? '🥗 A light balanced meal will finish your day perfectly.' : '🌙 You\'re nearly done for the day — just a small snack if needed.'}`
  }

  // Protein queries
  if (msg.includes('protein') || msg.includes('muscle') || msg.includes('build')) {
    return `You've had **${protein}g of protein** so far, and need **${proteinRemaining}g more** to hit your ${proteinGoal}g goal. 💪 Best options right now: **paneer (18g/100g)**, **boiled eggs (13g each)**, **moong dal (9g/100g)**, or **chicken breast (31g/100g)**.`
  }

  // Dinner / meal suggestions
  if (msg.includes('dinner') || msg.includes('eat') || msg.includes('suggest') || msg.includes('recommend')) {
    if (remaining < 300) return `You only have ${remaining} kcal left — go for something light: **cucumber raita**, a **small bowl of dal**, or some **fruit salad**. 🥗`
    if (remaining < 600) return `With ${remaining} kcal left, a balanced dinner would be: **2 chapatis + dal + sabzi** (~450 kcal) — filling and nutritious! 🫓`
    return `You have ${remaining} kcal left for dinner — try **dal rice + salad** (~380 kcal) or **paneer sabzi + 2 chapati** (~500 kcal). Both are nutritious and satisfying! 🍛`
  }

  // Snack queries
  if (msg.includes('snack') || msg.includes('hungry') || msg.includes('between')) {
    return `Great snack options for a software engineer: **Almonds (30g = 174 kcal)**, **banana + peanut butter (210 kcal)**, **Greek yogurt (100 kcal)**, or a **boiled egg (78 kcal)**. All give steady energy without a crash! 🥜`
  }

  // Weight loss
  if (msg.includes('lose weight') || msg.includes('weight loss') || msg.includes('fat')) {
    return `For weight loss, aim to eat **200-300 kcal below your goal** consistently. Focus on: **high protein foods** (keeps you full), **fiber-rich vegetables** (low calorie, filling), and **avoiding liquid calories** (chai with sugar adds up!). Consistency beats perfection every time. 🎯`
  }

  // Water / hydration
  if (msg.includes('water') || msg.includes('hydrat') || msg.includes('drink')) {
    return `💧 Aim for **8-10 glasses (2-3 litres) of water daily**. As a desk worker, it's easy to forget — try keeping a water bottle visible. Proper hydration improves focus by up to 20% and reduces false hunger signals!`
  }

  // Energy / focus
  if (msg.includes('energy') || msg.includes('focus') || msg.includes('tired') || msg.includes('fatigue')) {
    return `For sustained energy and focus: eat **complex carbs** (oats, brown rice, dal) instead of simple sugars, ensure **protein at every meal**, and don't skip breakfast. If you hit a 3pm slump, try **almonds + a glass of water** instead of chai. ⚡`
  }

  // Breakfast
  if (msg.includes('breakfast') || msg.includes('morning')) {
    return `Best Indian breakfast options: **Idli + sambar** (protein + fiber, ~200 kcal), **Poha with peanuts** (~250 kcal), **Oats with banana** (~300 kcal), or **Eggs + whole wheat toast** (~300 kcal). Avoid skipping breakfast — it sets your metabolism for the day! 🌅`
  }

  // General / fallback
  return `I'm your NutriScan coach! I can help you with: **calorie tracking** ("how many calories left?"), **meal suggestions** ("what should I eat for dinner?"), **protein goals** ("help me hit my protein target"), **energy tips**, and **weight management**. What would you like help with? 😊`
}


/**
 * ── 7. Edamam Meal Planner API ──────────────────────────────────────────────
 * Generates a full day/week meal plan based on target calories and diet
 */
export async function getMealPlan(targetCalories = 2000, diet = 'balanced', health = []) {
  // Edamam expects a "selection" object
  const body = {
    size: 7, // 7 days
    plan: {
      accept: {
        all: [
          { diet: [diet] },
          { health: health } // e.g., ['alcohol-free', 'peanut-free']
        ]
      },
      fit: {
        "ENERC_KCAL": { min: targetCalories - 200, max: targetCalories + 200 }
      },
      sections: {
        "Breakfast": { accept: { all: [{ meal: ["breakfast"] }] } },
        "Lunch": { accept: { all: [{ meal: ["lunch", "main course"] }] } },
        "Dinner": { accept: { all: [{ meal: ["lunch", "main course"] }] } }
      }
    }
  }

  try {
    const res = await fetch(
      `${MEAL_PLAN_URL}/${MEAL_APP_ID}/select?app_key=${MEAL_APP_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) throw new Error(`Meal Planner Error: ${res.status}`)

    const data = await res.json()
    
    // Map the complex Edamam response to a simpler format for your UI
    return data.selection.map((day, index) => ({
      day: index + 1,
      meals: Object.entries(day.sections).map(([type, content]) => ({
        type,
        label: content.assigned.label,
        image: content.assigned.image,
        url: content.assigned.url,
        calories: Math.round(content.assigned.nutrients.ENERC_KCAL),
        protein: Math.round(content.assigned.nutrients.PROCNT),
        carbs: Math.round(content.assigned.nutrients.CHOCDF),
        fat: Math.round(content.assigned.nutrients.FAT)
      }))
    }))
  } catch (error) {
    console.error("Meal Plan Fetch Failed:", error)
    return null // Fallback to your local rule-based logic if API fails
  }
}

// ── 7. Edamam Meal Planner API ──────────────────────────────────────────────
// (Keep the getMealPlan function I gave you earlier right here)

// ── 8. Smart Meal Recommendations (Merged Logic) ─────────────────────────────
// This replaces your OLD "generateMealRecommendations" function
export async function getSmartRecommendations(remainingKcal, userProfile = {}) {
  
  // 1. Try to get a real plan from the Edamam API first
  // We use the user's total daily calorie goal to generate the plan
  const apiPlan = await getMealPlan(userProfile.calorieGoal || 2000);
  
  if (apiPlan && apiPlan.length > 0) {
    // The API returns 7 days; we take Day 1 (index 0) for today
    const today = apiPlan[0]; 
    return {
      source: 'API',
      mealTime: "Today's Plan",
      suggestions: today.meals, // This contains the Breakfast, Lunch, and Dinner from the API
      remainingKcal
    };
  }

  // 2. FALLBACK: If API fails or limit is reached, use your Local Logic
  // This is the code you already had in your file
  const profession = userProfile.profession || 'Software Engineer';
  const timeHour = new Date().getHours();
  const mealTime = timeHour < 11 ? 'Breakfast' : timeHour < 14 ? 'Lunch' : 'Dinner';

  const professionMeals = {
    'Software Engineer': [
      { name:'Almonds (30g)', emoji:'🥜', kcal:174, protein:6, reason:'Focus fuel' },
      { name:'Greek yogurt', emoji:'🥛', kcal:100, protein:10, reason:'No-crash snack' }
    ],
    'default': [
      { name:'Dal rice', emoji:'🍚', kcal:350, protein:12, reason:'Balanced meal' }
    ]
  };

  const meals = professionMeals[profession] || professionMeals.default;
  const suitable = meals.filter(m => m.kcal <= remainingKcal);

  return {
    source: 'Local',
    mealTime,
    suggestions: suitable.length > 0 ? suitable : meals.slice(0, 2),
    remainingKcal
  };
}