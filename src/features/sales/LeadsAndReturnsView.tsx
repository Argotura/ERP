// ============================================================
// ARGOTURO ERP — Leads Pipeline & Sales Returns
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function LeadsAndReturnsView({ mode }: { mode: 'leads' | 'returns' }) {
  const { store } = useApp();

  if (mode === 'returns') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Sales Returns
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Customer return authorizations, credit notes, and quarantine stock intake
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Return No.</th>
                <th>Original Invoice</th>
                <th>Customer</th>
                <th>Return Reason</th>
                <th>Status</th>
                <th>Return Date</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {store.salesReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                    No sales returns recorded.
                  </td>
                </tr>
              ) : (
                store.salesReturns.map((r) => {
                  const invoice = r.invoiceId ? store.customerInvoices.find((i) => i.id === r.invoiceId) : null;
                  const customer = r.customerName ? { name: r.customerName } : (invoice ? store.customers.find((c) => c.id === invoice.customerId) : null);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{r.returnNumber}</td>
                      <td>{invoice?.invoiceNumber || r.deliveryOrderNumber || r.deliveryOrderId || '-'}</td>
                      <td>{customer?.name || 'Customer'}</td>
                      <td>{r.reason || (r.lines && r.lines[0]?.reason) || 'Quality Defect'}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 4,
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                          }}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(r.returnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        IDR {(r.totalAmount || 0).toLocaleString('en-US')}
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

  // Leads Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Sales Leads & CRM Pipeline
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Commercial opportunities, corporate pipeline tracking, and customer conversion status
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Lead Name</th>
              <th>Company</th>
              <th>Contact Details</th>
              <th>Acquisition Channel</th>
              <th style={{ textAlign: 'right' }}>Est. Value</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {store.leads.map((l) => (
              <tr key={l.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 4,
                      backgroundColor:
                        l.status === 'qualified'
                          ? '#dcfce7'
                          : l.status === 'contacted'
                          ? '#eff6ff'
                          : '#fef3c7',
                      color:
                        l.status === 'qualified'
                          ? '#15803d'
                          : l.status === 'contacted'
                          ? '#1d4ed8'
                          : '#b45309',
                    }}
                  >
                    {l.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{l.name}</td>
                <td>{l.company || l.companyName || '-'}</td>
                <td>
                  <div>{l.email}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{l.phone}</div>
                </td>
                <td>{l.source}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  IDR {l.estimatedValue.toLocaleString('en-US')}
                </td>
                <td>{l.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
