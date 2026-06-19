'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { loadSettings, saveSettings, loadUserProfile, saveUserProfile } from '@/lib/storage';
import styles from './page.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ geminiApiKey: '', theme: 'dark' });
  const [profile, setProfile] = useState({ name: 'Eco Warrior', points: 0, level: 1, badges: [] });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setSettings(loadSettings());
      setProfile(loadUserProfile());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    const trimmedName = (profile.name || '').trim();
    if (!trimmedName) {
      alert('⚠️ Display Name cannot be empty.');
      return;
    }
    if (trimmedName.length > 50) {
      alert('⚠️ Display Name is too long (max 50 characters).');
      return;
    }
    const updatedProfile = { ...profile, name: trimmedName };
    const updatedSettings = {
      ...settings,
      geminiApiKey: (settings.geminiApiKey || '').trim()
    };

    saveSettings(updatedSettings);
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setSettings(updatedSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset all your data? This cannot be undone.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <span className="badge badge-green">⚙️ Settings</span>
            <h1 className="display-2" style={{ marginTop: '12px' }}>
              App <span className="text-gradient">Settings</span>
            </h1>
            <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
              Configure your profile, API keys, and preferences
            </p>
          </div>

          <div className={styles.settingsGrid}>
            {/* Profile Settings */}
            <div className="card">
              <h2 className="heading-2" style={{ marginBottom: '20px' }}>👤 Your Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name-input">Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your eco name"
                    id="profile-name-input"
                  />
                </div>
                <div className={styles.profileStats}>
                  <div className={styles.profileStat}>
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--amber)' }}>{profile.points}</div>
                      <div className="caption text-muted">Points</div>
                    </div>
                  </div>
                  <div className={styles.profileStat}>
                    <span style={{ fontSize: '1.5rem' }}>🏅</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--green-primary)' }}>{(profile.badges || []).length}</div>
                      <div className="caption text-muted">Badges</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Configuration */}
            <div className="card">
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>🤖 AI Configuration</h2>
              <p className="body-sm text-secondary" style={{ marginBottom: '20px' }}>
                Add your Gemini API key to enable personalized AI suggestions and chat
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="gemini-api-key-input">Google Gemini API Key</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      className="form-input"
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      placeholder="AIza..."
                      id="gemini-api-key-input"
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowKey(!showKey)}
                      aria-label={showKey ? "Hide API key" : "Show API key"}
                    >
                      {showKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="caption text-muted" style={{ marginTop: '6px' }}>
                    Get your key from{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--green-primary)' }}
                    >
                      Google AI Studio →
                    </a>
                  </p>
                </div>

                <div className={styles.apiStatus}>
                  <span className={`${styles.statusDot} ${settings.geminiApiKey ? styles.dotActive : styles.dotInactive}`} />
                  <span className="body-sm">
                    {settings.geminiApiKey ? '✅ Gemini AI Active — Full AI features enabled' : '⚠️ No key — Using smart rule-based suggestions'}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card">
              <h2 className="heading-2" style={{ marginBottom: '16px' }}>🌿 About EcoTrack</h2>
              <div className={styles.aboutContent}>
                <div className={styles.aboutItem}>
                  <span>🧮</span><span>India-specific carbon emission factors</span>
                </div>
                <div className={styles.aboutItem}>
                  <span>🤖</span><span>Powered by Google Gemini AI</span>
                </div>
                <div className={styles.aboutItem}>
                  <span>🗺️</span><span>OpenStreetMap for green locations</span>
                </div>
                <div className={styles.aboutItem}>
                  <span>💾</span><span>All data stored locally in your browser</span>
                </div>
                <div className={styles.aboutItem}>
                  <span>🔒</span><span>No data sent to any server (except Gemini API)</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card" style={{ borderColor: 'rgba(255, 68, 102, 0.2)' }}>
              <h2 className="heading-2" style={{ marginBottom: '8px', color: 'var(--red)' }}>⚠️ Danger Zone</h2>
              <p className="body-sm text-secondary" style={{ marginBottom: '16px' }}>
                These actions are irreversible. Please be careful.
              </p>
              <button className="btn btn-danger" onClick={handleReset} id="reset-data-btn">
                🗑️ Reset All Data
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.saveRow}>
            <button
              className={`btn btn-primary btn-lg ${saved ? styles.saved : ''}`}
              onClick={handleSave}
              id="save-settings-btn"
            >
              {saved ? '✅ Settings Saved!' : '💾 Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
