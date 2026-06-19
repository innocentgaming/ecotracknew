'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  calculateTransport,
  calculateEnergy,
  calculateFood,
  calculateShopping,
  calculateWaste,
  getTotalEmissions,
  getEcoScore,
  getScoreLabel,
} from '@/lib/carbonCalculator';
import { saveCalculatorData, saveResults } from '@/lib/storage';
import { getRuleBasedSuggestions, getGeminiSuggestions } from '@/lib/aiSuggestions';
import { loadSettings } from '@/lib/storage';
import styles from './page.module.css';

const STEPS = [
  { id: 'transport', title: 'Transport', emoji: '🚗', desc: 'How you get around' },
  { id: 'energy', title: 'Energy', emoji: '⚡', desc: 'Home electricity usage' },
  { id: 'food', title: 'Food', emoji: '🥗', desc: 'Your diet habits' },
  { id: 'shopping', title: 'Shopping', emoji: '🛍️', desc: 'Consumer purchases' },
  { id: 'waste', title: 'Waste', emoji: '♻️', desc: 'Waste generation' },
];

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [data, setData] = useState({
    transport: {
      primaryMode: 'bike',
      dailyDistance: 10,
      flightHoursPerYear: 2,
      commuteFrequency: 22,
    },
    energy: {
      monthlyBill: 500,
      acHoursPerDay: 2,
      acMonthsPerYear: 5,
      hasSolarPanels: false,
    },
    food: {
      dietType: 'non_vegetarian',
      mealsPerDay: 3,
      foodWasteKgPerWeek: 2,
    },
    shopping: {
      clothingItemsPerMonth: 2,
      onlineOrdersPerMonth: 4,
      newPhoneThisYear: false,
      newLaptopThisYear: false,
    },
    waste: {
      wasteKgPerWeek: 3,
      recyclingPercentage: 10,
      compostsFood: false,
    },
  });

  const [results, setResults] = useState(null);

  function updateField(step, field, value) {
    setData((prev) => ({
      ...prev,
      [step]: { ...prev[step], [field]: value },
    }));
  }

  async function handleCalculate() {
    setLoading(true);
    const transport = calculateTransport(data.transport);
    const energy = calculateEnergy(data.energy);
    const food = calculateFood(data.food);
    const shopping = calculateShopping(data.shopping);
    const waste = calculateWaste(data.waste);
    const total = getTotalEmissions(transport, energy, food, shopping, waste);

    const r = { transport, energy, food, shopping, waste, total };
    setResults(r);
    saveCalculatorData(data);
    saveResults(r);

    const settings = loadSettings();
    const aiSuggestions = await getGeminiSuggestions(data, total, settings.geminiApiKey);
    const ruleSuggestions = getRuleBasedSuggestions(data);
    setSuggestions(aiSuggestions || ruleSuggestions);

    setLoading(false);
    setShowResults(true);
  }

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {!showResults ? (
            <>
              {/* Header */}
              <div className={styles.header}>
                <span className="badge badge-green">🧮 Carbon Calculator</span>
                <h1 className="display-2" style={{ marginTop: '12px' }}>
                  Calculate Your <span className="text-gradient">Footprint</span>
                </h1>
                <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
                  Answer 5 simple categories to get your personalized carbon analysis
                </p>
              </div>

              {/* Step Progress */}
              <div className={styles.stepProgress}>
                {STEPS.map((step, i) => (
                  <button
                    key={step.id}
                    className={`${styles.stepBtn} ${i === currentStep ? styles.stepActive : ''} ${i < currentStep ? styles.stepDone : ''}`}
                    onClick={() => i <= currentStep && setCurrentStep(i)}
                  >
                    <span className={styles.stepEmoji}>{i < currentStep ? '✓' : step.emoji}</span>
                    <span className={styles.stepLabel}>{step.title}</span>
                  </button>
                ))}
              </div>

              {/* Step Content */}
              <div className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2.5rem' }}>{STEPS[currentStep].emoji}</span>
                    <div>
                      <h2 className="heading-1">{STEPS[currentStep].title}</h2>
                      <p className="body-sm text-secondary">{STEPS[currentStep].desc}</p>
                    </div>
                  </div>
                  <span className="badge badge-green">Step {currentStep + 1} of {STEPS.length}</span>
                </div>

                <div className="divider" />

                {currentStep === 0 && (
                  <TransportStep data={data.transport} update={(f, v) => updateField('transport', f, v)} />
                )}
                {currentStep === 1 && (
                  <EnergyStep data={data.energy} update={(f, v) => updateField('energy', f, v)} />
                )}
                {currentStep === 2 && (
                  <FoodStep data={data.food} update={(f, v) => updateField('food', f, v)} />
                )}
                {currentStep === 3 && (
                  <ShoppingStep data={data.shopping} update={(f, v) => updateField('shopping', f, v)} />
                )}
                {currentStep === 4 && (
                  <WasteStep data={data.waste} update={(f, v) => updateField('waste', f, v)} />
                )}

                <div className={styles.stepFooter}>
                  {currentStep > 0 && (
                    <button className="btn btn-secondary" onClick={() => setCurrentStep((s) => s - 1)}>
                      ← Back
                    </button>
                  )}
                  <div style={{ flex: 1 }} />
                  {!isLastStep ? (
                    <button className="btn btn-primary" onClick={() => setCurrentStep((s) => s + 1)}>
                      Next Step →
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleCalculate}
                      disabled={loading}
                    >
                      {loading ? '⏳ Calculating...' : '🌿 Calculate My Footprint'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Results results={results} suggestions={suggestions} onRecalculate={() => { setShowResults(false); setCurrentStep(0); }} />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────────────────────

function TransportStep({ data, update }) {
  const modes = [
    { value: 'car_petrol', label: '🚗 Petrol Car', emission: '192g/km' },
    { value: 'car_diesel', label: '🚙 Diesel Car', emission: '171g/km' },
    { value: 'bike', label: '🏍️ Petrol Bike', emission: '113g/km' },
    { value: 'ev', label: '⚡ Electric Vehicle', emission: '55g/km' },
    { value: 'bus', label: '🚌 Bus', emission: '89g/km' },
    { value: 'train', label: '🚆 Train', emission: '41g/km' },
    { value: 'auto', label: '🛺 Auto Rickshaw', emission: '135g/km' },
    { value: 'bicycle', label: '🚴 Bicycle', emission: '0g/km' },
    { value: 'walking', label: '🚶 Walking', emission: '0g/km' },
  ];

  return (
    <div className={styles.stepContent}>
      <div className="form-group">
        <label className="form-label">Primary Mode of Transport</label>
        <div className={styles.modeGrid}>
          {modes.map((m) => (
            <button
              key={m.value}
              className={`${styles.modeBtn} ${data.primaryMode === m.value ? styles.modeBtnActive : ''}`}
              onClick={() => update('primaryMode', m.value)}
            >
              <span>{m.label}</span>
              <span className={styles.modeEmission}>{m.emission}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sliderGroup}>
        <div className="form-group">
          <label className="form-label">
            Daily commute distance: <strong className="text-accent">{data.dailyDistance} km</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="1" max="100" value={data.dailyDistance}
            onChange={(e) => update('dailyDistance', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>1 km</span><span>100 km</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Flight hours per year: <strong className="text-accent">{data.flightHoursPerYear} hrs</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="50" value={data.flightHoursPerYear}
            onChange={(e) => update('flightHoursPerYear', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0 hrs</span><span>50 hrs</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Days commuting per month: <strong className="text-accent">{data.commuteFrequency} days</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="30" value={data.commuteFrequency}
            onChange={(e) => update('commuteFrequency', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0</span><span>30 days</span></div>
        </div>
      </div>
    </div>
  );
}

function EnergyStep({ data, update }) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.sliderGroup}>
        <div className="form-group">
          <label className="form-label">
            Monthly electricity bill: <strong className="text-accent">₹{data.monthlyBill}</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="100" max="5000" step="50" value={data.monthlyBill}
            onChange={(e) => update('monthlyBill', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>₹100</span><span>₹5,000</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            AC usage per day: <strong className="text-accent">{data.acHoursPerDay} hours</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="16" value={data.acHoursPerDay}
            onChange={(e) => update('acHoursPerDay', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0 hrs</span><span>16 hrs</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            AC months per year: <strong className="text-accent">{data.acMonthsPerYear} months</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="12" value={data.acMonthsPerYear}
            onChange={(e) => update('acMonthsPerYear', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0</span><span>12 months</span></div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Solar Panels</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[{ label: '☀️ Yes, I have solar panels', value: true }, { label: '❌ No solar panels', value: false }].map((opt) => (
            <button
              key={String(opt.value)}
              className={`${styles.toggleBtn} ${data.hasSolarPanels === opt.value ? styles.toggleBtnActive : ''}`}
              onClick={() => update('hasSolarPanels', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FoodStep({ data, update }) {
  const diets = [
    { value: 'vegan', label: '🌱 Vegan', desc: 'Plant-only diet' },
    { value: 'vegetarian', label: '🥦 Vegetarian', desc: 'No meat/fish' },
    { value: 'eggetarian', label: '🥚 Eggetarian', desc: 'Vegetarian + eggs' },
    { value: 'non_vegetarian', label: '🍗 Non-Vegetarian', desc: 'Includes meat' },
  ];

  return (
    <div className={styles.stepContent}>
      <div className="form-group">
        <label className="form-label">Diet Type</label>
        <div className={styles.dietGrid}>
          {diets.map((d) => (
            <button
              key={d.value}
              className={`${styles.dietBtn} ${data.dietType === d.value ? styles.dietBtnActive : ''}`}
              onClick={() => update('dietType', d.value)}
            >
              <span style={{ fontSize: '1.5rem' }}>{d.label.split(' ')[0]}</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.label.split(' ').slice(1).join(' ')}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sliderGroup}>
        <div className="form-group">
          <label className="form-label">
            Meals per day: <strong className="text-accent">{data.mealsPerDay}</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="1" max="5" value={data.mealsPerDay}
            onChange={(e) => update('mealsPerDay', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>1 meal</span><span>5 meals</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Food waste per week: <strong className="text-accent">{data.foodWasteKgPerWeek} kg</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="10" step="0.5" value={data.foodWasteKgPerWeek}
            onChange={(e) => update('foodWasteKgPerWeek', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0 kg</span><span>10 kg</span></div>
        </div>
      </div>
    </div>
  );
}

function ShoppingStep({ data, update }) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.sliderGroup}>
        <div className="form-group">
          <label className="form-label">
            Clothing items purchased per month: <strong className="text-accent">{data.clothingItemsPerMonth}</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="20" value={data.clothingItemsPerMonth}
            onChange={(e) => update('clothingItemsPerMonth', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0</span><span>20 items</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Online deliveries per month: <strong className="text-accent">{data.onlineOrdersPerMonth}</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="30" value={data.onlineOrdersPerMonth}
            onChange={(e) => update('onlineOrdersPerMonth', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0</span><span>30 orders</span></div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Electronics purchased this year</label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className={`${styles.toggleBtn} ${data.newPhoneThisYear ? styles.toggleBtnActive : ''}`}
            onClick={() => update('newPhoneThisYear', !data.newPhoneThisYear)}
          >
            📱 New Smartphone
          </button>
          <button
            className={`${styles.toggleBtn} ${data.newLaptopThisYear ? styles.toggleBtnActive : ''}`}
            onClick={() => update('newLaptopThisYear', !data.newLaptopThisYear)}
          >
            💻 New Laptop
          </button>
        </div>
      </div>
    </div>
  );
}

function WasteStep({ data, update }) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.sliderGroup}>
        <div className="form-group">
          <label className="form-label">
            Waste generated per week: <strong className="text-accent">{data.wasteKgPerWeek} kg</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0.5" max="15" step="0.5" value={data.wasteKgPerWeek}
            onChange={(e) => update('wasteKgPerWeek', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0.5 kg</span><span>15 kg</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Recycling rate: <strong className="text-accent">{data.recyclingPercentage}%</strong>
          </label>
          <input
            type="range"
            className="range-input"
            min="0" max="100" value={data.recyclingPercentage}
            onChange={(e) => update('recyclingPercentage', +e.target.value)}
          />
          <div className={styles.sliderHints}><span>0%</span><span>100%</span></div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Do you compost food waste?</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={`${styles.toggleBtn} ${data.compostsFood ? styles.toggleBtnActive : ''}`}
            onClick={() => update('compostsFood', true)}
          >
            🌱 Yes, I compost
          </button>
          <button
            className={`${styles.toggleBtn} ${!data.compostsFood ? styles.toggleBtnActive : ''}`}
            onClick={() => update('compostsFood', false)}
          >
            ❌ No composting
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Results Component ───────────────────────────────────────────────────────

function Results({ results, suggestions, onRecalculate }) {
  const score = getEcoScore(results.total);
  const scoreInfo = getScoreLabel(score);

  const categories = [
    { key: 'transport', label: 'Transport', emoji: '🚗', color: '#3b82f6' },
    { key: 'energy', label: 'Energy', emoji: '⚡', color: '#eab308' },
    { key: 'food', label: 'Food', emoji: '🥗', color: '#22c55e' },
    { key: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#a855f7' },
    { key: 'waste', label: 'Waste', emoji: '♻️', color: '#06b6d4' },
  ];

  return (
    <div className={styles.results}>
      <div className={styles.resultsHeader}>
        <h2 className="display-2">Your Results <span className="text-gradient">🌍</span></h2>
        <p className="text-secondary">Based on your lifestyle data</p>
      </div>

      {/* Score Summary */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreMain}>
          <div className={styles.scoreNumber} style={{ color: scoreInfo.color }}>
            {score}
          </div>
          <div className={styles.scoreDetails}>
            <div style={{ fontSize: '2rem' }}>{scoreInfo.emoji}</div>
            <div className="heading-1">{scoreInfo.label}</div>
            <div className="text-secondary">{results.total.toFixed(0)} kg CO₂/month</div>
            <div className="text-muted">{(results.total * 12 / 1000).toFixed(2)} tonnes/year</div>
          </div>
        </div>

        <div className={styles.categoryBars}>
          {categories.map((cat) => {
            const pct = (results[cat.key] / results.total) * 100;
            return (
              <div key={cat.key} className={styles.resultBar}>
                <div className={styles.resultBarHeader}>
                  <span>{cat.emoji} {cat.label}</span>
                  <span style={{ color: cat.color }}>{results[cat.key].toFixed(0)} kg</span>
                </div>
                <div className="progress-bar-container" style={{ height: '10px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: cat.color, boxShadow: `0 0 8px ${cat.color}66` }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {pct.toFixed(1)}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className={styles.suggestionsSection}>
          <h3 className="heading-1" style={{ marginBottom: '20px' }}>
            🤖 AI-Powered Suggestions
          </h3>
          <div className={styles.suggestionsList}>
            {suggestions.map((s, i) => (
              <div key={i} className={styles.suggestionCard} style={{ '--delay': `${i * 0.1}s` }}>
                <div className={styles.suggestionHeader}>
                  <span className={`badge ${s.difficulty === 'Easy' ? 'badge-green' : s.difficulty === 'Medium' ? 'badge-amber' : 'badge-red'}`}>
                    {s.difficulty}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--green-primary)', fontWeight: 600 }}>
                    Save ~{s.savingKg} kg CO₂/yr
                  </span>
                </div>
                <p className="body" style={{ marginTop: '8px' }}>{s.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.resultsActions}>
        <button className="btn btn-secondary" onClick={onRecalculate}>
          🔄 Recalculate
        </button>
        <a href="/challenges" className="btn btn-primary">
          🏆 Start Green Challenges →
        </a>
      </div>
    </div>
  );
}
