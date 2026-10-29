// ============================================================
// ARGOTURO ERP — Accounts Receivable & Accounts Payable Aging
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function AccountsReceivableAndPayableView({ mode }: { mode: 'ar' | 'ap' }) {
  const { store } = useApp();

  if (mode === 'ap') {
    const totalAP = store.supplierInvoices.reduce((s, b) => s + (b.remainingAmount ?? b.outstandingBalance ?? 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Accounts Payable Aging (AP Report)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Vendor payment obligations, credit maturities, and projected cash outflows
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 320 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Accounts Payable Liability</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
            IDR {totalAP.toLocaleString('en-US')}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Supplier / Vendor</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
                <th style={{ textAlign: 'right' }}>Amount Paid</th>
                <th style={{ textAlign: 'right' }}>Remaining Payable</th>
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
                    <td>{new Date(b.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>IDR {b.grandTotal.toLocaleString('en-US')}</td>
                    <td style={{ textAlign: 'right' }}>IDR {b.paidAmount.toLocaleString('en-US')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: (b.remainingAmount ?? b.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                      IDR {(b.remainingAmount ?? b.outstandingBalance ?? 0).toLocaleString('en-US')}
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
          Accounts Receivable Aging (AR Report)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Customer billing collections, aging buckets, and projected cash inflows
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 320 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Accounts Receivable Balance</span>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
          IDR {totalAR.toLocaleString('en-US')}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Customer</th>
              <th>Due Date</th>
              <th style={{ textAlign: 'right' }}>Total Invoiced</th>
              <th style={{ textAlign: 'right' }}>Amount Collected</th>
              <th style={{ textAlign: 'right' }}>Remaining Receivable</th>
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
                  <td>{new Date(inv.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{ textAlign: 'right' }}>IDR {inv.grandTotal.toLocaleString('en-US')}</td>
                  <td style={{ textAlign: 'right' }}>IDR {inv.paidAmount.toLocaleString('en-US')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: (inv.remainingAmount ?? inv.outstandingBalance ?? 0) > 0 ? '#ef4444' : '#10b981' }}>
                    IDR {(inv.remainingAmount ?? inv.outstandingBalance ?? 0).toLocaleString('en-US')}
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
