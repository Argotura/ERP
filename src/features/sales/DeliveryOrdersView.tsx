// ============================================================
// ARGOTURO ERP — Delivery Orders & Dispatch
// ============================================================

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DeliveryOrdersView() {
  const { store, confirmDelivery } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Delivery Orders & Shipments
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Physical logistics dispatch, automatic inventory ledger deduction, and proof-of-delivery tracking
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Delivery Order No.</th>
              <th>SO Reference</th>
              <th>Source Warehouse</th>
              <th>Carrier & Tracking</th>
              <th>Dispatch Date</th>
              <th>Total Items</th>
              <th style={{ textAlign: 'right' }}>Logistics Action</th>
            </tr>
          </thead>
          <tbody>
            {store.deliveryOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No delivery orders issued yet. Generate them from approved Sales Orders.
                </td>
              </tr>
            ) : (
              store.deliveryOrders.map((d) => {
                const so = store.salesOrders.find((s) => s.id === d.salesOrderId);
                const warehouse = store.warehouses.find((w) => w.id === d.warehouseId || w.code === d.warehouseCode);
                const totalItemQty = d.lines.reduce((s, l: any) => s + (l.quantity ?? l.shippedQty ?? l.orderedQty ?? 0), 0);

                return (
                  <tr key={d.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: d.status === 'completed' || d.status === 'delivered' ? '#dcfce7' : '#fef3c7',
                          color: d.status === 'completed' || d.status === 'delivered' ? '#15803d' : '#b45309',
                        }}
                      >
                        {d.status === 'completed' || d.status === 'delivered' ? 'Delivered' : 'Pending Dispatch'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{d.deliveryNumber}</td>
                    <td>{so?.orderNumber || d.salesOrderId}</td>
                    <td>{warehouse?.name || 'Main Distribution Warehouse'}</td>
                    <td>
                      <div>{d.carrier}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{d.trackingNumber || d.trackingRef || '-'}</div>
                    </td>
                    <td>{new Date(d.deliveryDate || d.date || d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      {d.lines.length} Line(s) ({totalItemQty} PCS)
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {d.status !== 'completed' && d.status !== 'delivered' ? (
                        <button
                          type="button"
                          onClick={() => confirmDelivery(d.id)}
                          className="btn btn-sm btn-primary"
                          style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <CheckCircle2 size={12} /> Confirm Dispatch & Deduct Stock
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          ✓ Stock Deducted
                        </span>
                      )}
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
