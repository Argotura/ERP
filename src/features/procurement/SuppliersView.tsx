// ============================================================
// ARGOTURO ERP — Suppliers & Vendors Directory
// ============================================================

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';

export default function SuppliersView() {
  const { store, saveSupplier, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('NET 30');

  const filtered = store.suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `SUP-${String(store.suppliers.length + 1).padStart(3, '0')}`;
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
      taxId: '02.456.789.1-023.000',
      paymentTerms,
      leadTimeDays: 7,
      currentPayable: 0,
      rating: 4.8,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    saveSupplier(newSup);
    setShowModal(false);
    addToast('success', `New vendor ${name} (${code}) registered successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Supplier & Vendor Directory
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Supply chain partner master data, contact points, payment terms, and vendor performance ratings
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Add New Vendor
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
        <input
          type="text"
          className="input"
          placeholder="Search by code or vendor name..."
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
              <th>Vendor / Manufacturer Name</th>
              <th>Contact Person</th>
              <th>Email & Phone</th>
              <th>Payment Terms</th>
              <th>Vendor Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 4,
                      backgroundColor: s.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: s.status === 'active' ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{s.code}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.address}</div>
                </td>
                <td>{s.contactPerson}</td>
                <td>
                  <div>{s.email}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.phone}</div>
                </td>
                <td>{s.paymentTerms}</td>
                <td>
                  <span style={{ color: '#d97706', fontWeight: 600 }}>★ {s.rating}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              width: 520,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Register Supplier / Vendor</h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Vendor Company Name:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. PT Schneider Electric Indonesia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Contact Person (PIC):</label>
                <input
                  type="text"
                  className="input"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                />
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
                  <option value="NET 60">NET 60</option>
                  <option value="Cash On Delivery">Cash On Delivery</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Phone / WhatsApp:</label>
                <input
                  type="text"
                  className="input"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Office & Warehouse Address:</label>
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
                Save Vendor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
