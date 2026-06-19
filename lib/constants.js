// Centralized emission factors and baseline constants

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192,      // kg CO2 per km
    car_diesel: 0.171,      // kg CO2 per km
    bike: 0.113,            // kg CO2 per km (petrol motorcycle)
    bus: 0.089,             // kg CO2 per km
    train: 0.041,           // kg CO2 per km
    auto: 0.135,            // kg CO2 per km
    flight_domestic: 0.255,  // kg CO2 per km
    bicycle: 0,             // kg CO2 per km
    walking: 0,             // kg CO2 per km
    ev: 0.055,              // kg CO2 per km (India grid average)
  },
  electricity: {
    india_grid: 0.82,       // kg CO2 per kWh
    ac_per_hour: 1.5,       // kWh per hour (1.5 ton AC)
    fan_per_hour: 0.075,    // kWh per hour
    fridge_per_day: 1.5,    // kWh per day
    washing_machine: 0.5,   // kWh per wash
    tv_per_hour: 0.1,       // kWh per hour
  },
  food: {
    non_vegetarian: 7.2,    // kg CO2 per day
    vegetarian: 3.8,        // kg CO2 per day
    vegan: 2.9,             // kg CO2 per day
    eggetarian: 4.5,        // kg CO2 per day
    food_waste_kg: 1.9,     // kg CO2 per kg food wasted
  },
  shopping: {
    clothing_item: 10,      // kg CO2 per clothing item
    electronics_phone: 70,   // kg CO2 per phone
    electronics_laptop: 400, // kg CO2 per laptop
    online_delivery: 0.5,   // kg CO2 per last-mile delivery
  },
  waste: {
    landfill_kg: 0.5,       // kg CO2 per kg waste to landfill
    recycled_kg: -0.1,      // kg CO2 offset per kg recycled
  }
};

export const INDIA_AVERAGE_ANNUAL = 1900;   // kg CO2 per year
export const GLOBAL_AVERAGE_ANNUAL = 4700;  // kg CO2 per year
export const PARIS_TARGET_ANNUAL = 2300;     // kg CO2 per year

// Extracted operational constants (magic numbers refactored)
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_MONTH = 30;
export const WEEKS_PER_MONTH = 4;
export const AVERAGE_FLIGHT_SPEED_KM_H = 480;
export const ELECTRICITY_TARIFF_INR_PER_KWH = 8;
export const COMPOSTING_REDUCTION_FACTOR = 0.2;
export const SOLAR_REDUCTION_FACTOR = 0.3;
export const ECO_SCORE_MIN_ANNUAL_EMISSIONS = 500;
export const ECO_SCORE_MAX_ANNUAL_EMISSIONS = 8000;

export const CATEGORIES = ['transport', 'energy', 'food', 'shopping', 'waste'];

export const CATEGORY_COLORS = {
  transport: '#3b82f6',
  energy: '#eab308',
  food: '#22c55e',
  shopping: '#a855f7',
  waste: '#06b6d4',
};

export const CATEGORY_EMOJIS = {
  transport: '🚗',
  energy: '⚡',
  food: '🥗',
  shopping: '🛍️',
  waste: '♻️',
};
