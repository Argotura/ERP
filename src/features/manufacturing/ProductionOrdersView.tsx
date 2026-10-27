// ============================================================
// ARGOTURO ERP — Production Orders (Perintah Kerja Perakitan / MO)
// ============================================================

import React, { useState } from 'react';
import { Hammer, Plus, CheckCircle2, Boxes, Package, Calendar, Warehouse } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionOrder } from '../../types';

export default function ProductionOrdersView() {
  const { store, createProductionOrder, issueMaterialsForMO, completeProductionOrder, addToast } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [bomId, setBomId] = useState(store.billsOfMaterials[0]?.id || '');
  const [targetQty, setTargetQty] = useState(10);
  const [warehouseId, setWarehouseId] = useState(store.warehouses[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProductionOrder(bomId, targetQty, warehouseId, dueDate);
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Perintah Kerja Produksi (Manufacturing Orders / MO)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Perakitan produk industri, alokasi bahan baku, pelacakan proses kerja, dan penerimaan barang jadi
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Buat Perintah Produksi (MO)
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status Produksi</th>
              <th>No. Perintah (MO)</th>
              <th>Barang Jadi</th>
              <th>Formula BOM</th>
              <th>Target Selesai</th>
              <th>Target Output</th>
              <th>Hasil Jadi</th>
              <th style={{ textAlign: 'right' }}>Aksi Lantai Pabrik</th>
            </tr>
          </thead>
          <tbody>
            {store.productionOrders.map((mo) => {
              const product = store.products.find((p) => p.id === mo.productId || p.id === mo.finishedProductId);
              const bom = store.billsOfMaterials.find((b) => b.id === mo.bomId);

              return (
                <tr key={mo.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor:
                          mo.status === 'completed'
                            ? '#dcfce7'
                            : mo.status === 'in_progress'
                            ? '#eff6ff'
                            : '#fef3c7',
                        color:
                          mo.status === 'completed'
                            ? '#15803d'
                            : mo.status === 'in_progress'
                            ? '#1d4ed8'
                            : '#b45309',
                      }}
                    >
                      {mo.status === 'completed'
                        ? 'Selesai (Completed)'
                        : mo.status === 'in_progress'
                        ? 'Sedang Dirakit'
                        : 'Terencana (Planned)'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{mo.orderNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product?.name || 'Produk Jadi'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{product?.sku}</div>
                  </td>
                  <td>{bom?.name || bom?.finishedProductName || mo.bomCode || mo.bomId}</td>
                  <td>{new Date(mo.dueDate || mo.startDate || mo.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={{ fontWeight: 600 }}>{mo.quantityToProduce ?? mo.plannedQty ?? 0} PCS</td>
                  <td style={{ fontWeight: 600, color: (mo.quantityProduced ?? mo.completedQty ?? 0) > 0 ? '#10b981' : '#64748b' }}>
                    {mo.quantityProduced ?? mo.completedQty ?? 0} PCS
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {mo.status === 'planned' && (
                        <button
                          type="button"
                          onClick={() => issueMaterialsForMO(mo.id)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Boxes size={12} /> Keluarkan Bahan Baku
                        </button>
                      )}

                      {mo.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => completeProductionOrder(mo.id, mo.quantityToProduce ?? mo.plannedQty ?? 1)}
                          className="btn btn-sm btn-success"
                          style={{ fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <CheckCircle2 size={12} /> Selesai & Terima Barang Jadi
                        </button>
                      )}

                      {mo.status === 'completed' && (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          ✓ Barang Jadi Masuk Stok
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Terbitkan Perintah Kerja Produksi (MO)
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Pilih Formula Struktur Produk (BOM):
                </label>
                <select
                  value={bomId}
                  onChange={(e) => setBomId(e.target.value)}
                  className="input"
                  required
                >
                  {store.billsOfMaterials.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bomNumber || b.bomCode} — {b.name || b.finishedProductName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Jumlah Unit yang Akan Dirakit:
                </label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={targetQty}
                  onChange={(e) => setTargetQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Gudang Penerima Hasil Jadi:
                </label>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Target Tanggal Selesai:
                </label>
                <input
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Terbitkan Perintah Kerja
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
