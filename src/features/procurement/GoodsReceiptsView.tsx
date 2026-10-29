// ============================================================
// ARGOTURO ERP — Goods Receipts (GRN)
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function GoodsReceiptsView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Goods Receipts (GRN)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Physical inbound receiving from vendors, quality inspection, batch tracking, and automatic stock increments
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Receipt No.</th>
              <th>PO Reference</th>
              <th>Receiving Warehouse</th>
              <th>Received By</th>
              <th>Receipt Date</th>
              <th>Received Items & Batches</th>
            </tr>
          </thead>
          <tbody>
            {store.goodsReceipts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No goods receipts recorded yet.
                </td>
              </tr>
            ) : (
              store.goodsReceipts.map((gr) => {
                const po = store.purchaseOrders.find((p) => p.id === gr.purchaseOrderId);
                const warehouse = store.warehouses.find((w) => w.id === gr.warehouseId);
                const totalAccepted = gr.lines.reduce((s, l) => s + l.acceptedQuantity, 0);

                return (
                  <tr key={gr.id}>
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
                        RECEIVED
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{gr.receiptNumber}</td>
                    <td>{po?.orderNumber || gr.purchaseOrderId}</td>
                    <td>{warehouse?.name || 'Main Distribution Warehouse'}</td>
                    <td>{gr.receivedBy}</td>
                    <td>{new Date(gr.receiptDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      {gr.lines.length} Line(s) ({totalAccepted} Units Received)
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
