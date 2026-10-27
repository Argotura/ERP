// ============================================================
// NEXORA ERP — Inbound Logistics & Receiving (Penerimaan Barang)
// ============================================================

import React, { useState } from 'react';
import { Truck, Plus, Search, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InboundView() {
  const { store, createInboundReceipt } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [poNumber, setPoNumber] = useState('');
  const [supplierName, setSupplierName] = useState(store.suppliers[0]?.name || '');
  const [warehouseLocation, setWarehouseLocation] = useState('WH-A1');
  const [totalItems, setTotalItems] = useState('25');

  const inboundReceipts = store.inboundReceipts || [];

  const filteredReceipts = inboundReceipts.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        r.receiptNumber.toLowerCase().includes(q) ||
        r.poNumber.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.warehouseLocation.toLowerCase().includes(q) ||
        r.receivedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(totalItems, 10) || 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    createInboundReceipt({
      receiptNumber: `RCV-2026-${randomSuffix}`,
      poNumber: poNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName,
      totalItems: count,
      warehouseLocation,
      status: 'inspecting',
      receivedBy: 'Alex Morgan',
    });

    setModalOpen(false);
    setPoNumber('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-success" style={{ gap: 4 }}>
            <CheckCircle2 size={12} /> QA Passed / Stored
          </span>
        );
      case 'inspecting':
        return (
          <span className="badge badge-warning" style={{ gap: 4 }}>
            <Clock size={12} /> Under QA Inspection
          </span>
        );
      default:
        return (
          <span className="badge badge-info" style={{ gap: 4 }}>
            <Truck size={12} /> Staged at Dock
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Inbound Receiving & Procurement Logs (Penerimaan Barang)</h2>
          <p>Dock receipt inspection, PO line verification, supplier consignment, and staging status</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Log Inbound Delivery
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
            placeholder="Search Receipt #, PO #, supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="results-info">
          Showing {filteredReceipts.length} inbound receipt record(s)
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Receipt Number</th>
                <th style={{ width: 130 }}>PO Reference</th>
                <th>Supplier Vendor</th>
                <th style={{ width: 110 }}>Destination WH</th>
                <th style={{ textAlign: 'right', width: 110 }}>Total Units</th>
                <th style={{ width: 170 }}>QA & Staging Status</th>
                <th style={{ width: 130 }}>Receiving Date</th>
                <th style={{ width: 120 }}>Warehouse Officer</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <Truck className="empty-state-icon" />
                      <h3>No inbound shipments found</h3>
                      <p>Adjust your search criteria or register a new incoming PO delivery.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id}>
                    <td className="td-sku" style={{ fontWeight: 600 }}>{r.receiptNumber}</td>
                    <td className="td-sku">{r.poNumber}</td>
                    <td style={{ fontWeight: 500 }}>{r.supplierName}</td>
                    <td className="td-sku">{r.warehouseLocation}</td>
                    <td className="td-number" style={{ fontWeight: 600 }}>{r.totalItems}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(r.date).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>{r.receivedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inbound */}
      {modalOpen && (
        <div className="overlay">
          <div className="modal modal-md">
            <div className="modal-header">
              <div className="modal-title">Register Inbound Receiving Shipment</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label required">Purchase Order (PO) Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. PO-2026-8812"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Receiving Warehouse Location</label>
                    <select
                      className="form-select"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                    >
                      <option value="WH-A1">WH-A1 (Cikarang Central DC)</option>
                      <option value="WH-A2">WH-A2 (Cikarang Bay B)</option>
                      <option value="WH-B1">WH-B1 (Sunter Hub)</option>
                      <option value="WH-B2">WH-B2 (Tangerang Facility)</option>
                      <option value="WH-C1">WH-C1 (Surabaya Hub)</option>
                      <option value="WH-C2">WH-C2 (Safety Depot)</option>
                      <option value="WH-D1">WH-D1 (Karawang Spares)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Delivering Supplier</label>
                  <select
                    className="form-select"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  >
                    {store.suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Total Quantity Received (Items)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={totalItems}
                    onChange={(e) => setTotalItems(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Inbound Receiving
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

