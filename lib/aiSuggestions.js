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

Provide exactly 3 highly specific, actionable suggestions to reduce their carbon footprint. 
Format as JSON array with fields: suggestion (string, max 120 chars), savingKg (number), difficulty (Easy/Medium/Hard), category (string).
Be encouraging, specific to India, and mention approximate CO₂ savings.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Gemini suggestions error:', error);
  }
  return null;
}
