// Carbon emission factors (India-specific)
// Sources: India GHG Platform, Ministry of Environment, IEA

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192,    // kg CO2 per km
    car_diesel: 0.171,    // kg CO2 per km
    bike: 0.113,          // kg CO2 per km (petrol motorcycle)
    bus: 0.089,           // kg CO2 per km
    train: 0.041,         // kg CO2 per km
    auto: 0.135,          // kg CO2 per km
    flight_domestic: 0.255, // kg CO2 per km
    bicycle: 0,           // kg CO2 per km
    walking: 0,           // kg CO2 per km
    ev: 0.055,            // kg CO2 per km (India grid)
  },
  electricity: {
    india_grid: 0.82,     // kg CO2 per kWh (India average)
    ac_per_hour: 1.5,     // kWh per hour (1.5 ton AC)
    fan_per_hour: 0.075,  // kWh per hour
    fridge_per_day: 1.5,  // kWh per day
    washing_machine: 0.5, // kWh per wash
    tv_per_hour: 0.1,     // kWh per hour
  },
  food: {
    non_vegetarian: 7.2,  // kg CO2 per day
    vegetarian: 3.8,      // kg CO2 per day
    vegan: 2.9,           // kg CO2 per day
    eggetarian: 4.5,      // kg CO2 per day
    food_waste_kg: 1.9,   // kg CO2 per kg food wasted
  },
  shopping: {
    clothing_item: 10,    // kg CO2 per clothing item
    electronics_phone: 70, // kg CO2 per new phone
    electronics_laptop: 400, // kg CO2 per laptop
    online_delivery: 0.5, // kg CO2 per delivery (last mile)
  },
  waste: {
    landfill_kg: 0.5,     // kg CO2 per kg waste to landfill
    recycled_kg: -0.1,    // kg CO2 saved per kg recycled
  }
};

export const INDIA_AVERAGE_ANNUAL = 1900; // kg CO2 per year
export const GLOBAL_AVERAGE_ANNUAL = 4700; // kg CO2 per year
export const PARIS_TARGET_ANNUAL = 2300; // kg CO2 per year

export function calculateTransport(data) {
  const {
    primaryMode = 'bike',
    dailyDistance = 10,
    flightHoursPerYear = 0,
    commuteFrequency = 22, // days per month
  } = data;

  const monthlyKm = dailyDistance * commuteFrequency;
  const modeEmission = EMISSION_FACTORS.transport[primaryMode] || EMISSION_FACTORS.transport.bike;
  const commuteEmission = monthlyKm * modeEmission;

  // Flight: average domestic flight ~1200km, 2.5 hours
  const flightKmPerYear = flightHoursPerYear * 480; // ~480 km/hr domestic
  const flightEmission = (flightKmPerYear * EMISSION_FACTORS.transport.flight_domestic) / 12;

  return Math.round(commuteEmission + flightEmission);
}

export function calculateEnergy(data) {
  const {
    monthlyBill = 500, // INR
    acHoursPerDay = 2,
    acMonthsPerYear = 5,
    hasSolarPanels = false,
  } = data;

  // Estimate kWh from bill (avg 8 INR/kWh in India)
  const estimatedKwh = monthlyBill / 8;
  const gridEmission = estimatedKwh * EMISSION_FACTORS.electricity.india_grid;

  // AC additional (if not already in bill estimate)
  const acKwh = acHoursPerDay * EMISSION_FACTORS.electricity.ac_per_hour * 30 * (acMonthsPerYear / 12);
  const acEmission = acKwh * EMISSION_FACTORS.electricity.india_grid;

  const solarReduction = hasSolarPanels ? 0.3 : 0;
  const total = (gridEmission + acEmission) * (1 - solarReduction);

  return Math.round(total);
}

export function calculateFood(data) {
  const {
    dietType = 'non_vegetarian',
    mealsPerDay = 3,
    foodWasteKgPerWeek = 2,
  } = data;

  const dailyFoodEmission = EMISSION_FACTORS.food[dietType] || EMISSION_FACTORS.food.non_vegetarian;
  const monthlyFoodEmission = dailyFoodEmission * 30;
  const monthlyWasteEmission = foodWasteKgPerWeek * 4 * EMISSION_FACTORS.food.food_waste_kg;

  return Math.round(monthlyFoodEmission + monthlyWasteEmission);
}

export function calculateShopping(data) {
  const {
    clothingItemsPerMonth = 2,
    onlineOrdersPerMonth = 4,
    newPhoneThisYear = false,
    newLaptopThisYear = false,
  } = data;

  const clothingEmission = clothingItemsPerMonth * EMISSION_FACTORS.shopping.clothing_item;
  const deliveryEmission = onlineOrdersPerMonth * EMISSION_FACTORS.shopping.online_delivery;
  const phoneEmission = newPhoneThisYear ? EMISSION_FACTORS.shopping.electronics_phone / 12 : 0;
  const laptopEmission = newLaptopThisYear ? EMISSION_FACTORS.shopping.electronics_laptop / 12 : 0;

  return Math.round(clothingEmission + deliveryEmission + phoneEmission + laptopEmission);
}

export function calculateWaste(data) {
  const {
    wasteKgPerWeek = 3,
    recyclingPercentage = 10,
    compostsFood = false,
  } = data;

  const monthlyWaste = wasteKgPerWeek * 4;
  const landfillWaste = monthlyWaste * (1 - recyclingPercentage / 100);
  const recycledWaste = monthlyWaste * (recyclingPercentage / 100);
  const compostReduction = compostsFood ? 0.2 : 0;

  const emission =
    landfillWaste * EMISSION_FACTORS.waste.landfill_kg +
    recycledWaste * EMISSION_FACTORS.waste.recycled_kg;

  return Math.round(emission * (1 - compostReduction));
}

export function getTotalEmissions(transport, energy, food, shopping, waste) {
  return transport + energy + food + shopping + waste;
}

export function getEcoScore(monthlyKgCO2) {
  // Score 0-100, higher = better (lower emissions)
  const annualKg = monthlyKgCO2 * 12;
  if (annualKg <= 500) return 100;
  if (annualKg >= 8000) return 0;
  return Math.round(100 - ((annualKg - 500) / 7500) * 100);
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Eco Champion', color: '#00ff88', emoji: '🌟' };
  if (score >= 60) return { label: 'Green Warrior', color: '#7fff00', emoji: '🌿' };
  if (score >= 40) return { label: 'Eco Aware', color: '#ffbb00', emoji: '🌱' };
  if (score >= 20) return { label: 'Carbon Conscious', color: '#ff7700', emoji: '⚠️' };
  return { label: 'High Emitter', color: '#ff3333', emoji: '🔴' };
}

export function getComparisonText(monthlyKg) {
  const annualKg = monthlyKg * 12;
  const vsIndia = ((annualKg - INDIA_AVERAGE_ANNUAL) / INDIA_AVERAGE_ANNUAL) * 100;
  const vsGlobal = ((annualKg - GLOBAL_AVERAGE_ANNUAL) / GLOBAL_AVERAGE_ANNUAL) * 100;
  return {
    annualKg,
    vsIndia: vsIndia.toFixed(0),
    vsGlobal: vsGlobal.toFixed(0),
    betterThanIndia: annualKg < INDIA_AVERAGE_ANNUAL,
    betterThanGlobal: annualKg < GLOBAL_AVERAGE_ANNUAL,
  };
}
