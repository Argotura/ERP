// ============================================================
// ARGOTURO ERP — Supplier Disbursements & Payments
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function SupplierPaymentsView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Supplier Disbursements & Payments
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          History of accounts payable settlements, bank wires, and cash disbursement journal records
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Disbursement No.</th>
              <th>Supplier / Vendor</th>
              <th>Bill Reference</th>
              <th>Method</th>
              <th>Bank Account</th>
              <th>Payment Date</th>
              <th style={{ textAlign: 'right' }}>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {store.supplierPayments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No supplier payments recorded yet.
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
                    <td>{supplier?.name || 'Supplier'}</td>
                    <td>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                        {bill?.invoiceNumber || bill?.billNumber || p.supplierInvoiceId || p.billNumber || '-'}
                      </span>
                    </td>
                    <td>{p.paymentMethod}</td>
                    <td>{bank?.bankName || 'BCA Operational Account'}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
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
