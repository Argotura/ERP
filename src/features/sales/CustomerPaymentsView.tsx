// ============================================================
// ARGOTURO ERP — Customer Payments (Penerimaan Kas & Pelunasan)
// ============================================================

import React from 'react';
import { CreditCard, Landmark, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CustomerPaymentsView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Penerimaan Pembayaran Pelanggan (Customer Payments)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Histori penerimaan transfer bank, kliring giro, dan mutasi debit kas/bank otomatis
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Penerimaan</th>
              <th>Pelanggan</th>
              <th>Referensi Faktur</th>
              <th>Metode Pembayaran</th>
              <th>Rekening Kas/Bank</th>
              <th>Tanggal Terima</th>
              <th style={{ textAlign: 'right' }}>Jumlah Diterima</th>
            </tr>
          </thead>
          <tbody>
            {store.customerPayments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada catatan pembayaran masuk.
                </td>
              </tr>
            ) : (
              store.customerPayments.map((p) => {
                const customer = store.customers.find((c) => c.id === p.customerId);
                const invoice = store.customerInvoices.find((i) => i.id === p.invoiceId);
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
                    <td>{customer?.name || 'Pelanggan'}</td>
                    <td>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                        {invoice?.invoiceNumber || p.invoiceId}
                      </span>
                    </td>
                    <td>{p.paymentMethod}</td>
                    <td>{bank?.bankName || 'Bank BCA Operasional'}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
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

