'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { loadUserProfile } from '@/lib/storage';
import { getCurrentLevel } from '@/lib/challenges';
import styles from './page.module.css';

const COMMUNITY_MEMBERS = [
  { id: 1, name: 'Priya Sharma', avatar: '🌟', points: 4280, level: 'Eco Champion', streak: 42, co2Saved: 186, badge: '🥇' },
  { id: 2, name: 'Arjun Patel', avatar: '🔥', points: 3960, level: 'Climate Hero', streak: 35, co2Saved: 164, badge: '🥈' },
  { id: 3, name: 'Meera Nair', avatar: '🌿', points: 3610, level: 'Green Guardian', streak: 28, co2Saved: 148, badge: '🥉' },
  { id: 4, name: 'Rahul Verma', avatar: '⚡', points: 3210, level: 'Eco Champion', streak: 21, co2Saved: 132, badge: null },
  { id: 5, name: 'Anjali Singh', avatar: '🌱', points: 2980, level: 'Tree Hugger', streak: 19, co2Saved: 118, badge: null },
  { id: 6, name: 'Vikram Reddy', avatar: '🦋', points: 2740, level: 'Green Guardian', streak: 16, co2Saved: 106, badge: null },
  { id: 7, name: 'Sneha Kumar', avatar: '🌊', points: 2510, level: 'Eco Seed', streak: 14, co2Saved: 97, badge: null },
  { id: 8, name: 'Karthik Iyer', avatar: '🌻', points: 2340, level: 'Tree Hugger', streak: 12, co2Saved: 91, badge: null },
  { id: 9, name: 'Divya Rao', avatar: '🦚', points: 2180, level: 'Eco Seed', streak: 10, co2Saved: 84, badge: null },
  { id: 10, name: 'Arun Menon', avatar: '🍃', points: 1990, level: 'Seedling', streak: 8, co2Saved: 76, badge: null },
  { id: 11, name: 'Pooja Gupta', avatar: '🌺', points: 1820, level: 'Seedling', streak: 7, co2Saved: 69, badge: null },
  { id: 12, name: 'Suresh Pillai', avatar: '🌴', points: 1650, level: 'Seedling', streak: 6, co2Saved: 62, badge: null },
];

const TABS = [
  { key: 'points', label: '🏆 Points', sort: (a, b) => b.points - a.points },
  { key: 'co2', label: '🌍 CO₂ Saved', sort: (a, b) => b.co2Saved - a.co2Saved },
  { key: 'streak', label: '🔥 Streak', sort: (a, b) => b.streak - a.streak },
];

export default function LeaderboardPage() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('points');
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setProfile(loadUserProfile());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (key) => {
    setTab(key);
    setAnimKey(k => k + 1);
  };

  if (!mounted) return null;

  const userPoints = profile?.points || 0;
  const userEntry = {
    id: 'me',
    name: profile?.name || 'Eco Warrior',
    avatar: '👤',
    points: userPoints,
    level: 'You',
    streak: 5,
    co2Saved: Math.round(userPoints * 0.04),
    badge: null,
    isMe: true,
  };

  const allMembers = [...COMMUNITY_MEMBERS, userEntry];
  const sorter = TABS.find(t => t.key === tab)?.sort;
  const sorted = [...allMembers].sort(sorter);
  const userRank = sorted.findIndex(m => m.isMe) + 1;

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const getRankColor = (rank) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return 'var(--text-muted)';
  };

  const getRankClass = (rank) => {
    if (rank === 1) return styles.gold;
    if (rank === 2) return styles.silver;
    if (rank === 3) return styles.bronze;
    return '';
  };

  const getTabValue = (member) => {
    if (tab === 'points') return `${member.points.toLocaleString()} pts`;
    if (tab === 'co2') return `${member.co2Saved} kg`;
    if (tab === 'streak') return `${member.streak} days`;
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Animated Background */}
      <div className="bg-animated">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
      <div className="bg-grid" />

      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <div className={`${styles.header} animate-fade-in`}>
            <span className="badge badge-gold">🏆 Community Leaderboard</span>
            <h1 className="display-2" style={{ marginTop: '12px' }}>
              Global <span className="text-gradient">Rankings</span>
            </h1>
            <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
              See how you compare against eco-warriors worldwide
            </p>
          </div>

          {/* User Rank Banner */}
          <div className={`${styles.myRankBanner} animate-fade-in delay-100`}>
            <div className={styles.myRankLeft}>
              <div className={styles.myRankNum}>
                <span style={{ color: getRankColor(userRank), fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>
                  #{userRank}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile?.name || 'Eco Warrior'} <span className="badge badge-green">You</span></div>
                <div className="caption text-secondary">{userPoints.toLocaleString()} points • {userEntry.co2Saved} kg CO₂ saved</div>
              </div>
            </div>
            <div className={styles.myRankRight}>
              <div className={styles.statPill}>🔥 5 day streak</div>
              <div className={styles.statPill}>🌍 Top {Math.round((userRank / sorted.length) * 100)}%</div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`${styles.tabs} animate-fade-in delay-200`}>
            {TABS.map(t => (
              <button
                key={t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
                onClick={() => handleTabChange(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Podium Top 3 */}
          <div className={`${styles.podium} animate-fade-in delay-300`} key={`podium-${animKey}`}>
            {/* 2nd place */}
            <div className={`${styles.podiumCard} ${styles.podiumSecond} animate-scale-in`} style={{ animationDelay: '0.15s' }}>
              <div className={styles.podiumAvatar}>{top3[1]?.avatar}</div>
              <div className={styles.podiumRank} style={{ color: '#c0c0c0' }}>🥈</div>
              <div className={styles.podiumName}>{top3[1]?.name}</div>
              <div className={styles.podiumValue} style={{ color: '#c0c0c0' }}>{getTabValue(top3[1])}</div>
              <div className={styles.podiumBar} style={{ height: '80px', background: 'linear-gradient(to top, #a0a0a0, #e0e0e0)' }} />
            </div>

            {/* 1st place */}
            <div className={`${styles.podiumCard} ${styles.podiumFirst} animate-scale-in`} style={{ animationDelay: '0s' }}>
              <div className={styles.crownBadge}>👑</div>
              <div className={styles.podiumAvatar} style={{ width: '72px', height: '72px', fontSize: '2rem' }}>{top3[0]?.avatar}</div>
              <div className={styles.podiumRank} style={{ color: '#ffd700' }}>🥇</div>
              <div className={styles.podiumName}>{top3[0]?.name}</div>
              <div className={styles.podiumValue} style={{ color: '#ffd700' }}>{getTabValue(top3[0])}</div>
              <div className={styles.podiumBar} style={{ height: '120px', background: 'linear-gradient(to top, #856404, #ffd700)' }} />
            </div>

            {/* 3rd place */}
            <div className={`${styles.podiumCard} ${styles.podiumThird} animate-scale-in`} style={{ animationDelay: '0.3s' }}>
              <div className={styles.podiumAvatar}>{top3[2]?.avatar}</div>
              <div className={styles.podiumRank} style={{ color: '#cd7f32' }}>🥉</div>
              <div className={styles.podiumName}>{top3[2]?.name}</div>
              <div className={styles.podiumValue} style={{ color: '#cd7f32' }}>{getTabValue(top3[2])}</div>
              <div className={styles.podiumBar} style={{ height: '60px', background: 'linear-gradient(to top, #7c3b0a, #d97706)' }} />
            </div>
          </div>

          {/* Rank List */}
          <div className={styles.rankList} key={`list-${animKey}`}>
            {sorted.map((member, index) => {
              const rank = index + 1;
              if (rank <= 3) return null;
              return (
                <div
                  key={member.id}
                  className={`${styles.rankRow} ${member.isMe ? styles.myRow : ''}`}
                  style={{ animationDelay: `${(rank - 4) * 0.05}s` }}
                >
                  <div className={styles.rankNum} style={{ color: getRankColor(rank) }}>
                    {rank}
                  </div>
                  <div className={styles.rankAvatar}>{member.avatar}</div>
                  <div className={styles.rankInfo}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {member.name}
                      {member.isMe && <span className="badge badge-green" style={{ marginLeft: '8px' }}>You</span>}
                    </div>
                    <div className="caption text-muted">
                      🔥 {member.streak}d streak • 🌍 {member.co2Saved} kg saved
                    </div>
                  </div>
                  <div className={styles.rankValue} style={{ color: getRankColor(rank) }}>
                    {getTabValue(member)}
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
