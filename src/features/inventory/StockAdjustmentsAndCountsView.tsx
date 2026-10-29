// ============================================================
// ARGOTURO ERP — Stock Adjustments & Cycle Counts
// ============================================================

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StockAdjustmentsAndCountsView({ mode }: { mode: 'adjustments' | 'counts' }) {
  const { store, createStockAdjustment } = useApp();
  const [showAdjModal, setShowAdjModal] = useState(false);

  // Form State
  const [warehouseId, setWarehouseId] = useState(store.warehouses[0]?.id || '');
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'gain' | 'loss' | 'scrap' | 'damage'>('loss');
  const [quantity, setQuantity] = useState(2);
  const [reason, setReason] = useState('Periodic shrinkage / physical defect');

  const handleCreateAdj = (e: React.FormEvent) => {
    e.preventDefault();
    createStockAdjustment(warehouseId, productId, adjustmentType, quantity, reason);
    setShowAdjModal(false);
  };

  if (mode === 'counts') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Cycle Count Audit Results (Stock Opname)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Periodic physical inventory count recapitulation, inventory variance reconciliation, and accuracy audits
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count Document No.</th>
                <th>Warehouse Location</th>
                <th>Count Date</th>
                <th>Auditor / Counter</th>
                <th>SKUs Audited</th>
              </tr>
            </thead>
            <tbody>
              {store.stockCounts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                    No cycle count records found.
                  </td>
                </tr>
              ) : (
                store.stockCounts.map((sc) => {
                  const wh = store.warehouses.find((w) => w.id === sc.warehouseId || w.code === sc.warehouseCode);
                  return (
                    <tr key={sc.id}>
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
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{sc.countNumber}</td>
                      <td>{wh?.name || sc.warehouseCode || sc.warehouseId || 'Warehouse'}</td>
                      <td>{new Date(sc.countDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>{sc.counterName || sc.auditor || 'Internal Auditor'}</td>
                      <td>{sc.lines.length} SKU(s) Audited</td>
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

  // Adjustments Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Stock Adjustments
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Balance corrections resulting from cycle count discrepancies, scrap, shrinkage, or quality quarantine
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAdjModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Create Stock Adjustment
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Adjustment No.</th>
              <th>Warehouse Location</th>
              <th>Date</th>
              <th>Reason / Memo</th>
              <th>Authorized By</th>
              <th>Item Variance Details</th>
            </tr>
          </thead>
          <tbody>
            {store.stockAdjustments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No stock adjustments recorded.
                </td>
              </tr>
            ) : (
              store.stockAdjustments.map((a) => {
                const wh = store.warehouses.find((w) => w.id === a.warehouseId);
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{a.adjustmentNumber}</td>
                    <td>{wh?.name || a.warehouseId}</td>
                    <td>{new Date(a.adjustmentDate || a.date || a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{a.reason}</td>
                    <td>{a.adjustedBy}</td>
                    <td>
                      {a.lines.map((l, i) => {
                        const prod = store.products.find((p) => p.id === l.productId);
                        return (
                          <div key={i} style={{ fontSize: 12 }}>
                            {prod?.sku}:{' '}
                            <strong style={{ color: l.variance > 0 ? '#10b981' : '#ef4444' }}>
                              {l.variance > 0 ? `+${l.variance}` : l.variance} PCS
                            </strong>{' '}
                            ({l.adjustmentType})
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAdjModal && (
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
            onSubmit={handleCreateAdj}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Create Stock Adjustment</h3>
              <button
                type="button"
                onClick={() => setShowAdjModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Warehouse:</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Adjustment Type:</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="input"
                >
                  <option value="loss">Loss / Shortage (Loss)</option>
                  <option value="gain">Surplus Found (Gain)</option>
                  <option value="scrap">Physical Damage / Scrap</option>
                  <option value="damage">Quarantine Defect (Damage)</option>
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
                      {p.sku} — {p.name} (Current Stock: {p.onHandStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Quantity Variance:</label>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reason / Memo:</label>
                <input
                  type="text"
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdjModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
