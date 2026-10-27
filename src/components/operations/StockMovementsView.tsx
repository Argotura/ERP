// ============================================================
// NEXORA ERP — Stock Movements (Kartu Stok / Mutasi Barang)
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  Plus,
  Search,
  Download,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNumber } from '../../utils/helpers';
import { MovementType } from '../../types';

export default function StockMovementsView() {
  const { store, createStockMovement } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('inbound');
  const [quantity, setQuantity] = useState('10');
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('WH-A1');
  const [notes, setNotes] = useState('');

  const filteredMovements = useMemo(() => {
    return (store.stockMovements || []).filter((m) => {
      if (typeFilter && m.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          m.refNo.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.productName.toLowerCase().includes(q) ||
          m.fromLocation.toLowerCase().includes(q) ||
          m.toLocation.toLowerCase().includes(q) ||
          m.performedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [store.stockMovements, typeFilter, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = store.products.find((p) => p.id === productId);
    if (!prod) return;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNo = `TRX-${movementType.toUpperCase().slice(0, 3)}-2026-${randomSuffix}`;

    createStockMovement({
      refNo,
      type: movementType,
      productId: prod.id,
      sku: prod.sku,
      productName: prod.name,
      quantity: qty,
      fromLocation: fromLoc || (movementType === 'inbound' ? 'Supplier Receiving' : 'WH-A1'),
      toLocation: toLoc || (movementType === 'outbound' ? 'Customer Delivery' : 'WH-A1'),
      notes: notes || 'Operational ledger entry',
      performedBy: 'Alex Morgan',
    });

    setModalOpen(false);
    setNotes('');
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'inbound':
        return (
          <span className="badge badge-success" style={{ gap: 4 }}>
            <ArrowDownLeft size={13} /> INBOUND
          </span>
        );
      case 'outbound':
        return (
          <span className="badge badge-danger" style={{ gap: 4 }}>
            <ArrowUpRight size={13} /> OUTBOUND
          </span>
        );
      case 'transfer':
        return (
          <span className="badge badge-info" style={{ gap: 4 }}>
            <ArrowLeftRight size={13} /> TRANSFER
          </span>
        );
      case 'adjustment':
        return (
          <span className="badge badge-warning" style={{ gap: 4 }}>
            <Sliders size={13} /> ADJUSTMENT
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Header Info */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Stock Movements & Ledger (Kartu Stok)</h2>
          <p>Real-time audit log of all inbound receipts, dispatches, warehouse transfers, and adjustments</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Record Movement
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search ref #, SKU, product, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Movement Types</option>
          <option value="inbound">Inbound (+)</option>
          <option value="outbound">Outbound (-)</option>
          <option value="transfer">Internal Transfer</option>
          <option value="adjustment">Stock Adjustment</option>
        </select>

        <div className="results-info">
          Showing {filteredMovements.length} recorded movement(s)
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Ref Number</th>
                <th style={{ width: 120 }}>Type</th>
                <th>Product & SKU</th>
                <th style={{ textAlign: 'right', width: 90 }}>Qty</th>
                <th>From Location</th>
                <th>To Destination</th>
                <th>Notes / Ref Order</th>
                <th style={{ width: 130 }}>Date & Time</th>
                <th style={{ width: 120 }}>Officer</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <ArrowLeftRight className="empty-state-icon" />
                      <h3>No stock movements found</h3>
                      <p>Adjust your search criteria or record a new transaction.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id}>
                    <td className="td-sku" style={{ fontWeight: 600 }}>{m.refNo}</td>
                    <td>{getMovementBadge(m.type)}</td>
                    <td>
                      <div className="td-product-cell">
                        <span style={{ fontWeight: 500 }}>{m.productName}</span>
                        <span className="td-sku" style={{ fontSize: 11 }}>{m.sku}</span>
                      </div>
                    </td>
                    <td
                      className="td-number"
                      style={{
                        fontWeight: 700,
                        color:
                          m.type === 'inbound'
                            ? 'var(--success-text)'
                            : m.type === 'outbound'
                            ? 'var(--danger-text)'
                            : undefined,
                      }}
                    >
                      {m.type === 'inbound' ? '+' : m.type === 'outbound' ? '-' : ''}
                      {formatNumber(Math.abs(m.quantity))}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.fromLocation}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.toLocation}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.notes}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(m.date).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>{m.performedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Record Movement */}
      {modalOpen && (
        <div className="overlay">
          <div className="modal modal-md">
            <div className="modal-header">
              <div className="modal-title">Record Stock Movement / Transaction</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label required">Movement Type</label>
                    <select
                      className="form-select"
                      value={movementType}
                      onChange={(e) => setMovementType(e.target.value as MovementType)}
                    >
                      <option value="inbound">Inbound (Stock In / Receiving)</option>
                      <option value="outbound">Outbound (Dispatch / Sales Issue)</option>
                      <option value="transfer">Inter-Warehouse Transfer</option>
                      <option value="adjustment">Stock Opname Adjustment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Target Product</label>
                  <select
                    className="form-select"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    {store.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] {p.name} (Current On-hand: {p.onHandStock} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label required">From Origin</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Vendor Delivery or WH-A1"
                      value={fromLoc}
                      onChange={(e) => setFromLoc(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">To Destination</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. WH-B1 or Client Site"
                      value={toLoc}
                      onChange={(e) => setToLoc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Reference Document</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PO-2026-902, DO-Surat-Jalan, or regular replenishment"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Post Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

