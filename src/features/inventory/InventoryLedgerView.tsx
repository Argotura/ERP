// ============================================================
// ARGOTURO ERP — Inventory Ledger (Buku Besar Kartu Stok Mutasi)
// ============================================================

import React, { useState } from 'react';
import { BookOpen, Search, Filter, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Sliders } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InventoryLedgerView() {
  const { store } = useApp();
  const [search, setSearch] = useState('');
  const [movementFilter, setMovementFilter] = useState('all');

  const filteredLedger = store.inventoryLedger.filter((entry) => {
    if (movementFilter !== 'all' && entry.movementType !== movementFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const product = store.products.find((p) => p.id === entry.productId);
      const matchNumber = (entry.entryNumber || entry.transactionNumber || '').toLowerCase().includes(q);
      const matchRef = (entry.referenceNumber || entry.sourceDocNumber || '').toLowerCase().includes(q);
      const matchProduct = product ? product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q) : false;
      return matchNumber || matchRef || matchProduct;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Buku Besar Persediaan (Inventory Ledger / Kartu Stok)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Jejak audit permanen setiap mutasi barang masuk, keluar, transfer antar gudang, dan perakitan produksi
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari no. mutasi, referensi, atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={movementFilter}
          onChange={(e) => setMovementFilter(e.target.value)}
          className="input"
          style={{ width: 220 }}
        >
          <option value="all">Semua Tipe Mutasi</option>
          <option value="inbound">Penerimaan Masuk (Inbound)</option>
          <option value="outbound">Pengeluaran Logistik (Outbound)</option>
          <option value="transfer">Transfer Antar Gudang</option>
          <option value="adjustment">Penyesuaian (Adjustment)</option>
          <option value="production_issue">Konsumsi Bahan Produksi</option>
          <option value="production_receipt">Penerimaan Barang Jadi</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>Waktu Mutasi</th>
              <th>No. Entri Mutasi</th>
              <th>Tipe Pergerakan</th>
              <th>Produk (SKU)</th>
              <th>Lokasi Gudang</th>
              <th>Referensi Dokumen</th>
              <th style={{ textAlign: 'right' }}>Kuantitas Mutasi</th>
              <th style={{ textAlign: 'right' }}>Saldo Akhir</th>
              <th style={{ textAlign: 'right' }}>Nilai Mutasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  Belum ada catatan mutasi inventaris.
                </td>
              </tr>
            ) : (
              filteredLedger.map((entry) => {
                const product = store.products.find((p) => p.id === entry.productId);
                const warehouse = store.warehouses.find((w) => w.id === entry.warehouseId || w.code === entry.warehouseCode);
                const qty = entry.quantity !== undefined ? entry.quantity : (entry.quantityIn ? entry.quantityIn : -(entry.quantityOut || 0));
                const isPositive = qty > 0;

                return (
                  <tr key={entry.id}>
                    <td>
                      {new Date(entry.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{entry.entryNumber || entry.transactionNumber}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 3,
                          backgroundColor:
                            entry.movementType === 'inbound' || entry.movementType === 'production_receipt' || entry.quantityIn
                              ? '#dcfce7'
                              : entry.movementType === 'outbound' || entry.movementType === 'production_issue' || entry.quantityOut
                              ? '#fee2e2'
                              : '#eff6ff',
                          color:
                            entry.movementType === 'inbound' || entry.movementType === 'production_receipt' || entry.quantityIn
                              ? '#15803d'
                              : entry.movementType === 'outbound' || entry.movementType === 'production_issue' || entry.quantityOut
                              ? '#b91c1c'
                              : '#1d4ed8',
                        }}
                      >
                        {(entry.movementType || entry.sourceDocType || 'MUTASI').toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product?.sku || 'SKU'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{product?.name || entry.productId}</div>
                    </td>
                    <td>{warehouse?.code || entry.warehouseCode || 'WH-MAIN'}</td>
                    <td>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>{entry.referenceNumber || entry.sourceDocNumber || '-'}</span>
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: isPositive ? '#10b981' : '#ef4444',
                      }}
                    >
                      {isPositive ? `+${qty}` : qty} {product?.uom || product?.unit || 'PCS'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {entry.balanceAfter} {product?.uom || product?.unit || 'PCS'}
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>
                      Rp {(entry.totalCost ?? Math.abs(qty * entry.unitCost)).toLocaleString('id-ID')}
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
