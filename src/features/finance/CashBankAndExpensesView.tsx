// ============================================================
// ARGOTURO ERP — Cash & Bank Balances & Operating Expenses
// ============================================================

import React, { useState } from 'react';
import { Landmark, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CashBankAndExpensesView({ mode }: { mode: 'cash_bank' | 'expenses' }) {
  const { store, saveExpense } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Expense Form State
  const [category, setCategory] = useState<'utility' | 'rent' | 'office' | 'maintenance' | 'travel' | 'marketing' | 'other'>('office');
  const [description, setDescription] = useState('Office supplies purchase for commercial department');
  const [amount, setAmount] = useState(2500000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'petty_cash'>('bank_transfer');
  const [bankAccountId, setBankAccountId] = useState(store.bankAccounts[0]?.id || '');
  const [expenseAccountId] = useState(store.accounts.find((a) => a.code === '61900')?.id || '');

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
              Operating Expenses
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              Record routine expenditures, facility utilities, office supplies, maintenance, and automated GL posting
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Record Operating Expense
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Expense No.</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Disbursement Date</th>
                <th style={{ textAlign: 'right' }}>Expense Amount (IDR)</th>
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
                  <td>{new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                    IDR {exp.amount.toLocaleString('en-US')}
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
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Record Operating Expense</h3>
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Expense Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="input"
                  >
                    <option value="utility">Electricity, Utilities & Web</option>
                    <option value="office">Office Supplies & Stationery</option>
                    <option value="maintenance">Facility & Machine Maintenance</option>
                    <option value="travel">Travel & Transportation</option>
                    <option value="rent">Warehouse / Building Rent</option>
                    <option value="marketing">Marketing & Promotion</option>
                    <option value="other">Other Operational Expenses</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Expense Description:</label>
                  <input
                    type="text"
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Expense Amount (IDR):</label>
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Source Cash/Bank Account:</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="input"
                  >
                    {store.bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} — {b.accountNumber} ({b.accountName || b.accountHolder})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Expense & Journal Entry
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
          Cash & Bank Accounts
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Operational banking liquidity positions and petty cash accounts
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
                    Account No.: <strong style={{ color: '#1e293b' }}>{b.accountNumber}</strong>
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
                <span style={{ fontSize: 11, color: '#64748b' }}>Ledger Book Balance:</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                  IDR {currentBal.toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  GL Account Code: <strong>{b.accountCode}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
