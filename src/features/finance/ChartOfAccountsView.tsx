// ============================================================
// ARGOTURO ERP — Chart of Accounts (Bagan Akun Standar / COA)
// ============================================================

import React, { useState } from 'react';
import { BookOpen, Search, Filter, Layers, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ChartOfAccountsView() {
  const { store } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAccounts = store.accounts.filter((acc) => {
    const accType = (acc.type || acc.category).toLowerCase();
    if (typeFilter !== 'all' && !accType.includes(typeFilter.toLowerCase())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return acc.name.toLowerCase().includes(q) || acc.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Bagan Akun Standar (Chart of Accounts / COA)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Struktur kode akun akuntansi 5-digit standar Indonesia dan saldo real-time dari jurnal umum
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari kode atau nama akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input"
          style={{ width: 220 }}
        >
          <option value="all">Semua Klasifikasi Akun</option>
          <option value="asset">10000 — Aktiva / Aset</option>
          <option value="liability">20000 — Kewajiban / Hutang</option>
          <option value="equity">30000 — Modal / Ekuitas</option>
          <option value="revenue">40000 — Pendapatan Usaha</option>
          <option value="expense">50000 & 60000 — Beban & HPP</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Kode Akun</th>
              <th>Nama Akun</th>
              <th>Klasifikasi</th>
              <th>Kategori</th>
              <th>Saldo Normal</th>
              <th style={{ textAlign: 'right' }}>Saldo Real-Time Saat Ini</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc.id}>
                <td style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{acc.code}</td>
                <td>
                  <span style={{ fontWeight: 600 }}>{acc.name}</span>
                </td>
                <td>
                  {(() => {
                    const t = (acc.type || acc.category).toLowerCase();
                    return (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 4,
                          backgroundColor:
                            t.includes('asset')
                              ? '#eff6ff'
                              : t.includes('liabilit')
                              ? '#fef3c7'
                              : t.includes('revenue')
                              ? '#dcfce7'
                              : '#fee2e2',
                          color:
                            t.includes('asset')
                              ? '#1d4ed8'
                              : t.includes('liabilit')
                              ? '#b45309'
                              : t.includes('revenue')
                              ? '#15803d'
                              : '#b91c1c',
                        }}
                      >
                        {(acc.type || acc.category).toUpperCase()}
                      </span>
                    );
                  })()}
                </td>
                <td>{acc.category}</td>
                <td style={{ textTransform: 'capitalize' }}>{acc.normalBalance}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: acc.currentBalance >= 0 ? '#1e293b' : '#ef4444' }}>
                  Rp {Math.abs(acc.currentBalance).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
