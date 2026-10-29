// ============================================================
// ARGOTURO ERP — Document Numbering & Sequence Engine
// ============================================================

import React from 'react';
import { Hash, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DocumentNumberingView() {
  const { store } = useApp();

  const numberingRules = [
    { type: 'Sales Quotation', prefix: 'QUO', sample: 'QUO-2026-00004', count: store.quotations.length },
    { type: 'Sales Order', prefix: 'SO', sample: 'SO-2026-00005', count: store.salesOrders.length },
    { type: 'Delivery Order (DO)', prefix: 'DO', sample: 'DO-2026-00003', count: store.deliveryOrders.length },
    { type: 'Customer Invoice', prefix: 'INV', sample: 'INV-2026-00004', count: store.customerInvoices.length },
    { type: 'Customer Payment Receipt', prefix: 'CP', sample: 'CP-2026-00003', count: store.customerPayments.length },
    { type: 'Purchase Requisition (PR)', prefix: 'PR', sample: 'PR-2026-00003', count: store.purchaseRequisitions.length },
    { type: 'Purchase Order (PO)', prefix: 'PO', sample: 'PO-2026-00004', count: store.purchaseOrders.length },
    { type: 'Goods Receipt Note (GRN)', prefix: 'GR', sample: 'GR-2026-00003', count: store.goodsReceipts.length },
    { type: 'Supplier Invoice (Bill)', prefix: 'BILL', sample: 'BILL-2026-00003', count: store.supplierInvoices.length },
    { type: 'Supplier Payment', prefix: 'SP', sample: 'SP-2026-00002', count: store.supplierPayments.length },
    { type: 'Manufacturing Order (MO)', prefix: 'MO', sample: 'MO-2026-00003', count: store.productionOrders.length },
    { type: 'Inter-Warehouse Transfer', prefix: 'TRF', sample: 'TRF-2026-00002', count: store.stockTransfers.length },
    { type: 'Stock Adjustment (ADJ)', prefix: 'ADJ', sample: 'ADJ-2026-00002', count: store.stockAdjustments.length },
    { type: 'General Journal Entry (GL)', prefix: 'JE', sample: 'JE-2026-00010', count: store.journalEntries.length },
    { type: 'Operating Expense Record', prefix: 'EXP', sample: 'EXP-2026-00003', count: store.expenses.length },
    { type: 'Payroll Run Batch', prefix: 'PAY', sample: 'PAY-2026-00002', count: store.payrollRuns.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Document Sequences & Numbering Patterns
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Standard enterprise serial sequence patterns configured per fiscal year to ensure uniqueness and audit compliance
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Business Document Type</th>
              <th>Prefix</th>
              <th>Sequence Format</th>
              <th>Sample Generated Reference</th>
              <th style={{ textAlign: 'right' }}>Total Issued Documents</th>
            </tr>
          </thead>
          <tbody>
            {numberingRules.map((rule, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{rule.type}</td>
                <td>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {rule.prefix}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', color: '#64748b' }}>
                  {rule.prefix}-[YYYY]-[00001]
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
                  {rule.sample}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#3b82f6' }}>
                  {rule.count} Documents
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
