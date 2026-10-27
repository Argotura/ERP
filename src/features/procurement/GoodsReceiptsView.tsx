// ============================================================
// ARGOTURO ERP — Goods Receipts (Penerimaan Barang / GRN)
// ============================================================

import React from 'react';
import { PackageCheck, Truck, Warehouse, Calendar, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function GoodsReceiptsView() {
  const { store } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Penerimaan Barang Gudang (Goods Receipts / GRN)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Pencatatan penerimaan fisik dari vendor, inspeksi kualitas, penomoran batch, dan penambahan stok
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Penerimaan</th>
              <th>Referensi PO</th>
              <th>Gudang Penerima</th>
              <th>Petugas Gudang</th>
              <th>Tanggal Terima</th>
              <th>Item Diterima & Batch</th>
            </tr>
          </thead>
          <tbody>
            {store.goodsReceipts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada dokumen penerimaan barang.
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
                    <td>{warehouse?.name || 'Gudang Pusat'}</td>
                    <td>{gr.receivedBy}</td>
                    <td>{new Date(gr.receiptDate).toLocaleDateString('id-ID')}</td>
                    <td>
                      {gr.lines.length} Produk ({totalAccepted} Unit Diterima)
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

