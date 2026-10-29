// ============================================================
// ARGOTURO ERP — Chart of Accounts (COA)
// ============================================================

import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
          Chart of Accounts (COA)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Standard enterprise 5-digit account classifications and real-time general ledger balances
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Search by account code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input"
          style={{ width: 240 }}
        >
          <option value="all">All Classifications</option>
          <option value="asset">10000 — Assets</option>
          <option value="liability">20000 — Liabilities</option>
          <option value="equity">30000 — Equity</option>
          <option value="revenue">40000 — Operating Revenue</option>
          <option value="expense">50000 & 60000 — Expenses & COGS</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Classification</th>
              <th>Category</th>
              <th>Normal Balance</th>
              <th style={{ textAlign: 'right' }}>Real-Time Balance</th>
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
                  IDR {Math.abs(acc.currentBalance).toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
