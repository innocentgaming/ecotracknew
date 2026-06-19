'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { loadJournal, addJournalEntry, deleteJournalEntry, loadUserProfile, saveUserProfile } from '@/lib/storage';
import styles from './page.module.css';

const ECO_ACTIONS = {
  transport: [
    { label: 'Cycled to work', co2Saved: 2.4, points: 15 },
    { label: 'Took public transport', co2Saved: 1.8, points: 12 },
    { label: 'Walked instead of driving', co2Saved: 1.2, points: 10 },
    { label: 'Carpooled with 3 people', co2Saved: 3.0, points: 18 },
    { label: 'Worked from home', co2Saved: 2.0, points: 14 },
    { label: 'Avoided a flight', co2Saved: 120, points: 80 },
  ],
  food: [
    { label: 'Ate a plant-based meal', co2Saved: 1.8, points: 10 },
    { label: 'Zero food waste day', co2Saved: 0.9, points: 8 },
    { label: 'Bought local produce', co2Saved: 0.6, points: 6 },
    { label: 'Composted food waste', co2Saved: 0.4, points: 5 },
    { label: 'Avoided beef for a day', co2Saved: 3.6, points: 20 },
    { label: 'Grew own vegetables', co2Saved: 0.8, points: 12 },
  ],
  energy: [
    { label: 'Turned off AC for 4 hours', co2Saved: 0.9, points: 8 },
    { label: 'Used natural light all day', co2Saved: 0.3, points: 4 },
    { label: 'Ran on renewable energy', co2Saved: 2.4, points: 16 },
    { label: 'Line-dried laundry', co2Saved: 0.6, points: 6 },
    { label: 'Cold shower instead of hot', co2Saved: 0.2, points: 3 },
    { label: 'Switched off unused appliances', co2Saved: 0.5, points: 5 },
  ],
  shopping: [
    { label: 'Bought second-hand item', co2Saved: 4.0, points: 22 },
    { label: 'Refused single-use plastic', co2Saved: 0.3, points: 5 },
    { label: 'Repaired instead of replacing', co2Saved: 6.0, points: 30 },
    { label: 'Used reusable bags', co2Saved: 0.1, points: 3 },
    { label: 'Borrowed instead of buying', co2Saved: 5.0, points: 25 },
  ],
  waste: [
    { label: 'Recycled paper & plastic', co2Saved: 0.6, points: 6 },
    { label: 'Zero-waste grocery run', co2Saved: 0.4, points: 8 },
    { label: 'Upcycled an old item', co2Saved: 2.0, points: 18 },
    { label: 'Reduced household waste by 50%', co2Saved: 1.2, points: 14 },
  ],
};

const CATEGORY_META = {
  transport: { emoji: '🚗', label: 'Transport', color: '#3b82f6' },
  food: { emoji: '🥗', label: 'Food', color: '#22c55e' },
  energy: { emoji: '⚡', label: 'Energy', color: '#eab308' },
  shopping: { emoji: '🛍️', label: 'Shopping', color: '#a855f7' },
  waste: { emoji: '♻️', label: 'Waste', color: '#06b6d4' },
};

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('transport');
  const [selectedAction, setSelectedAction] = useState(null);
  const [customAction, setCustomAction] = useState('');
  const [customCo2, setCustomCo2] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const j = loadJournal();
      setEntries(j);
      setTotalSaved(j.reduce((acc, e) => acc + (e.co2Saved || 0), 0));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.category === filter);

  const handleAdd = () => {
    let action;
    if (selectedAction) {
      action = selectedAction;
    } else {
      const label = (customAction || '').trim();
      if (!label) {
        alert('⚠️ Please select an action or enter a custom action description.');
        return;
      }
      if (label.length > 100) {
        alert('⚠️ Custom action description is too long (max 100 characters).');
        return;
      }
      const rawCo2 = parseFloat(customCo2);
      if (isNaN(rawCo2) || rawCo2 < 0) {
        alert('⚠️ Please enter a valid non-negative number for CO₂ saved.');
        return;
      }
      if (rawCo2 > 10000) {
        alert('⚠️ CO₂ saved value must be less than 10,000 kg.');
        return;
      }
      action = {
        label,
        co2Saved: rawCo2,
        points: Math.ceil(rawCo2 * 5),
      };
    }

    const newEntry = {
      category: selectedCategory,
      action: action.label,
      co2Saved: action.co2Saved,
      points: action.points,
    };

    const updated = addJournalEntry(newEntry);
    setEntries(updated);
    setTotalSaved(updated.reduce((acc, e) => acc + (e.co2Saved || 0), 0));

    // Award points
    try {
      const p = loadUserProfile();
      saveUserProfile({ ...p, points: (p.points || 0) + action.points });
    } catch {}

    setAddedAnimation(Date.now());
    setTimeout(() => setAddedAnimation(null), 1500);
    setShowForm(false);
    setSelectedAction(null);
    setCustomAction('');
    setCustomCo2('');
  };

  const handleDelete = (id) => {
    const updated = deleteJournalEntry(id);
    setEntries(updated);
    setTotalSaved(updated.reduce((acc, e) => acc + (e.co2Saved || 0), 0));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className="bg-animated">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
      </div>
      <div className="bg-grid" />

      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <div className={`${styles.header} animate-fade-in`}>
            <span className="badge badge-green">📅 Activity Journal</span>
            <h1 className="display-2" style={{ marginTop: '12px' }}>
              Carbon <span className="text-gradient">Journal</span>
            </h1>
            <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
              Log your daily eco-actions and watch your impact grow
            </p>
          </div>

          {/* Stats Row */}
          <div className={`${styles.statsRow} animate-fade-in delay-100`}>
            <div className={`stat-card ${styles.statCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌍</div>
              <div className="stat-value">{totalSaved.toFixed(1)}</div>
              <div className="stat-label">kg CO₂ Saved</div>
            </div>
            <div className={`stat-card ${styles.statCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📝</div>
              <div className="stat-value">{entries.length}</div>
              <div className="stat-label">Actions Logged</div>
            </div>
            <div className={`stat-card ${styles.statCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌲</div>
              <div className="stat-value">{Math.round(totalSaved / 22 * 10) / 10}</div>
              <div className="stat-label">Trees Equivalent</div>
            </div>
            <div className={`stat-card ${styles.statCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⭐</div>
              <div className="stat-value">{entries.reduce((a, e) => a + (e.points || 0), 0)}</div>
              <div className="stat-label">Points Earned</div>
            </div>
          </div>

          <div className={styles.layout}>
            {/* Left: Form + Filters + Entries */}
            <div className={styles.mainCol}>
              {/* Category Filter */}
              <div className={`${styles.filterRow} animate-fade-in delay-200`}>
                <button
                  className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
                  onClick={() => setFilter('all')}
                >
                  🌿 All
                </button>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <button
                    key={key}
                    className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ''}`}
                    style={filter === key ? { borderColor: meta.color, color: meta.color, background: meta.color + '15' } : {}}
                    onClick={() => setFilter(key)}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                ))}
              </div>

              {/* Add Action Button */}
              <button
                className={`btn btn-primary ${styles.addBtn}`}
                onClick={() => setShowForm(!showForm)}
                id="add-action-btn"
              >
                {showForm ? '✕ Cancel' : '+ Log Eco Action'}
              </button>

              {/* Add Action Form */}
              {showForm && (
                <div className={`${styles.addForm} animate-scale-in`}>
                  <h3 className="heading-2" style={{ marginBottom: '16px' }}>🌱 Log New Action</h3>

                  {/* Category Select */}
                  <div className={styles.categoryPicker}>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <button
                        key={key}
                        className={`${styles.catBtn} ${selectedCategory === key ? styles.catBtnActive : ''}`}
                        style={selectedCategory === key ? { borderColor: meta.color, background: meta.color + '15' } : {}}
                        onClick={() => { setSelectedCategory(key); setSelectedAction(null); }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{meta.emoji}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{meta.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Action Picker */}
                  <div className={styles.actionPicker}>
                    {ECO_ACTIONS[selectedCategory].map((action, i) => (
                      <button
                        key={i}
                        className={`${styles.actionOption} ${selectedAction === action ? styles.actionSelected : ''}`}
                        onClick={() => setSelectedAction(action)}
                      >
                        <span style={{ flex: 1, textAlign: 'left', fontSize: '0.875rem' }}>{action.label}</span>
                        <span style={{ color: 'var(--green-primary)', fontSize: '0.75rem', fontWeight: 700 }}>-{action.co2Saved}kg</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>+{action.points}pts</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Action */}
                  <div style={{ marginTop: '12px' }}>
                    <label className="caption text-muted" style={{ marginBottom: '8px', display: 'block' }} htmlFor="custom-action-desc">Or enter a custom action:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="custom-action-desc"
                        type="text"
                        className="form-input"
                        placeholder="What did you do?"
                        value={customAction}
                        onChange={e => { setCustomAction(e.target.value); setSelectedAction(null); }}
                        aria-label="Custom action description"
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="CO₂ (kg)"
                        value={customCo2}
                        onChange={e => setCustomCo2(e.target.value)}
                        style={{ width: '120px', flexShrink: 0 }}
                        aria-label="Custom action CO2 saved in kilograms"
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: '16px' }}
                    onClick={handleAdd}
                    disabled={!selectedAction && !customAction}
                    id="submit-action-btn"
                  >
                    ✅ Log Action & Earn Points
                  </button>
                </div>
              )}

              {/* Success animation */}
              {addedAnimation && (
                <div className={styles.successToast}>
                  🎉 Action logged! Points earned!
                </div>
              )}

              {/* Entries */}
              <div className={styles.entries}>
                {filteredEntries.length === 0 && (
                  <div className="empty-state">
                    <span className="emoji">🌱</span>
                    <p>No actions logged yet. Start your eco journey!</p>
                  </div>
                )}
                {filteredEntries.map((entry, i) => {
                  const meta = CATEGORY_META[entry.category] || CATEGORY_META.transport;
                  return (
                    <div
                      key={entry.id}
                      className={`${styles.entryCard} animate-fade-in`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className={styles.entryIcon} style={{ background: meta.color + '22', color: meta.color }}>
                        {meta.emoji}
                      </div>
                      <div className={styles.entryContent}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.action}</div>
                        <div className="caption text-muted" style={{ marginTop: '2px' }}>
                          {formatDate(entry.date)} • {meta.label}
                        </div>
                      </div>
                      <div className={styles.entryStats}>
                        <span style={{ color: 'var(--green-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                          -{entry.co2Saved.toFixed(1)} kg CO₂
                        </span>
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>+{entry.points}pts</span>
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(entry.id)}
                        title="Remove entry"
                        aria-label="Remove journal entry"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Tips sidebar */}
            <div className={styles.sideCol}>
              <div className="card card-shimmer">
                <h3 className="heading-2" style={{ marginBottom: '16px' }}>💡 Impact Tips</h3>
                {[
                  { emoji: '🚲', tip: 'Cycling 5km daily saves ~870kg CO₂/year' },
                  { emoji: '🥗', tip: 'A plant-based diet cuts food emissions by 73%' },
                  { emoji: '💡', tip: 'LED bulbs use 75% less energy than incandescent' },
                  { emoji: '🛒', tip: 'Buying second-hand saves up to 60% more CO₂' },
                  { emoji: '🌊', tip: 'Cold showers use 50% less energy' },
                ].map((item, i) => (
                  <div key={i} className={styles.tip}>
                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                    <span className="body-sm text-secondary">{item.tip}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: '20px' }}>
                <h3 className="heading-2" style={{ marginBottom: '16px' }}>🏅 This Week</h3>
                <div className={styles.weekProgress}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const hasEntry = entries.some(e => {
                      const d = new Date(e.date);
                      return d.getDay() === (i + 1) % 7;
                    });
                    return (
                      <div key={day} className={styles.weekDay}>
                        <div
                          className={styles.weekDot}
                          style={{ background: hasEntry ? 'var(--green-primary)' : 'rgba(255,255,255,0.1)', boxShadow: hasEntry ? '0 0 8px rgba(0,255,136,0.5)' : 'none' }}
                        />
                        <span className="caption text-muted">{day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="divider" />
                <div className="caption text-secondary">
                  Keep logging daily to build your streak! 🔥
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
