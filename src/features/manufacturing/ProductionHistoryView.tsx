// ============================================================
// ARGOTURO ERP — Production History & Material Consumption
// ============================================================

import React from 'react';
import { Activity, Boxes, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProductionHistoryView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Histori Perakitan & Konsumsi Bahan (Production History)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Arsip hasil perakitan, riwayat penggunaan komponen bahan baku, dan efisiensi lantai pabrik
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>No. Perintah (MO)</th>
              <th>Barang Jadi Dihasilkan</th>
              <th>Kuantitas Selesai</th>
              <th>Tanggal Selesai</th>
              <th>Status</th>
              <th>Rincian Konsumsi Bahan Baku</th>
            </tr>
          </thead>
          <tbody>
            {store.productionOrders.map((mo) => {
              const product = store.products.find((p) => p.id === mo.productId || p.id === mo.finishedProductId);
              return (
                <tr key={mo.id}>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{mo.orderNumber}</td>
                  <td>
                    <strong>{product?.sku}</strong> — {product?.name}
                  </td>
                  <td>{mo.quantityProduced ?? mo.completedQty ?? mo.plannedQty ?? 0} PCS</td>
                  <td>{mo.completionDate || (mo.status === 'completed' ? new Date(mo.createdAt).toLocaleDateString('id-ID') : 'Dalam Proses')}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: mo.status === 'completed' ? '#dcfce7' : '#eff6ff',
                        color: mo.status === 'completed' ? '#15803d' : '#1d4ed8',
                      }}
                    >
                      {mo.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {(mo.components || []).map((c: any, i: number) => {
                      const cp = store.products.find((prod) => prod.id === c.productId);
                      return (
                        <div key={i} style={{ fontSize: 11.5, color: '#475569' }}>
                          • {cp?.name || c.productName || 'Bahan Baku'}: {c.issuedQuantity || c.quantity || 0} Unit
                        </div>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
