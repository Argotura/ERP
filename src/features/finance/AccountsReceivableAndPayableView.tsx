// ============================================================
// ARGOTURO ERP — Accounts Receivable & Accounts Payable Aging
// ============================================================

import React, { useState } from 'react';
import { CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AccountsReceivableAndPayableView({ mode }: { mode: 'ar' | 'ap' }) {
  const { store } = useApp();

  if (mode === 'ap') {
    const totalAP = store.supplierInvoices.reduce((s, b) => s + (b.remainingAmount ?? b.outstandingBalance ?? 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Analisis Umur Hutang Usaha (AP Aging Report)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Monitoring kewajiban pembayaran ke vendor, jatuh tempo kredit, dan arus kas keluar
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 300 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Kewajiban Hutang Usaha</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
            Rp {totalAP.toLocaleString('id-ID')}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>No. Tagihan</th>
                <th>Pemasok / Vendor</th>
                <th>Jatuh Tempo</th>
                <th style={{ textAlign: 'right' }}>Total Tagihan</th>
                <th style={{ textAlign: 'right' }}>Sudah Dibayar</th>
                <th style={{ textAlign: 'right' }}>Sisa Hutang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {store.supplierInvoices.map((b) => {
                const supplier = store.suppliers.find((s) => s.id === b.supplierId);
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{b.invoiceNumber}</td>
                    <td>{supplier?.name || b.supplierId}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }}>Rp {b.grandTotal.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }}>Rp {b.paidAmount.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: (b.remainingAmount ?? b.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                      Rp {(b.remainingAmount ?? b.outstandingBalance ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 4,
                          backgroundColor: b.status === 'paid' ? '#dcfce7' : '#fee2e2',
                          color: b.status === 'paid' ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // AR Mode
  const totalAR = store.customerInvoices.reduce((s, i) => s + (i.remainingAmount ?? i.outstandingBalance ?? 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Analisis Umur Piutang Usaha (AR Aging Report)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Monitoring penagihan faktur pelanggan, kolektibilitas piutang, dan jadwal penerimaan kas
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 300 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Tagihan Piutang Usaha</span>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
          Rp {totalAR.toLocaleString('id-ID')}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>No. Faktur</th>
              <th>Pelanggan</th>
              <th>Jatuh Tempo</th>
              <th style={{ textAlign: 'right' }}>Total Tagihan</th>
              <th style={{ textAlign: 'right' }}>Sudah Diterima</th>
              <th style={{ textAlign: 'right' }}>Sisa Piutang</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {store.customerInvoices.map((inv) => {
              const cust = store.customers.find((c) => c.id === inv.customerId);
              return (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{inv.invoiceNumber}</td>
                  <td>{cust?.name || inv.customerId}</td>
                  <td>{new Date(inv.dueDate).toLocaleDateString('id-ID')}</td>
                  <td style={{ textAlign: 'right' }}>Rp {inv.grandTotal.toLocaleString('id-ID')}</td>
                  <td style={{ textAlign: 'right' }}>Rp {inv.paidAmount.toLocaleString('id-ID')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: (inv.remainingAmount ?? inv.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                    Rp {(inv.remainingAmount ?? inv.outstandingBalance ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: inv.status === 'paid' ? '#dcfce7' : '#fee2e2',
                        color: inv.status === 'paid' ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
