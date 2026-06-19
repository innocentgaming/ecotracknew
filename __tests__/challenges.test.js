import { describe, it, expect } from 'vitest';
import {
  getCurrentLevel,
  getNextLevel,
  getLevelProgress,
  getDefaultChallengeState,
  CHALLENGES,
  LEVELS,
} from '@/lib/challenges';

describe('EcoTrack Challenges & Gamification Engine', () => {
  describe('getCurrentLevel', () => {
    it('returns the level corresponding to user points', () => {
      expect(getCurrentLevel(0).name).toBe('Seedling');
      expect(getCurrentLevel(50).name).toBe('Seedling');
      expect(getCurrentLevel(100).name).toBe('Sapling');
      expect(getCurrentLevel(450).name).toBe('Eco Aware');
      expect(getCurrentLevel(800).name).toBe('Green Warrior');
      expect(getCurrentLevel(1500).name).toBe('Eco Champion');
      expect(getCurrentLevel(5000).name).toBe('Planet Guardian');
    });
  });

  describe('getNextLevel', () => {
    it('returns the next level information', () => {
      expect(getNextLevel(0).name).toBe('Sapling');
      expect(getNextLevel(100).name).toBe('Eco Aware');
      expect(getNextLevel(1500).name).toBe('Planet Guardian');
    });

    it('returns null if user has reached the maximum level', () => {
      expect(getNextLevel(5000)).toBeNull();
    });
  });

  describe('getLevelProgress', () => {
    it('calculates the percentage progress inside the current tier', () => {
      // Seedling is 0 to 100. 40 points is 40%
      expect(getLevelProgress(40)).toBe(40);
      // Sapling is 100 to 300. 150 points is 50%
      expect(getLevelProgress(200)).toBe(50);
      // Planet Guardian has maxPoints = Infinity, returns 100
      expect(getLevelProgress(3000)).toBe(100);
    });
  });

  describe('getDefaultChallengeState', () => {
    it('initializes default states for all challenges', () => {
      const state = getDefaultChallengeState();
      CHALLENGES.forEach(c => {
        expect(state[c.id]).toBeDefined();
        expect(state[c.id].started).toBe(false);
        expect(state[c.id].completed).toBe(false);
        expect(state[c.id].progress).toBe(0);
        expect(state[c.id].startedAt).toBeNull();
        expect(state[c.id].completedAt).toBeNull();
      });
    });
  });
});
