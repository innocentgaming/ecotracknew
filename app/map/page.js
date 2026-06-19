'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <div className={styles.mapLoadingSpinner}>🗺️</div>
      <p>Loading map...</p>
    </div>
  ),
});

const MAP_LAYERS = [
  { id: 'ev_charging', label: '⚡ EV Charging', icon: '⚡', color: '#eab308', description: 'Electric vehicle charging stations' },
  { id: 'public_transport', label: '🚌 Public Transport', icon: '🚌', color: '#3b82f6', description: 'Bus stops, metro stations, railway' },
  { id: 'recycling', label: '♻️ Recycling Centers', icon: '♻️', color: '#22c55e', description: 'Waste collection and recycling centers' },
  { id: 'parks', label: '🌳 Parks & Nature', icon: '🌳', color: '#16a34a', description: 'Parks, nature reserves, plantation sites' },
  { id: 'cycle_paths', label: '🚴 Cycle Paths', icon: '🚴', color: '#06b6d4', description: 'Cycling infrastructure and bike lanes' },
];

export default function MapPage() {
  const [activeLayers, setActiveLayers] = useState(['ev_charging', 'public_transport', 'recycling']);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const toggleLayer = (layerId) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]
    );
  };

  const handleLocate = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
          // Default to Delhi if permission denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setLocationLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <div className={styles.header}>
            <span className="badge badge-green">🗺️ Green Alternatives Map</span>
            <h1 className="display-2" style={{ marginTop: '12px' }}>
              Discover <span className="text-gradient">Green Places</span>
            </h1>
            <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
              Find EV charging stations, public transport, recycling centers, and parks near you
            </p>
          </div>

          <div className={styles.mapLayout}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
              {/* Locate Me */}
              <button
                className={`btn btn-primary btn-full ${locationLoading ? '' : ''}`}
                onClick={handleLocate}
                disabled={locationLoading}
                id="locate-me-btn"
              >
                {locationLoading ? '⏳ Locating...' : '📍 Use My Location'}
              </button>

              {/* Layer Toggles */}
              <div className={styles.layerSection}>
                <h3 className="heading-2" style={{ marginBottom: '12px' }}>Map Layers</h3>
                {MAP_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    className={`${styles.layerToggle} ${activeLayers.includes(layer.id) ? styles.layerActive : ''}`}
                    onClick={() => toggleLayer(layer.id)}
                    style={{ '--color': layer.color }}
                  >
                    <div className={styles.layerLeft}>
                      <span className={styles.layerIcon}>{layer.icon}</span>
                      <div>
                        <div className={styles.layerLabel}>{layer.label}</div>
                        <div className={styles.layerDesc}>{layer.description}</div>
                      </div>
                    </div>
                    <div className={`${styles.layerCheck} ${activeLayers.includes(layer.id) ? styles.layerCheckActive : ''}`}>
                      {activeLayers.includes(layer.id) ? '✓' : ''}
                    </div>
                  </button>
                ))}
              </div>

              {/* Info Cards */}
              <div className={styles.infoSection}>
                <h3 className="heading-2" style={{ marginBottom: '12px' }}>Green Tips</h3>
                {[
                  { emoji: '⚡', title: 'Switch to EV', desc: 'Find nearest charging station to plan your EV journey' },
                  { emoji: '🚌', title: 'Go Public', desc: 'Bus and metro cut your transport emissions by 60%' },
                  { emoji: '♻️', title: 'Recycle Right', desc: 'Locate your nearest e-waste and recycling drop-off' },
                ].map((tip, i) => (
                  <div key={i} className={styles.tipCard}>
                    <span className={styles.tipEmoji}>{tip.emoji}</span>
                    <div>
                      <div className={styles.tipTitle}>{tip.title}</div>
                      <div className={styles.tipDesc}>{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className={styles.mapContainer}>
              <MapComponent
                activeLayers={activeLayers}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
