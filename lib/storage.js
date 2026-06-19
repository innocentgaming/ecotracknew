// localStorage helpers for EcoTrack data persistence

const KEYS = {
  CALCULATOR_DATA: 'ecotrack_calculator',
  CALCULATOR_RESULTS: 'ecotrack_results',
  CHALLENGES: 'ecotrack_challenges',
  HISTORY: 'ecotrack_history',
  SETTINGS: 'ecotrack_settings',
  USER_PROFILE: 'ecotrack_profile',
  JOURNAL: 'ecotrack_journal',
  BUDGET: 'ecotrack_budget',
  GOALS: 'ecotrack_goals',
};

export function saveCalculatorData(data) {
  try {
    localStorage.setItem(KEYS.CALCULATOR_DATA, JSON.stringify(data));
  } catch (e) {}
}

export function loadCalculatorData() {
  try {
    const data = localStorage.getItem(KEYS.CALCULATOR_DATA);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
}

export function saveResults(results) {
  try {
    const existing = loadHistory();
    const entry = {
      ...results,
      date: new Date().toISOString(),
      id: Date.now(),
    };
    const updated = [entry, ...existing].slice(0, 12); // Keep last 12 months
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    localStorage.setItem(KEYS.CALCULATOR_RESULTS, JSON.stringify(entry));
  } catch (e) {}
}

export function loadResults() {
  try {
    const data = localStorage.getItem(KEYS.CALCULATOR_RESULTS);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
}

export function loadHistory() {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

export function saveChallenges(challenges) {
  try {
    localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(challenges));
  } catch (e) {}
}

export function loadChallenges() {
  try {
    const data = localStorage.getItem(KEYS.CHALLENGES);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { geminiApiKey: '', theme: 'dark' };
  } catch (e) { return { geminiApiKey: '', theme: 'dark' }; }
}

export function loadUserProfile() {
  try {
    const data = localStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : { name: 'Eco Warrior', points: 0, level: 1, badges: [] };
  } catch (e) { return { name: 'Eco Warrior', points: 0, level: 1, badges: [] }; }
}

export function saveUserProfile(profile) {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

export function generateMockHistory() {
  // Generate 6 months of mock data for demo purposes
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, i) => ({
    month,
    transport: 150 + Math.random() * 50,
    energy: 200 + Math.random() * 80,
    food: 300 + Math.random() * 60,
    shopping: 80 + Math.random() * 40,
    waste: 30 + Math.random() * 20,
    date: new Date(2026, i, 1).toISOString(),
  }));
}

// ── JOURNAL ──────────────────────────────────────────────────────────────────

const DEFAULT_JOURNAL = [
  { id: 1, category: 'transport', action: 'Cycled to work instead of driving', co2Saved: 2.4, points: 15, date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, category: 'food', action: 'Ate a plant-based meal', co2Saved: 1.8, points: 10, date: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, category: 'energy', action: 'Turned off AC for 4 hours', co2Saved: 0.9, points: 8, date: new Date().toISOString() },
];

export function loadJournal() {
  try {
    const data = localStorage.getItem(KEYS.JOURNAL);
    return data ? JSON.parse(data) : DEFAULT_JOURNAL;
  } catch (e) { return DEFAULT_JOURNAL; }
}

export function saveJournal(entries) {
  try {
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(entries));
  } catch (e) {}
}

export function addJournalEntry(entry) {
  try {
    const existing = loadJournal();
    const updated = [{ ...entry, id: Date.now(), date: new Date().toISOString() }, ...existing];
    saveJournal(updated);
    return updated;
  } catch (e) { return loadJournal(); }
}

export function deleteJournalEntry(id) {
  try {
    const existing = loadJournal();
    const updated = existing.filter(e => e.id !== id);
    saveJournal(updated);
    return updated;
  } catch (e) { return loadJournal(); }
}

// ── CARBON BUDGET ─────────────────────────────────────────────────────────────

export function loadBudget() {
  try {
    const data = localStorage.getItem(KEYS.BUDGET);
    return data ? JSON.parse(data) : { monthlyTarget: 700 };
  } catch (e) { return { monthlyTarget: 700 }; }
}

export function saveBudget(budget) {
  try {
    localStorage.setItem(KEYS.BUDGET, JSON.stringify(budget));
  } catch (e) {}
}

// ── GOALS ─────────────────────────────────────────────────────────────────────

const DEFAULT_GOALS = [
  { id: 1, title: 'Car-Free Week', emoji: '🚲', description: 'Avoid car travel for 7 days', category: 'transport', target: 7, progress: 2, completed: false, reward: 100 },
  { id: 2, title: 'Vegan for 5 Days', emoji: '🥗', description: 'Eat only plant-based meals', category: 'food', target: 5, progress: 3, completed: false, reward: 80 },
  { id: 3, title: 'Zero Waste Week', emoji: '♻️', description: 'Reduce waste to near-zero', category: 'waste', target: 7, progress: 7, completed: true, reward: 120 },
  { id: 4, title: 'Solar Habits', emoji: '☀️', description: 'Use no AC for 10 days', category: 'energy', target: 10, progress: 4, completed: false, reward: 90 },
  { id: 5, title: 'Public Transport Month', emoji: '🚌', description: 'Only use buses/metro for 30 days', category: 'transport', target: 30, progress: 12, completed: false, reward: 200 },
];

export function loadGoals() {
  try {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : DEFAULT_GOALS;
  } catch (e) { return DEFAULT_GOALS; }
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {}
}
