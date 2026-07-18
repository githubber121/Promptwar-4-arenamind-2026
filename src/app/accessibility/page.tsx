'use client';

import Link from 'next/link';
import { FIFA_STADIUMS } from '@/lib/stadiumData';
import { useState } from 'react';

const FEATURE_ICONS: Record<string, { icon: string; label: string }> = {
  wheelchair: { icon: '♿', label: 'Wheelchair Accessible' },
  elevator: { icon: '🛗', label: 'Elevator Available' },
  reserved_parking: { icon: '🅿️', label: 'Reserved Parking' },
  audio_guide: { icon: '🔊', label: 'Audio Guide' },
  sensory_friendly: { icon: '🧠', label: 'Sensory Friendly' },
  low_crowd: { icon: '👤', label: 'Low Crowd Route' },
  staff_assisted: { icon: '🙋', label: 'Staff Assisted' },
};

export default function AccessibilityPage() {
  const [selectedId, setSelectedId] = useState('metlife');
  const [aiGuide, setAiGuide] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const stadium = FIFA_STADIUMS.find((s) => s.id === selectedId)!;

  const getAiGuide = async () => {
    setIsLoading(true);
    setAiGuide('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I am a wheelchair user attending a match at ${stadium.name}. Please give me a detailed step-by-step guide from arrival to my seat, including what to expect at each stage and any tips to make my experience smoother.`,
          persona: 'fan',
          stadiumId: selectedId,
          language: 'en',
          history: [],
        }),
      });
      const data = await res.json();
      if (data.success) setAiGuide(data.text);
    } catch {
      setAiGuide('Could not generate guide. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoutes = filter === 'all'
    ? stadium.accessibleRoutes
    : stadium.accessibleRoutes.filter((r) => r.features.includes(filter));

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px',
        borderBottom: '1px solid var(--navy-border)', background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" className="btn-ghost">← Back</Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>♿ Accessibility Hub</h1>
        <span className="badge badge-gold">All abilities welcome</span>
      </header>

      <main id="main-content" style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
        {/* Hero */}
        <div className="glass-card animate-fade-in-up" style={{
          padding: '32px', marginBottom: '32px', textAlign: 'center',
          borderColor: 'rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.03)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }} aria-hidden="true">♿</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>
            Accessible Stadium Experience
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            FIFA World Cup 2026 is committed to full accessibility for all fans. Find dedicated routes,
            facilities, and AI-powered guidance tailored to your needs.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="access-stadium" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Venue:</label>
              <select
                id="access-stadium"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{
                  padding: '10px 16px', background: 'var(--navy-card)',
                  border: '1px solid var(--navy-border)', borderRadius: '10px',
                  color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                {FIFA_STADIUMS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={getAiGuide} disabled={isLoading} className="btn-primary">
              {isLoading ? '⏳ Generating...' : '🤖 AI Step-by-Step Guide'}
            </button>
          </div>
        </div>

        {/* AI Guide */}
        {aiGuide && (
          <section aria-label="AI accessibility guide" className="glass-card animate-fade-in" style={{ padding: '24px', marginBottom: '28px', borderColor: 'rgba(255,215,0,0.3)' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '14px' }}>
              🤖 Your Personalised Accessibility Guide
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{aiGuide}</p>
          </section>
        )}

        {/* Feature Filter */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Filter:</span>
          {['all', 'wheelchair', 'elevator', 'sensory_friendly', 'audio_guide'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === f ? 'var(--gold)' : 'var(--navy-border)'}`,
                background: filter === f ? 'rgba(255,215,0,0.1)' : 'transparent',
                color: filter === f ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: filter === f ? 600 : 400,
              }}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'All Routes' : FEATURE_ICONS[f]?.label}
            </button>
          ))}
        </div>

        {/* Accessible Routes */}
        <section aria-labelledby="routes-heading">
          <h2 id="routes-heading" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            Accessible Entry Points — {stadium.name}
          </h2>

          {filteredRoutes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
              No routes match the selected filter. Try &quot;All Routes&quot;.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredRoutes.map((route) => (
                <article key={route.id} className="glass-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{route.name}</h3>
                    <span className="badge badge-gold" style={{ flexShrink: 0 }}>
                      🚪 {route.entranceGate}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '16px' }}>
                    {route.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {route.features.map((f) => {
                      const fi = FEATURE_ICONS[f];
                      return fi ? (
                        <span key={f} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '5px 12px', borderRadius: '20px',
                          background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
                          fontSize: '0.78rem', color: 'var(--gold)',
                        }}>
                          {fi.icon} {fi.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Emergency info */}
        <section aria-labelledby="emergency-heading" className="glass-card" style={{ padding: '22px', marginTop: '28px', borderColor: 'rgba(239,68,68,0.2)' }}>
          <h2 id="emergency-heading" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>
            🆘 Emergency Assistance
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            If you require immediate assistance, please approach any volunteer in an orange vest or press the
            accessibility call button located at every section entrance. Medical staff are stationed at all
            first aid points throughout the venue.
          </p>
        </section>
      </main>
    </div>
  );
}
