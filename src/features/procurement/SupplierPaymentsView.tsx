// ============================================================
// ARGOTURO ERP — Supplier Payments (Histori Pembayaran Vendor)
// ============================================================

import React from 'react';
import { CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SupplierPaymentsView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Histori Pembayaran ke Pemasok (Supplier Payments)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Arsip pengeluaran kas/bank untuk pelunasan hutang usaha (AP) dan bukti transfer
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Pembayaran</th>
              <th>Pemasok / Vendor</th>
              <th>Referensi Tagihan</th>
              <th>Metode Pengeluaran</th>
              <th>Rekening Kas/Bank</th>
              <th>Tanggal Bayar</th>
              <th style={{ textAlign: 'right' }}>Jumlah Dibayar</th>
            </tr>
          </thead>
          <tbody>
            {store.supplierPayments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada pembayaran ke pemasok.
                </td>
              </tr>
            ) : (
              store.supplierPayments.map((p) => {
                const supplier = store.suppliers.find((s) => s.id === p.supplierId);
                const bill = store.supplierInvoices.find((b) => b.id === p.supplierInvoiceId || b.id === p.billId);
                const bank = store.bankAccounts.find((b) => b.id === p.bankAccountId);

                return (
                  <tr key={p.id}>
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
                        CLEARED
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{p.paymentNumber}</td>
                    <td>{supplier?.name || 'Pemasok'}</td>
                    <td>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                        {bill?.invoiceNumber || bill?.billNumber || p.supplierInvoiceId || p.billNumber || '-'}
                      </span>
                    </td>
                    <td>{p.paymentMethod}</td>
                    <td>{bank?.bankName || 'Bank BCA Operasional'}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      Rp {p.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
