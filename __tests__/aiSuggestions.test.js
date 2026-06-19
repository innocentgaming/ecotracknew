import { describe, it, expect } from 'vitest';
import { getRuleBasedSuggestions, SUGGESTIONS } from '@/lib/aiSuggestions';

describe('AI / Rule-based Suggestions Engine', () => {
  it('generates customized suggestions based on high carbon activities', () => {
    const mockData = {
      transport: {
        primaryMode: 'car_petrol',
        dailyDistance: 4, // triggers dailyDistance <= 5
        commuteFrequency: 20,
      },
      energy: {
        acHoursPerDay: 5, // triggers acHoursPerDay > 3
        monthlyBill: 600, // triggers standby suggestion but not solar or LED
      },
      food: {
        dietType: 'non_vegetarian', // triggers meatless mondays
        foodWasteKgPerWeek: 2.0, // triggers food waste reduction
      },
      shopping: {
        clothingItemsPerMonth: 1, // does not trigger clothing reduction
      },
      waste: {
        recyclingPercentage: 10, // triggers recycling suggestion
      },
    };

    const suggestions = getRuleBasedSuggestions(mockData);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(6);

    // Verify suggestions contain expected topics
    const suggestionsText = suggestions.map(s => s.suggestion).join(' ');
    expect(suggestionsText).toContain('cycling');
    expect(suggestionsText).toContain('AC');
  });

  it('handles empty input data gracefully', () => {
    const suggestions = getRuleBasedSuggestions({});
    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
