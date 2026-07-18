'use client';

import Link from 'next/link';

const features = [
  {
    icon: '🤖',
    title: 'AI Fan Assistant',
    description:
      'Multilingual AI chatbot helping fans navigate, find facilities, and get real-time answers in 8 languages.',
    href: '/assistant',
    badge: 'Fan',
    badgeClass: 'badge-green',
  },
  {
    icon: '📊',
    title: 'Operations Dashboard',
    description:
      'Real-time crowd heatmap, zone occupancy alerts, and AI-powered decision support for venue staff.',
    href: '/operations',
    badge: 'Staff',
    badgeClass: 'badge-orange',
  },
  {
    icon: '🚌',
    title: 'Transport Planner',
    description:
      'AI-recommended routes for metro, shuttle, and rideshare with live status updates and crowd-aware suggestions.',
    href: '/transport',
    badge: 'Fan',
    badgeClass: 'badge-blue',
  },
  {
    icon: '♿',
    title: 'Accessibility Hub',
    description:
      'Dedicated accessible routes, sensory-friendly paths, and step-by-step guidance for all fans.',
    href: '/accessibility',
    badge: 'All',
    badgeClass: 'badge-gold',
  },
  {
    icon: '🙋',
    title: 'Volunteer Guide',
    description:
      'AI command centre for volunteers — quick answers, incident protocols, and multilingual fan phrase support.',
    href: '/volunteer',
    badge: 'Volunteer',
    badgeClass: 'badge-amber',
  },
  {
    icon: '🌱',
    title: 'Sustainability Tracker',
    description:
      'Live tracking of stadium energy consumption, waste metrics, and AI-generated sustainability insights.',
    href: '/sustainability',
    badge: 'Ops',
    badgeClass: 'badge-green',
  },
];

const stats = [
  { value: '3', label: 'Host Nations', icon: '🌎' },
  { value: '16', label: 'Host Cities', icon: '🏙️' },
  { value: '48', label: 'Teams', icon: '⚽' },
  { value: '104', label: 'Matches', icon: '🏟️' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <header
        role="banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid var(--navy-border)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10, 15, 30, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--pitch-green), var(--pitch-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(0,200,81,0.3)',
            }}
          >
            🏟️
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>ArenaMind</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '-2px' }}>FIFA World Cup 2026</p>
          </div>
        </div>
        <nav aria-label="Main navigation" style={{ display: 'flex', gap: '8px' }}>
          <Link href="/assistant" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            🤖 Fan Assistant
          </Link>
          <Link href="/operations" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            📊 Operations
          </Link>
        </nav>
      </header>

      <main id="main-content">
        {/* ── Hero Section ── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            textAlign: 'center',
            padding: '80px 32px 60px',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div className="animate-fade-in-up">
            <span className="badge badge-gold" style={{ marginBottom: '20px', display: 'inline-flex' }}>
              ✨ GenAI-Powered · FIFA World Cup 2026
            </span>
          </div>

          <h2
            id="hero-heading"
            className="animate-fade-in-up"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              animationDelay: '0.1s',
            }}
          >
            The AI Brain Behind
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--pitch-green), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Smart Stadiums
            </span>
          </h2>

          <p
            className="animate-fade-in-up"
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '0 auto 40px',
              lineHeight: 1.75,
              animationDelay: '0.2s',
            }}
          >
            ArenaMind uses Generative AI to transform the FIFA World Cup 2026 experience — real-time crowd intelligence,
            multilingual fan support, accessible navigation, and operational command for staff and volunteers.
          </p>

          <div
            className="animate-fade-in-up"
            style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}
          >
            <Link href="/assistant" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              🤖 Start as Fan
            </Link>
            <Link href="/operations" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              📊 View Operations
            </Link>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section
          aria-label="FIFA World Cup 2026 statistics"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1px',
            background: 'var(--navy-border)',
            borderTop: '1px solid var(--navy-border)',
            borderBottom: '1px solid var(--navy-border)',
            marginBottom: '70px',
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '28px 16px',
                background: 'var(--navy)',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }} aria-hidden="true">
                {s.icon}
              </div>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── Feature Grid ── */}
        <section
          aria-labelledby="features-heading"
          style={{ padding: '0 32px 80px', maxWidth: '1200px', margin: '0 auto' }}
        >
          <h2
            id="features-heading"
            style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '48px' }}
          >
            Everything You Need,{' '}
            <span style={{ color: 'var(--pitch-green)' }}>AI-Powered</span>
          </h2>

          <div
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {features.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="glass-card glass-card-hover animate-fade-in-up"
                style={{
                  display: 'block',
                  padding: '28px',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                aria-label={`${f.title} — ${f.description}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '2.2rem' }} aria-hidden="true">
                    {f.icon}
                  </span>
                  <span className={`badge ${f.badgeClass}`}>{f.badge}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.description}</p>
                <div
                  style={{
                    marginTop: '20px',
                    fontSize: '0.85rem',
                    color: 'var(--pitch-green)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid var(--navy-border)',
          padding: '24px 32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        <p>ArenaMind 2026 — Built for the FIFA World Cup 2026 Smart Stadium Challenge</p>
        <p style={{ marginTop: '6px', color: 'var(--text-muted)' }}>Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}
