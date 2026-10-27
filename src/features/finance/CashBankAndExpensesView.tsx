// ============================================================
// ARGOTURO ERP — Cash & Bank Balances & Operating Expenses
// ============================================================

import React, { useState } from 'react';
import { Landmark, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CashBankAndExpensesView({ mode }: { mode: 'cash_bank' | 'expenses' }) {
  const { store, saveExpense, addToast } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Expense Form State
  const [category, setCategory] = useState<'utility' | 'rent' | 'office' | 'maintenance' | 'travel' | 'marketing' | 'other'>('office');
  const [description, setDescription] = useState('Pembelian perlengkapan kantor & ATK divisi sales');
  const [amount, setAmount] = useState(2500000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'petty_cash'>('bank_transfer');
  const [bankAccountId, setBankAccountId] = useState(store.bankAccounts[0]?.id || '');
  const [expenseAccountId, setExpenseAccountId] = useState(store.accounts.find((a) => a.code === '61900')?.id || '');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    saveExpense({
      date: new Date().toISOString().split('T')[0],
      category,
      description,
      amount,
      paymentMethod,
      bankAccountId,
      expenseAccountId,
      status: 'approved',
    });
    setShowModal(false);
  };

  if (mode === 'expenses') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Biaya & Beban Operasional (Operating Expenses)
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              Pencatatan pengeluaran rutin, utilitas pabrik, ATK, pemeliharaan, dan posting otomatis ke GL
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Catat Beban Operasional
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>No. Beban</th>
                <th>Kategori</th>
                <th>Keterangan / Deskripsi</th>
                <th>Metode Pembayaran</th>
                <th>Tanggal Pengeluaran</th>
                <th style={{ textAlign: 'right' }}>Jumlah Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {store.expenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{exp.expenseNumber}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: 3,
                        textTransform: 'uppercase',
                      }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td>{exp.description}</td>
                  <td>{exp.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                  <td>{new Date(exp.date).toLocaleDateString('id-ID')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                    Rp {exp.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
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
              onSubmit={handleCreateExpense}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                padding: 24,
                width: 500,
                maxWidth: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Catat Beban Operasional</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Kategori Beban:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="input"
                  >
                    <option value="utility">Listrik, Air & Internet (Utilitas)</option>
                    <option value="office">Perlengkapan Kantor & ATK</option>
                    <option value="maintenance">Pemeliharaan Fasilitas & Mesin</option>
                    <option value="travel">Transportasi & Perjalanan Dinas</option>
                    <option value="rent">Sewa Gudang / Gedung</option>
                    <option value="marketing">Pemasaran & Promosi</option>
                    <option value="other">Beban Operasional Lainnya</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Deskripsi Pengeluaran:</label>
                  <input
                    type="text"
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nominal Biaya (Rp):</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Sumber Kas/Bank:</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="input"
                  >
                    {store.bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} — {b.accountNumber} ({b.accountName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Posting Beban & Jurnal Kas
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Cash & Bank Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Kas & Rekening Bank (Cash & Bank Balances)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Posisi likuiditas perbankan operasional dan buku kas kecil (petty cash)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {store.bankAccounts.map((b) => {
          const acc = store.accounts.find((a) => a.code === b.accountCode);
          const currentBal = acc ? acc.currentBalance : (b.balance ?? b.currentBalance ?? 0);

          return (
            <div
              key={b.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{b.bankName}</h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    No. Rek: <strong style={{ color: '#1e293b' }}>{b.accountNumber}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>a/n {b.accountName}</div>
                </div>

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Landmark size={20} />
                </div>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Saldo Buku Kas/Bank:</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                  Rp {currentBal.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Kode Akun GL: <strong>{b.accountCode}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
