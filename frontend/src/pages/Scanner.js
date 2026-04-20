import React, { useState } from 'react';
import axios from 'axios';
import styles from './Scanner.module.css';

const TABS = [
  { key: 'url', label: 'URL', icon: '🔗', placeholder: 'Paste a URL to scan e.g. https://suspicious-site.com/login' },
  { key: 'email', label: 'Email', icon: '📧', placeholder: 'Paste the full email content here including subject, body and any links...' },
  { key: 'text', label: 'Text', icon: '📄', placeholder: 'Paste any suspicious message or text content here...' },
];

const VerdictBadge = ({ verdict }) => {
  const map = {
    safe:       { label: 'SAFE',       color: 'var(--safe)',   bg: 'var(--safe-bg)',   icon: '✅' },
    suspicious: { label: 'SUSPICIOUS', color: 'var(--warn)',   bg: 'var(--warn-bg)',   icon: '⚠️' },
    phishing:   { label: 'PHISHING',   color: 'var(--danger)', bg: 'var(--danger-bg)', icon: '🚨' },
  };
  const v = map[verdict] || map.safe;
  return (
    <span className={styles.badge} style={{ color: v.color, background: v.bg, border: `1px solid ${v.color}44` }}>
      {v.icon} {v.label}
    </span>
  );
};

const RiskMeter = ({ score }) => {
  const color = score >= 60 ? 'var(--danger)' : score >= 30 ? 'var(--warn)' : 'var(--safe)';
  return (
    <div className={styles.meterWrap}>
      <div className={styles.meterHeader}>
        <span className={styles.meterLabel}>Risk Score</span>
        <span className={styles.meterScore} style={{ color }}>
          {score}<span className={styles.meterMax}>/100</span>
        </span>
      </div>
      <div className={styles.meterTrack}>
        <div className={styles.meterFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <div className={styles.meterScale}>
        <span>Safe (0–29)</span><span>Suspicious (30–59)</span><span>Phishing (60+)</span>
      </div>
    </div>
  );
};

export default function Scanner() {
  const [activeTab, setActiveTab] = useState('url');
  const [content, setContent]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');

  const currentTab = TABS.find(t => t.key === activeTab);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setContent('');
    setResult(null);
    setError('');
  };

  const handleScan = async () => {
    if (!content.trim()) return setError('Please enter some content to scan');
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/scan', {
        inputType: activeTab,
        content: content.trim()
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setResult(null);
    setError('');
  };

  const loadSample = (type, text) => {
    setActiveTab(type);
    setContent(text);
    setResult(null);
    setError('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Phishing Scanner</h1>
        <p className={styles.subtitle}>
          Analyze URLs, emails, and text using our ML-powered detection engine
        </p>
      </div>

      <div className={styles.layout}>
        {/* ── Input Panel ── */}
        <div className={styles.inputPanel}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputBox}>
            <textarea
              className={styles.textarea}
              placeholder={currentTab.placeholder}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={activeTab === 'url' ? 3 : 10}
            />
            <div className={styles.inputFooter}>
              <span className={styles.charCount}>{content.length} chars</span>
              {content && (
                <button className={styles.clearBtn} onClick={handleClear}>Clear</button>
              )}
            </div>
          </div>

          {error && <div className={styles.error}>⚠ {error}</div>}

          <button
            className={styles.scanBtn}
            onClick={handleScan}
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <><div className={styles.btnSpinner} /> Analyzing...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Scan Now
              </>
            )}
          </button>

          <div className={styles.samples}>
            <span className={styles.samplesLabel}>Try a sample:</span>
            <button className={styles.sampleBtn} onClick={() =>
              loadSample('url', 'http://paypa1-secure-login.tk/verify?token=abc123&user=victim')
            }>Phishing URL</button>
            <button className={styles.sampleBtn} onClick={() =>
              loadSample('email', 'Dear Customer,\n\nUrgent! Your PayPal account has been suspended due to unusual activity. Click here immediately to verify your account: http://paypal-secure-login.ru/verify\n\nAct now or your account will be permanently closed!\n\nPayPal Security Team')
            }>Phishing Email</button>
            <button className={styles.sampleBtn} onClick={() =>
              loadSample('url', 'https://www.google.com')
            }>Safe URL</button>
          </div>
        </div>

        {/* ── Result Panel ── */}
        <div className={styles.resultPanel}>
          {!result && !loading && (
            <div className={styles.resultEmpty}>
              <div className={styles.emptyIcon}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <p>Scan results will appear here</p>
              <span>Paste content on the left and click Scan Now</span>
            </div>
          )}

          {loading && (
            <div className={styles.scanning}>
              <div className={styles.scanRing}>
                <div className={styles.scanRingInner} />
                <div className={styles.scanRingPulse} />
              </div>
              <p className={styles.scanningText}>Analyzing content...</p>
              <span className={styles.scanningSubtext}>Running ML + NLP detection pipeline</span>
            </div>
          )}

          {result && !loading && (
            <div className={`${styles.result} fadeIn`}>
              <div className={styles.resultHeader}>
                <VerdictBadge verdict={result.result.verdict} />
                <span className={styles.confidence}>
                  {result.result.confidence}% confidence
                </span>
              </div>

              <RiskMeter score={result.result.riskScore} />

              {result.result.flags.length > 0 ? (
                <div className={styles.flagsSection}>
                  <h4 className={styles.flagsTitle}>
                    🚩 Detected Issues ({result.result.flags.length})
                  </h4>
                  <ul className={styles.flagsList}>
                    {result.result.flags.map((flag, i) => (
                      <li key={i} className={styles.flagItem}>
                        <span className={styles.flagDot} />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={styles.noFlags}>✅ No suspicious patterns detected</div>
              )}

              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Scan ID</span>
                  <span className={`${styles.metaVal} ${styles.mono}`}>{result.scanId?.slice(-8)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Type</span>
                  <span className={styles.metaVal}>{result.result.details?.inputType?.toUpperCase()}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Engine</span>
                  <span className={styles.metaVal}>ML Heuristic + NLP v2.1</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Scanned At</span>
                  <span className={styles.metaVal}>{new Date(result.scannedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}