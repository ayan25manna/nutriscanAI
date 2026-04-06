// const API_URL = 'https://api.anthropic.com/v1/messages'
// const MODEL   = 'claude-sonnet-4-20250514'

// async function callClaude(systemPrompt, userMessage, maxTokens = 1000) {
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       model: MODEL,
//       max_tokens: maxTokens,
//       system: systemPrompt,
//       messages: [{ role: 'user', content: userMessage }],
//     }),
//   })
//   if (!res.ok) throw new Error(`API error ${res.status}`)
//   const data = await res.json()
//   return data.content[0].text
// }

// // ── 1. Deep Nutrition Analysis ──────────────────────────────────────────────
// export async function analyzeFood(foodName, grams = 100, userProfile = {}) {
//   const system = `You are NutriScan AI, an expert nutritionist and dietitian.
// Return ONLY a valid JSON object (no markdown fences, no extra text) with this exact shape:
// {
//   "name": string,
//   "emoji": string (single emoji that best represents this food),
//   "calories": number,
//   "protein": number,
//   "carbs": number,
//   "fat": number,
//   "fiber": number,
//   "sugar": number,
//   "vitamins": [{"name": string, "amount": string}],
//   "minerals": [{"name": string, "amount": string}],
//   "healthScore": number (1-10),
//   "glycemicIndex": string ("Low"|"Medium"|"High"),
//   "allergens": [string],
//   "benefits": [string] (3 short health benefits),
//   "warnings": [string] (0-2 cautions if any, else empty array),
//   "professionTip": string (personalized tip for the user's profession),
//   "bestTimeToEat": string,
//   "pairWith": [string] (2 foods that complement this one)
// }`

//   const profession = userProfile.profession || 'Software Engineer'
//   const goal       = userProfile.goal       || 'Maintain weight'
//   const text = await callClaude(system,
//     `Analyze ${grams}g of "${foodName}" for a ${profession} whose goal is to ${goal}. All nutrient values are per ${grams}g serving.`)
//   return JSON.parse(text.trim())
// }

// // ── 2. AI Nutrition Coach Chat ───────────────────────────────────────────────
// export async function chatWithCoach(messages, userProfile = {}, dailyStats = {}) {
//   const system = `You are NutriScan Coach, a world-class personal nutritionist and wellness AI.

// User profile:
// - Name: ${userProfile.name || 'User'}
// - Profession: ${userProfile.profession || 'Software Engineer'}
// - Age: ${userProfile.age || 25}, Gender: ${userProfile.gender || 'Male'}
// - Goal: ${userProfile.goal || 'Maintain weight'}
// - Location: ${userProfile.city || 'India'}
// - Diet: ${userProfile.diet || 'No restriction'}
// - Daily calorie goal: ${userProfile.calorieGoal || 2400} kcal

// Today's stats:
// - Calories eaten: ${dailyStats.eaten || 1240} kcal
// - Protein: ${dailyStats.protein || 48}g / ${dailyStats.proteinGoal || 120}g
// - Carbs: ${dailyStats.carbs || 180}g / 300g
// - Fat: ${dailyStats.fat || 30}g / 75g

// Be conversational, warm, and motivating. Give specific, actionable advice.
// Use emojis naturally. Keep responses under 150 words unless asked for detail.
// Personalize everything to their profession, location, and goals.
// Suggest local Indian foods when relevant.`

//   const apiMessages = messages.map(m => ({ role: m.role, content: m.content }))
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       model: MODEL,
//       max_tokens: 400,
//       system,
//       messages: apiMessages,
//     }),
//   })
//   const data = await res.json()
//   return data.content[0].text
// }

// // ── 3. Smart Meal Plan Generator ─────────────────────────────────────────────
// export async function generateMealPlan(userProfile = {}, remainingKcal = 1160) {
//   const system = `You are a precision nutrition planner. Return ONLY valid JSON, no markdown:
// {
//   "plan": [
//     {
//       "meal": "Breakfast"|"Morning Snack"|"Lunch"|"Evening Snack"|"Dinner",
//       "time": string,
//       "items": [{"name": string, "emoji": string, "kcal": number, "protein": number}],
//       "totalKcal": number,
//       "whyThisMeal": string (one sentence)
//     }
//   ],
//   "totalKcal": number,
//   "tip": string (one personalized tip)
// }`

//   return JSON.parse(await callClaude(system,
//     `Create a smart meal plan for the rest of today with ${remainingKcal} kcal remaining.
// User: ${userProfile.profession || 'Software Engineer'} in ${userProfile.city || 'Jamshedpur, India'}.
// Goal: ${userProfile.goal || 'Maintain weight'}. Diet: ${userProfile.diet || 'No restriction'}.
// Prefer locally available Indian foods. It is currently afternoon.`))
// }

// // ── 4. Weekly AI Insights Report ─────────────────────────────────────────────
// export async function generateWeeklyInsights(weekData = [], userProfile = {}) {
//   const system = `You are a health analytics AI. Return ONLY valid JSON:
// {
//   "score": number (1-100, overall weekly health score),
//   "grade": string ("A+"|"A"|"B+"|"B"|"C"|"D"),
//   "headline": string (motivating one-liner),
//   "insights": [
//     {"type": "win"|"warning"|"tip", "emoji": string, "title": string, "body": string}
//   ],
//   "nextWeekGoal": string,
//   "streakMessage": string
// }`

//   const avgKcal = weekData.length
//     ? Math.round(weekData.reduce((a, b) => a + b, 0) / weekData.length)
//     : 2100

//   return JSON.parse(await callClaude(system,
//     `Analyze this week for a ${userProfile.profession || 'Software Engineer'} with goal "${userProfile.goal || 'Maintain weight'}".
// Weekly calories: ${weekData.join(', ')} kcal. Average: ${avgKcal} kcal. Goal: ${userProfile.calorieGoal || 2400} kcal/day.
// Provide 4 insights (mix of wins, warnings, tips).`))
// }

// // ── 5. Barcode / Packed Food AI Analyzer ─────────────────────────────────────
// export async function analyzePacked(productName, ingredients = '', userProfile = {}) {
//   const system = `You are a food safety and nutrition AI. Return ONLY valid JSON:
// {
//   "safetyScore": number (1-10),
//   "processingLevel": "Minimally processed"|"Processed"|"Ultra-processed",
//   "additivesFound": [{"name": string, "risk": "Low"|"Medium"|"High", "purpose": string}],
//   "healthierAlternative": {"name": string, "emoji": string, "reason": string},
//   "professionFit": string (is this good for their profession?),
//   "verdict": "Excellent"|"Good"|"Okay"|"Limit"|"Avoid",
//   "verdictReason": string
// }`

//   return JSON.parse(await callClaude(system,
//     `Analyze packed food: "${productName}". Ingredients: "${ingredients || 'standard'}".
// User is a ${userProfile.profession || 'Software Engineer'} with goal: ${userProfile.goal || 'Maintain weight'}.`))
// }

// // ── 6. Smart Recipe from Remaining Macros ───────────────────────────────────
// export async function suggestRecipe(remainingMacros = {}, location = 'India') {
//   const system = `You are a recipe AI. Return ONLY valid JSON:
// {
//   "name": string,
//   "emoji": string,
//   "prepTime": string,
//   "cookTime": string,
//   "servings": number,
//   "ingredients": [{"item": string, "amount": string}],
//   "steps": [string],
//   "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number},
//   "whyPerfect": string
// }`

//   return JSON.parse(await callClaude(system,
//     `Suggest one simple Indian recipe that provides roughly:
// ${remainingMacros.protein || 30}g protein, ${remainingMacros.carbs || 60}g carbs, ${remainingMacros.fat || 15}g fat.
// Available in ${location}. Quick to make (under 30 min). Healthy and delicious.`))
// }
const MEAL_PLAN_URL = 'https://api.edamam.com/api/meal-planner/v1'

// Note: Meal Planner usually uses its own App ID/Key. 
// If your plan covers all, use the existing ones.
const MEAL_APP_ID = import.meta.env.VITE_EDAMAM_MEAL_APP_ID || FOOD_APP_ID
const MEAL_APP_KEY = import.meta.env.VITE_EDAMAM_MEAL_APP_KEY || FOOD_APP_KEY
// ── 1. Deep Nutrition Analysis (Edamam Nutrition API) ───────────────────────
export async function analyzeFood(foodName, grams = 100, userProfile = {}) {
  const ingr = `${grams}g ${foodName}`
  
  const res = await fetch(`${NUTRITION_URL}?app_id=${NUTRITION_APP_ID}&app_key=${NUTRITION_APP_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingr: [ingr] }),
  })

  if (!res.ok) throw new Error('Edamam could not analyze this item.')
  const data = await res.json()
  
  const n = data.totalNutrients
  const healthScore = calculateHealthScore(data) // Helper function below

  return {
    name: `${foodName} (${grams}g)`,
    emoji: "🍽️", 
    calories: Math.round(n.ENERC_KCAL?.quantity || 0),
    protein: Math.round(n.PROCNT?.quantity || 0),
    carbs: Math.round(n.CHOCDF?.quantity || 0),
    fat: Math.round(n.FAT?.quantity || 0),
    fiber: Math.round(n.FIBTG?.quantity || 0),
    sugar: Math.round(n.SUGAR?.quantity || 0),
    vitamins: extractTopNutrients(data.totalNutrients, 'VIT'),
    minerals: extractTopNutrients(data.totalNutrients, 'MG', 'CA', 'FE'),
    healthScore: healthScore,
    glycemicIndex: "Medium", // Edamam doesn't provide GI directly; calculated via fiber/sugar ratio usually
    allergens: data.cautions || [],
    benefits: data.healthLabels?.slice(0, 3) || ["Nutritious choice"],
    warnings: data.cautions?.length > 0 ? [`Contains ${data.cautions[0]}`] : [],
    professionTip: `Good energy source for a ${userProfile.profession || 'professional'}.`,
    bestTimeToEat: n.ENERC_KCAL?.quantity > 400 ? "Lunch" : "Snack",
    pairWith: ["Fresh Salad", "Water"]
  }
}

// ── 2. Smart Meal Plan Generator (Edamam Meal Planner API) ──────────────────
export async function generateMealPlan(userProfile = {}, remainingKcal = 1200) {
  const body = {
    size: 1, // Plan for 1 day
    plan: {
      accept: { all: [{ diet: [userProfile.diet === 'No restriction' ? 'balanced' : userProfile.diet.toLowerCase()] }] },
      fit: { "ENERC_KCAL": { min: remainingKcal - 200, max: remainingKcal + 200 } },
      sections: {
        "Lunch": { accept: { all: [{ meal: ["lunch"] }] } },
        "Dinner": { accept: { all: [{ meal: ["dinner"] }] } }
      }
    }
  }

  const res = await fetch(`${MEAL_PLAN_URL}/${MEAL_APP_ID}/select?app_key=${MEAL_APP_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('Meal Planner API error')
  const data = await res.json()
  const dayPlan = data.selection[0].sections

  const plan = Object.entries(dayPlan).map(([mealType, content]) => ({
    meal: mealType,
    time: mealType === "Lunch" ? "1:30 PM" : "8:00 PM",
    items: [{
      name: content.assigned.label,
      emoji: "🥘",
      kcal: Math.round(content.assigned.nutrients.ENERC_KCAL),
      protein: Math.round(content.assigned.nutrients.PROCNT)
    }],
    totalKcal: Math.round(content.assigned.nutrients.ENERC_KCAL),
    whyThisMeal: `Fits your ${userProfile.goal} goal with balanced macros.`
  }))

  return {
    plan,
    totalKcal: plan.reduce((acc, curr) => acc + curr.totalKcal, 0),
    tip: "Drink a glass of water before each meal to aid digestion."
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function extractTopNutrients(nutrients, ...prefixes) {
  return Object.entries(nutrients)
    .filter(([key]) => prefixes.some(p => key.startsWith(p)))
    .slice(0, 3)
    .map(([_, val]) => ({ name: val.label, amount: `${Math.round(val.quantity)}${val.unit}` }))
}

function calculateHealthScore(data) {
  // Simple logic: add points for fiber/protein, subtract for sodium/sugar
  let score = 5
  if (data.totalNutrients.FIBTG?.quantity > 5) score += 2
  if (data.totalNutrients.PROCNT?.quantity > 15) score += 2
  if (data.totalNutrients.SUGAR?.quantity > 10) score -= 2
  return Math.min(10, Math.max(1, score))
}