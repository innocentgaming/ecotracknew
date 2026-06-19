// Challenges data and logic for EcoTrack gamification system

export const CHALLENGES = [
  {
    id: 'public_transport_7',
    title: 'Public Transport Week',
    description: 'Use public transport (bus/metro/train) for all commutes for 7 consecutive days.',
    emoji: '🚌',
    category: 'transport',
    points: 100,
    badge: '🏅 Transit Star',
    targetDays: 7,
    co2Saving: 25,
    difficulty: 'Medium',
    color: '#3b82f6',
  },
  {
    id: 'plant_tree',
    title: 'Plant a Tree',
    description: 'Plant at least one native tree or participate in a local plantation drive.',
    emoji: '🌳',
    category: 'nature',
    points: 150,
    badge: '🌲 Tree Hugger',
    targetDays: 1,
    co2Saving: 22,
    difficulty: 'Easy',
    color: '#22c55e',
  },
  {
    id: 'reusable_bottle_30',
    title: 'Reusable Bottle Pledge',
    description: 'Carry a reusable water bottle every day for 30 days. No single-use plastic bottles!',
    emoji: '🧴',
    category: 'waste',
    points: 80,
    badge: '♻️ Plastic Fighter',
    targetDays: 30,
    co2Saving: 5,
    difficulty: 'Easy',
    color: '#06b6d4',
  },
  {
    id: 'electricity_reduce',
    title: 'Energy Saver Challenge',
    description: 'Reduce your electricity consumption by 20% this month. Turn off lights, unplug devices.',
    emoji: '💡',
    category: 'energy',
    points: 120,
    badge: '⚡ Energy Hero',
    targetDays: 30,
    co2Saving: 40,
    difficulty: 'Medium',
    color: '#eab308',
  },
  {
    id: 'vegetarian_week',
    title: 'Meatless Week',
    description: 'Go fully vegetarian for 7 days. Explore India\'s incredible plant-based cuisine!',
    emoji: '🥗',
    category: 'food',
    points: 90,
    badge: '🌱 Green Eater',
    targetDays: 7,
    co2Saving: 24,
    difficulty: 'Easy',
    color: '#84cc16',
  },
  {
    id: 'cycle_commute',
    title: 'Cycle Commuter',
    description: 'Use a bicycle instead of motorized transport for at least 5 working days.',
    emoji: '🚴',
    category: 'transport',
    points: 110,
    badge: '🏆 Cycle Champion',
    targetDays: 5,
    co2Saving: 15,
    difficulty: 'Medium',
    color: '#f97316',
  },
  {
    id: 'zero_waste_day',
    title: 'Zero Waste Day',
    description: 'Go a full day producing zero landfill waste. Compost, recycle, and refuse packaging.',
    emoji: '♻️',
    category: 'waste',
    points: 75,
    badge: '🎯 Zero Waster',
    targetDays: 1,
    co2Saving: 2,
    difficulty: 'Hard',
    color: '#a855f7',
  },
  {
    id: 'no_ac_week',
    title: 'Fan-Only Week',
    description: 'Avoid using air conditioning for 7 days. Use fans and natural ventilation instead.',
    emoji: '🌬️',
    category: 'energy',
    points: 95,
    badge: '🌡️ Cool Warrior',
    targetDays: 7,
    co2Saving: 30,
    difficulty: 'Hard',
    color: '#ec4899',
  },
];

export const LEVELS = [
  { level: 1, name: 'Seedling', minPoints: 0, maxPoints: 100, emoji: '🌱' },
  { level: 2, name: 'Sapling', minPoints: 100, maxPoints: 300, emoji: '🌿' },
  { level: 3, name: 'Eco Aware', minPoints: 300, maxPoints: 600, emoji: '🍃' },
  { level: 4, name: 'Green Warrior', minPoints: 600, maxPoints: 1000, emoji: '🌲' },
  { level: 5, name: 'Eco Champion', minPoints: 1000, maxPoints: 2000, emoji: '🏆' },
  { level: 6, name: 'Planet Guardian', minPoints: 2000, maxPoints: Infinity, emoji: '🌍' },
];

export function getCurrentLevel(points) {
  return LEVELS.find((l) => points >= l.minPoints && points < l.maxPoints) || LEVELS[0];
}

export function getNextLevel(points) {
  const current = getCurrentLevel(points);
  return LEVELS.find((l) => l.level === current.level + 1) || null;
}

export function getLevelProgress(points) {
  const current = getCurrentLevel(points);
  if (current.maxPoints === Infinity) return 100;
  const range = current.maxPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.round((progress / range) * 100);
}

export function getDefaultChallengeState() {
  return CHALLENGES.reduce((acc, challenge) => {
    acc[challenge.id] = {
      started: false,
      completed: false,
      progress: 0,
      startedAt: null,
      completedAt: null,
    };
    return acc;
  }, {});
}
