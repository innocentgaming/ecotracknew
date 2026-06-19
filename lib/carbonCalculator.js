import {
  EMISSION_FACTORS,
  INDIA_AVERAGE_ANNUAL,
  GLOBAL_AVERAGE_ANNUAL,
  PARIS_TARGET_ANNUAL,
  MONTHS_PER_YEAR,
  DAYS_PER_MONTH,
  WEEKS_PER_MONTH,
  AVERAGE_FLIGHT_SPEED_KM_H,
  ELECTRICITY_TARIFF_INR_PER_KWH,
  COMPOSTING_REDUCTION_FACTOR,
  SOLAR_REDUCTION_FACTOR,
  ECO_SCORE_MIN_ANNUAL_EMISSIONS,
  ECO_SCORE_MAX_ANNUAL_EMISSIONS,
} from './constants';

export { EMISSION_FACTORS, INDIA_AVERAGE_ANNUAL, GLOBAL_AVERAGE_ANNUAL, PARIS_TARGET_ANNUAL };

export function calculateTransport(data) {
  const {
    primaryMode = 'bike',
    dailyDistance = 10,
    flightHoursPerYear = 0,
    commuteFrequency = 22, // days per month
  } = data;

  const monthlyKm = dailyDistance * commuteFrequency;
  const modeEmission = EMISSION_FACTORS.transport[primaryMode] !== undefined
    ? EMISSION_FACTORS.transport[primaryMode]
    : EMISSION_FACTORS.transport.bike;
  const commuteEmission = monthlyKm * modeEmission;

  // Flight: average domestic flight speed ~480km/hr, divided by 12 to get monthly emissions
  const flightKmPerYear = flightHoursPerYear * AVERAGE_FLIGHT_SPEED_KM_H;
  const flightEmission = (flightKmPerYear * EMISSION_FACTORS.transport.flight_domestic) / MONTHS_PER_YEAR;

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
  const estimatedKwh = monthlyBill / ELECTRICITY_TARIFF_INR_PER_KWH;
  const gridEmission = estimatedKwh * EMISSION_FACTORS.electricity.india_grid;

  // AC additional (if not already in bill estimate)
  const acKwh = acHoursPerDay * EMISSION_FACTORS.electricity.ac_per_hour * DAYS_PER_MONTH * (acMonthsPerYear / MONTHS_PER_YEAR);
  const acEmission = acKwh * EMISSION_FACTORS.electricity.india_grid;

  const solarReduction = hasSolarPanels ? SOLAR_REDUCTION_FACTOR : 0;
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
  const monthlyFoodEmission = dailyFoodEmission * DAYS_PER_MONTH;
  const monthlyWasteEmission = foodWasteKgPerWeek * WEEKS_PER_MONTH * EMISSION_FACTORS.food.food_waste_kg;

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
  const phoneEmission = newPhoneThisYear ? EMISSION_FACTORS.shopping.electronics_phone / MONTHS_PER_YEAR : 0;
  const laptopEmission = newLaptopThisYear ? EMISSION_FACTORS.shopping.electronics_laptop / MONTHS_PER_YEAR : 0;

  return Math.round(clothingEmission + deliveryEmission + phoneEmission + laptopEmission);
}

export function calculateWaste(data) {
  const {
    wasteKgPerWeek = 3,
    recyclingPercentage = 10,
    compostsFood = false,
  } = data;

  const monthlyWaste = wasteKgPerWeek * WEEKS_PER_MONTH;
  const landfillWaste = monthlyWaste * (1 - recyclingPercentage / 100);
  const recycledWaste = monthlyWaste * (recyclingPercentage / 100);
  const compostReduction = compostsFood ? COMPOSTING_REDUCTION_FACTOR : 0;

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
  const annualKg = monthlyKgCO2 * MONTHS_PER_YEAR;
  if (annualKg <= ECO_SCORE_MIN_ANNUAL_EMISSIONS) return 100;
  if (annualKg >= ECO_SCORE_MAX_ANNUAL_EMISSIONS) return 0;
  const range = ECO_SCORE_MAX_ANNUAL_EMISSIONS - ECO_SCORE_MIN_ANNUAL_EMISSIONS;
  return Math.round(100 - ((annualKg - ECO_SCORE_MIN_ANNUAL_EMISSIONS) / range) * 100);
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Eco Champion', color: '#00ff88', emoji: '🌟' };
  if (score >= 60) return { label: 'Green Warrior', color: '#7fff00', emoji: '🌿' };
  if (score >= 40) return { label: 'Eco Aware', color: '#ffbb00', emoji: '🌱' };
  if (score >= 20) return { label: 'Carbon Conscious', color: '#ff7700', emoji: '⚠️' };
  return { label: 'High Emitter', color: '#ff3333', emoji: '🔴' };
}

export function getComparisonText(monthlyKg) {
  const annualKg = monthlyKg * MONTHS_PER_YEAR;
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

export function calculateSustainabilitySubScores(results) {
  if (!results) {
    return { transport: 50, energy: 50, food: 50, shopping: 50, waste: 50, overall: 50 };
  }
  const transport = Math.max(0, Math.min(100, 100 - Math.round(((results.transport || 0) * MONTHS_PER_YEAR / 3000) * 100)));
  const energy = Math.max(0, Math.min(100, 100 - Math.round(((results.energy || 0) * MONTHS_PER_YEAR / 2500) * 100)));
  const food = Math.max(0, Math.min(100, 100 - Math.round(((results.food || 0) * MONTHS_PER_YEAR / 3000) * 100)));
  const shopping = Math.max(0, Math.min(100, 100 - Math.round(((results.shopping || 0) * MONTHS_PER_YEAR / 1200) * 100)));
  const waste = Math.max(0, Math.min(100, 100 - Math.round(((results.waste || 0) * MONTHS_PER_YEAR / 800) * 100)));
  
  const overall = Math.round((transport + energy + food + shopping + waste) / 5);
  return { transport, energy, food, shopping, waste, overall };
}

export function predictFutureFootprint(history) {
  if (!history || history.length < 2) {
    // If we do not have enough history data, we project static values
    return null;
  }
  
  // Sort history chronologically
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const n = sorted.length;
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  sorted.forEach((h, index) => {
    const total = h.total || ((h.transport || 0) + (h.energy || 0) + (h.food || 0) + (h.shopping || 0) + (h.waste || 0));
    sumX += index;
    sumY += total;
    sumXY += index * total;
    sumXX += index * index;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict next month (x = n)
  const predictedNext = slope * n + intercept;
  return Math.max(0, Math.round(predictedNext));
}
