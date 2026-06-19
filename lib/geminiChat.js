// Gemini Chat Integration for EcoBot

const SYSTEM_CONTEXT = `You are EcoBot 🌿, an expert AI assistant for the EcoTrack Carbon Footprint Platform. 
You specialize in:
- Carbon footprint reduction strategies for Indian users
- Sustainable living tips relevant to India's context
- Environmental impact of daily activities
- Green technology and alternatives available in India
- Climate science and facts

Always be encouraging, specific, and provide actionable advice. 
When possible, mention approximate CO₂ savings in kg or tonnes.
Keep responses concise (2-4 sentences) but informative.
Reference India-specific context (Indian cities, railways, renewable energy, etc.) when relevant.`;

export async function sendChatMessage(messages, userMessage, apiKey) {
  if (!apiKey) {
    return getFallbackResponse(userMessage);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_CONTEXT,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    if (error.message?.includes('API key')) {
      return '⚠️ Invalid API key. Please check your Gemini API key in Settings.';
    }
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('flight') || msg.includes('fly') || msg.includes('airplane')) {
    return "✈️ A typical domestic flight in India emits about 255g CO₂ per passenger per km. A Delhi-Mumbai flight (~1400km) generates ~357 kg CO₂ per person — that's equivalent to 3 months of electricity usage for an average Indian household! Consider trains for journeys under 1000km — Indian Railways emits 80% less CO₂ per km.";
  }
  if (msg.includes('cycle') || msg.includes('cycling') || msg.includes('bicycle')) {
    return "🚴 Cycling is the greenest transport option — zero CO₂ emissions! Switching from a petrol bike to cycling for just 5km daily saves about 150-200 kg CO₂/year. Plus, it's great for your health and free! Many Indian cities like Pune, Bangalore, and Delhi now have cycle lanes and bike-sharing programs.";
  }
  if (msg.includes('electric') || msg.includes('ev') || msg.includes('scooter')) {
    return "⚡ Electric vehicles are significantly greener than petrol vehicles, even with India's current electricity grid. An electric scooter emits about 55g CO₂/km vs 113g for a petrol bike — a 50% reduction! As India adds more renewable energy, EVs will become even cleaner. Government subsidies under FAME-II make them affordable.";
  }
  if (msg.includes('vegetarian') || msg.includes('vegan') || msg.includes('meat') || msg.includes('food')) {
    return "🥗 Diet is one of the biggest factors in your carbon footprint! A non-vegetarian diet emits ~7.2 kg CO₂/day vs ~3.8 kg for vegetarian. Going vegetarian just 2-3 days a week can save 400-600 kg CO₂/year. India has incredible vegetarian cuisine — dal, sabzi, biryani — making this one of the easiest switches!";
  }
  if (msg.includes('solar') || msg.includes('renewable')) {
    return "☀️ India gets 300+ sunny days per year, making solar panels incredibly effective! A 1kW rooftop solar system costs ₹60,000-80,000 and offsets ~1,200 kg CO₂/year. With PM Surya Ghar Muft Bijli Yojana offering subsidies up to ₹78,000, payback period is now just 4-5 years. Many states also offer net metering.";
  }
  if (msg.includes('reduce') || msg.includes('footprint') || msg.includes('carbon')) {
    return "🌱 The top 5 ways to reduce your carbon footprint in India: 1) Switch to public transport or cycling for short trips, 2) Reduce AC usage (set to 24°C+), 3) Eat more vegetarian meals, 4) Install LED lights and energy-efficient appliances, 5) Reduce food waste and start composting. Even small changes compound to hundreds of kg CO₂ saved per year!";
  }
  if (msg.includes('tree') || msg.includes('plant')) {
    return "🌳 Planting trees is wonderful! A mature tree absorbs 20-25 kg CO₂/year. India's Green India Mission aims to plant 500 million trees by 2030. While tree planting is valuable, it should complement (not replace) emission reductions — we need to do both! You can participate in local plantation drives through NSS, forest departments, or apps like India for Trees.";
  }

  return "🌍 Great question! As your EcoBot, I'm here to help you understand and reduce your carbon footprint. Some quick facts: The average Indian emits ~1.9 tonnes CO₂/year (vs global average of 4.7 tonnes). Even small changes like switching to public transport, reducing AC usage, or eating less meat can make a significant difference. What specific aspect of your lifestyle would you like to make greener?";
}

export const QUICK_QUESTIONS = [
  "How can I reduce my carbon footprint?",
  "Is cycling better than electric scooters?",
  "How much CO₂ does a flight emit?",
  "Which diet has lowest carbon impact?",
  "Are EVs truly eco-friendly in India?",
  "How much does a tree absorb CO₂?",
];
