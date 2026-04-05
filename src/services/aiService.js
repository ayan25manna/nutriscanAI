const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  'anthropic-version': '2023-06-01',
}
async function callClaude(systemPrompt, userMessage, maxTokens = 1000) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

// ── 1. Deep Nutrition Analysis ──────────────────────────────────────────────
export async function analyzeFood(foodName, grams = 100, userProfile = {}) {
  const system = `You are NutriScan AI, an expert nutritionist and dietitian.
Return ONLY a valid JSON object (no markdown fences, no extra text) with this exact shape:
{
  "name": string,
  "emoji": string (single emoji that best represents this food),
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "vitamins": [{"name": string, "amount": string}],
  "minerals": [{"name": string, "amount": string}],
  "healthScore": number (1-10),
  "glycemicIndex": string ("Low"|"Medium"|"High"),
  "allergens": [string],
  "benefits": [string] (3 short health benefits),
  "warnings": [string] (0-2 cautions if any, else empty array),
  "professionTip": string (personalized tip for the user's profession),
  "bestTimeToEat": string,
  "pairWith": [string] (2 foods that complement this one)
}`

  const profession = userProfile.profession || 'Software Engineer'
  const goal       = userProfile.goal       || 'Maintain weight'
  const text = await callClaude(system,
    `Analyze ${grams}g of "${foodName}" for a ${profession} whose goal is to ${goal}. All nutrient values are per ${grams}g serving.`)
  return JSON.parse(text.trim())
}

// ── 2. AI Nutrition Coach Chat ───────────────────────────────────────────────
export async function chatWithCoach(messages, userProfile = {}, dailyStats = {}) {
  const system = `You are NutriScan Coach, a world-class personal nutritionist and wellness AI.

User profile:
- Name: ${userProfile.name || 'User'}
- Profession: ${userProfile.profession || 'Software Engineer'}
- Age: ${userProfile.age || 25}, Gender: ${userProfile.gender || 'Male'}
- Goal: ${userProfile.goal || 'Maintain weight'}
- Location: ${userProfile.city || 'India'}
- Diet: ${userProfile.diet || 'No restriction'}
- Daily calorie goal: ${userProfile.calorieGoal || 2400} kcal

Today's stats:
- Calories eaten: ${dailyStats.eaten || 1240} kcal
- Protein: ${dailyStats.protein || 48}g / ${dailyStats.proteinGoal || 120}g
- Carbs: ${dailyStats.carbs || 180}g / 300g
- Fat: ${dailyStats.fat || 30}g / 75g

Be conversational, warm, and motivating. Give specific, actionable advice.
Use emojis naturally. Keep responses under 150 words unless asked for detail.
Personalize everything to their profession, location, and goals.
Suggest local Indian foods when relevant.`

  const apiMessages = messages.map(m => ({ role: m.role, content: m.content }))
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: apiMessages,
    }),
  })
  const data = await res.json()
  return data.content[0].text
}

// ── 3. Smart Meal Plan Generator ─────────────────────────────────────────────
export async function generateMealPlan(userProfile = {}, remainingKcal = 1160) {
  const system = `You are a precision nutrition planner. Return ONLY valid JSON, no markdown:
{
  "plan": [
    {
      "meal": "Breakfast"|"Morning Snack"|"Lunch"|"Evening Snack"|"Dinner",
      "time": string,
      "items": [{"name": string, "emoji": string, "kcal": number, "protein": number}],
      "totalKcal": number,
      "whyThisMeal": string (one sentence)
    }
  ],
  "totalKcal": number,
  "tip": string (one personalized tip)
}`

  return JSON.parse(await callClaude(system,
    `Create a smart meal plan for the rest of today with ${remainingKcal} kcal remaining.
User: ${userProfile.profession || 'Software Engineer'} in ${userProfile.city || 'Jamshedpur, India'}.
Goal: ${userProfile.goal || 'Maintain weight'}. Diet: ${userProfile.diet || 'No restriction'}.
Prefer locally available Indian foods. It is currently afternoon.`))
}

// ── 4. Weekly AI Insights Report ─────────────────────────────────────────────
export async function generateWeeklyInsights(weekData = [], userProfile = {}) {
  const system = `You are a health analytics AI. Return ONLY valid JSON:
{
  "score": number (1-100, overall weekly health score),
  "grade": string ("A+"|"A"|"B+"|"B"|"C"|"D"),
  "headline": string (motivating one-liner),
  "insights": [
    {"type": "win"|"warning"|"tip", "emoji": string, "title": string, "body": string}
  ],
  "nextWeekGoal": string,
  "streakMessage": string
}`

  const avgKcal = weekData.length
    ? Math.round(weekData.reduce((a, b) => a + b, 0) / weekData.length)
    : 2100

  return JSON.parse(await callClaude(system,
    `Analyze this week for a ${userProfile.profession || 'Software Engineer'} with goal "${userProfile.goal || 'Maintain weight'}".
Weekly calories: ${weekData.join(', ')} kcal. Average: ${avgKcal} kcal. Goal: ${userProfile.calorieGoal || 2400} kcal/day.
Provide 4 insights (mix of wins, warnings, tips).`))
}

// ── 5. Barcode / Packed Food AI Analyzer ─────────────────────────────────────
export async function analyzePacked(productName, ingredients = '', userProfile = {}) {
  const system = `You are a food safety and nutrition AI. Return ONLY valid JSON:
{
  "safetyScore": number (1-10),
  "processingLevel": "Minimally processed"|"Processed"|"Ultra-processed",
  "additivesFound": [{"name": string, "risk": "Low"|"Medium"|"High", "purpose": string}],
  "healthierAlternative": {"name": string, "emoji": string, "reason": string},
  "professionFit": string (is this good for their profession?),
  "verdict": "Excellent"|"Good"|"Okay"|"Limit"|"Avoid",
  "verdictReason": string
}`

  return JSON.parse(await callClaude(system,
    `Analyze packed food: "${productName}". Ingredients: "${ingredients || 'standard'}".
User is a ${userProfile.profession || 'Software Engineer'} with goal: ${userProfile.goal || 'Maintain weight'}.`))
}

// ── 6. Smart Recipe from Remaining Macros ───────────────────────────────────
export async function suggestRecipe(remainingMacros = {}, location = 'India') {
  const system = `You are a recipe AI. Return ONLY valid JSON:
{
  "name": string,
  "emoji": string,
  "prepTime": string,
  "cookTime": string,
  "servings": number,
  "ingredients": [{"item": string, "amount": string}],
  "steps": [string],
  "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number},
  "whyPerfect": string
}`

  return JSON.parse(await callClaude(system,
    `Suggest one simple Indian recipe that provides roughly:
${remainingMacros.protein || 30}g protein, ${remainingMacros.carbs || 60}g carbs, ${remainingMacros.fat || 15}g fat.
Available in ${location}. Quick to make (under 30 min). Healthy and delicious.`))
}
