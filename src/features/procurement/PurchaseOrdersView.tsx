// ============================================================
// ARGOTURO ERP — Purchase Orders (Pesanan Pembelian)
// ============================================================

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  Truck,
  FileCheck,
  Building2,
  Eye,
  PackageCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder } from '../../types';

export default function PurchaseOrdersView() {
  const {
    store,
    activeUser,
    savePurchaseOrder,
    approvePO,
    createGoodsReceipt,
    createSupplierInvoice,
    addToast,
  } = useApp();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New PO State
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState(store.warehouses[0]?.id || '');
  const [lines, setLines] = useState([
    { productId: store.products[0]?.id || '', quantity: 25, unitCost: store.products[0]?.unitCost || 0 },
  ]);

  const calculateSubtotal = () => lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = calculateSubtotal();
    const taxAmount = Math.round(subtotal * (store.companySettings.standardVatRate / 100));
    const grandTotal = subtotal + taxAmount;
    const isApprovalReq = grandTotal > store.companySettings.poApprovalThreshold;

    const poNumber = `PO-${new Date().getFullYear()}-${String(store.purchaseOrders.length + 1).padStart(5, '0')}`;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      orderNumber: poNumber,
      supplierId,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: isApprovalReq ? 'pending_approval' : 'approved',
      lines: lines.map((l, i) => ({
        id: `pol-${Date.now()}-${i}`,
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.unitCost,
        subtotal: l.quantity * l.unitCost,
        receivedQuantity: 0,
      })),
      subtotal,
      taxTotal: taxAmount,
      taxAmount,
      grandTotal,
      poNumber: poNumber,
      supplierName: store.suppliers.find((s) => s.id === supplierId)?.name || '',
      warehouseCode: store.warehouses.find((w) => w.id === warehouseId)?.code || 'WH-01',
      expectedArrival: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      notes: '',
      paymentTerms: 'NET 30',
      warehouseId,
      buyer: activeUser.name,
      createdAt: new Date().toISOString(),
    };

    savePurchaseOrder(newPO);
    setShowCreateModal(false);
    addToast('success', `Purchase Order ${poNumber} berhasil diterbitkan`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Pesanan Pembelian (Purchase Orders / PO)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Penerbitan pesanan resmi ke pemasok, kontrol penerimaan barang (GRN), dan tagihan vendor
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Buat PO Baru
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. PO</th>
              <th>Pemasok / Vendor</th>
              <th>Tanggal Order</th>
              <th>Estimasi Tiba</th>
              <th>Progress Terima</th>
              <th style={{ textAlign: 'right' }}>Total Pembelian</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {store.purchaseOrders.map((po) => {
              const supplier = store.suppliers.find((s) => s.id === po.supplierId);
              const totalQty = po.lines.reduce((s, l) => s + l.quantity, 0);
              const totalReceived = po.lines.reduce((s, l) => s + l.receivedQuantity, 0);
              const recvPct = totalQty > 0 ? Math.round((totalReceived / totalQty) * 100) : 0;

              return (
                <tr key={po.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor:
                          po.status === 'received'
                            ? '#dcfce7'
                            : po.status === 'partially_received'
                            ? '#e0e7ff'
                            : po.status === 'approved'
                            ? '#eff6ff'
                            : '#fef3c7',
                        color:
                          po.status === 'received'
                            ? '#15803d'
                            : po.status === 'partially_received'
                            ? '#3730a3'
                            : po.status === 'approved'
                            ? '#1d4ed8'
                            : '#b45309',
                      }}
                    >
                      {po.status === 'received'
                        ? 'Diterima Penuh'
                        : po.status === 'partially_received'
                        ? 'Terima Sebagian'
                        : po.status === 'approved'
                        ? 'Disetujui'
                        : 'Pending Approval'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{po.orderNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{supplier?.name || 'Pemasok'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Buyer: {po.buyer}</div>
                  </td>
                  <td>{new Date(po.orderDate).toLocaleDateString('id-ID')}</td>
                  <td>{new Date(po.expectedDeliveryDate || po.expectedArrival || po.orderDate).toLocaleDateString('id-ID')}</td>
                  <td style={{ minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${recvPct}%`,
                            height: '100%',
                            backgroundColor: recvPct === 100 ? '#10b981' : '#3b82f6',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 10.5, color: '#64748b' }}>{recvPct}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    Rp {po.grandTotal.toLocaleString('id-ID')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPO(po)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      <Eye size={12} /> Detail & Alur
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedPO && (
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
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 680,
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Detail Purchase Order: {selectedPO.orderNumber}
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Pemasok:{' '}
                  {store.suppliers.find((s) => s.id === selectedPO.supplierId)?.name || selectedPO.supplierId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPO(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Procurement Actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {selectedPO.status === 'pending_approval' && (
                <button
                  type="button"
                  onClick={() => {
                    approvePO(selectedPO.id);
                    setSelectedPO(null);
                  }}
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <CheckCircle2 size={14} /> Setujui Purchase Order
                </button>
              )}

              {selectedPO.status !== 'pending_approval' && selectedPO.status !== 'received' && (
                <button
                  type="button"
                  onClick={() => {
                    createGoodsReceipt(selectedPO.id, selectedPO.warehouseId || store.warehouses[0].id);
                    setSelectedPO(null);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <PackageCheck size={14} /> Terima Barang Masuk (GRN)
                </button>
              )}

              {selectedPO.status !== 'pending_approval' && (
                <button
                  type="button"
                  onClick={() => {
                    createSupplierInvoice(selectedPO.id);
                    setSelectedPO(null);
                  }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <FileCheck size={14} /> Catat Tagihan Pemasok (Bill)
                </button>
              )}
            </div>

            {/* Line items table */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Barang yang Dipesan
            </h4>
            <table className="data-table" style={{ width: '100%', fontSize: 12.5, marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Jumlah Dipesan</th>
                  <th>Jumlah Diterima</th>
                  <th>Harga Beli Satuan</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO.lines.map((l) => {
                  const prod = store.products.find((p) => p.id === l.productId);
                  return (
                    <tr key={l.id}>
                      <td>
                        <strong>{prod?.sku}</strong> — {prod?.name}
                      </td>
                      <td>{l.quantity} PCS</td>
                      <td>
                        <span style={{ color: l.receivedQuantity >= l.quantity ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                          {l.receivedQuantity} PCS
                        </span>
                      </td>
                      <td>Rp {l.unitCost.toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {l.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 6, fontSize: 12.5, textAlign: 'right' }}>
              <div>Subtotal: Rp {selectedPO.subtotal.toLocaleString('id-ID')}</div>
              <div style={{ margin: '4px 0' }}>PPN 11%: Rp {(selectedPO.taxAmount ?? selectedPO.taxTotal ?? 0).toLocaleString('id-ID')}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                Grand Total: Rp {selectedPO.grandTotal.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
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
            onSubmit={handleCreatePO}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 700,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Buat Purchase Order Baru</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Pemasok:</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="input"
                >
                  {store.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Gudang Penerima:</label>
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
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Item Produk:</label>
              {lines.map((l, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <select
                    value={l.productId}
                    onChange={(e) => {
                      const prod = store.products.find((p) => p.id === e.target.value);
                      const updated = [...lines];
                      updated[idx] = { ...updated[idx], productId: e.target.value, unitCost: prod?.unitCost || 0 };
                      setLines(updated);
                    }}
                    className="input"
                    style={{ flex: 2 }}
                  >
                    {store.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={l.quantity}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setLines(updated);
                    }}
                    style={{ width: 80 }}
                  />

                  <input
                    type="number"
                    className="input"
                    value={l.unitCost}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].unitCost = parseInt(e.target.value, 10) || 0;
                      setLines(updated);
                    }}
                    style={{ width: 140 }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Terbitkan Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
