/**
 * JSDoc / TypeScript Schema Definitions for EcoTrack
 * Used for static code validation and strict-mode verification
 */

/**
 * @typedef {Object} TransportFactors
 * @property {number} car_petrol - kg CO2/km for petrol cars
 * @property {number} car_diesel - kg CO2/km for diesel cars
 * @property {number} bike - kg CO2/km for petrol motorcycles
 * @property {number} bus - kg CO2/km for buses
 * @property {number} train - kg CO2/km for trains
 * @property {number} auto - kg CO2/km for auto rickshaws
 * @property {number} flight_domestic - kg CO2/km for domestic flights
 * @property {number} bicycle - kg CO2/km for bicycle
 * @property {number} walking - kg CO2/km for walking
 * @property {number} ev - kg CO2/km for electric vehicles
 */

/**
 * @typedef {Object} ElectricityFactors
 * @property {number} india_grid - kg CO2/kWh for grid electricity
 * @property {number} ac_per_hour - kWh/hour for AC usage
 * @property {number} fan_per_hour - kWh/hour for fan usage
 * @property {number} fridge_per_day - kWh/day for refrigerator
 * @property {number} washing_machine - kWh/wash cycle
 * @property {number} tv_per_hour - kWh/hour for TV
 */

/**
 * @typedef {Object} FoodFactors
 * @property {number} non_vegetarian - kg CO2/day
 * @property {number} vegetarian - kg CO2/day
 * @property {number} vegan - kg CO2/day
 * @property {number} eggetarian - kg CO2/day
 * @property {number} food_waste_kg - kg CO2/kg waste
 */

/**
 * @typedef {Object} ShoppingFactors
 * @property {number} clothing_item - kg CO2 per clothing item
 * @property {number} electronics_phone - kg CO2 per phone
 * @property {number} electronics_laptop - kg CO2 per laptop
 * @property {number} online_delivery - kg CO2 per delivery
 */

/**
 * @typedef {Object} WasteFactors
 * @property {number} landfill_kg - kg CO2/kg landfill waste
 * @property {number} recycled_kg - kg CO2/kg recycled waste (offset)
 */

/**
 * @typedef {Object} EmissionFactors
 * @property {TransportFactors} transport
 * @property {ElectricityFactors} electricity
 * @property {FoodFactors} food
 * @property {ShoppingFactors} shopping
 * @property {WasteFactors} waste
 */

/**
 * @typedef {Object} CalculatorInputTransport
 * @property {string} [primaryMode]
 * @property {number} [dailyDistance]
 * @property {number} [flightHoursPerYear]
 * @property {number} [commuteFrequency]
 */

/**
 * @typedef {Object} CalculatorInputEnergy
 * @property {number} [monthlyBill]
 * @property {number} [acHoursPerDay]
 * @property {number} [acMonthsPerYear]
 * @property {boolean} [hasSolarPanels]
 */

/**
 * @typedef {Object} CalculatorInputFood
 * @property {string} [dietType]
 * @property {number} [mealsPerDay]
 * @property {number} [foodWasteKgPerWeek]
 */

/**
 * @typedef {Object} CalculatorInputShopping
 * @property {number} [clothingItemsPerMonth]
 * @property {number} [onlineOrdersPerMonth]
 * @property {boolean} [newPhoneThisYear]
 * @property {boolean} [newLaptopThisYear]
 */

/**
 * @typedef {Object} CalculatorInputWaste
 * @property {number} [wasteKgPerWeek]
 * @property {number} [recyclingPercentage]
 * @property {boolean} [compostsFood]
 */

/**
 * @typedef {Object} CalculatorInputs
 * @property {CalculatorInputTransport} transport
 * @property {CalculatorInputEnergy} energy
 * @property {CalculatorInputFood} food
 * @property {CalculatorInputShopping} shopping
 * @property {CalculatorInputWaste} waste
 */

/**
 * @typedef {Object} CalculatorResults
 * @property {number} transport - kg CO2/month
 * @property {number} energy - kg CO2/month
 * @property {number} food - kg CO2/month
 * @property {number} shopping - kg CO2/month
 * @property {number} waste - kg CO2/month
 * @property {number} total - kg CO2/month
 * @property {number} score - overall EcoScore (0-100)
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} name - display name of the user
 * @property {number} points - accumulated gamification points
 * @property {number} level - user level (1-6)
 * @property {string[]} badges - earned badge titles
 */

/**
 * @typedef {Object} JournalEntry
 * @property {number} id - timestamp-based unique ID
 * @property {string} category - e.g. transport, energy, food, waste, shopping
 * @property {string} action - action description
 * @property {number} co2Saved - kg CO2 saved
 * @property {number} points - points awarded
 * @property {string} date - ISO string timestamp
 */

/**
 * @typedef {Object} Goal
 * @property {number} id - unique ID
 * @property {string} title - title of the goal
 * @property {string} emoji - representative emoji
 * @property {string} description - detailed description
 * @property {string} category - target category
 * @property {number} target - metric target
 * @property {number} progress - current progress value
 * @property {boolean} completed - completion state
 * @property {number} reward - points reward
 */

/**
 * @typedef {Object} AdvisorSuggestion
 * @property {string} category - target category
 * @property {string} action - concrete action recommendation
 * @property {string} saving - expected CO2 saving description
 * @property {string} cost - cost estimate
 */

/**
 * @typedef {Object} AIAdvisorReport
 * @property {string} analysis - overall carbon analysis
 * @property {AdvisorSuggestion[]} suggestions - concrete suggestion plans
 * @property {string} alternatives - alternative materials or routines
 * @property {string} goals - proposed action plans
 * @property {Object} [subScores] - category sub-scores
 * @property {number} [predictedNext] - mathematical predictions
 */

export {};
