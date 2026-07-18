'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FIFA_STADIUMS } from '@/lib/stadiumData';

const DUTIES = [
  { icon: '🗺️', title: 'Fan Navigation', desc: 'Help fans find their seats, facilities, and exits' },
  { icon: '🌍', title: 'Multilingual Support', desc: 'Assist international fans with language barriers' },
  { icon: '♿', title: 'Accessibility Assistance', desc: 'Guide fans with disabilities to accessible routes' },
  { icon: '🚨', title: 'Incident Reporting', desc: 'Report safety and security incidents correctly' },
  { icon: '📋', title: 'Fan Information', desc: 'Answer general questions about the venue and event' },
  { icon: '🏥', title: 'Medical Assistance', desc: 'Direct fans to first aid and medical services' },
];

export default function VolunteerPage() {
  const [selectedId, setSelectedId] = useState('metlife');
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stadium = FIFA_STADIUMS.find((s) => s.id === selectedId)!;

  const askAI = async (q?: string) => {
    const question = q ?? query;
    if (!question.trim()) return;
    setIsLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question.trim(), persona: 'volunteer', stadiumId: selectedId, language: 'en', history: [] }),
      });
      const data = await res.json();
      if (data.success) setAiResponse(data.text);
    } catch {
      setAiResponse('Failed to get response. Please check your API key.');
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const QUICK_Q = [
    'A fan is lost and cannot find their seat in Section C',
    'A fan is asking directions in Arabic — what should I say?',
    'I see two fans arguing — what is the protocol?',
    'A fan has fainted — what do I do?',
    'How do I report a lost child?',
    'A fan needs to get to the accessible exit quickly',
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px',
        borderBottom: '1px solid var(--navy-border)', background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" className="btn-ghost">← Back</Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>🙋 Volunteer Command Guide</h1>
        <span className="badge badge-amber">FIFA 2026 Volunteer</span>
      </header>

      <main id="main-content" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

          {/* Left: Duties + Quick Q */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section aria-labelledby="venue-heading" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h2 id="venue-heading" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your Venue:</h2>
              <select
                id="vol-stadium"
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
            </section>

            <section aria-labelledby="duties-heading">
              <h2 id="duties-heading" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Your Volunteer Duties</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {DUTIES.map((d) => (
                  <div key={d.title} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }} aria-hidden="true">{d.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>{d.title}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="quick-q-heading">
              <h2 id="quick-q-heading" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Common Situations</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {QUICK_Q.map((q) => (
                  <button
                    key={q}
                    onClick={() => askAI(q)}
                    disabled={isLoading}
                    className="glass-card"
                    style={{
                      padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '0.88rem', color: 'var(--text-secondary)', border: '1px solid var(--navy-border)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,215,0,0.4)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--navy-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {q}
                    <span style={{ color: 'var(--gold)', marginLeft: '12px', flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Key contacts */}
            <section aria-labelledby="contacts-heading" className="glass-card" style={{ padding: '20px' }}>
              <h2 id="contacts-heading" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>📞 Key Contacts — {stadium.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Volunteer Supervisor', value: 'Radio Ch. 1' },
                  { label: 'Security Control', value: 'Radio Ch. 2' },
                  { label: 'Medical Emergency', value: 'Radio Ch. 3 / 911' },
                  { label: 'Lost & Found', value: 'Gate A Office' },
                ].map((c) => (
                  <div key={c.label} style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                    <div style={{ color: 'var(--pitch-green)', fontWeight: 600 }}>{c.value}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: AI Ask Panel */}
          <aside aria-labelledby="ai-help-heading" className="glass-card" style={{ padding: '22px', position: 'sticky', top: '80px' }}>
            <h2 id="ai-help-heading" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              🤖 Ask AI Guide
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.55 }}>
              Not sure what to do? Ask our AI volunteer guide for instant advice on any situation.
            </p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI(); } }}
              placeholder="e.g. A fan is asking about prayer rooms..."
              aria-label="Enter your volunteer question"
              style={{
                width: '100%', padding: '12px', background: 'var(--navy)',
                border: '1px solid var(--navy-border)', borderRadius: '10px',
                color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical',
                minHeight: '80px', outline: 'none', marginBottom: '12px',
              }}
            />
            <button onClick={() => askAI()} disabled={isLoading || !query.trim()} className="btn-primary" style={{ width: '100%' }}>
              {isLoading ? '⏳ Getting guidance...' : '💬 Get Guidance'}
            </button>

            {aiResponse && (
              <div className="animate-fade-in" style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: 'rgba(0,200,81,0.06)', border: '1px solid rgba(0,200,81,0.2)' }}>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{aiResponse}</p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
