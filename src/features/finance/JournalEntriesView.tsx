// ============================================================
// ARGOTURO ERP — Journal Entries (Jurnal Umum Double-Entry)
// ============================================================

import React, { useState } from 'react';
import { FileText, Plus, CheckCircle2, AlertCircle, Eye, Scale } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JournalEntry } from '../../types';

export default function JournalEntriesView() {
  const { store, createJournalEntry, addToast } = useApp();
  const [selectedJE, setSelectedJE] = useState<JournalEntry | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [description, setDescription] = useState('Penyesuaian biaya penyusutan perlengkapan kantor');
  const [referenceType, setReferenceType] = useState<JournalEntry['referenceType']>('Manual');
  const [lines, setLines] = useState([
    { accountCode: '61900', accountName: 'Beban Operasional Lainnya', debit: 1500000, credit: 0, memo: 'Beban perlengkapan' },
    { accountCode: '11120', accountName: 'Bank BCA Operasional', debit: 0, credit: 1500000, memo: 'Pembayaran perlengkapan' },
  ]);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      addToast('warning', `Jurnal tidak seimbang! Total Debit (Rp ${totalDebit.toLocaleString()}) harus sama dengan Total Credit (Rp ${totalCredit.toLocaleString()})`);
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
            Jurnal Umum Akuntansi (General Journal Entries)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Seluruh transaksi finansial otomatis & manual dengan validasi double-entry (Debit = Credit)
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Buat Jurnal Manual
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Bukti Jurnal</th>
              <th>Tanggal Posting</th>
              <th>Tipe Dokumen</th>
              <th>Keterangan / Memo</th>
              <th style={{ textAlign: 'right' }}>Total Debit (Rp)</th>
              <th style={{ textAlign: 'right' }}>Total Kredit (Rp)</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
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
                <td>{new Date(je.date).toLocaleDateString('id-ID')}</td>
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
                  Rp {je.totalDebit.toLocaleString('id-ID')}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  Rp {je.totalCredit.toLocaleString('id-ID')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedJE(je)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    <Eye size={12} /> Baris Jurnal
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
                  Rincian Baris Jurnal: {selectedJE.entryNumber}
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Referensi: {selectedJE.referenceNumber} ({selectedJE.referenceType})
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
              <strong>Keterangan:</strong> {selectedJE.description}
            </p>

            <table className="data-table" style={{ width: '100%', fontSize: 12.5, marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Kode Akun</th>
                  <th>Nama Akun</th>
                  <th>Memo Baris</th>
                  <th style={{ textAlign: 'right' }}>Debit (Rp)</th>
                  <th style={{ textAlign: 'right' }}>Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {selectedJE.lines.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.accountCode}</td>
                    <td style={{ fontWeight: 500 }}>{l.accountName}</td>
                    <td style={{ color: '#64748b' }}>{l.memo}</td>
                    <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 600 : 400 }}>
                      {l.debit > 0 ? `Rp ${l.debit.toLocaleString('id-ID')}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 600 : 400 }}>
                      {l.credit > 0 ? `Rp ${l.credit.toLocaleString('id-ID')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan={3} style={{ textAlign: 'right' }}>TOTAL:</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>
                    Rp {selectedJE.totalDebit.toLocaleString('id-ID')}
                  </td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>
                    Rp {selectedJE.totalCredit.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedJE(null)}>
                Tutup
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Input Jurnal Manual Double-Entry</h3>
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
                Keterangan / Memo Jurnal:
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
                Baris Akun Debit & Kredit:
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
                    placeholder="Kredit"
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
                  {isBalanced ? '✓ Jurnal Seimbang (Balanced)' : '✕ Jurnal Tidak Seimbang (Unbalanced)'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                Debit: Rp {totalDebit.toLocaleString('id-ID')} | Kredit: Rp {totalCredit.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={!isBalanced}>
                Posting Jurnal ke Buku Besar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
