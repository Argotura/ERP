// ============================================================
// NEXORA ERP — Outbound Logistics & Dispatch (Surat Jalan DO)
// ============================================================

import React, { useState } from 'react';
import { Send, Plus, Search, CheckCircle2, Clock, Truck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OutboundView() {
  const { store, createOutboundDispatch } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('Internal Fleet Truck');
  const [totalItems, setTotalItems] = useState('10');

  const dispatches = store.outboundDispatches || [];

  const filteredDispatches = dispatches.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        d.doNumber.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q) ||
        d.carrier.toLowerCase().includes(q) ||
        d.dispatchedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(totalItems, 10) || 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    createOutboundDispatch({
      doNumber: `DO-2026-${randomSuffix}`,
      customerName: customerName || 'PT Client Enterprise Mandiri',
      destination: destination || 'Jakarta Industrial Estate Pulogadung',
      totalItems: count,
      carrier: carrier || 'Internal Logistics',
      status: 'dispatched',
      dispatchedBy: 'Alex Morgan',
    });

    setModalOpen(false);
    setCustomerName('');
    setDestination('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="badge badge-success" style={{ gap: 4 }}>
            <CheckCircle2 size={12} /> Delivered & Signed
          </span>
        );
      case 'in_transit':
        return (
          <span className="badge badge-warning" style={{ gap: 4 }}>
            <Truck size={12} /> In Transit (On Delivery)
          </span>
        );
      default:
        return (
          <span className="badge badge-info" style={{ gap: 4 }}>
            <Clock size={12} /> Dispatched from Dock
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Outbound Fulfillment & Delivery Orders (Surat Jalan DO)</h2>
          <p>Sales shipment dispatches, packing slip verification, commercial carrier tracking, and proof of delivery</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Create Delivery Order
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
            placeholder="Search DO #, Customer, Destination, Carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="results-info">
          Showing {filteredDispatches.length} delivery order record(s)
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>DO Number</th>
                <th>Recipient / Customer</th>
                <th>Destination Address</th>
                <th style={{ width: 180 }}>Logistics Carrier</th>
                <th style={{ textAlign: 'right', width: 100 }}>Total Items</th>
                <th style={{ width: 160 }}>Fulfillment Status</th>
                <th style={{ width: 130 }}>Dispatch Date</th>
                <th style={{ width: 110 }}>Dispatcher</th>
              </tr>
            </thead>
            <tbody>
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <Send className="empty-state-icon" />
                      <h3>No delivery orders found</h3>
                      <p>Adjust your search criteria or issue a new delivery order.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((d) => (
                  <tr key={d.id}>
                    <td className="td-sku" style={{ fontWeight: 600 }}>{d.doNumber}</td>
                    <td style={{ fontWeight: 500 }}>{d.customerName}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.destination}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.carrier}</td>
                    <td className="td-number" style={{ fontWeight: 600 }}>{d.totalItems}</td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(d.date).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>{d.dispatchedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Outbound */}
      {modalOpen && (
        <div className="overlay">
          <div className="modal modal-md">
            <div className="modal-header">
              <div className="modal-title">Issue Delivery Order (Surat Jalan)</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Customer / Client Recipient</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PT Astra Digital Mandiri"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Delivery Destination Address</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter full recipient address, building/floor, contact name..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Carrier / Expeditor</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Internal Fleet Truck, JNE Trucking, Dakota Cargo"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Total Quantities Dispatched</label>
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Dispatch & Print Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

