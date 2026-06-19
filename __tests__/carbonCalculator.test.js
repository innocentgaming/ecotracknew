import { describe, it, expect } from 'vitest';
import {
  calculateTransport,
  calculateEnergy,
  calculateFood,
  calculateShopping,
  calculateWaste,
  getTotalEmissions,
  getEcoScore,
  getScoreLabel,
  getComparisonText,
  EMISSION_FACTORS,
  calculateSustainabilitySubScores,
  predictFutureFootprint,
} from '@/lib/carbonCalculator';

describe('Carbon Footprint Calculator Engine', () => {
  describe('calculateTransport', () => {
    it('calculates transport emissions for default petrol bike commute', () => {
      const data = {
        primaryMode: 'bike',
        dailyDistance: 10,
        flightHoursPerYear: 0,
        commuteFrequency: 22,
      };
      // monthly km = 10 * 22 = 220 km
      // emission = 220 * 0.113 = 24.86 kg CO2
      // rounded to 25
      expect(calculateTransport(data)).toBe(25);
    });

    it('calculates transport emissions with domestic flights included', () => {
      const data = {
        primaryMode: 'ev',
        dailyDistance: 20,
        flightHoursPerYear: 5,
        commuteFrequency: 20,
      };
      // monthly km = 20 * 20 = 400 km
      // commute emission = 400 * 0.055 = 22 kg CO2
      // flight km = 5 * 480 = 2400 km
      // flight emission = (2400 * 0.255) / 12 = 51 kg CO2
      // total = 22 + 51 = 73 kg CO2
      expect(calculateTransport(data)).toBe(73);
    });

    it('returns zero for clean modes (bicycle/walking)', () => {
      const bicycleData = { primaryMode: 'bicycle', dailyDistance: 15, commuteFrequency: 20 };
      const walkingData = { primaryMode: 'walking', dailyDistance: 5, commuteFrequency: 30 };
      expect(calculateTransport(bicycleData)).toBe(0);
      expect(calculateTransport(walkingData)).toBe(0);
    });

    it('handles missing or incomplete fields gracefully with defaults', () => {
      expect(calculateTransport({})).toBeDefined();
    });
  });

  describe('calculateEnergy', () => {
    it('estimates energy emissions from monthly bill and AC usage', () => {
      const data = {
        monthlyBill: 800,
        acHoursPerDay: 4,
        acMonthsPerYear: 6,
        hasSolarPanels: false,
      };
      // bill kWh = 800 / 8 = 100 kWh
      // bill emissions = 100 * 0.82 = 82 kg CO2
      // AC kWh = 4 * 1.5 * 30 * (6 / 12) = 90 kWh
      // AC emissions = 90 * 0.82 = 73.8 kg CO2
      // total = 82 + 73.8 = 155.8 -> round to 156
      expect(calculateEnergy(data)).toBe(156);
    });

    it('applies solar reduction when solar panels are present', () => {
      const data = {
        monthlyBill: 1600,
        acHoursPerDay: 0,
        acMonthsPerYear: 0,
        hasSolarPanels: true,
      };
      // bill kWh = 1600 / 8 = 200 kWh
      // bill emissions = 200 * 0.82 = 164 kg CO2
      // solar reduction = 30% -> 164 * 0.7 = 114.8 -> round to 115
      expect(calculateEnergy(data)).toBe(115);
    });
  });

  describe('calculateFood', () => {
    it('calculates food emissions based on diet type and waste', () => {
      const data = {
        dietType: 'vegan',
        mealsPerDay: 3,
        foodWasteKgPerWeek: 1.5,
      };
      // monthly food = 2.9 * 30 = 87 kg CO2
      // waste = 1.5 * 4 * 1.9 = 11.4 kg CO2
      // total = 87 + 11.4 = 98.4 -> round to 98
      expect(calculateFood(data)).toBe(98);
    });

    it('defaults dietType if unknown value is provided', () => {
      const data = { dietType: 'extraterrestrial', foodWasteKgPerWeek: 0 };
      expect(calculateFood(data)).toBe(7.2 * 30);
    });
  });

  describe('calculateShopping', () => {
    it('calculates shopping emissions including electronics offsets amortized monthly', () => {
      const data = {
        clothingItemsPerMonth: 3,
        onlineOrdersPerMonth: 10,
        newPhoneThisYear: true,
        newLaptopThisYear: false,
      };
      // clothing = 3 * 10 = 30 kg CO2
      // online deliveries = 10 * 0.5 = 5 kg CO2
      // phone = 70 / 12 = 5.83 kg CO2
      // total = 30 + 5 + 5.83 = 40.83 -> round to 41
      expect(calculateShopping(data)).toBe(41);
    });
  });

  describe('calculateWaste', () => {
    it('calculates household waste impact with recycling offsets', () => {
      const data = {
        wasteKgPerWeek: 10,
        recyclingPercentage: 40,
        compostsFood: false,
      };
      // monthly waste = 10 * 4 = 40 kg
      // landfill = 40 * 0.6 = 24 kg -> emissions = 24 * 0.5 = 12 kg CO2
      // recycled = 40 * 0.4 = 16 kg -> offset = 16 * -0.1 = -1.6 kg CO2
      // net = 12 - 1.6 = 10.4 -> round to 10
      expect(calculateWaste(data)).toBe(10);
    });

    it('applies composting reduction when enabled', () => {
      const data = {
        wasteKgPerWeek: 5,
        recyclingPercentage: 20,
        compostsFood: true,
      };
      // monthly waste = 20 kg
      // landfill = 16 kg -> 8 kg CO2
      // recycled = 4 kg -> -0.4 kg CO2
      // net = 7.6
      // compost discount = 20% -> 7.6 * 0.8 = 6.08 -> round to 6
      expect(calculateWaste(data)).toBe(6);
    });
  });

  describe('getEcoScore', () => {
    it('returns 100 for very low annual emissions', () => {
      // monthly = 40 kg -> annual = 480 kg (<= 500)
      expect(getEcoScore(40)).toBe(100);
    });

    it('returns 0 for high annual emissions', () => {
      // monthly = 700 kg -> annual = 8400 kg (>= 8000)
      expect(getEcoScore(700)).toBe(0);
    });

    it('correctly maps scores proportionally', () => {
      // target middle value
      // annual = 4250 kg
      // score = 100 - ((4250 - 500) / 7500) * 100 = 100 - 50 = 50
      expect(getEcoScore(4250 / 12)).toBe(50);
    });
  });

  describe('getScoreLabel', () => {
    it('returns Eco Champion for high scores', () => {
      expect(getScoreLabel(85).label).toBe('Eco Champion');
    });

    it('returns High Emitter for low scores', () => {
      expect(getScoreLabel(10).label).toBe('High Emitter');
    });
  });

  describe('getComparisonText', () => {
    it('provides correct percentage differences vs benchmarks', () => {
      const comparison = getComparisonText(100); // 1200 kg annual
      expect(comparison.betterThanIndia).toBe(true);
      expect(comparison.betterThanGlobal).toBe(true);
    });
  });

  describe('calculateSustainabilitySubScores', () => {
    it('calculates default scores when results are missing', () => {
      const subScores = calculateSustainabilitySubScores(null);
      expect(subScores.transport).toBe(50);
      expect(subScores.energy).toBe(50);
      expect(subScores.overall).toBe(50);
    });

    it('calculates correct subscores for a set of emissions', () => {
      const results = {
        transport: 100, // 1200 kg/year -> 1200/3000 = 40% -> score 60
        energy: 50,    // 600 kg/year -> 600/2500 = 24% -> score 76
        food: 100,    // 1200 kg/year -> 1200/3000 = 40% -> score 60
        shopping: 20,  // 240 kg/year -> 240/1200 = 20% -> score 80
        waste: 10,     // 120 kg/year -> 120/800 = 15% -> score 85
      };
      const subScores = calculateSustainabilitySubScores(results);
      expect(subScores.transport).toBe(60);
      expect(subScores.energy).toBe(76);
      expect(subScores.food).toBe(60);
      expect(subScores.shopping).toBe(80);
      expect(subScores.waste).toBe(85);
      expect(subScores.overall).toBe(Math.round((60 + 76 + 60 + 80 + 85) / 5)); // 72
    });
  });

  describe('predictFutureFootprint', () => {
    it('returns null if there are fewer than 2 history entries', () => {
      expect(predictFutureFootprint([])).toBeNull();
      expect(predictFutureFootprint([{ total: 300, date: '2026-01-01' }])).toBeNull();
    });

    it('makes a linear regression prediction for future carbon emissions', () => {
      const history = [
        { total: 100, date: '2026-01-01' },
        { total: 120, date: '2026-02-01' },
        { total: 140, date: '2026-03-01' },
      ];
      // Index 0: 100, Index 1: 120, Index 2: 140
      // Next is index 3: prediction should be 160
      expect(predictFutureFootprint(history)).toBe(160);
    });

    it('works correctly when totals are computed from individual categories', () => {
      const history = [
        { transport: 50, energy: 50, food: 50, shopping: 50, waste: 50, date: '2026-01-01' }, // 250
        { transport: 60, energy: 60, food: 60, shopping: 60, waste: 60, date: '2026-02-01' }, // 300
      ];
      // Index 0: 250, Index 1: 300
      // Next is index 2: prediction should be 350
      expect(predictFutureFootprint(history)).toBe(350);
    });
  });
});
