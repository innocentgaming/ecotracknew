'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CarbonRing from '@/components/CarbonRing';
import { loadResults, loadUserProfile, loadHistory, generateMockHistory, loadBudget, saveBudget, loadGoals, saveGoals } from '@/lib/storage';
import { getEcoScore, getScoreLabel, getComparisonText, INDIA_AVERAGE_ANNUAL, GLOBAL_AVERAGE_ANNUAL } from '@/lib/carbonCalculator';
import { getCurrentLevel, getNextLevel, getLevelProgress, CHALLENGES } from '@/lib/challenges';
import styles from './page.module.css';

const DEFAULT_EMISSIONS = {
  transport: 150,
  energy: 220,
  food: 310,
  shopping: 85,
  waste: 35,
  total: 800,
};

// Particle component for premium background
function Particles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticles(Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="particles" aria-hidden>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// AQI Widget
function AqiWidget() {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use Open-Meteo free API (no key needed) for Delhi default
    const lat = 28.6139;
    const lon = 77.2090;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms`)
      .then(r => r.json())
      .then(data => {
        const temp = data.current?.temperature_2m;
        const humidity = data.current?.relative_humidity_2m;
        const wind = data.current?.wind_speed_10m;
        const code = data.current?.weather_code;
        setTimeout(() => {
          setWeather({ temp, humidity, wind, code });
          setAqi(Math.floor(80 + Math.random() * 80));
          setLoading(false);
        }, 0);
      })
      .catch(() => {
        // fallback
        setTimeout(() => {
          setWeather({ temp: 34, humidity: 62, wind: 3.2, code: 1 });
          setAqi(Math.floor(80 + Math.random() * 80));
          setLoading(false);
        }, 0);
      });
  }, []);

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    return '⛈️';
  };

  const getAqiLevel = (aqiVal) => {
    if (aqiVal <= 50) return { label: 'Good', color: '#00ff88', bg: 'rgba(0,255,136,0.1)' };
    if (aqiVal <= 100) return { label: 'Moderate', color: '#ffb700', bg: 'rgba(255,183,0,0.1)' };
    if (aqiVal <= 150) return { label: 'Unhealthy', color: '#ff7700', bg: 'rgba(255,119,0,0.1)' };
    return { label: 'Hazardous', color: '#ff4466', bg: 'rgba(255,68,102,0.1)' };
  };
  const aqiInfo = getAqiLevel(aqi);

  if (loading) {
    return (
      <div className={styles.aqiWidget}>
        <div className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius)' }} />
      </div>
    );
  }

  return (
    <div className={styles.aqiWidget}>
      <div className={styles.aqiMain}>
        <span className={styles.weatherEmoji}>{getWeatherEmoji(weather.code)}</span>
        <div>
          <div className={styles.aqiTemp}>{weather.temp?.toFixed(0)}°C</div>
          <div className="caption text-muted">New Delhi</div>
        </div>
        <div className={styles.aqiDivider} />
        <div>
          <div
            className="aqi-badge"
            style={{ color: aqiInfo.color, background: aqiInfo.bg, borderColor: aqiInfo.color }}
          >
            AQI {aqi} · {aqiInfo.label}
          </div>
          <div className="caption text-muted" style={{ marginTop: '4px' }}>
            💧 {weather.humidity}% · 💨 {weather.wind?.toFixed(1)} m/s
          </div>
        </div>
      </div>
      {aqi > 100 && (
        <div className={styles.aqiTip}>
          ⚠️ Poor air quality today. Consider indoor activities to reduce exposure.
        </div>
      )}
    </div>
  );
}

// Carbon Budget Tracker
function BudgetTracker({ totalEmissions }) {
  const [budget, setBudget] = useState({ monthlyTarget: 700 });
  const [editing, setEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setBudget(loadBudget());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const used = totalEmissions;
  const target = budget.monthlyTarget;
  const pct = Math.min((used / target) * 100, 100);
  const remaining = target - used;
  const isOver = used > target;

  const getColor = () => {
    if (pct < 70) return 'var(--green-primary)';
    if (pct < 90) return 'var(--amber)';
    return 'var(--red)';
  };

  const handleSave = () => {
    const t = parseInt(tempTarget) || budget.monthlyTarget;
    const updated = { monthlyTarget: Math.max(100, t) };
    saveBudget(updated);
    setBudget(updated);
    setEditing(false);
  };

  const color = getColor();

  return (
    <div className={`card card-shimmer ${styles.budgetCard}`}>
      <div className={styles.budgetHeader}>
        <div>
          <h2 className="heading-2">🌡️ Carbon Budget</h2>
          <p className="caption text-muted">Monthly CO₂ limit tracker</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { setEditing(!editing); setTempTarget(String(budget.monthlyTarget)); }}
        >
          {editing ? '✕' : '✏️ Set Goal'}
        </button>
      </div>

      {editing && (
        <div className={styles.budgetEdit}>
          <input
            type="number"
            className="form-input"
            value={tempTarget}
            onChange={e => setTempTarget(e.target.value)}
            placeholder="Enter monthly CO₂ budget (kg)"
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </div>
      )}

      <div className={styles.budgetMeter}>
        <div className={styles.budgetNumbers}>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color }}>
            {used.toFixed(0)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>kg used</span>
          </span>
          <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)' }}>
            of {target} kg
          </span>
        </div>

        {/* Thermometer bar */}
        <div className={styles.budgetBarWrap}>
          <div
            className={styles.budgetBarFill}
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--green-secondary), ${color})`, boxShadow: `0 0 12px ${color}66` }}
          />
          {/* Target marker */}
          <div className={styles.targetLine} style={{ left: '100%' }} />
        </div>

        <div className={styles.budgetStatus}>
          {isOver ? (
            <span style={{ color: 'var(--red)', fontWeight: 600, fontSize: '0.85rem' }}>
              🔴 Over budget by {Math.abs(remaining).toFixed(0)} kg — reduce your footprint!
            </span>
          ) : (
            <span style={{ color, fontWeight: 600, fontSize: '0.85rem' }}>
              {pct < 70 ? '✅' : '⚠️'} {remaining.toFixed(0)} kg remaining this month
            </span>
          )}
          <span className="caption text-muted">{pct.toFixed(0)}% used</span>
        </div>
      </div>
    </div>
  );
}

// Goals Panel
function GoalsPanel() {
  const [goals, setGoals] = useState([]);
  const [completedGoal, setCompletedGoal] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGoals(loadGoals());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (id) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const completed = !g.completed;
        if (completed) setCompletedGoal(g);
        return { ...g, completed };
      }
      return g;
    });
    setGoals(updated);
    saveGoals(updated);
    if (completedGoal) setTimeout(() => setCompletedGoal(null), 2500);
  };

  const CATEGORY_COLORS = {
    transport: '#3b82f6',
    food: '#22c55e',
    energy: '#eab308',
    shopping: '#a855f7',
    waste: '#06b6d4',
  };

  const active = goals.filter(g => !g.completed);
  const done = goals.filter(g => g.completed);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="heading-2">🎯 Eco Goals</h2>
          <p className="caption text-muted">{done.length}/{goals.length} completed</p>
        </div>
        <span className="badge badge-green">{done.length * 100 + active.reduce((s, g) => s + Math.round((g.progress / g.target) * g.reward), 0)} pts earned</span>
      </div>

      {completedGoal && (
        <div className={styles.goalCompleteToast}>
          🎉 Goal completed: {completedGoal.emoji} {completedGoal.title} · +{completedGoal.reward} pts!
        </div>
      )}

      <div className={styles.goalsList}>
        {active.map(goal => {
          const pct = (goal.progress / goal.target) * 100;
          const color = CATEGORY_COLORS[goal.category] || 'var(--green-primary)';
          return (
            <div key={goal.id} className={styles.goalCard}>
              <div className={styles.goalLeft}>
                <span style={{ fontSize: '1.5rem' }}>{goal.emoji}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{goal.title}</span>
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>+{goal.reward}pts</span>
                </div>
                <div className="caption text-muted" style={{ marginBottom: '8px' }}>{goal.description}</div>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66` }}
                  />
                </div>
                <div className="caption text-muted" style={{ marginTop: '4px' }}>
                  {goal.progress}/{goal.target} {goal.progress === goal.target ? '✅' : ''}
                </div>
              </div>
              <button
                className={styles.goalCheck}
                onClick={() => handleToggle(goal.id)}
                title="Mark as complete"
              >
                ○
              </button>
            </div>
          );
        })}

        {done.length > 0 && (
          <>
            <div className="divider" style={{ margin: '12px 0' }} />
            <div className="caption text-muted" style={{ marginBottom: '8px' }}>✅ Completed</div>
            {done.map(goal => (
              <div key={goal.id} className={`${styles.goalCard} ${styles.goalDone}`}>
                <span style={{ fontSize: '1.3rem' }}>{goal.emoji}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {goal.title}
                  </span>
                  <div className="caption" style={{ color: 'var(--green-primary)' }}>+{goal.reward} pts earned 🎉</div>
                </div>
                <button className={styles.goalCheck} style={{ color: 'var(--green-primary)' }} onClick={() => handleToggle(goal.id)}>✓</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [results, setResults] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const r = loadResults() || DEFAULT_EMISSIONS;
      setResults(r);
      setProfile(loadUserProfile());
      const h = loadHistory();
      setHistory(h.length > 0 ? h : generateMockHistory());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const total = results?.total || results?.transport + results?.energy + results?.food + results?.shopping + results?.waste || 800;
  const score = getEcoScore(total);
  const scoreInfo = getScoreLabel(score);
  const comparison = getComparisonText(total);
  const level = profile ? getCurrentLevel(profile.points) : null;
  const nextLevel = profile ? getNextLevel(profile.points) : null;
  const levelProgress = profile ? getLevelProgress(profile.points) : 0;

  const categories = [
    { key: 'transport', label: 'Transport', emoji: '🚗', value: results?.transport || 150, color: '#3b82f6' },
    { key: 'energy', label: 'Energy', emoji: '⚡', value: results?.energy || 220, color: '#eab308' },
    { key: 'food', label: 'Food', emoji: '🥗', value: results?.food || 310, color: '#22c55e' },
    { key: 'shopping', label: 'Shopping', emoji: '🛍️', value: results?.shopping || 85, color: '#a855f7' },
    { key: 'waste', label: 'Waste', emoji: '♻️', value: results?.waste || 35, color: '#06b6d4' },
  ];

  const maxCategory = Math.max(...categories.map((c) => c.value));

  return (
    <div className={styles.page}>
      <Navbar />
      <Particles />
      <div className="bg-animated">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
      <div className="bg-grid" />

      <main className={styles.main}>
        <div className="container">
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              <div className={`badge badge-green animate-fade-in`} style={{ marginBottom: '16px' }}>
                🌿 Your Carbon Footprint Dashboard
              </div>
              <h1 className={`display-1 animate-fade-in delay-100`}>
                Hello, <span className="text-gradient">{profile?.name || 'Eco Warrior'}</span> 👋
              </h1>
              <p className={`body-lg text-secondary animate-fade-in delay-200`} style={{ marginTop: '12px', maxWidth: '480px' }}>
                Track your environmental impact and take steps toward a greener future.
                Every action counts!
              </p>

              {/* AQI Widget */}
              <div className={`animate-fade-in delay-300`} style={{ marginTop: '20px' }}>
                <AqiWidget />
              </div>

              <div className={`${styles.heroActions} animate-fade-in delay-400`}>
                <Link href="/calculator" className="btn btn-primary btn-lg">
                  🧮 Calculate My Footprint
                </Link>
                <Link href="/journal" className="btn btn-secondary btn-lg">
                  📅 Log Action
                </Link>
              </div>
            </div>

            <div className={`${styles.heroRight} animate-fade-in delay-200`}>
              <CarbonRing score={score} total={total} scoreInfo={scoreInfo} />
            </div>
          </section>

          {/* Stats Row */}
          <section className={`${styles.statsRow} animate-fade-in delay-300`}>
            <div className="stat-card">
              <div className="stat-label">Monthly CO₂</div>
              <div className="stat-value">{total.toFixed(0)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>kg</span></div>
              <div className={`stat-change ${comparison.betterThanIndia ? 'down' : 'up'}`}>
                {comparison.betterThanIndia ? '▼' : '▲'} {Math.abs(comparison.vsIndia)}% vs India avg
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Yearly Estimate</div>
              <div className="stat-value">{(total * 12 / 1000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>t</span></div>
              <div className={`stat-change ${comparison.betterThanGlobal ? 'down' : 'up'}`}>
                {comparison.betterThanGlobal ? '▼' : '▲'} {Math.abs(comparison.vsGlobal)}% vs global avg
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Eco Score</div>
              <div className="stat-value" style={{ color: scoreInfo.color }}>{score}</div>
              <div className="stat-change" style={{ color: scoreInfo.color }}>
                {scoreInfo.emoji} {scoreInfo.label}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Points Earned</div>
              <div className="stat-value" style={{ color: 'var(--amber)' }}>{profile?.points || 0}</div>
              <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>
                {level?.emoji} {level?.name || 'Seedling'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Trees to Offset</div>
              <div className="stat-value" style={{ color: 'var(--lime)' }}>{Math.ceil(total * 12 / 22)}</div>
              <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
                🌲 plant this many trees/yr
              </div>
            </div>
          </section>

          {/* Carbon Budget */}
          <div className={`animate-fade-in delay-400`} style={{ marginBottom: '24px' }}>
            <BudgetTracker totalEmissions={total} />
          </div>

          {/* Main Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Column */}
            <div className={styles.leftCol}>
              {/* Category Breakdown */}
              <div className="card">
                <div style={{ marginBottom: '20px' }}>
                  <h2 className="heading-2">Category Breakdown</h2>
                  <p className="body-sm text-secondary">Monthly emissions by source</p>
                </div>
                <div className={styles.categoryList}>
                  {categories.map((cat) => (
                    <div key={cat.key} className={styles.categoryItem}>
                      <div className={styles.categoryHeader}>
                        <span>{cat.emoji} {cat.label}</span>
                        <span style={{ color: cat.color, fontWeight: 600 }}>{cat.value.toFixed(0)} kg</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${(cat.value / maxCategory) * 100}%`,
                            background: cat.color,
                            boxShadow: `0 0 10px ${cat.color}66`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Card */}
              <div className="card" style={{ marginTop: '24px' }}>
                <h2 className="heading-2" style={{ marginBottom: '20px' }}>Global Comparison</h2>
                <div className={styles.comparisonList}>
                  <ComparisonBar
                    label="Your Footprint"
                    value={comparison.annualKg}
                    max={8000}
                    color="var(--green-primary)"
                    isYou
                  />
                  <ComparisonBar
                    label="India Average"
                    value={INDIA_AVERAGE_ANNUAL}
                    max={8000}
                    color="var(--amber)"
                  />
                  <ComparisonBar
                    label="Global Average"
                    value={GLOBAL_AVERAGE_ANNUAL}
                    max={8000}
                    color="var(--red)"
                  />
                </div>
              </div>

              {/* Goals Panel */}
              <div style={{ marginTop: '24px' }}>
                <GoalsPanel />
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightCol}>
              {/* Level Progress */}
              {level && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className="heading-2">Your Level</h2>
                    <span style={{ fontSize: '2rem' }}>{level.emoji}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="body-sm text-accent">{level.name}</span>
                    {nextLevel && <span className="body-sm text-muted">→ {nextLevel.name}</span>}
                  </div>
                  <div className="progress-bar-container" style={{ height: '12px' }}>
                    <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }} />
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="caption text-muted">{profile?.points} pts</span>
                    {nextLevel && <span className="caption text-muted">{nextLevel.minPoints} pts</span>}
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(profile?.badges || []).map((badge, i) => (
                      <span key={i} className="badge badge-green">{badge}</span>
                    ))}
                    {(!profile?.badges || profile.badges.length === 0) && (
                      <span className="body-sm text-muted">Complete challenges to earn badges!</span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="card" style={{ marginTop: '24px' }}>
                <h2 className="heading-2" style={{ marginBottom: '16px' }}>Quick Actions</h2>
                <div className={styles.quickActions}>
                  <Link href="/calculator" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🧮</span>
                    <div>
                      <div className={styles.qaTitle}>Update Calculator</div>
                      <div className={styles.qaDesc}>Recalculate your footprint</div>
                    </div>
                  </Link>
                  <Link href="/journal" className={styles.quickAction}>
                    <span className={styles.qaIcon}>📅</span>
                    <div>
                      <div className={styles.qaTitle}>Log Eco Action</div>
                      <div className={styles.qaDesc}>Track daily green habits</div>
                    </div>
                  </Link>
                  <Link href="/leaderboard" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🎖️</span>
                    <div>
                      <div className={styles.qaTitle}>Leaderboard</div>
                      <div className={styles.qaDesc}>See your community rank</div>
                    </div>
                  </Link>
                  <Link href="/challenges" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🏆</span>
                    <div>
                      <div className={styles.qaTitle}>Active Challenges</div>
                      <div className={styles.qaDesc}>Track your progress</div>
                    </div>
                  </Link>
                  <Link href="/chat" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🤖</span>
                    <div>
                      <div className={styles.qaTitle}>Ask EcoBot</div>
                      <div className={styles.qaDesc}>Get personalized tips</div>
                    </div>
                  </Link>
                  <Link href="/map" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🗺️</span>
                    <div>
                      <div className={styles.qaTitle}>Green Map</div>
                      <div className={styles.qaDesc}>Find eco-friendly places</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Active Challenges Preview */}
              <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 className="heading-2">Active Challenges</h2>
                  <Link href="/challenges" className="btn btn-secondary btn-sm">View All</Link>
                </div>
                {CHALLENGES.slice(0, 3).map((c) => (
                  <div key={c.id} className={styles.challengePreview}>
                    <span style={{ fontSize: '1.5rem' }}>{c.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Save {c.co2Saving} kg CO₂ · {c.points} pts
                      </div>
                    </div>
                    <Link href="/challenges" className="btn btn-outline btn-sm">Start</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href="/journal" className="fab" title="Log eco action" id="fab-log-action">
        +
      </Link>
    </div>
  );
}

function ComparisonBar({ label, value, max, color, isYou }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span className="body-sm" style={{ color: isYou ? color : 'var(--text-secondary)', fontWeight: isYou ? 700 : 400 }}>
          {isYou ? '👤 ' : ''}{label}
        </span>
        <span className="body-sm" style={{ color, fontWeight: 600 }}>
          {(value / 1000).toFixed(1)} t/yr
        </span>
      </div>
      <div className="progress-bar-container" style={{ height: '10px' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '9999px',
            background: color,
            boxShadow: `0 0 10px ${color}66`,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}
