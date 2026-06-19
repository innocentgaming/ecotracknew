'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { loadUserProfile } from '@/lib/storage';
import { getCurrentLevel } from '@/lib/challenges';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/calculator', label: 'Calculator', icon: '🧮' },
  { href: '/challenges', label: 'Challenges', icon: '🏆' },
  { href: '/journal', label: 'Journal', icon: '📅' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🎖️' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/map', label: 'Green Map', icon: '🗺️' },
  { href: '/chat', label: 'EcoBot', icon: '🤖' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfile(loadUserProfile());
    }, 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const level = profile ? getCurrentLevel(profile.points) : null;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">🌿</span>
          <span className={styles.logoText}>EcoTrack</span>
          <span className={styles.logoBadge}>PRO</span>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              <span className={styles.navIcon} aria-hidden="true">{link.icon}</span>
              <span className={styles.navLabel}>{link.label}</span>
              {pathname === link.href && <span className={styles.activeDot} />}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className={styles.rightActions}>
          {/* Notification Bell */}
          <button
            className={styles.notifBtn}
            title="Eco Tips"
            aria-label="Eco Tips"
            style={{ outline: 'none', color: 'inherit' }}
          >
            <span aria-hidden="true">🔔</span>
            <span className={styles.notifDot} aria-hidden="true" />
          </button>

          {/* Profile Badge */}
          <Link href="/settings" className={styles.profileBadge} aria-label={`View settings for ${profile?.name || 'Eco Warrior'}`}>
            {level && (
              <>
                <span className={styles.levelEmoji} aria-hidden="true">{level.emoji}</span>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{profile?.name || 'Eco Warrior'}</span>
                  <span className={styles.profileLevel}>{level.name}</span>
                </div>
                <span className={styles.profilePoints}>{profile?.points || 0} pts</span>
              </>
            )}
            {!level && <span className={styles.levelEmoji} aria-hidden="true">🌱</span>}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
