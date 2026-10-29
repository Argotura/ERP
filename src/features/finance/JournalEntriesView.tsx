// ============================================================
// ARGOTURO ERP — Journal Entries (Double-Entry General Journal)
// ============================================================

import React, { useState } from 'react';
import { Plus, Eye, Scale } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JournalEntry } from '../../types';

export default function JournalEntriesView() {
  const { store, createJournalEntry, addToast } = useApp();
  const [selectedJE, setSelectedJE] = useState<JournalEntry | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [description, setDescription] = useState('Office supplies depreciation adjustment');
  const [referenceType, setReferenceType] = useState<JournalEntry['referenceType']>('Manual');
  const [lines, setLines] = useState([
    { accountCode: '61900', accountName: 'Other Operating Expenses', debit: 1500000, credit: 0, memo: 'Office supplies expense' },
    { accountCode: '11120', accountName: 'BCA Operational Bank', debit: 0, credit: 1500000, memo: 'Supplies settlement payment' },
  ]);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      addToast('warning', `Journal is unbalanced! Total Debit (IDR ${totalDebit.toLocaleString()}) must equal Total Credit (IDR ${totalCredit.toLocaleString()})`);
      return;
    }

    createJournalEntry({
      date: new Date().toISOString(),
      referenceType,
      referenceNumber: `MAN-${Date.now().toString().slice(-4)}`,
      description,
      lines: lines.map((l, i) => ({
        id: `jel-${Date.now()}-${i}`,
        accountCode: l.accountCode,
        accountName: store.accounts.find((a) => a.code === l.accountCode)?.name || l.accountName,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo,
      })),
      status: 'posted',
      postedBy: store.activeUserId,
    });

    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            General Journal Entries
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Automated & manual financial transactions strictly balanced with double-entry validation (Debit = Credit)
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Create Manual Journal
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Voucher No.</th>
              <th>Posting Date</th>
              <th>Doc Type</th>
              <th>Memo / Description</th>
              <th style={{ textAlign: 'right' }}>Total Debit</th>
              <th style={{ textAlign: 'right' }}>Total Credit</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.journalEntries.map((je) => (
              <tr key={je.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 4,
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                    }}
                  >
                    POSTED
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{je.entryNumber}</td>
                <td>{new Date(je.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {je.referenceType.toUpperCase()}
                  </span>
                </td>
                <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {je.description}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  IDR {je.totalDebit.toLocaleString('en-US')}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  IDR {je.totalCredit.toLocaleString('en-US')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedJE(je)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    <Eye size={12} /> View Lines
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Journal Lines Drawer Modal */}
      {selectedJE && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 650,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Journal Voucher Lines: {selectedJE.entryNumber}
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Reference: {selectedJE.referenceNumber} ({selectedJE.referenceType})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJE(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#334155', marginBottom: 14 }}>
              <strong>Description:</strong> {selectedJE.description}
            </p>

            <table className="data-table" style={{ width: '100%', fontSize: 12.5, marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Line Memo</th>
                  <th style={{ textAlign: 'right' }}>Debit (IDR)</th>
                  <th style={{ textAlign: 'right' }}>Credit (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {selectedJE.lines.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.accountCode}</td>
                    <td style={{ fontWeight: 500 }}>{l.accountName}</td>
                    <td style={{ color: '#64748b' }}>{l.memo}</td>
                    <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 600 : 400 }}>
                      {l.debit > 0 ? `IDR ${l.debit.toLocaleString('en-US')}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 600 : 400 }}>
                      {l.credit > 0 ? `IDR ${l.credit.toLocaleString('en-US')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan={3} style={{ textAlign: 'right' }}>TOTAL:</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>
                    IDR {selectedJE.totalDebit.toLocaleString('en-US')}
                  </td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>
                    IDR {selectedJE.totalCredit.toLocaleString('en-US')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedJE(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <form
            onSubmit={handleCreate}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 680,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Input Manual Double-Entry Journal</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Journal Description / Memo:
              </label>
              <input
                type="text"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Debit & Credit Account Lines:
              </label>
              {lines.map((l, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <select
                    value={l.accountCode}
                    onChange={(e) => {
                      const updated = [...lines];
                      const matched = store.accounts.find((a) => a.code === e.target.value);
                      updated[idx].accountCode = e.target.value;
                      updated[idx].accountName = matched ? matched.name : '';
                      setLines(updated);
                    }}
                    className="input"
                    style={{ flex: 2 }}
                  >
                    {store.accounts.map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="input"
                    placeholder="Debit"
                    value={l.debit || ''}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].debit = parseInt(e.target.value, 10) || 0;
                      setLines(updated);
                    }}
                    style={{ width: 130 }}
                  />

                  <input
                    type="number"
                    className="input"
                    placeholder="Credit"
                    value={l.credit || ''}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].credit = parseInt(e.target.value, 10) || 0;
                      setLines(updated);
                    }}
                    style={{ width: 130 }}
                  />
                </div>
              ))}
            </div>

            {/* Balance Indicator */}
            <div
              style={{
                backgroundColor: isBalanced ? '#f0fdf4' : '#fef2f2',
                border: isBalanced ? '1px solid #bbf7d0' : '1px solid #fecaca',
                borderRadius: 6,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={16} color={isBalanced ? '#16a34a' : '#dc2626'} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: isBalanced ? '#166534' : '#991b1b' }}>
                  {isBalanced ? '✓ Balanced Double-Entry Journal' : '✕ Unbalanced Journal (Debit !== Credit)'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                Debit: IDR {totalDebit.toLocaleString('en-US')} | Credit: IDR {totalCredit.toLocaleString('en-US')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!isBalanced}>
                Post Journal to General Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
