// ============================================================
// NEXORA ERP — Audit Trail & Compliance Log (Jejak Aktivitas)
// ============================================================

import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { activityLabel, relativeTime } from '../../utils/helpers';

export default function AuditTrailView() {
  const { store } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const logs = store.activityLogs || [];

  const filteredLogs = logs.filter((log) => {
    if (entityFilter && log.entityType !== entityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        log.summary.toLowerCase().includes(q) ||
        log.entityName.toLowerCase().includes(q) ||
        activityLabel(log.action).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Enterprise Audit Trail & System Log (Jejak Aktivitas)</h2>
          <p>Immutable regulatory audit log of all master data changes, inventory entries, price revisions, and security events</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search action, entity name, audit summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="">All Entity Scopes</option>
          <option value="product">Products</option>
          <option value="stock">Stock & Logistics</option>
          <option value="category">Categories</option>
          <option value="supplier">Suppliers</option>
          <option value="system">System Events</option>
        </select>

        <div className="results-info">
          Showing {filteredLogs.length} audit entry record(s)
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Action Event</th>
                <th style={{ width: 110 }}>Scope</th>
                <th>Target Entity</th>
                <th>Audit Summary & Description</th>
                <th style={{ width: 130 }}>Occurred</th>
                <th style={{ width: 170 }}>Exact Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <History className="empty-state-icon" />
                      <h3>No audit log entries match your filter</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                        {activityLabel(log.action)}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                      {log.entityType}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.entityName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.summary}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {relativeTime(log.timestamp)}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }} className="td-sku">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

