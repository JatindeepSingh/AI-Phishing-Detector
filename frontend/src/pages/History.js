import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './History.module.css';

const VERDICT_CONFIG = {
  safe:       { label: 'Safe',       color: 'var(--safe)',   bg: 'var(--safe-bg)',   icon: '✅' },
  suspicious: { label: 'Suspicious', color: 'var(--warn)',   bg: 'var(--warn-bg)',   icon: '⚠️' },
  phishing:   { label: 'Phishing',   color: 'var(--danger)', bg: 'var(--danger-bg)', icon: '🚨' },
};

const TYPE_ICONS = { url: '🔗', email: '📧', text: '📄' };

function ScanRow({ scan, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const v = VERDICT_CONFIG[scan.result.verdict];

  return (
    <div className={styles.row}>
      <div className={styles.rowMain} onClick={() => setExpanded(!expanded)}>
        <div className={styles.rowLeft}>
          <span className={styles.typeIcon}>{TYPE_ICONS[scan.inputType]}</span>
          <div className={styles.rowContent}>
            <p className={styles.rowInput}>{scan.inputContent.substring(0, 80)}{scan.inputContent.length > 80 ? '...' : ''}</p>
            <span className={styles.rowDate}>{new Date(scan.scannedAt).toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.rowRight}>
          <span
            className={styles.verdictChip}
            style={{ color: v.color, background: v.bg, border: `1px solid ${v.color}33` }}
          >
            {v.icon} {v.label}
          </span>
          <span className={styles.riskScore} style={{ color: v.color }}>
            {scan.result.riskScore}
          </span>
          <span className={styles.chevron} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            ▾
          </span>
        </div>
      </div>

      {expanded && (
        <div className={styles.rowDetail}>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>Confidence</span>
              <span className={styles.detailVal}>{scan.result.confidence}%</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>Type</span>
              <span className={styles.detailVal}>{scan.inputType.toUpperCase()}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>Flags Found</span>
              <span className={styles.detailVal}>{scan.result.flags.length}</span>
            </div>
          </div>

          {scan.result.flags.length > 0 && (
            <div className={styles.detailFlags}>
              <span className={styles.detailKey}>Issues:</span>
              <ul className={styles.flagList}>
                {scan.result.flags.map((f, i) => (
                  <li key={i} className={styles.flagListItem}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.detailFull}>
            <span className={styles.detailKey}>Full Content:</span>
            <p className={styles.detailFullText}>{scan.inputContent}</p>
          </div>

          <button className={styles.deleteBtn} onClick={() => onDelete(scan._id)}>
            🗑 Delete this scan
          </button>
        </div>
      )}
    </div>
  );
}

export default function History() {
  const [scans, setScans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters]     = useState({ verdict: '', type: '' });

  const fetchScans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      const { data } = await axios.get('/api/history', { params });
      setScans(data.scans);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchScans(1); }, [fetchScans]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scan?')) return;
    await axios.delete(`/api/history/${id}`);
    fetchScans(pagination.page);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL scan history? This cannot be undone.')) return;
    await axios.delete('/api/history');
    fetchScans(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Scan History</h1>
          <p className={styles.subtitle}>{pagination.total} total scans recorded</p>
        </div>
        {scans.length > 0 && (
          <button className={styles.clearAllBtn} onClick={handleClearAll}>
            🗑 Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filters.verdict}
          onChange={e => handleFilterChange('verdict', e.target.value)}
        >
          <option value="">All Verdicts</option>
          <option value="safe">✅ Safe</option>
          <option value="suspicious">⚠️ Suspicious</option>
          <option value="phishing">🚨 Phishing</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.type}
          onChange={e => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="url">🔗 URL</option>
          <option value="email">📧 Email</option>
          <option value="text">📄 Text</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className={styles.loader}><div className={styles.spinner} /></div>
      ) : scans.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <p>No scans found</p>
          <span>Try adjusting the filters or run a new scan</span>
        </div>
      ) : (
        <div className={styles.list}>
          {scans.map(scan => (
            <ScanRow key={scan._id} scan={scan} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={pagination.page <= 1}
            onClick={() => fetchScans(pagination.page - 1)}
          >← Prev</button>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchScans(pagination.page + 1)}
          >Next →</button>
        </div>
      )}
    </div>
  );
}