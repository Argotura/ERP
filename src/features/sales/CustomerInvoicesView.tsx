// ============================================================
// ARGOTURO ERP — Customer Invoices (Faktur Tagihan Piutang)
// ============================================================

import React, { useState } from 'react';
import { FileCheck, DollarSign, Calendar, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerInvoice } from '../../types';

export default function CustomerInvoicesView() {
  const { store, recordCustomerPayment } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer BCA');
  const [bankAccountId, setBankAccountId] = useState<string>(store.bankAccounts[0]?.id || '');

  const openPaymentModal = (inv: CustomerInvoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.remainingAmount ?? inv.outstandingBalance ?? 0);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    recordCustomerPayment(selectedInvoice.id, paymentAmount, paymentMethod, bankAccountId);
    setSelectedInvoice(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Faktur Penjualan (Customer Invoices)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Pengakuan piutang usaha (AR), monitoring jatuh tempo, dan pelunasan kas/bank
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status Bayar</th>
              <th>No. Faktur</th>
              <th>Pelanggan</th>
              <th>Tanggal Faktur</th>
              <th>Jatuh Tempo</th>
              <th style={{ textAlign: 'right' }}>Total Tagihan</th>
              <th style={{ textAlign: 'right' }}>Sisa Piutang</th>
              <th style={{ textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {store.customerInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada Faktur Penjualan. Buat dari Sales Order.
                </td>
              </tr>
            ) : (
              store.customerInvoices.map((inv) => {
                const customer = store.customers.find((c) => c.id === inv.customerId);
                return (
                  <tr key={inv.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor:
                            inv.status === 'paid'
                              ? '#dcfce7'
                              : inv.status === 'partially_paid'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            inv.status === 'paid'
                              ? '#15803d'
                              : inv.status === 'partially_paid'
                              ? '#b45309'
                              : '#b91c1c',
                        }}
                      >
                        {inv.status === 'paid'
                          ? 'Lunas'
                          : inv.status === 'partially_paid'
                          ? 'Dibayar Sebagian'
                          : 'Belum Dibayar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{inv.invoiceNumber}</td>
                    <td>{customer?.name || 'Pelanggan'}</td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString('id-ID')}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      Rp {inv.grandTotal.toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: (inv.remainingAmount ?? inv.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                      Rp {(inv.remainingAmount ?? inv.outstandingBalance ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(inv.remainingAmount ?? inv.outstandingBalance ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={() => openPaymentModal(inv)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <DollarSign size={12} /> Catat Pelunasan
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
      {selectedInvoice && (
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
                Catat Pelunasan Faktur {selectedInvoice.invoiceNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 12.5, marginBottom: 16 }}>
              <div>Total Tagihan: Rp {selectedInvoice.grandTotal.toLocaleString('id-ID')}</div>
              <div>Sudah Dibayar: Rp {selectedInvoice.paidAmount.toLocaleString('id-ID')}</div>
              <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                Sisa Piutang: Rp {(selectedInvoice.remainingAmount ?? selectedInvoice.outstandingBalance ?? 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Jumlah Pembayaran Masuk (Rp):
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.remainingAmount ?? selectedInvoice.outstandingBalance ?? 0}
                  className="input"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Metode Pembayaran:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input"
                >
                  <option value="Bank Transfer BCA">Bank Transfer BCA</option>
                  <option value="Bank Transfer Mandiri">Bank Transfer Mandiri</option>
                  <option value="Bilyet Giro / Cek">Bilyet Giro / Cek</option>
                  <option value="Tunai / Kas Kecil">Tunai / Kas Kecil</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Rekening Bank Penerima:
                </label>
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
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn-success">
                Posting Pembayaran & Jurnal Kas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
