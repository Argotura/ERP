// ============================================================
// ARGOTURO ERP — Inventory Ledger
// ============================================================

import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
          Inventory Ledger (Stock Movement Card)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Permanent audit trail of inbound receipts, shipments, inter-warehouse transfers, and production issues
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Search movement no., reference, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={movementFilter}
          onChange={(e) => setMovementFilter(e.target.value)}
          className="input"
          style={{ width: 240 }}
        >
          <option value="all">All Movement Types</option>
          <option value="inbound">Inbound Receipt</option>
          <option value="outbound">Outbound Shipment</option>
          <option value="transfer">Inter-Warehouse Transfer</option>
          <option value="adjustment">Stock Adjustment</option>
          <option value="production_issue">Production Material Issue</option>
          <option value="production_receipt">Finished Goods Intake</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>Movement Timestamp</th>
              <th>Entry No.</th>
              <th>Movement Type</th>
              <th>Product (SKU)</th>
              <th>Warehouse</th>
              <th>Document Ref</th>
              <th style={{ textAlign: 'right' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Balance After</th>
              <th style={{ textAlign: 'right' }}>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No inventory movement records found.
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
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
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
                        {(entry.movementType || entry.sourceDocType || 'MOVEMENT').toUpperCase().replace('_', ' ')}
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
                      IDR {(entry.totalCost ?? Math.abs(qty * entry.unitCost)).toLocaleString('en-US')}
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
