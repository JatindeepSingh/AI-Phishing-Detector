import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import styles from './Dashboard.module.css';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={styles.statCard} style={{ '--card-color': color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statInfo}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{label}</p>
        <p className={styles.tooltipVal}>{payload[0].value} scans</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
    </div>
  );

  const verdictData = stats ? [
    { name: 'Safe', value: stats.verdicts.safe, color: 'var(--safe)' },
    { name: 'Suspicious', value: stats.verdicts.suspicious, color: 'var(--warn)' },
    { name: 'Phishing', value: stats.verdicts.phishing, color: 'var(--danger)' },
  ] : [];

  const activityData = stats?.recentActivity?.map(d => ({
    date: d._id.slice(5),
    scans: d.count
  })) || [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'},{' '}
            <span className={styles.accent}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className={styles.subtitle}>Here's your phishing detection overview</p>
        </div>
        <button className={styles.scanBtn} onClick={() => navigate('/scanner')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          New Scan
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Scans"
          value={stats?.totalScans ?? 0}
          color="var(--accent)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        />
        <StatCard
          label="Threats Detected"
          value={(stats?.verdicts?.phishing ?? 0) + (stats?.verdicts?.suspicious ?? 0)}
          color="var(--danger)"
          sub={`${stats?.threatRate ?? 0}% threat rate`}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <StatCard
          label="Safe Results"
          value={stats?.verdicts?.safe ?? 0}
          color="var(--safe)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <StatCard
          label="Avg Risk Score"
          value={`${stats?.avgRiskScore ?? 0}`}
          color="var(--warn)"
          sub="out of 100"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Verdict Breakdown</h3>
          {stats?.totalScans === 0 ? (
            <div className={styles.empty}>No scans yet</div>
          ) : (
            <div className={styles.verdictBars}>
              {verdictData.map(v => (
                <div key={v.name} className={styles.verdictRow}>
                  <span className={styles.verdictName}>{v.name}</span>
                  <div className={styles.verdictTrack}>
                    <div
                      className={styles.verdictFill}
                      style={{
                        width: stats.totalScans > 0 ? `${(v.value / stats.totalScans) * 100}%` : '0%',
                        background: v.color
                      }}
                    />
                  </div>
                  <span className={styles.verdictCount} style={{ color: v.color }}>{v.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Scan Types</h3>
          {stats?.totalScans === 0 ? (
            <div className={styles.empty}>No scans yet</div>
          ) : (
            <div className={styles.typeGrid}>
              {[
                { key: 'url', label: 'URLs', icon: '🔗' },
                { key: 'email', label: 'Emails', icon: '📧' },
                { key: 'text', label: 'Text', icon: '📄' },
              ].map(t => (
                <div key={t.key} className={styles.typeCard}>
                  <span className={styles.typeIcon}>{t.icon}</span>
                  <span className={styles.typeCount}>{stats?.types?.[t.key] ?? 0}</span>
                  <span className={styles.typeLabel}>{t.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.chartCard} ${styles.wide}`}>
          <h3 className={styles.chartTitle}>7-Day Activity</h3>
          {activityData.length === 0 ? (
            <div className={styles.empty}>No recent activity</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={activityData} barSize={24}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
                <Bar dataKey="scans" radius={[4, 4, 0, 0]}>
                  {activityData.map((_, i) => (
                    <Cell key={i} fill={i === activityData.length - 1 ? 'var(--accent)' : 'var(--surface)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {stats?.totalScans === 0 && (
        <div className={styles.quickStart}>
          <h3>Ready to detect threats?</h3>
          <p>Scan a URL, email, or text message using our AI-powered engine.</p>
          <button className={styles.scanBtn} onClick={() => navigate('/scanner')}>
            Start Your First Scan →
          </button>
        </div>
      )}
    </div>
  );
}