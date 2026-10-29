// ============================================================
// ARGOTURO ERP — Stock Transfers
// ============================================================

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StockTransfersView() {
  const { store, createStockTransfer, addToast } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [fromWarehouseId, setFromWarehouseId] = useState(store.warehouses[0]?.id || '');
  const [toWarehouseId, setToWarehouseId] = useState(store.warehouses[1]?.id || '');
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('Periodic stock rebalance for regional order fulfillment');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouseId === toWarehouseId) {
      addToast('warning', 'Source warehouse and destination warehouse cannot be the same.');
      return;
    }

    createStockTransfer(fromWarehouseId, toWarehouseId, [{ productId, quantity }], notes);
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Inter-Warehouse Stock Transfers
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Physical stock relocation between branch warehouses with dual-side inventory ledger synchronisation
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Create Stock Transfer
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Transfer Document No.</th>
              <th>Source Warehouse</th>
              <th>Destination Warehouse</th>
              <th>Transfer Date</th>
              <th>Transferred Items</th>
              <th>Authorized By</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {store.stockTransfers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No stock transfer records found.
                </td>
              </tr>
            ) : (
              store.stockTransfers.map((t) => {
                const fromWh = store.warehouses.find((w) => w.id === t.fromWarehouseId || w.code === t.fromWarehouse);
                const toWh = store.warehouses.find((w) => w.id === t.toWarehouseId || w.code === t.toWarehouse);
                const totalQty = t.lines.reduce((s, l: any) => s + (l.quantity || 0), 0);

                return (
                  <tr key={t.id}>
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
                        COMPLETED
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{t.transferNumber}</td>
                    <td>{fromWh?.name || t.fromWarehouse || t.fromWarehouseId}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#3b82f6' }}>{toWh?.name || t.toWarehouse || t.toWarehouseId}</span>
                    </td>
                    <td>{new Date(t.transferDate || t.date || t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      {t.lines.length} Line(s) ({totalQty} Units)
                    </td>
                    <td>{t.requestedBy}</td>
                    <td style={{ color: '#64748b' }}>{t.notes || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <form
            onSubmit={handleCreate}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 520,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Inter-Warehouse Transfer Form</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Source Warehouse (Outbound):</label>
                <select
                  value={fromWarehouseId}
                  onChange={(e) => setFromWarehouseId(e.target.value)}
                  className="input"
                >
                  {store.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Destination Warehouse (Inbound):</label>
                <select
                  value={toWarehouseId}
                  onChange={(e) => setToWarehouseId(e.target.value)}
                  className="input"
                >
                  {store.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Select Product:</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="input"
                >
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (Total Stock: {p.onHandStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Transfer Quantity:</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Transfer Memo / Reason:</label>
                <input
                  type="text"
                  className="input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Execute Stock Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
