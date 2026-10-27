// ============================================================
// ARGOTURO ERP — Trial Balance (Neraca Saldo Rekonsiliasi)
// ============================================================

import React from 'react';
import { Scale, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TrialBalanceView() {
  const { store } = useApp();

  // Compute trial balance debit and credit columns
  let totalDebitCol = 0;
  let totalCreditCol = 0;

  const trialRows = store.accounts.map((acc) => {
    let debit = 0;
    let credit = 0;

    if (acc.normalBalance === 'debit') {
      if (acc.currentBalance >= 0) {
        debit = acc.currentBalance;
      } else {
        credit = Math.abs(acc.currentBalance);
      }
    } else {
      // normal balance credit
      if (acc.currentBalance >= 0) {
        credit = acc.currentBalance;
      } else {
        debit = Math.abs(acc.currentBalance);
      }
    }

    totalDebitCol += debit;
    totalCreditCol += credit;

    return {
      account: acc,
      debit,
      credit,
    };
  });

  const isBalanced = Math.abs(totalDebitCol - totalCreditCol) < 0.01;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Neraca Saldo Percobaan (Trial Balance)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Rekonsiliasi total saldo debit dan kredit seluruh bagan akun pembukuan
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: isBalanced ? '#f0fdf4' : '#fef2f2',
            border: isBalanced ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: isBalanced ? '#15803d' : '#b91c1c',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          <Scale size={16} />
          {isBalanced ? 'Status: 100% RECONCILED & BALANCED' : 'Status: UNBALANCED'}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>Kode Akun</th>
              <th>Nama Akun</th>
              <th>Klasifikasi</th>
              <th style={{ textAlign: 'right' }}>Debit (IDR)</th>
              <th style={{ textAlign: 'right' }}>Kredit (IDR)</th>
            </tr>
          </thead>
          <tbody>
            {trialRows.map((row) => (
              <tr key={row.account.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.account.code}</td>
                <td style={{ fontWeight: 500 }}>{row.account.name}</td>
                <td>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b' }}>
                    {row.account.type || row.account.category}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: row.debit > 0 ? 600 : 400 }}>
                  {row.debit > 0 ? `Rp ${row.debit.toLocaleString('id-ID')}` : '—'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: row.credit > 0 ? 600 : 400 }}>
                  {row.credit > 0 ? `Rp ${row.credit.toLocaleString('id-ID')}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800, fontSize: 13.5 }}>
              <td colSpan={3} style={{ textAlign: 'right' }}>TOTAL NERACA SALDO:</td>
              <td style={{ textAlign: 'right', color: '#10b981' }}>
                Rp {totalDebitCol.toLocaleString('id-ID')}
              </td>
              <td style={{ textAlign: 'right', color: '#10b981' }}>
                Rp {totalCreditCol.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
