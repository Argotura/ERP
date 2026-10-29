// ============================================================
// ARGOTURO ERP — Reorder Planning & Replenishment
// ============================================================

import React from 'react';
import { AlertTriangle, ShoppingCart, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ReorderPlanningView() {
  const { store, generateReorderPR } = useApp();

  // Find products where current stock <= reorder level
  const lowStockItems = store.products
    .filter((p) => p.onHandStock <= p.reorderLevel)
    .map((p) => {
      // Suggest order quantity to bring stock up to 2.5x reorder level
      const targetLevel = Math.max(p.reorderLevel * 2.5, (p.safetyStock || 0) * 3);
      const suggestedQty = Math.max(10, Math.ceil(targetLevel - p.onHandStock));
      return {
        product: p,
        suggestedQty,
        estimatedCost: p.unitCost,
        totalCost: suggestedQty * p.unitCost,
      };
    });

  const totalEstimatedReplenishment = lowStockItems.reduce((s, it) => s + it.totalCost, 0);

  const handleBatchGeneratePR = () => {
    if (lowStockItems.length === 0) return;
    generateReorderPR(
      lowStockItems.map((it) => ({
        productId: it.product.id,
        quantity: it.suggestedQty,
        estimatedCost: it.estimatedCost,
      }))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Reorder Planning & Replenishment
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Automated detection of inventory below reorder point (ROP) and batch purchase requisition generation
          </p>
        </div>

        {lowStockItems.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBatchGeneratePR}
            style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#ea580c', borderColor: '#ea580c' }}
          >
            <ShoppingCart size={15} /> Auto-Generate PR ({lowStockItems.length} Items)
          </button>
        )}
      </div>

      {/* Summary Alert */}
      <div
        style={{
          backgroundColor: lowStockItems.length > 0 ? '#fff7ed' : '#f0fdf4',
          borderRadius: 8,
          border: lowStockItems.length > 0 ? '1px solid #fed7aa' : '1px solid #bbf7d0',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lowStockItems.length > 0 ? (
            <AlertTriangle size={24} color="#ea580c" />
          ) : (
            <CheckCircle size={24} color="#16a34a" />
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: lowStockItems.length > 0 ? '#9a3412' : '#166534' }}>
              {lowStockItems.length > 0
                ? `${lowStockItems.length} Products Below Reorder Point (ROP)`
                : 'All Products Within Optimal Stock Levels'}
            </div>
            <div style={{ fontSize: 12, color: lowStockItems.length > 0 ? '#c2410c' : '#15803d', marginTop: 2 }}>
              {lowStockItems.length > 0
                ? 'Generate a Purchase Requisition (PR) immediately to prevent operational stockouts.'
                : 'No emergency replenishment required at this time.'}
            </div>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: '#9a3412' }}>Estimated Capital Requirement:</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#9a3412' }}>
              IDR {totalEstimatedReplenishment.toLocaleString('en-US')}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Product SKU</th>
              <th>Product Name</th>
              <th>UOM</th>
              <th style={{ textAlign: 'right' }}>On-Hand Stock</th>
              <th style={{ textAlign: 'right' }}>Reorder Point</th>
              <th style={{ textAlign: 'right' }}>Safety Stock</th>
              <th style={{ textAlign: 'right' }}>Suggested Order</th>
              <th style={{ textAlign: 'right' }}>Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#16a34a' }}>
                  ✓ Inventory levels healthy. No SKUs currently require replenishment.
                </td>
              </tr>
            ) : (
              lowStockItems.map((it) => (
                <tr key={it.product.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                      }}
                    >
                      LOW STOCK
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{it.product.sku}</td>
                  <td style={{ fontWeight: 500 }}>{it.product.name}</td>
                  <td>{it.product.uom}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                    {it.product.onHandStock}
                  </td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>{it.product.reorderLevel}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>{it.product.safetyStock}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>
                    +{it.suggestedQty} {it.product.uom}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    IDR {it.totalCost.toLocaleString('en-US')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
