// ============================================================
// ARGOTURO ERP — Sales Quotations
// ============================================================

import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Quotation } from '../../types';

export default function QuotationsView() {
  const { store, activeUser, saveQuotation, convertQuotationToSO, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState(store.customers[0]?.id || '');
  const [deliveryAddress, setDeliveryAddress] = useState('GIIC Industrial Estate, Cikarang');
  const [paymentTerms, setPaymentTerms] = useState('NET 30');
  const [lines, setLines] = useState([
    { productId: store.products[0]?.id || '', quantity: 10, unitPrice: store.products[0]?.sellingPrice || 0, discount: 0 },
  ]);

  const calculateSubtotal = () =>
    lines.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - l.discount / 100), 0);

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = calculateSubtotal();
    const taxAmount = Math.round(subtotal * (store.companySettings.standardVatRate / 100));
    const grandTotal = subtotal + taxAmount;

    const qNumber = `QUO-${new Date().getFullYear()}-${String(store.quotations.length + 1).padStart(5, '0')}`;
    const newQuotation: Quotation = {
      id: `quo-${Date.now()}`,
      quotationNumber: qNumber,
      customerId,
      customerName: store.customers.find((c) => c.id === customerId)?.name || 'Customer',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'pending_approval',
      lines: lines.map((l, i) => {
        const prod = store.products.find((p) => p.id === l.productId);
        const sub = Math.round(l.quantity * l.unitPrice * (1 - l.discount / 100));
        return {
          id: `quol-${Date.now()}-${i}`,
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount,
          subtotal: sub,
          unitCost: prod?.unitCost || 0,
        };
      }),
      subtotal,
      taxAmount,
      taxTotal: taxAmount,
      grandTotal,
      notes: '',
      paymentTerms,
      deliveryAddress,
      salesperson: activeUser.name,
      createdAt: new Date().toISOString(),
    };

    saveQuotation(newQuotation);
    setShowCreateModal(false);
    addToast('success', `Sales Quotation ${qNumber} created successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Sales Quotations
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Formal price estimates for prospects and clients before conversion into binding sales orders
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Create Quotation
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Quotation No.</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Valid Until</th>
              <th>Salesperson</th>
              <th style={{ textAlign: 'right' }}>Total Estimate</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.quotations.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No quotations found.
                </td>
              </tr>
            ) : (
              store.quotations.map((q) => {
                const customer = store.customers.find((c) => c.id === q.customerId);
                return (
                  <tr key={q.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: q.status === 'approved' ? '#dcfce7' : '#fef3c7',
                          color: q.status === 'approved' ? '#15803d' : '#b45309',
                        }}
                      >
                        {q.status === 'approved' ? 'Converted to SO' : 'Active Quotation'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{q.quotationNumber}</td>
                    <td>{customer?.name || 'Customer'}</td>
                    <td>{new Date(q.quotationDate || q.date || q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{new Date(q.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{q.salesperson || q.salesRep || 'Sales Team'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      IDR {q.grandTotal.toLocaleString('en-US')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {q.status !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => convertQuotationToSO(q.id)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          Convert to SO <ArrowRight size={11} />
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Converted</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
            onSubmit={handleCreateQuotation}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 650,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Create Sales Quotation</h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Customer:</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="input"
                >
                  {store.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Payment Terms:</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="input"
                >
                  <option value="NET 14">NET 14</option>
                  <option value="NET 30">NET 30</option>
                  <option value="Cash Before Delivery">Cash Before Delivery</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Quotation Items:</label>
              {lines.map((l, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <select
                    value={l.productId}
                    onChange={(e) => {
                      const prod = store.products.find((p) => p.id === e.target.value);
                      const updated = [...lines];
                      updated[idx] = { ...updated[idx], productId: e.target.value, unitPrice: prod?.sellingPrice || 0 };
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
                    value={l.unitPrice}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].unitPrice = parseInt(e.target.value, 10) || 0;
                      setLines(updated);
                    }}
                    style={{ width: 140 }}
                  />
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 13, textAlign: 'right', marginBottom: 20 }}>
              <div>Subtotal: IDR {calculateSubtotal().toLocaleString('en-US')}</div>
              <div style={{ margin: '4px 0' }}>
                VAT ({store.companySettings.standardVatRate}%): IDR {Math.round(calculateSubtotal() * (store.companySettings.standardVatRate / 100)).toLocaleString('en-US')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                Total: IDR {Math.round(calculateSubtotal() * (1 + store.companySettings.standardVatRate / 100)).toLocaleString('en-US')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Quotation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
