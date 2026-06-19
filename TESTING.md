# EcoTrack Testing Documentation

This document explains the test infrastructure, test runner execution, and test suites in the EcoTrack application.

---

## 1. Test Architecture

EcoTrack uses **Vitest** as its primary test runner and runner environment. The tests check core calculation formulas, local storage actions, AI prompts, and linear regression models to ensure correct and bug-free execution.

- **Configuration**: Managed via `vitest.config.mjs` with browser-like API testing support using `jsdom`.
- **Global Setup**: Managed via `__tests__/setup.js` to establish mocks for browser components and localStorage.

---

## 2. Test Commands

Run the test suite from the project directory (`ecotrack/`):

### 2.1 Single Run
To run all tests once and view the test execution report:
```bash
npm run test
```

### 2.2 Watch Mode
To start the Vitest watch runner for continuous testing during development:
```bash
npm run test:watch
```

---

## 3. Test Suites Overview

The test files are located in the `__tests__/` directory:

1. **`carbonCalculator.test.js`**:
   - Asserts monthly carbon estimations per category (Transport, Energy, Food, Shopping, Waste).
   - Validates correct bounds checks, division-by-zero mitigations, and boundary edge values.
   - Tests `calculateSustainabilitySubScores` to check that the score diagnostics accurately map emission values to a normalized scale.
   - Tests `predictFutureFootprint` to verify linear regression trend models and verify projections work correctly.

2. **`challenges.test.js`**:
   - Verifies the user gamification level milestones, progress computations, and points tracking.
   - Checks initial level ranges and transition thresholds.

3. **`storage.test.js`**:
   - Asserts browser local storage serialization and deserialization functions.
   - Validates default values fallbacks and graceful handling of parsing errors.

4. **`aiSuggestions.test.js`**:
   - Verifies the rule-based recommendation logic.
   - Validates that tips are successfully generated and sorted based on their carbon saving capacity.
