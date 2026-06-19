'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { CHALLENGES, LEVELS, getCurrentLevel, getNextLevel, getLevelProgress, getDefaultChallengeState } from '@/lib/challenges';
import { loadChallenges, saveChallenges, loadUserProfile, saveUserProfile } from '@/lib/storage';
import styles from './page.module.css';

export default function ChallengesPage() {
  const [challengeState, setChallengeState] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [celebrationId, setCelebrationId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const state = loadChallenges() || getDefaultChallengeState();
      setChallengeState(state);
      setProfile(loadUserProfile());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = (challengeId) => {
    const updated = {
      ...challengeState,
      [challengeId]: {
        ...challengeState[challengeId],
        started: true,
        startedAt: new Date().toISOString(),
      },
    };
    setChallengeState(updated);
    saveChallenges(updated);
  };

  const handleProgress = (challengeId, increment) => {
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    const current = challengeState[challengeId];
    const newProgress = Math.min(current.progress + increment, challenge.targetDays);
    const isCompleted = newProgress >= challenge.targetDays;

    const updated = {
      ...challengeState,
      [challengeId]: {
        ...current,
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null,
      },
    };

    if (isCompleted && !current.completed) {
      // Award points and badge
      const newProfile = {
        ...profile,
        points: (profile?.points || 0) + challenge.points,
        badges: [...(profile?.badges || []), challenge.badge],
      };
      setProfile(newProfile);
      saveUserProfile(newProfile);
      setCelebrationId(challengeId);
      setTimeout(() => setCelebrationId(null), 3000);
    }

    setChallengeState(updated);
    saveChallenges(updated);
  };

  if (!challengeState) return null;

  const level = profile ? getCurrentLevel(profile.points) : LEVELS[0];
  const nextLevel = profile ? getNextLevel(profile.points) : LEVELS[1];
  const levelProgress = profile ? getLevelProgress(profile.points) : 0;

  const completedCount = Object.values(challengeState).filter((s) => s.completed).length;
  const activeCount = Object.values(challengeState).filter((s) => s.started && !s.completed).length;

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'available', label: 'Available' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'energy', label: '⚡ Energy' },
    { value: 'food', label: '🥗 Food' },
    { value: 'waste', label: '♻️ Waste' },
    { value: 'nature', label: '🌳 Nature' },
  ];

  const filteredChallenges = CHALLENGES.filter((c) => {
    const state = challengeState[c.id];
    if (activeFilter === 'active') return state.started && !state.completed;
    if (activeFilter === 'completed') return state.completed;
    if (activeFilter === 'available') return !state.started;
    if (['transport', 'energy', 'food', 'waste', 'nature'].includes(activeFilter)) {
      return c.category === activeFilter;
    }
    return true;
  });

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <div className={styles.header}>
            <span className="badge badge-green">🏆 Green Challenges</span>
            <h1 className="display-2" style={{ marginTop: '12px' }}>
              Earn Points, <span className="text-gradient">Save the Planet</span>
            </h1>
            <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
              Complete eco-challenges to earn badges, level up, and make a real difference
            </p>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            {/* Level Card */}
            <div className={styles.levelCard}>
              <div className={styles.levelHeader}>
                <span className={styles.levelEmoji}>{level.emoji}</span>
                <div>
                  <div className={styles.levelName}>{level.name}</div>
                  <div className="caption text-muted">Level {level.level}</div>
                </div>
                <div className={styles.levelPoints}>
                  <span>{profile?.points || 0}</span>
                  <span className="caption text-muted">points</span>
                </div>
              </div>
              <div className="progress-bar-container" style={{ margin: '12px 0' }}>
                <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="caption text-muted">{profile?.points || 0} pts</span>
                {nextLevel && <span className="caption text-muted">{nextLevel.name} at {nextLevel.minPoints} pts →</span>}
              </div>
            </div>

            {/* Stats */}
            <div className={styles.challengeStats}>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ color: 'var(--amber)' }}>{profile?.points || 0}</div>
                <div className="stat-label">Total Points</div>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ color: 'var(--green-primary)' }}>{completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ color: 'var(--blue)' }}>{activeCount}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ color: 'var(--teal)' }}>
                  {CHALLENGES.reduce((sum, c) => sum + (challengeState[c.id]?.completed ? c.co2Saving : 0), 0)}
                </div>
                <div className="stat-label">kg CO₂ Saved</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {(profile?.badges?.length > 0) && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 className="heading-2" style={{ marginBottom: '16px' }}>🏅 Your Badges</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {profile.badges.map((badge, i) => (
                  <span key={i} className={`badge badge-green ${styles.badgePill}`}>{badge}</span>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.value}
                className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterActive : ''}`}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Challenge Grid */}
          <div className={styles.challengeGrid}>
            {filteredChallenges.map((challenge, i) => {
              const state = challengeState[challenge.id];
              const isCelebrating = celebrationId === challenge.id;
              const progressPct = challenge.targetDays > 0
                ? (state.progress / challenge.targetDays) * 100
                : 0;

              return (
                <div
                  key={challenge.id}
                  className={`${styles.challengeCard} ${state.completed ? styles.cardCompleted : ''} ${isCelebrating ? styles.cardCelebrating : ''}`}
                  style={{ '--accent': challenge.color, '--delay': `${i * 0.05}s` }}
                >
                  {state.completed && (
                    <div className={styles.completedBadge}>✓ Completed</div>
                  )}
                  {isCelebrating && (
                    <div className={styles.celebration}>🎉 Challenge Complete!</div>
                  )}

                  <div className={styles.cardHeader}>
                    <span className={styles.challengeEmoji}>{challenge.emoji}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={`badge ${challenge.difficulty === 'Easy' ? 'badge-green' : challenge.difficulty === 'Medium' ? 'badge-amber' : 'badge-red'}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                  <p className={styles.challengeDesc}>{challenge.description}</p>

                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      🏆 {challenge.points} pts
                    </span>
                    <span className={styles.metaItem}>
                      🌱 Save {challenge.co2Saving} kg CO₂
                    </span>
                  </div>

                  {state.started && !state.completed && (
                    <div className={styles.progressSection}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                        <span className="text-secondary">Progress</span>
                        <span className="text-accent">{state.progress}/{challenge.targetDays} days</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progressPct}%`, background: challenge.color }}
                        />
                      </div>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    {!state.started && !state.completed && (
                      <button
                        className="btn btn-outline btn-full"
                        onClick={() => handleStart(challenge.id)}
                      >
                        Start Challenge
                      </button>
                    )}
                    {state.started && !state.completed && (
                      <button
                        className="btn btn-primary btn-full"
                        onClick={() => handleProgress(challenge.id, 1)}
                      >
                        ✓ Log Day {state.progress + 1}
                      </button>
                    )}
                    {state.completed && (
                      <div className={styles.completedAction}>
                        <span>{challenge.badge}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--green-primary)' }}>Badge Earned!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
