// ============================================================
// ARGOTURO ERP — Reorder Planning & Low-Stock Replenishment
// ============================================================

import React from 'react';
import { AlertTriangle, ShoppingCart, CheckCircle, Package, ArrowRight } from 'lucide-react';
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
            Perencanaan Pemesanan Ulang (Reorder Planning)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Kalkulasi otomatis barang di bawah titik minimum (ROP) dan pembuatan PR pengadaan sekaligus
          </p>
        </div>

        {lowStockItems.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBatchGeneratePR}
            style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#ea580c', borderColor: '#ea580c' }}
          >
            <ShoppingCart size={15} /> Buat PR Otomatis ({lowStockItems.length} Item)
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
                ? `${lowStockItems.length} Produk Berada di Bawah Batas Reorder Point`
                : 'Semua Produk Berada dalam Level Persediaan Aman'}
            </div>
            <div style={{ fontSize: 12, color: lowStockItems.length > 0 ? '#c2410c' : '#15803d', marginTop: 2 }}>
              {lowStockItems.length > 0
                ? 'Segera buat Permintaan Pembelian (PR) untuk mencegah stockout pada operasional perakitan.'
                : 'Tidak ada kebutuhan restock darurat saat ini.'}
            </div>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: '#9a3412' }}>Estimasi Kebutuhan Dana:</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#9a3412' }}>
              Rp {totalEstimatedReplenishment.toLocaleString('id-ID')}
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
              <th>SKU Produk</th>
              <th>Nama Produk</th>
              <th>Satuan</th>
              <th style={{ textAlign: 'right' }}>Stok Fisik</th>
              <th style={{ textAlign: 'right' }}>Reorder Point</th>
              <th style={{ textAlign: 'right' }}>Safety Stock</th>
              <th style={{ textAlign: 'right' }}>Saran Pemesanan</th>
              <th style={{ textAlign: 'right' }}>Estimasi Biaya</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#16a34a' }}>
                  ✓ Persediaan optimal. Tidak ada SKU yang membutuhkan replenishment mendesak.
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
                    Rp {it.totalCost.toLocaleString('id-ID')}
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
