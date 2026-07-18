'use client';

import Link from 'next/link';
import { FIFA_STADIUMS } from '@/lib/stadiumData';
import { useState } from 'react';

const TRANSPORT_ICONS: Record<string, string> = {
  metro: '🚇',
  bus: '🚌',
  shuttle: '🚐',
  taxi: '🚕',
  walk: '🚶',
};

const STATUS_INFO: Record<string, { color: string; label: string; class: string }> = {
  normal: { color: '#22c55e', label: 'On Time', class: 'badge-green' },
  delayed: { color: '#f59e0b', label: 'Delayed', class: 'badge-amber' },
  disrupted: { color: '#ef4444', label: 'Disrupted', class: 'badge-red' },
};

export default function TransportPage() {
  const [selectedId, setSelectedId] = useState('metlife');
  const [aiTip, setAiTip] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stadium = FIFA_STADIUMS.find((s) => s.id === selectedId)!;

  const getAiTransportAdvice = async () => {
    setIsLoading(true);
    setAiTip('');
    try {
      const disrupted = stadium.transportOptions.filter((t) => t.currentStatus !== 'normal').map((t) => t.name).join(', ');
      const prompt = disrupted
        ? `Transport disruptions at ${stadium.name}: ${disrupted}. Give concise advice for fans arriving in the next 2 hours.`
        : `All transport is running normally at ${stadium.name}. Give the best transport recommendations for fans leaving after the match.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, persona: 'fan', stadiumId: selectedId, language: 'en', history: [] }),
      });
      const data = await res.json();
      if (data.success) setAiTip(data.text);
    } catch {
      setAiTip('Could not fetch AI advice. Please check your API key.');
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
        <h1 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>🚌 Transport Planner</h1>
      </header>

      <main id="main-content" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <label htmlFor="transport-stadium" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Venue:</label>
          <select
            id="transport-stadium"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              padding: '10px 16px', background: 'var(--navy-card)',
              border: '1px solid var(--navy-border)', borderRadius: '10px',
              color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {FIFA_STADIUMS.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
          </select>
          <button onClick={getAiTransportAdvice} disabled={isLoading} className="btn-primary" style={{ marginLeft: 'auto' }}>
            {isLoading ? '⏳ Getting advice...' : '🤖 AI Transport Advice'}
          </button>
        </div>

        {aiTip && (
          <div className="glass-card animate-fade-in" style={{ padding: '20px', marginBottom: '28px', borderColor: 'rgba(0,200,81,0.3)' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--pitch-green)', marginBottom: '12px' }}>
              🤖 AI Transport Recommendation
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{aiTip}</p>
          </div>
        )}

        <section aria-labelledby="transport-heading">
          <h2 id="transport-heading" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            Available Transport — {stadium.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stadium.transportOptions.map((t) => {
              const si = STATUS_INFO[t.currentStatus];
              return (
                <article key={t.name} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                  }} aria-hidden="true">
                    {TRANSPORT_ICONS[t.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.name}</h3>
                      <span className={`badge ${si.class}`} aria-label={`Status: ${si.label}`}>{si.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        ⏱️ ~{t.estimatedTime} min
                      </span>
                      {t.frequency > 0 && (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          🔄 Every {t.frequency} min
                        </span>
                      )}
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        🚦 {t.type}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
