// ============================================================
// ARGOTURO ERP — System Audit Trail & Compliance Log
// ============================================================

import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AuditTrailView() {
  const { store } = useApp();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = store.activityLogs.filter((log) => {
    if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        (log.entityNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Jejak Audit Sistem & Kepatuhan (System Audit Trail)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Log aktivitas tidak dapat diubah (immutable log) yang merekam setiap pembuatan, persetujuan, dan mutasi data
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari user, no. dokumen, atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="input"
          style={{ width: 220 }}
        >
          <option value="all">Semua Modul Sistem</option>
          <option value="sales">CRM & Sales</option>
          <option value="purchasing">Procurement</option>
          <option value="inventory">Inventory & Gudang</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="finance">Finance & GL</option>
          <option value="hr">People & HR</option>
          <option value="approval">Otorisasi & Approval</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>Waktu Stempel</th>
              <th>Modul</th>
              <th>Aksi</th>
              <th>No. Referensi Dokumen</th>
              <th>Pengguna</th>
              <th>Peran Otoritas</th>
              <th>Deskripsi Lengkap Transaksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>
                    {new Date(log.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '2px 6px',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    {log.module}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      color:
                        log.action === 'created' || log.action === 'posted'
                          ? '#16a34a'
                          : log.action === 'approved' || log.action === 'confirmed'
                          ? '#2563eb'
                          : log.action === 'rejected'
                          ? '#dc2626'
                          : '#475569',
                    }}
                  >
                    {log.action.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{log.entityNumber}</td>
                <td>
                  <strong>{log.user}</strong>
                </td>
                <td>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{log.role}</span>
                </td>
                <td style={{ color: '#334155' }}>{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
