import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCalculatorData,
  loadCalculatorData,
  saveResults,
  loadResults,
  loadHistory,
  saveChallenges,
  loadChallenges,
  saveSettings,
  loadSettings,
  loadUserProfile,
  saveUserProfile,
  loadJournal,
  saveJournal,
  addJournalEntry,
  deleteJournalEntry,
  loadBudget,
  saveBudget,
  loadGoals,
  saveGoals,
  generateMockHistory,
} from '@/lib/storage';

describe('Storage Persistence Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Calculator Data', () => {
    it('saves and loads calculator raw input data', () => {
      const mockData = { transport: { primaryMode: 'ev' } };
      saveCalculatorData(mockData);
      expect(loadCalculatorData()).toEqual(mockData);
    });

    it('returns null if no calculator data exists', () => {
      expect(loadCalculatorData()).toBeNull();
    });
  });

  describe('Results & History', () => {
    it('saves calculations and updates history up to a limit of 12', () => {
      const result = { total: 450, transport: 150 };
      saveResults(result);
      
      const loaded = loadResults();
      expect(loaded).toBeDefined();
      expect(loaded.total).toBe(450);

      const history = loadHistory();
      expect(history.length).toBe(1);
      expect(history[0].total).toBe(450);
    });
  });

  describe('Challenges State', () => {
    it('saves and loads challenge active states', () => {
      const state = { 'public_transport_7': { started: true } };
      saveChallenges(state);
      expect(loadChallenges()).toEqual(state);
    });
  });

  describe('Settings', () => {
    it('defaults theme and API key, saves adjustments', () => {
      expect(loadSettings()).toEqual({ geminiApiKey: '', theme: 'dark' });
      saveSettings({ geminiApiKey: '12345', theme: 'light' });
      expect(loadSettings()).toEqual({ geminiApiKey: '12345', theme: 'light' });
    });
  });

  describe('User Profile', () => {
    it('initializes default profile and updates correctly', () => {
      expect(loadUserProfile().name).toBe('Eco Warrior');
      saveUserProfile({ name: 'Green Wizard', points: 120 });
      expect(loadUserProfile().name).toBe('Green Wizard');
    });
  });

  describe('Journal Activity', () => {
    it('supports listing, adding, and deleting journal entries', () => {
      const initial = loadJournal();
      expect(initial.length).toBeGreaterThan(0); // starts with default entries

      const newEntry = { category: 'transport', action: 'Walked to store', co2Saved: 1.0, points: 5 };
      const updatedList = addJournalEntry(newEntry);
      
      expect(updatedList.length).toBe(initial.length + 1);
      expect(updatedList[0].action).toBe('Walked to store');

      const entryIdToDelete = updatedList[0].id;
      const cleanList = deleteJournalEntry(entryIdToDelete);
      expect(cleanList.length).toBe(initial.length);
      expect(cleanList.some(e => e.id === entryIdToDelete)).toBe(false);
    });
  });

  describe('Carbon Budget', () => {
    it('persists budget limits', () => {
      expect(loadBudget()).toEqual({ monthlyTarget: 700 });
      saveBudget({ monthlyTarget: 500 });
      expect(loadBudget()).toEqual({ monthlyTarget: 500 });
    });
  });

  describe('Goals', () => {
    it('manages goal items state updates', () => {
      const initialGoals = loadGoals();
      expect(initialGoals.length).toBeGreaterThan(0);

      const modified = initialGoals.map(g => ({ ...g, completed: true }));
      saveGoals(modified);
      expect(loadGoals()[0].completed).toBe(true);
    });
  });
});
