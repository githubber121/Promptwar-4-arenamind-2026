'use client';

import Link from 'next/link';
import { useState } from 'react';

const METRICS = [
  { id: 'energy', label: 'Energy Consumed', value: '4,820', unit: 'kWh', target: '5,000 kWh', percent: 96, icon: '⚡', color: '#f59e0b' },
  { id: 'water', label: 'Water Used', value: '182,400', unit: 'L', target: '200,000 L', percent: 91, icon: '💧', color: '#3b82f6' },
  { id: 'waste', label: 'Waste Diverted', value: '78', unit: '%', target: '80%', percent: 78, icon: '♻️', color: '#22c55e' },
  { id: 'carbon', label: 'Carbon Offset', value: '12.4', unit: 't CO₂', target: '15 t CO₂', percent: 83, icon: '🌿', color: '#00c851' },
];

const INITIATIVES = [
  { icon: '☀️', title: 'Solar Energy', desc: 'Rooftop solar panels provide up to 30% of match-day energy needs.' },
  { icon: '🚌', title: 'Public Transport Push', desc: 'AI-optimised shuttle schedules reduce car usage by an estimated 45%.' },
  { icon: '♻️', title: 'Zero Waste Goal', desc: 'Biodegradable packaging and recycling stations at every 20m throughout the venue.' },
  { icon: '💧', title: 'Water Harvesting', desc: 'Rainwater collection systems reused for pitch irrigation and toilet flushing.' },
  { icon: '🌳', title: 'Fan Carbon Offset', desc: 'Every ticket purchase plants one tree as part of the FIFA Green Goal 2026.' },
  { icon: '📱', title: 'Digital-First', desc: 'E-tickets and digital menus eliminate 95% of single-use paper materials.' },
];

export default function SustainabilityPage() {
  const [aiInsight, setAiInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAiInsight = async () => {
    setIsLoading(true);
    setAiInsight('');
    try {
      const metricsStr = METRICS.map((m) => `${m.label}: ${m.value} ${m.unit} (${m.percent}% of target)`).join(', ');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on current FIFA 2026 sustainability metrics: ${metricsStr}. Provide 3 actionable AI-powered recommendations to improve our sustainability score before end of match day. Keep it concise and practical.`,
          persona: 'operations',
          stadiumId: 'metlife',
          language: 'en',
          history: [],
        }),
      });
      const data = await res.json();
      if (data.success) setAiInsight(data.text);
    } catch {
      setAiInsight('Could not generate insights. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px',
        borderBottom: '1px solid var(--navy-border)', background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" className="btn-ghost">← Back</Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>🌱 Sustainability Tracker</h1>
        <span className="badge badge-green">FIFA Green Goal 2026</span>
      </header>

      <main id="main-content" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Hero */}
        <div className="glass-card animate-fade-in-up" style={{
          padding: '32px', marginBottom: '32px', textAlign: 'center',
          borderColor: 'rgba(0,200,81,0.25)', background: 'rgba(0,200,81,0.03)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }} aria-hidden="true">🌍</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>FIFA Green Goal 2026</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 20px', lineHeight: 1.7, fontSize: '0.92rem' }}>
            Real-time AI monitoring of energy, water, waste and carbon metrics across all FIFA 2026 venues.
          </p>
          <button onClick={getAiInsight} disabled={isLoading} className="btn-primary">
            {isLoading ? '⏳ Analyzing...' : '🤖 Get AI Sustainability Recommendations'}
          </button>
        </div>

        {aiInsight && (
          <section aria-label="AI sustainability recommendations" className="glass-card animate-fade-in" style={{ padding: '22px', marginBottom: '28px', borderColor: 'rgba(0,200,81,0.3)' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--pitch-green)', marginBottom: '12px' }}>
              🤖 AI Sustainability Recommendations
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{aiInsight}</p>
          </section>
        )}

        {/* Metrics Grid */}
        <section aria-labelledby="metrics-heading" style={{ marginBottom: '32px' }}>
          <h2 id="metrics-heading" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Live Environmental Metrics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {METRICS.map((m) => (
              <article key={m.id} className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '1.6rem' }} aria-hidden="true">{m.icon}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {m.target}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: m.color, marginBottom: '4px' }}>
                  {m.value} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{m.unit}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{m.label}</div>
                <div className="crowd-bar" role="progressbar" aria-valuenow={m.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${m.label}: ${m.percent}% of target`}>
                  <div className="crowd-bar-fill" style={{ width: `${m.percent}%`, background: m.color }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>{m.percent}% of daily target used</div>
              </article>
            ))}
          </div>
        </section>

        {/* Initiatives */}
        <section aria-labelledby="initiatives-heading">
          <h2 id="initiatives-heading" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>🌿 Green Initiatives</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {INITIATIVES.map((i) => (
              <div key={i.title} className="glass-card" style={{ padding: '18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }} aria-hidden="true">{i.icon}</span>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '5px' }}>{i.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{i.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
