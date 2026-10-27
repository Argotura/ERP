// ============================================================
// ARGOTURO ERP — Sales Orders (Pesanan Penjualan)
// ============================================================

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Truck,
  FileCheck,
  AlertCircle,
  Eye,
  Building2,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SalesOrder } from '../../types';

export default function SalesOrdersView() {
  const {
    store,
    activeUser,
    saveSalesOrder,
    approveSalesOrder,
    createDeliveryOrder,
    createCustomerInvoice,
    addToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New SO Form State
  const [customerId, setCustomerId] = useState(store.customers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState(store.warehouses[0]?.id || '');
  const [paymentTerms, setPaymentTerms] = useState('NET 30');
  const [shippingAddress, setShippingAddress] = useState('Kawasan Industri GIIC Cikarang');
  const [selectedLines, setSelectedLines] = useState<
    { productId: string; quantity: number; unitPrice: number; discount: number }[]
  >([{ productId: store.products[0]?.id || '', quantity: 5, unitPrice: store.products[0]?.sellingPrice || 0, discount: 0 }]);

  const filteredOrders = store.salesOrders.filter((so) => {
    if (statusFilter !== 'all' && so.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const customer = store.customers.find((c) => c.id === so.customerId);
      const matchNumber = so.orderNumber.toLowerCase().includes(q);
      const matchCustomer = customer?.name.toLowerCase().includes(q);
      return matchNumber || matchCustomer;
    }
    return true;
  });

  const handleAddLine = () => {
    const firstProduct = store.products[0];
    setSelectedLines([
      ...selectedLines,
      { productId: firstProduct?.id || '', quantity: 1, unitPrice: firstProduct?.sellingPrice || 0, discount: 0 },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setSelectedLines(selectedLines.filter((_, i) => i !== idx));
  };

  const handleLineProductChange = (idx: number, pId: string) => {
    const p = store.products.find((prod) => prod.id === pId);
    const updated = [...selectedLines];
    updated[idx] = {
      ...updated[idx],
      productId: pId,
      unitPrice: p ? p.sellingPrice : 0,
    };
    setSelectedLines(updated);
  };

  const calculateSubtotal = () =>
    selectedLines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (1 - l.discount / 100), 0);

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLines.length === 0) {
      addToast('warning', 'Tambahkan minimal satu item produk.');
      return;
    }

    const subtotal = calculateSubtotal();
    const taxAmount = Math.round(subtotal * (store.companySettings.standardVatRate / 100));
    const grandTotal = subtotal + taxAmount;
    const isApprovalRequired = grandTotal > store.companySettings.soApprovalThreshold;

    const soId = `so-${Date.now()}`;
    const orderNumber = `SO-${new Date().getFullYear()}-${String(store.salesOrders.length + 1).padStart(5, '0')}`;

    const newSO: SalesOrder = {
      id: soId,
      orderNumber,
      customerId,
      customerName: store.customers.find((c) => c.id === customerId)?.name || 'Pelanggan',
      notes: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: isApprovalRequired ? 'pending_approval' : 'approved',
      lines: selectedLines.map((l, i) => {
        const prod = store.products.find((p) => p.id === l.productId);
        const sub = Math.round(l.quantity * l.unitPrice * (1 - l.discount / 100));
        return {
          id: `sol-${Date.now()}-${i}`,
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount,
          subtotal: sub,
          fulfilledQuantity: 0,
          unitCost: prod?.unitCost || 0,
        };
      }),
      subtotal,
      taxAmount,
      grandTotal,
      paymentTerms,
      shippingAddress,
      warehouseId,
      salesperson: activeUser.name,
      createdAt: new Date().toISOString(),
    };

    saveSalesOrder(newSO);
    setShowCreateModal(false);
    addToast(
      'success',
      `Sales Order ${orderNumber} berhasil dibuat${isApprovalRequired ? ' (Menunggu Persetujuan Manajer)' : ''}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Pesanan Penjualan (Sales Orders)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Kelola pemesanan barang pelanggan, otorisasi kredit, pengiriman, dan penagihan
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Buat Sales Order Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari berdasarkan nomor SO atau nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ width: 180 }}
        >
          <option value="all">Semua Status</option>
          <option value="pending_approval">Menunggu Persetujuan</option>
          <option value="approved">Disetujui (Siap Kirim)</option>
          <option value="partially_fulfilled">Terkirim Sebagian</option>
          <option value="fulfilled">Terkirim Penuh</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Sales Order</th>
              <th>Pelanggan</th>
              <th>Tanggal Order</th>
              <th>Item & Kuantitas</th>
              <th>Progress Kirim</th>
              <th style={{ textAlign: 'right' }}>Total Transaksi</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Tidak ada Sales Order yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredOrders.map((so) => {
                const customer = store.customers.find((c) => c.id === so.customerId);
                const totalQty = so.lines.reduce((s, l) => s + l.quantity, 0);
                const totalFulfilled = so.lines.reduce((s, l) => s + l.fulfilledQuantity, 0);
                const progressPct = totalQty > 0 ? Math.round((totalFulfilled / totalQty) * 100) : 0;

                return (
                  <tr key={so.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor:
                            so.status === 'fulfilled'
                              ? '#dcfce7'
                              : so.status === 'partially_fulfilled'
                              ? '#e0e7ff'
                              : so.status === 'approved'
                              ? '#eff6ff'
                              : '#fef3c7',
                          color:
                            so.status === 'fulfilled'
                              ? '#15803d'
                              : so.status === 'partially_fulfilled'
                              ? '#3730a3'
                              : so.status === 'approved'
                              ? '#1d4ed8'
                              : '#b45309',
                        }}
                      >
                        {so.status === 'fulfilled'
                          ? 'Terkirim Penuh'
                          : so.status === 'partially_fulfilled'
                          ? 'Kirim Sebagian'
                          : so.status === 'approved'
                          ? 'Disetujui'
                          : 'Pending Approval'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{so.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{customer?.name || 'Pelanggan'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{so.salesperson || so.salesRep || 'Sales Team'}</div>
                    </td>
                    <td>{new Date(so.orderDate).toLocaleDateString('id-ID')}</td>
                    <td>
                      {so.lines.length} Baris ({totalQty} Unit)
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              backgroundColor: progressPct === 100 ? '#10b981' : '#3b82f6',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10.5, color: '#64748b' }}>{progressPct}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      Rp {so.grandTotal.toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSO(so)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                      >
                        <Eye size={12} /> Detail & Alur
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail & Action Drawer */}
      {selectedSO && (
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
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Detail Sales Order: {selectedSO.orderNumber}
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Pelanggan:{' '}
                  {store.customers.find((c) => c.id === selectedSO.customerId)?.name || selectedSO.customerId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSO(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Workflow Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {selectedSO.status === 'pending_approval' && (
                <button
                  type="button"
                  onClick={() => {
                    approveSalesOrder(selectedSO.id);
                    setSelectedSO(null);
                  }}
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <CheckCircle2 size={14} /> Setujui Sales Order
                </button>
              )}

              {selectedSO.status !== 'pending_approval' && selectedSO.status !== 'fulfilled' && (
                <button
                  type="button"
                  onClick={() => {
                    createDeliveryOrder(selectedSO.id, selectedSO.warehouseId || selectedSO.warehouseCode || store.warehouses[0].id);
                    setSelectedSO(null);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <Truck size={14} /> Buat Surat Jalan (DO)
                </button>
              )}

              {selectedSO.status !== 'pending_approval' && (
                <button
                  type="button"
                  onClick={() => {
                    createCustomerInvoice(selectedSO.id);
                    setSelectedSO(null);
                  }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, backgroundColor: '#f8fafc' }}
                >
                  <FileCheck size={14} /> Terbitkan Faktur (Invoice)
                </button>
              )}
            </div>

            {/* Line Items Table */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Daftar Barang Pesanan
            </h4>
            <table className="data-table" style={{ width: '100%', fontSize: 12.5, marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Jumlah Order</th>
                  <th>Terkirim</th>
                  <th>Harga Satuan</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedSO.lines.map((l) => {
                  const prod = store.products.find((p) => p.id === l.productId);
                  return (
                    <tr key={l.id}>
                      <td>
                        <strong>{prod?.sku || 'SKU'}</strong> — {prod?.name || l.productId}
                      </td>
                      <td>{l.quantity} PCS</td>
                      <td>
                        <span style={{ color: l.fulfilledQuantity >= l.quantity ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                          {l.fulfilledQuantity} PCS
                        </span>
                      </td>
                      <td>Rp {l.unitPrice.toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {l.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Calculation Breakdown */}
            <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 6, fontSize: 12.5, textAlign: 'right' }}>
              <div>Subtotal: Rp {selectedSO.subtotal.toLocaleString('id-ID')}</div>
              <div style={{ margin: '4px 0' }}>PPN 11%: Rp {(selectedSO.taxAmount ?? selectedSO.taxTotal ?? 0).toLocaleString('id-ID')}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                Grand Total: Rp {selectedSO.grandTotal.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create SO Modal */}
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
            onSubmit={handleCreateSO}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 720,
              maxWidth: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Buat Pesanan Penjualan Baru (Sales Order)
              </h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Pelanggan:
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="input"
                  required
                >
                  {store.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Gudang Pengeluaran:
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="input"
                  required
                >
                  {store.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Ketentuan Pembayaran:
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="input"
                >
                  <option value="Cash Before Delivery">Cash Before Delivery (CBD)</option>
                  <option value="NET 14">NET 14 Hari</option>
                  <option value="NET 30">NET 30 Hari</option>
                  <option value="NET 60">NET 60 Hari</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Alamat Pengiriman:
                </label>
                <input
                  type="text"
                  className="input"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Line Items Picker */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Item Pesanan</span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: 11 }}
                >
                  + Tambah Baris Produk
                </button>
              </div>

              {selectedLines.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <select
                    value={line.productId}
                    onChange={(e) => handleLineProductChange(idx, e.target.value)}
                    className="input"
                    style={{ flex: 2 }}
                  >
                    {store.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name} (Stok: {p.onHandStock})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="input"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => {
                      const updated = [...selectedLines];
                      updated[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setSelectedLines(updated);
                    }}
                    style={{ width: 80 }}
                  />

                  <input
                    type="number"
                    className="input"
                    placeholder="Harga Satuan"
                    value={line.unitPrice}
                    onChange={(e) => {
                      const updated = [...selectedLines];
                      updated[idx].unitPrice = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setSelectedLines(updated);
                    }}
                    style={{ width: 140 }}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Totals Preview */}
            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 13, textAlign: 'right', marginBottom: 20 }}>
              <div>Subtotal: Rp {calculateSubtotal().toLocaleString('id-ID')}</div>
              <div style={{ margin: '4px 0' }}>
                PPN ({store.companySettings.standardVatRate}%): Rp{' '}
                {Math.round(calculateSubtotal() * (store.companySettings.standardVatRate / 100)).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                Grand Total: Rp{' '}
                {Math.round(calculateSubtotal() * (1 + store.companySettings.standardVatRate / 100)).toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan & Terbitkan SO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
