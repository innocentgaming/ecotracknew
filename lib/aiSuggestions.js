// AI Suggestions - Rule-based engine + Gemini API integration

export const SUGGESTIONS = {
  transport: [
    {
      condition: (d) => d.primaryMode === 'car_petrol' && d.dailyDistance <= 5,
      suggestion: "🚴 Switch to cycling for your daily 5km commute — save up to 180 kg CO₂/year and improve cardiovascular health!",
      savingKg: 180,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.primaryMode === 'car_petrol' && d.dailyDistance > 5 && d.dailyDistance <= 15,
      suggestion: "🚌 Use public transport (bus/metro) instead of your car — could reduce your transport emissions by 50-60%.",
      savingKg: 400,
      difficulty: 'Medium',
    },
    {
      condition: (d) => d.primaryMode === 'bike' && d.dailyDistance > 0,
      suggestion: "⚡ Switch from petrol bike to an electric scooter — cut your transport CO₂ by 50% using India's expanding EV infrastructure.",
      savingKg: 220,
      difficulty: 'Medium',
    },
    {
      condition: (d) => d.flightHoursPerYear > 5,
      suggestion: "✈️ Reduce air travel by 1 domestic trip and choose trains instead — save 150-200 kg CO₂ per trip.",
      savingKg: 200,
      difficulty: 'Hard',
    },
    {
      condition: (d) => d.dailyDistance > 15 && d.primaryMode !== 'train',
      suggestion: "🚆 For long commutes, Indian Railways emits 80% less CO₂ than cars. Consider train travel!",
      savingKg: 600,
      difficulty: 'Medium',
    },
  ],
  energy: [
    {
      condition: (d) => d.acHoursPerDay > 3,
      suggestion: "❄️ Reduce AC usage by 2 hours/day — set thermostat to 24°C instead of 18°C. Save ~40 kg CO₂/month.",
      savingKg: 40,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.monthlyBill > 1000,
      suggestion: "💡 Replace remaining incandescent bulbs with LED — save ₹500/month and 30 kg CO₂/year.",
      savingKg: 30,
      difficulty: 'Easy',
    },
    {
      condition: (d) => !d.hasSolarPanels && d.monthlyBill > 800,
      suggestion: "☀️ Installing a 1kW rooftop solar panel can offset 1,200 kg CO₂/year and save ₹6,000+ annually.",
      savingKg: 100,
      difficulty: 'Hard',
    },
    {
      condition: (d) => d.monthlyBill > 500,
      suggestion: "🔌 Unplug chargers and electronics when not in use — standby power wastes 10% of your electricity.",
      savingKg: 15,
      difficulty: 'Easy',
    },
  ],
  food: [
    {
      condition: (d) => d.dietType === 'non_vegetarian',
      suggestion: "🥗 Try Meatless Mondays! Cutting meat just 1 day/week reduces your food footprint by 10% (~100 kg CO₂/year).",
      savingKg: 100,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.foodWasteKgPerWeek > 1,
      suggestion: "🗑️ Plan meals to cut food waste by 50% — wasted food generates 1.9 kg CO₂ per kg and costs you money.",
      savingKg: 50,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.dietType === 'non_vegetarian',
      suggestion: "🐟 Choose fish/chicken over red meat — beef emits 5x more CO₂ than chicken per protein unit.",
      savingKg: 80,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.mealsPerDay > 2,
      suggestion: "🛒 Buy local and seasonal produce — reduces transport emissions by 30% compared to imported food.",
      savingKg: 40,
      difficulty: 'Easy',
    },
  ],
  shopping: [
    {
      condition: (d) => d.clothingItemsPerMonth > 2,
      suggestion: "👗 Fast fashion emits 10+ kg CO₂ per item. Try thrift stores or buy-nothing groups to halve clothing emissions.",
      savingKg: 120,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.onlineOrdersPerMonth > 5,
      suggestion: "📦 Bundle online orders into fewer, larger deliveries — reduce delivery CO₂ by 30-40%.",
      savingKg: 25,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.newPhoneThisYear,
      suggestion: "📱 Extend phone life by 1-2 extra years through repair — save 70 kg CO₂ vs buying new.",
      savingKg: 70,
      difficulty: 'Medium',
    },
  ],
  waste: [
    {
      condition: (d) => d.recyclingPercentage < 20,
      suggestion: "♻️ Start recycling paper, plastic, and metal — recycling 1 kg of aluminum saves 9 kg CO₂.",
      savingKg: 30,
      difficulty: 'Easy',
    },
    {
      condition: (d) => !d.compostsFood,
      suggestion: "🌱 Start composting food scraps — diverts waste from landfills and creates free fertilizer for plants.",
      savingKg: 20,
      difficulty: 'Easy',
    },
    {
      condition: (d) => d.wasteKgPerWeek > 2,
      suggestion: "🛍️ Carry reusable bags and containers — reduces single-use plastic that takes 400+ years to decompose.",
      savingKg: 10,
      difficulty: 'Easy',
    },
  ],
};

export function getRuleBasedSuggestions(calculatorData) {
  const allSuggestions = [];

  const categories = ['transport', 'energy', 'food', 'shopping', 'waste'];
  categories.forEach((cat) => {
    const catData = calculatorData[cat] || {};
    const catSuggestions = SUGGESTIONS[cat] || [];
    catSuggestions.forEach((s) => {
      if (s.condition(catData)) {
        allSuggestions.push({ ...s, category: cat });
      }
    });
  });

  // Sort by saving potential
  return allSuggestions
    .sort((a, b) => b.savingKg - a.savingKg)
    .slice(0, 6);
}

export async function getGeminiSuggestions(calculatorData, totalEmissions, apiKey) {
  const report = await getAIAdvisorReport(calculatorData, totalEmissions, apiKey);
  return report.suggestions;
}

export function getLocalAdvisorSuggestions(calculatorData) {
  const rules = getRuleBasedSuggestions(calculatorData);
  
  let highestCat = 'energy';
  let maxVal = 0;
  ['transport', 'energy', 'food', 'shopping', 'waste'].forEach(cat => {
    const val = (calculatorData[cat] || {}).total || 0;
    if (val > maxVal) {
      maxVal = val;
      highestCat = cat;
    }
  });

  const analysis = `Your highest carbon source is likely ${highestCat}. Implementing targeted reductions here will yield your most significant monthly CO₂ offsets.`;
  
  const alternatives = [];
  const trans = calculatorData.transport || {};
  if (trans.primaryMode === 'car_petrol' || trans.primaryMode === 'car_diesel') {
    alternatives.push({ original: 'Petrol/Diesel Car', alternative: 'Electric Scooter / Public Metro', benefit: 'Lowers travel footprint by up to 70%' });
  }
  if (!(calculatorData.energy || {}).hasSolarPanels) {
    alternatives.push({ original: 'Grid Electricity', alternative: 'PM Surya Ghar Rooftop Solar System', benefit: 'Cuts household emissions by 30% dynamically' });
  }
  if ((calculatorData.food || {}).dietType === 'non_vegetarian') {
    alternatives.push({ original: 'Meat-heavy Diet', alternative: 'Plant-forward (Vegetarian or Vegan) meals', benefit: 'Plant diets have 50% lower daily emission weight' });
  }
  if (alternatives.length === 0) {
    alternatives.push({ original: 'Single-use packaging', alternative: 'Reusable containers and shopping bags', benefit: 'Reduces landfill waste emissions to zero' });
  }

  const monthlyGoals = [
    { title: 'Car-Free Week', description: 'Avoid driving for 7 days', category: 'transport', target: 7, reward: 100 },
    { title: 'Zero Waste Challenge', description: 'Compost and recycle household waste', category: 'waste', target: 14, reward: 120 }
  ];

  return {
    analysis,
    suggestions: rules,
    monthlyGoals,
    alternatives
  };
}

export async function getGeminiAdvisorReport(calculatorData, totalEmissions, apiKey) {
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are EcoBot, an expert carbon footprint advisor specializing in India. 
    
A user's monthly carbon footprint analysis:
- Transport: ${calculatorData.transport?.primaryMode || 'bike'}, ${calculatorData.transport?.dailyDistance || 10}km/day
- Monthly electricity bill: ₹${calculatorData.energy?.monthlyBill || 500}
- AC usage: ${calculatorData.energy?.acHoursPerDay || 2} hours/day
- Diet: ${calculatorData.food?.dietType || 'non_vegetarian'}
- Food waste: ${calculatorData.food?.foodWasteKgPerWeek || 2}kg/week
- Clothing purchases: ${calculatorData.shopping?.clothingItemsPerMonth || 2} items/month
- Total monthly emissions: ${totalEmissions} kg CO₂

Provide a personalized sustainability advisor report.
Return ONLY a valid JSON object matching the following structure (no markdown formatting, no other text):
{
  "analysis": "A detailed 1-2 sentence assessment of their footprint, noting their largest source and general advice.",
  "suggestions": [
    { "suggestion": "Specific recommendation 1", "savingKg": 120, "difficulty": "Easy", "category": "transport" },
    { "suggestion": "Specific recommendation 2", "savingKg": 80, "difficulty": "Medium", "category": "energy" },
    { "suggestion": "Specific recommendation 3", "savingKg": 50, "difficulty": "Easy", "category": "food" }
  ],
  "monthlyGoals": [
    { "title": "Car-Free Week", "description": "Avoid car travel for 7 days", "category": "transport", "target": 7, "reward": 100 },
    { "title": "Vegetarian Pledge", "description": "Eat plant-based meals for 5 days", "category": "food", "target": 5, "reward": 80 }
  ],
  "alternatives": [
    { "original": "Petrol Car", "alternative": "Electric Vehicle / Metro", "benefit": "Reduces transport emissions by 70%" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Gemini suggestions error:', error);
  }
  return null;
}

export async function getAIAdvisorReport(calculatorData, totalEmissions, apiKey) {
  if (apiKey) {
    const report = await getGeminiAdvisorReport(calculatorData, totalEmissions, apiKey);
    if (report && report.analysis && report.suggestions) {
      return report;
    }
  }
  return getLocalAdvisorSuggestions(calculatorData);
}
