'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (emoji, color) => {
  return L.divIcon({
    html: `<div style="
      background: ${color}22;
      border: 2px solid ${color};
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 0 10px ${color}66;
      backdrop-filter: blur(4px);
    ">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Pre-defined eco-friendly locations across major Indian cities
const ECO_LOCATIONS = {
  ev_charging: [
    { lat: 28.6139, lng: 77.2090, name: 'Delhi EV Station - Connaught Place', city: 'Delhi' },
    { lat: 28.5355, lng: 77.3910, name: 'Noida EV Hub - Sector 18', city: 'Noida' },
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai EV Point - Bandra', city: 'Mumbai' },
    { lat: 12.9716, lng: 77.5946, name: 'Bangalore EV Station - MG Road', city: 'Bangalore' },
    { lat: 13.0827, lng: 80.2707, name: 'Chennai EV Point - T. Nagar', city: 'Chennai' },
    { lat: 17.3850, lng: 78.4867, name: 'Hyderabad EV Hub - HITEC City', city: 'Hyderabad' },
    { lat: 22.5726, lng: 88.3639, name: 'Kolkata EV Station - Park Street', city: 'Kolkata' },
    { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad EV Point - CG Road', city: 'Ahmedabad' },
  ],
  public_transport: [
    { lat: 28.6304, lng: 77.2177, name: 'Rajiv Chowk Metro Station', city: 'Delhi' },
    { lat: 28.6562, lng: 77.2410, name: 'Kashmiri Gate ISBT', city: 'Delhi' },
    { lat: 19.0822, lng: 72.8909, name: 'Dadar Bus Terminus', city: 'Mumbai' },
    { lat: 19.0176, lng: 72.8561, name: 'Kurla Bus Station', city: 'Mumbai' },
    { lat: 12.9774, lng: 77.5713, name: 'Majestic Bus Terminal', city: 'Bangalore' },
    { lat: 13.0827, lng: 80.2650, name: 'Chennai Central Station', city: 'Chennai' },
    { lat: 17.4399, lng: 78.4983, name: 'MGBS Bus Terminal', city: 'Hyderabad' },
    { lat: 22.5726, lng: 88.3832, name: 'Howrah Station', city: 'Kolkata' },
  ],
  recycling: [
    { lat: 28.6441, lng: 77.2170, name: 'Delhi Recycling Center - Karol Bagh', city: 'Delhi' },
    { lat: 19.1136, lng: 72.8697, name: 'Mumbai E-Waste Hub - Andheri', city: 'Mumbai' },
    { lat: 12.9352, lng: 77.6245, name: 'Bangalore Recycling Park', city: 'Bangalore' },
    { lat: 13.0569, lng: 80.2425, name: 'Chennai Waste Management Center', city: 'Chennai' },
    { lat: 17.3616, lng: 78.4747, name: 'Hyderabad Recycling Hub', city: 'Hyderabad' },
    { lat: 22.5726, lng: 88.3392, name: 'Kolkata Solid Waste Facility', city: 'Kolkata' },
    { lat: 23.0225, lng: 72.5499, name: 'Ahmedabad Recycling Center', city: 'Ahmedabad' },
    { lat: 18.5204, lng: 73.8567, name: 'Pune Waste Processing Unit', city: 'Pune' },
  ],
  parks: [
    { lat: 28.6129, lng: 77.2295, name: 'Lodi Garden', city: 'Delhi' },
    { lat: 28.6250, lng: 77.1700, name: 'Sanjay Gandhi Park', city: 'Delhi' },
    { lat: 19.0760, lng: 72.8228, name: 'Sanjay Gandhi National Park', city: 'Mumbai' },
    { lat: 12.9344, lng: 77.5854, name: 'Cubbon Park', city: 'Bangalore' },
    { lat: 13.0359, lng: 80.2492, name: 'Guindy National Park', city: 'Chennai' },
    { lat: 17.4472, lng: 78.3970, name: 'KBR National Park', city: 'Hyderabad' },
    { lat: 22.5726, lng: 88.4083, name: 'East Kolkata Wetlands', city: 'Kolkata' },
    { lat: 18.5204, lng: 73.9195, name: 'Empress Botanical Garden', city: 'Pune' },
  ],
  cycle_paths: [
    { lat: 28.6100, lng: 77.1900, name: 'Delhi Cycling Track - JLN Stadium', city: 'Delhi' },
    { lat: 28.6335, lng: 77.2290, name: 'Central Park Cycling Zone', city: 'Delhi' },
    { lat: 12.9795, lng: 77.5905, name: 'Bangalore MG Road Cycle Lane', city: 'Bangalore' },
    { lat: 12.9551, lng: 77.5997, name: 'Koramangala Cycle Path', city: 'Bangalore' },
    { lat: 18.5204, lng: 73.8567, name: 'Pune River Front Cycle Track', city: 'Pune' },
    { lat: 19.0190, lng: 72.8540, name: 'Bandra-Worli Sea Link Promenade', city: 'Mumbai' },
  ],
};

const LAYER_CONFIG = {
  ev_charging: { emoji: '⚡', color: '#eab308' },
  public_transport: { emoji: '🚌', color: '#3b82f6' },
  recycling: { emoji: '♻️', color: '#22c55e' },
  parks: { emoji: '🌳', color: '#16a34a' },
  cycle_paths: { emoji: '🚴', color: '#06b6d4' },
};

function FlyToLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14, { animate: true, duration: 1.5 });
    }
  }, [location, map]);
  return null;
}

export default function MapComponent({ activeLayers, userLocation }) {
  const defaultCenter = [22.5, 80.0]; // Center of India
  const defaultZoom = 5;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%', borderRadius: '18px' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && <FlyToLocation location={userLocation} />}

      {/* User location marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createIcon('📍', '#ff4466')}
        >
          <Popup>
            <strong>Your Location</strong>
          </Popup>
        </Marker>
      )}

      {/* Eco-friendly location markers */}
      {activeLayers.map((layerId) => {
        const locations = ECO_LOCATIONS[layerId] || [];
        const config = LAYER_CONFIG[layerId];
        return locations.map((loc, i) => (
          <Marker
            key={`${layerId}-${i}`}
            position={[loc.lat, loc.lng]}
            icon={createIcon(config.emoji, config.color)}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  {config.emoji} {loc.name}
                </strong>
                <span style={{ fontSize: '12px', color: '#666' }}>📍 {loc.city}</span>
              </div>
            </Popup>
          </Marker>
        ));
      })}
    </MapContainer>
  );
}
