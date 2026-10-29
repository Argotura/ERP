// ============================================================
// ARGOTURO ERP — General Ledger (Account Audit Ledger)
// ============================================================

import React, { useState } from 'react';
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
          General Ledger Detail
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Chronological audit trail of debit and credit postings per account with running balance tracking
        </p>
      </div>

      {/* Account Picker */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Select General Ledger Account:</span>
        <select
          value={selectedAccountCode}
          onChange={(e) => setSelectedAccountCode(e.target.value)}
          className="input"
          style={{ width: 420, fontWeight: 600 }}
        >
          {store.accounts.map((a) => (
            <option key={a.id} value={a.code}>
              {a.code} — {a.name} (Balance: IDR {Math.abs(a.currentBalance).toLocaleString('en-US')})
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
            <span style={{ fontSize: 11, color: '#64748b' }}>Account Classification:</span>
            <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{selectedAccount.type || selectedAccount.category}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Normal Balance:</span>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedAccount.normalBalance}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Total Debits:</span>
            <div style={{ fontWeight: 600, color: '#3b82f6' }}>IDR {totalDebit.toLocaleString('en-US')}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b' }}>Current Net Balance:</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
              IDR {Math.abs(selectedAccount.currentBalance).toLocaleString('en-US')}
            </div>
          </div>
        </div>
      )}

      {/* Ledger Lines Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Voucher No.</th>
              <th>Transaction Description</th>
              <th>Reference No.</th>
              <th style={{ textAlign: 'right' }}>Debit (IDR)</th>
              <th style={{ textAlign: 'right' }}>Credit (IDR)</th>
            </tr>
          </thead>
          <tbody>
            {ledgerLines.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No transaction activity posted for this account.
                </td>
              </tr>
            ) : (
              ledgerLines.map((l, idx) => (
                <tr key={idx}>
                  <td>{new Date(l.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{l.entryNumber}</td>
                  <td>{l.description}</td>
                  <td>
                    <span style={{ color: '#3b82f6' }}>{l.reference}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 600 : 400 }}>
                    {l.debit > 0 ? `IDR ${l.debit.toLocaleString('en-US')}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 600 : 400 }}>
                    {l.credit > 0 ? `IDR ${l.credit.toLocaleString('en-US')}` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
              <td colSpan={4} style={{ textAlign: 'right' }}>TOTAL TRANSACTIONS:</td>
              <td style={{ textAlign: 'right', color: '#10b981' }}>IDR {totalDebit.toLocaleString('en-US')}</td>
              <td style={{ textAlign: 'right', color: '#10b981' }}>IDR {totalCredit.toLocaleString('en-US')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
