// ============================================================
// ARGOTURO ERP — Supplier Invoices (Tagihan Pemasok / Vendor Bills)
// ============================================================

import React, { useState } from 'react';
import { FileCheck, DollarSign, Calendar, Building2, CheckCircle2 } from 'lucide-react';
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
          Tagihan Pemasok (Supplier Invoices / Vendor Bills)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Pencatatan kewajiban hutang usaha (AP), pencocokan 3-way matching PO-GRN-Bill, dan jadwal pembayaran
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status Bayar</th>
              <th>No. Tagihan Internal</th>
              <th>No. Faktur Vendor</th>
              <th>Pemasok</th>
              <th>Tanggal Tagihan</th>
              <th>Jatuh Tempo</th>
              <th style={{ textAlign: 'right' }}>Total Tagihan</th>
              <th style={{ textAlign: 'right' }}>Sisa Hutang</th>
              <th style={{ textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {store.supplierInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada tagihan pemasok yang tercatat. Buat dari Purchase Order.
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
                          ? 'Lunas'
                          : bill.status === 'partially_paid'
                          ? 'Dibayar Sebagian'
                          : 'Belum Dibayar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{bill.invoiceNumber || bill.billNumber}</td>
                    <td>{bill.supplierInvoiceNumber || bill.supplierBillRef || '-'}</td>
                    <td>{supplier?.name || 'Pemasok'}</td>
                    <td>{new Date(bill.invoiceDate).toLocaleDateString('id-ID')}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      Rp {bill.grandTotal.toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: (bill.remainingAmount ?? bill.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                      Rp {(bill.remainingAmount ?? bill.outstandingBalance ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(bill.remainingAmount ?? bill.outstandingBalance ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={() => openPayModal(bill)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <DollarSign size={12} /> Bayar Tagihan
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Lunas</span>
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
                Pembayaran Tagihan {selectedBill.invoiceNumber}
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
              <div>Total Tagihan: Rp {selectedBill.grandTotal.toLocaleString('id-ID')}</div>
              <div>Sudah Dibayar: Rp {selectedBill.paidAmount.toLocaleString('id-ID')}</div>
              <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                Sisa Hutang: Rp {(selectedBill.remainingAmount ?? selectedBill.outstandingBalance ?? 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Jumlah Bayar ke Pemasok (Rp):
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBill.remainingAmount}
                  className="input"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Metode Pengeluaran Dana:
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="input"
                >
                  <option value="Bank Transfer BCA">Bank Transfer BCA Operasional</option>
                  <option value="Bank Transfer Mandiri">Bank Transfer Mandiri</option>
                  <option value="Cek / Bilyet Giro">Cek / Bilyet Giro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Rekening Sumber Pengeluaran:
                </label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
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
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedBill(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Posting Pengeluaran Kas & Lunasi Hutang
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
