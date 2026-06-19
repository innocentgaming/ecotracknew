'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { loadHistory, generateMockHistory, loadResults } from '@/lib/storage';
import { INDIA_AVERAGE_ANNUAL, GLOBAL_AVERAGE_ANNUAL } from '@/lib/carbonCalculator';
import styles from './page.module.css';

// Dynamically import chart components to avoid SSR issues
const ChartComponents = dynamic(() => import('@/components/ChartComponents'), { ssr: false });

export default function AnalyticsPage() {
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const h = loadHistory();
      setHistory(h.length > 0 ? h : generateMockHistory());
      setResults(loadResults());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const categories = ['transport', 'energy', 'food', 'shopping', 'waste'];
  const categoryColors = {
    transport: '#3b82f6',
    energy: '#eab308',
    food: '#22c55e',
    shopping: '#a855f7',
    waste: '#06b6d4',
  };
  const categoryEmojis = { transport: '🚗', energy: '⚡', food: '🥗', shopping: '🛍️', waste: '♻️' };

  const currentResults = results || {
    transport: 150, energy: 220, food: 310, shopping: 85, waste: 35, total: 800
  };

  const monthlyTotal = currentResults.total;
  const annualTotal = monthlyTotal * 12;

  // Pie chart data
  const pieData = {
    labels: categories.map((c) => `${categoryEmojis[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`),
    datasets: [{
      data: categories.map((c) => currentResults[c] || 0),
      backgroundColor: categories.map((c) => categoryColors[c] + 'cc'),
      borderColor: categories.map((c) => categoryColors[c]),
      borderWidth: 2,
    }],
  };

  // Bar chart data (monthly history)
  const recentMonths = history.slice(-6);
  const barData = {
    labels: recentMonths.map((h) => h.month || new Date(h.date).toLocaleString('default', { month: 'short' })),
    datasets: categories.map((cat) => ({
      label: `${categoryEmojis[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
      data: recentMonths.map((h) => Math.round(h[cat] || 0)),
      backgroundColor: categoryColors[cat] + '99',
      borderColor: categoryColors[cat],
      borderWidth: 1,
      borderRadius: 4,
    })),
  };

  // Line chart (total trend)
  const lineData = {
    labels: recentMonths.map((h) => h.month || new Date(h.date).toLocaleString('default', { month: 'short' })),
    datasets: [{
      label: 'Monthly CO₂ (kg)',
      data: recentMonths.map((h) => Math.round(
        (h.transport || 0) + (h.energy || 0) + (h.food || 0) + (h.shopping || 0) + (h.waste || 0)
      )),
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0,255,136,0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00ff88',
      pointBorderColor: '#080f0a',
      pointRadius: 5,
    }, {
      label: 'India Monthly Avg',
      data: recentMonths.map(() => Math.round(INDIA_AVERAGE_ANNUAL / 12)),
      borderColor: '#ffb700',
      borderDash: [5, 5],
      borderWidth: 2,
      fill: false,
      tension: 0,
      pointRadius: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8fa896', font: { family: 'Inter', size: 12 }, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#111e15',
        borderColor: 'rgba(0,255,136,0.2)',
        borderWidth: 1,
        titleColor: '#00ff88',
        bodyColor: '#e8f5ec',
      },
    },
    scales: {
      x: {
        ticks: { color: '#8fa896' },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: { color: '#8fa896' },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <div className={styles.header}>
            <span className="badge badge-green">📊 Analytics</span>
            <h1 className="display-2" style={{ marginTop: '12px' }}>
              Your Carbon <span className="text-gradient">Analytics</span>
            </h1>
            <p className="body-lg text-secondary" style={{ marginTop: '8px' }}>
              Deep dive into your environmental impact with real-time charts and insights
            </p>
          </div>

          {/* Key Metrics */}
          <div className={styles.metricsRow}>
            <div className={`stat-card ${styles.metricCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📅</div>
              <div className="stat-value">{monthlyTotal.toFixed(0)}</div>
              <div className="stat-label">kg CO₂ / Month</div>
              <div className={`stat-change ${monthlyTotal < INDIA_AVERAGE_ANNUAL / 12 ? 'down' : 'up'}`}>
                {monthlyTotal < INDIA_AVERAGE_ANNUAL / 12 ? '▼ Below' : '▲ Above'} India avg
              </div>
            </div>
            <div className={`stat-card ${styles.metricCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📆</div>
              <div className="stat-value">{(annualTotal / 1000).toFixed(2)}</div>
              <div className="stat-label">Tonnes CO₂ / Year</div>
              <div className={`stat-change ${annualTotal < INDIA_AVERAGE_ANNUAL ? 'down' : 'up'}`}>
                {annualTotal < INDIA_AVERAGE_ANNUAL ? '▼ Better' : '▲ Higher'} than India avg
              </div>
            </div>
            <div className={`stat-card ${styles.metricCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌍</div>
              <div className="stat-value">
                {((annualTotal / GLOBAL_AVERAGE_ANNUAL) * 100).toFixed(0)}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>%</span>
              </div>
              <div className="stat-label">Of Global Average</div>
              <div className={`stat-change ${annualTotal < GLOBAL_AVERAGE_ANNUAL ? 'down' : 'up'}`}>
                {(GLOBAL_AVERAGE_ANNUAL / 1000).toFixed(1)} t global avg
              </div>
            </div>
            <div className={`stat-card ${styles.metricCard}`}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌲</div>
              <div className="stat-value">{Math.ceil(annualTotal / 22)}</div>
              <div className="stat-label">Trees to Offset</div>
              <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
                Each tree ~22 kg CO₂/yr
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className={styles.chartsGrid}>
            {/* Line Chart - Trend */}
            <div className={`card ${styles.chartCard} ${styles.chartWide}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h2 className="heading-2">Monthly CO₂ Trend</h2>
                  <p className="body-sm text-secondary">Your emissions vs India average over 6 months</p>
                </div>
              </div>
              <div className={styles.chartArea} style={{ height: '280px' }}>
                {mounted && <ChartComponents type="line" data={lineData} options={chartOptions} />}
              </div>
            </div>

            {/* Pie Chart */}
            <div className={`card ${styles.chartCard}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h2 className="heading-2">Category Breakdown</h2>
                  <p className="body-sm text-secondary">Emissions by source this month</p>
                </div>
              </div>
              <div className={styles.chartArea} style={{ height: '280px' }}>
                {mounted && (() => {
                  const { scales: _omit, ...pieOptions } = chartOptions;
                  return (
                    <ChartComponents
                      type="pie"
                      data={pieData}
                      options={{
                        ...pieOptions,
                        plugins: { ...chartOptions.plugins, legend: { position: 'bottom', labels: chartOptions.plugins.legend.labels } }
                      }}
                    />
                  );
                })()}
              </div>
            </div>

            {/* Bar Chart - Stacked */}
            <div className={`card ${styles.chartCard} ${styles.chartWide}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h2 className="heading-2">Monthly Breakdown by Category</h2>
                  <p className="body-sm text-secondary">Stacked bar view of emissions per category</p>
                </div>
              </div>
              <div className={styles.chartArea} style={{ height: '280px' }}>
                {mounted && (
                  <ChartComponents
                    type="bar"
                    data={barData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: { ...chartOptions.scales.x, stacked: true },
                        y: { ...chartOptions.scales.y, stacked: true },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Category Details */}
            <div className={`card ${styles.chartCard}`}>
              <h2 className="heading-2" style={{ marginBottom: '16px' }}>Category Details</h2>
              {categories.map((cat) => {
                const val = currentResults[cat] || 0;
                const pct = (val / monthlyTotal) * 100;
                return (
                  <div key={cat} className={styles.categoryDetail}>
                    <div className={styles.catIcon} style={{ background: categoryColors[cat] + '22', color: categoryColors[cat] }}>
                      {categoryEmojis[cat]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{cat}</span>
                        <span style={{ fontSize: '0.875rem', color: categoryColors[cat], fontWeight: 700 }}>{val.toFixed(0)} kg</span>
                      </div>
                      <div className="progress-bar-container" style={{ height: '6px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: '9999px',
                            background: categoryColors[cat],
                            boxShadow: `0 0 8px ${categoryColors[cat]}66`,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {pct.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
