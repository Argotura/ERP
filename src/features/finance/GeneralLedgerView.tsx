// ============================================================
// ARGOTURO ERP — General Ledger (Buku Besar Per Akun)
// ============================================================

import React, { useState } from 'react';
import { BookOpen, Search, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function GeneralLedgerView() {
  const { store } = useApp();
  const [selectedAccountCode, setSelectedAccountCode] = useState(store.accounts[0]?.code || '11120');

  const selectedAccount = store.accounts.find((a) => a.code === selectedAccountCode);

  // Collect all journal lines for this account
  const ledgerLines: {
    date: string;
    entryNumber: string;
    description: string;
    reference: string;
    debit: number;
    credit: number;
  }[] = [];

  store.journalEntries.forEach((je) => {
    je.lines.forEach((l) => {
      if (l.accountCode === selectedAccountCode) {
        ledgerLines.push({
          date: je.date,
          entryNumber: je.entryNumber,
          description: l.memo || je.description,
          reference: je.referenceNumber,
          debit: l.debit,
          credit: l.credit,
        });
      }
    });
  });

  const totalDebit = ledgerLines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = ledgerLines.reduce((s, l) => s + l.credit, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Buku Besar Akun (General Ledger Detail)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Rincian kronologis setiap posting debit dan kredit per akun dengan running balance
        </p>
      </div>

      {/* Account Picker */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Pilih Akun Buku Besar:</span>
        <select
          value={selectedAccountCode}
          onChange={(e) => setSelectedAccountCode(e.target.value)}
          className="input"
          style={{ width: 380, fontWeight: 600 }}
        >
          {store.accounts.map((a) => (
            <option key={a.id} value={a.code}>
              {a.code} — {a.name} (Saldo: Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')})
            </option>
          ))}
        </select>
      </div>

      {/* Account Summary Card */}
      {selectedAccount && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            padding: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Klasifikasi Akun:</span>
            <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{selectedAccount.type || selectedAccount.category}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Saldo Normal:</span>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedAccount.normalBalance}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Akumulasi Debit:</span>
            <div style={{ fontWeight: 600, color: '#3b82f6' }}>Rp {totalDebit.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Saldo Bersih Saat Ini:</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
              Rp {Math.abs(selectedAccount.currentBalance).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}

      {/* Ledger Lines Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No. Jurnal</th>
              <th>Keterangan Transaksi</th>
              <th>No. Referensi</th>
              <th style={{ textAlign: 'right' }}>Debit (Rp)</th>
              <th style={{ textAlign: 'right' }}>Kredit (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {ledgerLines.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada mutasi transaksi untuk akun ini.
                </td>
              </tr>
            ) : (
              ledgerLines.map((l, idx) => (
                <tr key={idx}>
                  <td>{new Date(l.date).toLocaleDateString('id-ID')}</td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{l.entryNumber}</td>
                  <td>{l.description}</td>
                  <td>
                    <span style={{ color: '#3b82f6' }}>{l.reference}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 600 : 400 }}>
                    {l.debit > 0 ? `Rp ${l.debit.toLocaleString('id-ID')}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 600 : 400 }}>
                    {l.credit > 0 ? `Rp ${l.credit.toLocaleString('id-ID')}` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
              <td colSpan={4} style={{ textAlign: 'right' }}>TOTAL MUTASI:</td>
              <td style={{ textAlign: 'right', color: '#10b981' }}>Rp {totalDebit.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', color: '#10b981' }}>Rp {totalCredit.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
