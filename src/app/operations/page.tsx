'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FIFA_STADIUMS, getCrowdDensity, getCrowdStatus, simulateOccupancyFluctuation } from '@/lib/stadiumData';

interface LiveZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  alertThreshold: number;
  amenities: readonly string[];
  density: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
}

interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  zone: string;
  time: Date;
}

const STATUS_BADGE: Record<string, { class: string; label: string; dot: string }> = {
  low: { class: 'badge-green', label: 'Normal', dot: '#22c55e' },
  moderate: { class: 'badge-amber', label: 'Moderate', dot: '#f59e0b' },
  high: { class: 'badge-orange', label: 'High', dot: '#f97316' },
  critical: { class: 'badge-red', label: 'CRITICAL', dot: '#ef4444' },
};

function generateAlerts(zones: LiveZone[]): Alert[] {
  const alerts: Alert[] = [];
  zones.forEach((zone) => {
    if (zone.status === 'critical') {
      alerts.push({
        id: zone.id,
        type: 'critical',
        message: `${zone.name} is at ${zone.density}% capacity — above ${zone.alertThreshold}% alert threshold. Immediate crowd dispersal recommended.`,
        zone: zone.name,
        time: new Date(),
      });
    } else if (zone.status === 'high') {
      alerts.push({
        id: `warn-${zone.id}`,
        type: 'warning',
        message: `${zone.name} approaching capacity (${zone.density}%). Consider redirecting incoming crowds.`,
        zone: zone.name,
        time: new Date(),
      });
    }
  });
  return alerts;
}

export default function OperationsPage() {
  const [selectedId, setSelectedId] = useState('metlife');
  const [zones, setZones] = useState<LiveZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const stadium = FIFA_STADIUMS.find((s) => s.id === selectedId)!;

  // Simulate live data updates every 15 seconds
  const refreshData = useCallback(() => {
    const liveZones: LiveZone[] = stadium.zones.map((zone) => {
      const occ = simulateOccupancyFluctuation(zone);
      const density = getCrowdDensity({ ...zone, currentOccupancy: occ });
      return { ...zone, currentOccupancy: occ, density, status: getCrowdStatus(density) };
    });
    setZones(liveZones);
    setAlerts(generateAlerts(liveZones));
    setLastUpdated(new Date());
  }, [stadium]);

  useEffect(() => {
    const timeout = setTimeout(refreshData, 0);
    const interval = setInterval(refreshData, 15_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [refreshData]);

  const getAiInsight = async () => {
    setIsLoadingInsight(true);
    setAiInsight('');
    try {
      const zonesSummary = zones.map((z) => `${z.name}: ${z.density}% (${z.status})`).join(', ');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a concise operational status briefing. Current zone data: ${zonesSummary}. Provide 3 bullet-point actionable recommendations for the operations team.`,
          persona: 'operations',
          stadiumId: selectedId,
          language: 'en',
          history: [],
        }),
      });
      const data = await res.json();
      if (data.success) setAiInsight(data.text);
    } catch {
      setAiInsight('Failed to fetch AI insight. Please check your API key configuration.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const totalOcc = useMemo(() => zones.reduce((acc, z) => acc + z.currentOccupancy, 0), [zones]);
  const overallDensity = useMemo(() => stadium ? Math.round((totalOcc / stadium.capacity) * 100) : 0, [totalOcc, stadium]);
  const overallStatus = useMemo(() => getCrowdStatus(overallDensity), [overallDensity]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px',
        borderBottom: '1px solid var(--navy-border)', background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" className="btn-ghost">← Back</Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>Operations Dashboard</h1>
        <span className="badge badge-green animate-pulse-glow" aria-live="polite">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Live · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </header>

      <main id="main-content" style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stadium selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <label htmlFor="ops-stadium" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Venue:
          </label>
          <select
            id="ops-stadium"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              padding: '10px 16px', background: 'var(--navy-card)', border: '1px solid var(--navy-border)',
              borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {FIFA_STADIUMS.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
            ))}
          </select>
          <button onClick={refreshData} className="btn-secondary" style={{ padding: '10px 18px' }}>
            🔄 Refresh
          </button>
          <button onClick={getAiInsight} disabled={isLoadingInsight} className="btn-primary" style={{ marginLeft: 'auto' }}>
            {isLoadingInsight ? '⏳ Analyzing...' : '🤖 AI Briefing'}
          </button>
        </div>

        {/* Summary Stats */}
        <section aria-labelledby="summary-heading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <h2 id="summary-heading" className="sr-only">Stadium Summary</h2>

          {[
            { label: 'Total Attendance', value: totalOcc.toLocaleString(), icon: '👥', sub: `of ${stadium?.capacity.toLocaleString()}` },
            { label: 'Overall Density', value: `${overallDensity}%`, icon: '📊', sub: STATUS_BADGE[overallStatus]?.label },
            { label: 'Active Alerts', value: String(alerts.length), icon: '🔔', sub: alerts.length > 0 ? 'Action required' : 'All clear' },
            { label: 'Zones Monitored', value: String(zones.length), icon: '🗺️', sub: stadium?.name },
          ].map((stat) => (
            <div key={stat.label} className="glass-card stat-card">
              <div style={{ fontSize: '1.5rem' }} aria-hidden="true">{stat.icon}</div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
            </div>
          ))}
        </section>

        {/* AI Insight Panel */}
        {aiInsight && (
          <section aria-label="AI operational briefing" className="glass-card animate-fade-in" style={{ padding: '20px', marginBottom: '28px', borderColor: 'rgba(0,200,81,0.3)' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--pitch-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🤖 AI Operational Briefing
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{aiInsight}</p>
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          {/* Zone Heatmap */}
          <section aria-labelledby="zones-heading" className="glass-card" style={{ padding: '24px' }}>
            <h2 id="zones-heading" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Zone Crowd Heatmap</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {zones.map((zone) => {
                const sb = STATUS_BADGE[zone.status];
                return (
                  <div key={zone.id} style={{
                    padding: '16px', borderRadius: '12px', border: `1px solid ${zone.status === 'critical' ? 'rgba(239,68,68,0.4)' : 'var(--navy-border)'}`,
                    background: zone.status === 'critical' ? 'rgba(239,68,68,0.05)' : 'rgba(26,34,55,0.5)',
                    transition: 'all 0.3s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{zone.name}</h3>
                      <span className={`badge ${sb.class}`} aria-label={`${zone.name} status: ${sb.label}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: sb.dot, display: 'inline-block' }} />
                        {sb.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <span>{zone.currentOccupancy.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                      <span style={{ fontWeight: 700, color: sb.dot }}>{zone.density}%</span>
                    </div>
                    <div className="crowd-bar" role="progressbar" aria-valuenow={zone.density} aria-valuemin={0} aria-valuemax={100} aria-label={`${zone.name} occupancy`}>
                      <div className="crowd-bar-fill" style={{ width: `${zone.density}%`, background: sb.dot }} />
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {zone.amenities.slice(0, 3).map((a) => (
                        <span key={a} style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{a}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Alerts Panel */}
          <aside aria-labelledby="alerts-heading" className="glass-card" style={{ padding: '20px' }}>
            <h2 id="alerts-heading" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              🔔 Active Alerts
              {alerts.length > 0 && <span className="badge badge-red">{alerts.length}</span>}
            </h2>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                <p style={{ fontSize: '0.85rem' }}>All zones are within safe limits.</p>
              </div>
            ) : (
              <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map((alert) => (
                  <div key={alert.id} role="listitem" style={{
                    padding: '12px', borderRadius: '10px',
                    background: alert.type === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                    border: `1px solid ${alert.type === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: alert.type === 'critical' ? '#ef4444' : '#f97316' }}>
                        {alert.type === 'critical' ? '🔴 CRITICAL' : '🟠 WARNING'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {alert.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Transport Status */}
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '24px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
              🚌 Transport Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stadium?.transportOptions.map((t) => (
                <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                  <span className={`badge ${t.currentStatus === 'normal' ? 'badge-green' : t.currentStatus === 'delayed' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                    {t.currentStatus}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
