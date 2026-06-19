'use client';
import { useEffect, useRef } from 'react';
import styles from './CarbonRing.module.css';

export default function CarbonRing({ score, total, scoreInfo }) {
  const glowCircleRef = useRef(null);
  const mainCircleRef = useRef(null);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (glowCircleRef.current) {
      glowCircleRef.current.style.strokeDashoffset = circumference;
      setTimeout(() => {
        if (glowCircleRef.current) {
          glowCircleRef.current.style.strokeDashoffset = dashOffset;
        }
      }, 300);
    }
    if (mainCircleRef.current) {
      mainCircleRef.current.style.strokeDashoffset = circumference;
      setTimeout(() => {
        if (mainCircleRef.current) {
          mainCircleRef.current.style.strokeDashoffset = dashOffset;
        }
      }, 300);
    }
  }, [score, dashOffset, circumference]);

  const getColor = () => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#7fff00';
    if (score >= 40) return '#ffbb00';
    if (score >= 20) return '#ff7700';
    return '#ff3333';
  };

  const color = getColor();

  return (
    <div
      className={styles.container}
      role="img"
      aria-label={`Carbon Ring Indicator: Eco Score is ${score}/100, ranking you as a ${scoreInfo?.label || 'Eco Warrior'}. Monthly emissions are ${(total/1000).toFixed(2)} tonnes, estimating to ${(total*12/1000).toFixed(1)} tonnes annually.`}
    >
      <div className={styles.ringWrapper} aria-hidden="true">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className={styles.svg}
        >
          {/* Background track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="16"
          />
          {/* Glow effect */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            filter="url(#glow)"
            ref={glowCircleRef}
            className={styles.progressCircle}
            opacity="0.3"
          />
          {/* Main progress arc */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            ref={mainCircleRef}
            className={styles.progressCircle}
          />
          {/* Tick marks */}
          {[0, 20, 40, 60, 80, 100].map((val) => {
            const angle = (val / 100) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 110 + (radius - 8) * Math.cos(rad);
            const y1 = 110 + (radius - 8) * Math.sin(rad);
            const x2 = 110 + (radius + 8) * Math.cos(rad);
            const y2 = 110 + (radius + 8) * Math.sin(rad);
            return (
              <line
                key={val}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
              />
            );
          })}
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Center Content */}
        <div className={styles.center}>
          <div className={styles.score} style={{ color }}>
            {score}
          </div>
          <div className={styles.scoreLabel}>Eco Score</div>
          <div className={styles.statusEmoji}>{scoreInfo?.emoji}</div>
          <div className={styles.statusText} style={{ color }}>
            {scoreInfo?.label}
          </div>
        </div>
      </div>

      {/* Stats below ring */}
      <div className={styles.ringStats} aria-hidden="true">
        <div className={styles.ringStat}>
          <span className={styles.ringStatValue}>{(total / 1000).toFixed(2)}</span>
          <span className={styles.ringStatLabel}>t CO₂/mo</span>
        </div>
        <div className={styles.ringStatDivider} />
        <div className={styles.ringStat}>
          <span className={styles.ringStatValue}>{(total * 12 / 1000).toFixed(1)}</span>
          <span className={styles.ringStatLabel}>t CO₂/yr</span>
        </div>
      </div>
    </div>
  );
}
