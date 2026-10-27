// ============================================================
// NEXORA ERP — Stock Adjustments & Opname (Penyesuaian Stok)
// ============================================================

import React, { useState, useMemo } from 'react';
import { Sliders, Plus, Search, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNumber } from '../../utils/helpers';

export default function StockAdjustmentsView() {
  const { store, createStockAdjustment, approveStockAdjustment } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [warehouseLocation, setWarehouseLocation] = useState('WH-A1');
  const [actualQtyStr, setActualQtyStr] = useState('10');
  const [reason, setReason] = useState('');
  const [immediateApprove, setImmediateApprove] = useState(true);

  const selectedProduct = useMemo(() => {
    return store.products.find((p) => p.id === productId) || store.products[0];
  }, [store.products, productId]);

  const systemQty = selectedProduct ? selectedProduct.onHandStock : 0;
  const actualQty = parseInt(actualQtyStr, 10) || 0;
  const diffQty = actualQty - systemQty;

  const filteredAdjustments = useMemo(() => {
    return (store.stockAdjustments || []).filter((a) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          a.refNo.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          a.productName.toLowerCase().includes(q) ||
          a.warehouseLocation.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q) ||
          a.auditor.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [store.stockAdjustments, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const refNo = `ADJ-OPN-2026-${randomSuffix}`;

    createStockAdjustment({
      refNo,
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      warehouseLocation,
      systemQty,
      actualQty,
      diffQty,
      reason: reason || 'Physical inventory cycle count verification',
      status: immediateApprove ? 'approved' : 'pending',
      auditor: 'Alex Morgan',
    });

    setModalOpen(false);
    setReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Header Info */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Stock Adjustments & Cycle Counts (Stock Opname)</h2>
          <p>Reconcile physical warehouse counts with system inventory, write-offs, and audit variances</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> New Stock Opname
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
            placeholder="Search Opname #, SKU, warehouse, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="results-info">
          Showing {filteredAdjustments.length} adjustment audit record(s)
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Adjustment Ref</th>
                <th>Product & SKU</th>
                <th style={{ width: 100 }}>Warehouse</th>
                <th style={{ textAlign: 'right', width: 100 }}>System Qty</th>
                <th style={{ textAlign: 'right', width: 100 }}>Physical Count</th>
                <th style={{ textAlign: 'right', width: 90 }}>Variance</th>
                <th>Reason / Findings</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 110 }}>Auditor</th>
                <th style={{ textAlign: 'right', width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <Sliders className="empty-state-icon" />
                      <h3>No stock adjustment records found</h3>
                      <p>Create a new stock opname or adjust your search filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((a) => (
                  <tr key={a.id}>
                    <td className="td-sku" style={{ fontWeight: 600 }}>{a.refNo}</td>
                    <td>
                      <div className="td-product-cell">
                        <span style={{ fontWeight: 500 }}>{a.productName}</span>
                        <span className="td-sku" style={{ fontSize: 11 }}>{a.sku}</span>
                      </div>
                    </td>
                    <td className="td-sku">{a.warehouseLocation}</td>
                    <td className="td-number">{formatNumber(a.systemQty)}</td>
                    <td className="td-number" style={{ fontWeight: 600 }}>{formatNumber(a.actualQty)}</td>
                    <td
                      className="td-number"
                      style={{
                        fontWeight: 700,
                        color:
                          a.diffQty < 0
                            ? 'var(--danger-text)'
                            : a.diffQty > 0
                            ? 'var(--success-text)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {a.diffQty > 0 ? `+${a.diffQty}` : a.diffQty}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 280 }}>
                      {a.reason}
                    </td>
                    <td>
                      {a.status === 'approved' ? (
                        <span className="badge badge-success" style={{ gap: 4 }}>
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ gap: 4 }}>
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>{a.auditor}</td>
                    <td className="td-actions">
                      {a.status === 'pending' ? (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ height: 26, fontSize: 11, padding: '0 8px' }}
                          onClick={() => approveStockAdjustment(a.id)}
                          title="Approve adjustment and commit actual quantity to catalog stock"
                        >
                          Approve
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Posted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal New Stock Opname */}
      {modalOpen && (
        <div className="overlay">
          <div className="modal modal-md">
            <div className="modal-header">
              <div className="modal-title">Record Stock Opname / Cycle Count Variance</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Select Item for Verification</label>
                  <select
                    className="form-select"
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value);
                      const p = store.products.find((prod) => prod.id === e.target.value);
                      if (p) setActualQtyStr(String(p.onHandStock));
                    }}
                  >
                    {store.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid cols-3" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Warehouse</label>
                    <select
                      className="form-select"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                    >
                      <option value="WH-A1">WH-A1 (Cikarang Central)</option>
                      <option value="WH-A2">WH-A2 (Cikarang Bay B)</option>
                      <option value="WH-B1">WH-B1 (Sunter Hub)</option>
                      <option value="WH-B2">WH-B2 (Tangerang Staging)</option>
                      <option value="WH-C1">WH-C1 (Surabaya Depot)</option>
                      <option value="WH-C2">WH-C2 (Safety Facility)</option>
                      <option value="WH-D1">WH-D1 (Karawang Heavy)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">System Recorded Qty</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`${systemQty} ${selectedProduct?.unit || 'Unit'}`}
                      disabled
                      style={{ background: 'var(--bg-muted)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Physical Counted Qty</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={actualQtyStr}
                      onChange={(e) => setActualQtyStr(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Variance Banner */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: diffQty !== 0 ? 'var(--warning-bg)' : 'var(--bg-surface-alt)',
                    border: `1px solid ${diffQty !== 0 ? 'var(--warning-border)' : 'var(--border-default)'}`,
                    marginBottom: 'var(--sp-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <AlertTriangle size={15} color={diffQty !== 0 ? 'var(--warning-text)' : '#6b7280'} />
                    <span>Calculated Discrepancy (Variance):</span>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color:
                        diffQty < 0
                          ? 'var(--danger-text)'
                          : diffQty > 0
                          ? 'var(--success-text)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {diffQty > 0 ? `+${diffQty}` : diffQty} {selectedProduct?.unit || 'Unit'}
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Reason / Root Cause Investigation</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe reason for count difference (e.g. damaged goods during handling, missing box, sample units dispursed, etc.)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id="immApprove"
                    checked={immediateApprove}
                    onChange={(e) => setImmediateApprove(e.target.checked)}
                  />
                  <label htmlFor="immApprove" style={{ fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                    Auto-approve and immediately update master catalog stock to {actualQty}
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit Opname Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

