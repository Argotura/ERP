// ============================================================
// ARGOTURO ERP — Supplier Invoices (Vendor Bills)
// ============================================================

import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupplierInvoice } from '../../types';

export default function SupplierInvoicesView() {
  const { store, recordSupplierPayment } = useApp();
  const [selectedBill, setSelectedBill] = useState<SupplierInvoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('Bank Transfer BCA');
  const [bankId, setBankId] = useState(store.bankAccounts[0]?.id || '');

  const openPayModal = (bill: SupplierInvoice) => {
    setSelectedBill(bill);
    setPayAmount(bill.remainingAmount ?? bill.outstandingBalance ?? 0);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    recordSupplierPayment(selectedBill.id, payAmount, payMethod, bankId);
    setSelectedBill(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Supplier Invoices (Vendor Bills)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Accounts payable (AP) liability recognition, 3-way matching PO-GRN-Bill, and disbursement schedules
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Payment Status</th>
              <th>Internal Bill No.</th>
              <th>Vendor Invoice No.</th>
              <th>Supplier</th>
              <th>Bill Date</th>
              <th>Due Date</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Remaining Payable</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {store.supplierInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No supplier invoices recorded yet. Generate them from Purchase Orders.
                </td>
              </tr>
            ) : (
              store.supplierInvoices.map((bill) => {
                const supplier = store.suppliers.find((s) => s.id === bill.supplierId);
                return (
                  <tr key={bill.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor:
                            bill.status === 'paid'
                              ? '#dcfce7'
                              : bill.status === 'partially_paid'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            bill.status === 'paid'
                              ? '#15803d'
                              : bill.status === 'partially_paid'
                              ? '#b45309'
                              : '#b91c1c',
                        }}
                      >
                        {bill.status === 'paid'
                          ? 'Paid'
                          : bill.status === 'partially_paid'
                          ? 'Partially Paid'
                          : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{bill.invoiceNumber || bill.billNumber}</td>
                    <td>{bill.supplierInvoiceNumber || bill.supplierBillRef || '-'}</td>
                    <td>{supplier?.name || 'Supplier'}</td>
                    <td>{new Date(bill.invoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      IDR {bill.grandTotal.toLocaleString('en-US')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: (bill.remainingAmount ?? bill.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                      IDR {(bill.remainingAmount ?? bill.outstandingBalance ?? 0).toLocaleString('en-US')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(bill.remainingAmount ?? bill.outstandingBalance ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={() => openPayModal(bill)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <DollarSign size={12} /> Settle Bill
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {selectedBill && (
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
            onSubmit={handlePay}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 480,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Disburse Payment for Bill {selectedBill.invoiceNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 12.5, marginBottom: 16 }}>
              <div>Total Bill: IDR {selectedBill.grandTotal.toLocaleString('en-US')}</div>
              <div>Already Paid: IDR {selectedBill.paidAmount.toLocaleString('en-US')}</div>
              <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                Remaining Payable: IDR {(selectedBill.remainingAmount ?? selectedBill.outstandingBalance ?? 0).toLocaleString('en-US')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Payment Amount to Vendor (IDR):
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBill.remainingAmount ?? selectedBill.outstandingBalance ?? 0}
                  className="input"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Payment Disbursement Method:
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="input"
                >
                  <option value="Bank Transfer BCA">Bank Transfer BCA Operational</option>
                  <option value="Bank Transfer Mandiri">Bank Transfer Mandiri</option>
                  <option value="Cheque / Bilyet Giro">Cheque / Bilyet Giro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Source Bank Account:
                </label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
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
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedBill(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Post Disbursement & Settle Payable
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
