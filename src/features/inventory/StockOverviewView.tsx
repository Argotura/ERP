// ============================================================
// ARGOTURO ERP — Stock Overview (Ringkasan Persediaan Multi-Gudang)
// ============================================================

import React, { useState } from 'react';
import { Boxes, Warehouse, Search, AlertTriangle, Layers, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StockOverviewView() {
  const { store } = useApp();
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const filteredProducts = store.products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const totalInventoryValue = store.products.reduce((s, p) => s + p.onHandStock * p.unitCost, 0);
  const totalPhysicalUnits = store.products.reduce((s, p) => s + p.onHandStock, 0);
  const lowStockCount = store.products.filter((p) => p.onHandStock <= p.reorderLevel).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Ringkasan Persediaan Multi-Gudang (Stock Overview)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Monitoring ketersediaan stok fisik, barang dialokasikan, dan valuasi aset per gudang
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Nilai Persediaan</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            Rp {totalInventoryValue.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Metode FIFO Perpetual</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Unit Fisik</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
            {totalPhysicalUnits.toLocaleString('id-ID')} Unit
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Di 5 Fasilitas Pergudangan</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Item Low-Stock</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: lowStockCount > 0 ? '#ef4444' : '#1e293b', marginTop: 4 }}>
            {lowStockCount} SKU
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Berada di bawah batas aman</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Cari SKU atau nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="input"
          style={{ width: 220 }}
        >
          <option value="all">Semua Lokasi Gudang</option>
          {store.warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Multi-Warehouse Grid Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama Produk</th>
              <th>Satuan</th>
              <th style={{ textAlign: 'right' }}>Stok Total</th>
              {store.warehouses.map((w) => (
                <th key={w.id} style={{ textAlign: 'right' }}>
                  {w.code}
                </th>
              ))}
              <th style={{ textAlign: 'right' }}>Valuasi Aset</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const isLow = p.onHandStock <= p.reorderLevel;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{p.sku}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    {isLow && (
                      <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>
                        ⚠ Batas Reorder: {p.reorderLevel}
                      </span>
                    )}
                  </td>
                  <td>{p.uom}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: isLow ? '#ef4444' : '#1e293b' }}>
                    {p.onHandStock}
                  </td>
                  {store.warehouses.map((w) => {
                    const whAlloc = (p.warehouses || []).find((item) => item.warehouseId === w.id);
                    const qty = whAlloc ? whAlloc.onHandStock : 0;
                    return (
                      <td key={w.id} style={{ textAlign: 'right', color: qty > 0 ? '#334155' : '#94a3b8' }}>
                        {qty}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                    Rp {(p.onHandStock * p.unitCost).toLocaleString('id-ID')}
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
