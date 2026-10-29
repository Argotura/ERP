// ============================================================
// ARGOTURO ERP — Customers Directory
// ============================================================

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

export default function CustomersView() {
  const { store, saveCustomer, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState(100000000);
  const [paymentTerms, setPaymentTerms] = useState('NET 30');

  const filtered = store.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `CUST-${String(store.customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      code,
      name,
      taxId: taxId || '01.234.567.8-012.000',
      email,
      phone,
      address,
      creditLimit,
      currentReceivable: 0,
      paymentTerms,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    saveCustomer(newCust);
    setShowModal(false);
    addToast('success', `Customer ${name} (${code}) added successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Customer Directory
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Enterprise client accounts, credit limits, outstanding receivables, and transaction history
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Add New Customer
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
        <input
          type="text"
          className="input"
          placeholder="Search by code or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Code</th>
              <th>Company Name</th>
              <th>Contact & Address</th>
              <th>Tax ID (NPWP)</th>
              <th>Terms</th>
              <th style={{ textAlign: 'right' }}>Credit Limit</th>
              <th style={{ textAlign: 'right' }}>Receivables Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 4,
                      backgroundColor: c.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: c.status === 'active' ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{c.code}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.email}</div>
                </td>
                <td>
                  <div>{c.phone}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.address}</div>
                </td>
                <td>{c.taxId}</td>
                <td>{c.paymentTerms}</td>
                <td style={{ textAlign: 'right' }}>IDR {c.creditLimit.toLocaleString('en-US')}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: c.currentReceivable > 0 ? '#ef4444' : '#10b981' }}>
                  IDR {c.currentReceivable.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
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
            onSubmit={handleCreate}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 540,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Add New Customer</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Company Name:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. PT Sukses Jaya Abadi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Tax ID (NPWP):</label>
                <input
                  type="text"
                  className="input"
                  placeholder="01.234.567.8-012.000"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Phone / WhatsApp:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="+62 21 8976 5432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Corporate Email:</label>
                <input
                  type="email"
                  className="input"
                  placeholder="procurement@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Credit Limit (IDR):</label>
                <input
                  type="number"
                  className="input"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Full Billing & Shipping Address:</label>
                <textarea
                  className="input"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
