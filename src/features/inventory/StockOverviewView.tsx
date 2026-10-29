// ============================================================
// ARGOTURO ERP — Stock Overview (Multi-Warehouse Inventory)
// ============================================================

import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
          Stock Overview (Multi-Warehouse)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Real-time physical stock availability, warehouse bin allocations, and asset valuations
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Inventory Value</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            IDR {totalInventoryValue.toLocaleString('en-US')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>FIFO Perpetual Costing</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Physical Units</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
            {totalPhysicalUnits.toLocaleString('en-US')} Units
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Across {store.warehouses.length} Warehouse Facilities</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Low-Stock Items</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: lowStockCount > 0 ? '#ef4444' : '#1e293b', marginTop: 4 }}>
            {lowStockCount} SKU(s)
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Below reorder threshold</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="input"
          style={{ width: 240 }}
        >
          <option value="all">All Warehouse Locations</option>
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
              <th>Product Name</th>
              <th>UOM</th>
              <th style={{ textAlign: 'right' }}>Total Stock</th>
              {store.warehouses.map((w) => (
                <th key={w.id} style={{ textAlign: 'right' }}>
                  {w.code}
                </th>
              ))}
              <th style={{ textAlign: 'right' }}>Asset Valuation</th>
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
                        ⚠ Reorder Level: {p.reorderLevel}
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
                    IDR {(p.onHandStock * p.unitCost).toLocaleString('en-US')}
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
