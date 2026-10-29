// ============================================================
// ARGOTURO ERP — Customer Receipts & Payments
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function CustomerPaymentsView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Customer Receipts & Payments
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Audit trail of incoming bank settlements, cheque clearings, and automatic cash ledger debits
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Receipt No.</th>
              <th>Customer</th>
              <th>Invoice Ref</th>
              <th>Payment Method</th>
              <th>Bank Account</th>
              <th>Receipt Date</th>
              <th style={{ textAlign: 'right' }}>Amount Received</th>
            </tr>
          </thead>
          <tbody>
            {store.customerPayments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No customer payment receipts recorded yet.
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
                    <td>{customer?.name || 'Customer'}</td>
                    <td>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                        {invoice?.invoiceNumber || p.invoiceId}
                      </span>
                    </td>
                    <td>{p.paymentMethod}</td>
                    <td>{bank?.bankName || 'BCA Operational Account'}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      IDR {p.amount.toLocaleString('en-US')}
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
