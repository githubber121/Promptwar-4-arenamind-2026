'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FIFA_STADIUMS, SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/stadiumData';

type Persona = 'fan' | 'operations' | 'volunteer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HistoryEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const PERSONA_CONFIG = {
  fan: { label: 'Fan Assistant', icon: '🤖', color: 'var(--pitch-green)', desc: 'Get help navigating, finding facilities, and enjoying the match.' },
  operations: { label: 'Operations AI', icon: '📊', color: 'var(--orange-alert)', desc: 'Real-time crowd management and decision support for staff.' },
  volunteer: { label: 'Volunteer Guide', icon: '🙋', color: 'var(--gold)', desc: 'AI guidance for FIFA 2026 volunteers.' },
};

const QUICK_PROMPTS: Record<Persona, string[]> = {
  fan: [
    'Where is the nearest restroom?',
    'Which zone is least crowded right now?',
    'How do I get to Section 214?',
    'What food options are available?',
    'How do I get back to the metro?',
  ],
  operations: [
    'Which zones are above alert threshold?',
    'Show crowd dispersal recommendations',
    'What are current transport disruptions?',
    'Generate a status briefing',
    'Emergency evacuation protocol?',
  ],
  volunteer: [
    'A fan needs help to their seat',
    'How do I report an incident?',
    'Fan is asking for directions in Spanish',
    'Where is the nearest first aid?',
    'A fan has lost their ticket',
  ],
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export default function AssistantPage() {
  const [persona, setPersona] = useState<Persona>('fan');
  const [stadiumId, setStadiumId] = useState<string>('metlife');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Remove useEffect for state reset to fix ESLint set-state-in-effect

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          persona,
          stadiumId,
          language,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to get response.');
      }

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: text.trim() }] },
        { role: 'model', parts: [{ text: data.text }] },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error.';
      setError(msg);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, persona, stadiumId, language, history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const selectedStadium = FIFA_STADIUMS.find((s) => s.id === stadiumId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Bar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px',
        borderBottom: '1px solid var(--navy-border)', background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" className="btn-ghost" aria-label="Back to home" style={{ padding: '6px 10px' }}>← Back</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>ArenaMind AI Assistant</h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>FIFA World Cup 2026</p>
        </div>
        <span className={`badge badge-green`}>Live</span>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 65px)' }}>

        {/* ── Sidebar ── */}
        <aside
          aria-label="Assistant settings"
          style={{
            width: '280px', minWidth: '280px', borderRight: '1px solid var(--navy-border)',
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px',
            overflowY: 'auto', background: 'rgba(10,15,30,0.6)',
          }}
        >
          {/* Persona Selector */}
          <div>
            <h2 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              I am a...
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} role="radiogroup" aria-label="Select persona">
              {(Object.keys(PERSONA_CONFIG) as Persona[]).map((p) => {
                const cfg = PERSONA_CONFIG[p];
                const isActive = persona === p;
                return (
                  <button
                    key={p}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => {
                      setPersona(p);
                      setMessages([]);
                      setHistory([]);
                      setError(null);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                      borderRadius: '10px', border: `1px solid ${isActive ? cfg.color : 'var(--navy-border)'}`,
                      background: isActive ? `${cfg.color}15` : 'transparent',
                      color: isActive ? cfg.color : 'var(--text-secondary)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      fontWeight: isActive ? 600 : 400, fontSize: '0.88rem',
                    }}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stadium Selector */}
          <div>
            <label htmlFor="stadium-select" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Stadium
            </label>
            <select
              id="stadium-select"
              value={stadiumId}
              onChange={(e) => {
                setStadiumId(e.target.value);
                setMessages([]);
                setHistory([]);
                setError(null);
              }}
              style={{
                width: '100%', padding: '10px 12px', background: 'var(--navy-card)',
                border: '1px solid var(--navy-border)', borderRadius: '10px',
                color: 'var(--text-primary)', fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              {FIFA_STADIUMS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
              ))}
            </select>
          </div>

          {/* Language Selector (fan only) */}
          {persona === 'fan' && (
            <div>
              <label htmlFor="lang-select" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Response Language
              </label>
              <select
                id="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                style={{
                  width: '100%', padding: '10px 12px', background: 'var(--navy-card)',
                  border: '1px solid var(--navy-border)', borderRadius: '10px',
                  color: 'var(--text-primary)', fontSize: '0.88rem', cursor: 'pointer',
                }}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Live Zone Status */}
          {selectedStadium && (
            <div>
              <h2 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Live Zone Status
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedStadium.zones.map((zone) => {
                  const density = Math.round((zone.currentOccupancy / zone.capacity) * 100);
                  const color = density >= 90 ? 'var(--red-alert)' : density >= 75 ? 'var(--orange-alert)' : density >= 50 ? 'var(--amber-alert)' : 'var(--green-ok)';
                  return (
                    <div key={zone.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{zone.name}</span>
                        <span style={{ color, fontWeight: 600 }}>{density}%</span>
                      </div>
                      <div className="crowd-bar">
                        <div className="crowd-bar-fill" style={{ width: `${density}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Prompts */}
          <div>
            <h2 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Quick Prompts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {QUICK_PROMPTS[persona].map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  disabled={isLoading}
                  style={{
                    padding: '8px 12px', background: 'transparent', border: '1px solid var(--navy-border)',
                    borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--pitch-green)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--navy-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Chat Area ── */}
        <main
          id="main-content"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          aria-label="AI chat interface"
        >
          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            style={{
              flex: 1, overflowY: 'auto', padding: '24px', display: 'flex',
              flexDirection: 'column', gap: '16px',
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '420px', padding: '40px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }} aria-hidden="true">
                  {PERSONA_CONFIG[persona].icon}
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                  {PERSONA_CONFIG[persona].label}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                  {PERSONA_CONFIG[persona].desc}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '20px' }}>
                  Ask me anything or pick a quick prompt from the sidebar.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {msg.role === 'user' ? (
                  <div className="chat-bubble-user" aria-label={`You said: ${msg.content}`}>
                    {msg.content}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--pitch-green), var(--pitch-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', marginTop: '2px',
                      }}
                    >
                      {PERSONA_CONFIG[persona].icon}
                    </div>
                    <div className="chat-bubble-ai" aria-label={`ArenaMind replied: ${msg.content}`}>
                      {msg.content}
                    </div>
                  </div>
                )}
                <time
                  dateTime={msg.timestamp.toISOString()}
                  style={{
                    fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', marginLeft: msg.role === 'assistant' ? '42px' : 0,
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} aria-label="ArenaMind is typing">
                <div
                  aria-hidden="true"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--pitch-green), var(--pitch-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                  }}
                >
                  {PERSONA_CONFIG[persona].icon}
                </div>
                <div className="chat-bubble-ai" style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '14px 18px' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div role="alert" style={{
                padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.88rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <label htmlFor="chat-input" className="sr-only">Type your message</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${PERSONA_CONFIG[persona].label}... (Enter to send)`}
              disabled={isLoading}
              rows={1}
              aria-label="Chat message input"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="btn-primary"
              aria-label="Send message"
              style={{ padding: '12px 20px', flexShrink: 0, opacity: (!input.trim() || isLoading) ? 0.5 : 1 }}
            >
              {isLoading ? '...' : '→'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
