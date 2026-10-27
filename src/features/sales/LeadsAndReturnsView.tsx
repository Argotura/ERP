// ============================================================
// ARGOTURO ERP — Leads Pipeline & Sales Returns
// ============================================================

import React, { useState } from 'react';
import { Users, RotateCcw, Plus, Mail, Phone, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LeadsAndReturnsView({ mode }: { mode: 'leads' | 'returns' }) {
  const { store } = useApp();

  if (mode === 'returns') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Retur Penjualan (Sales Returns)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Pencatatan pengembalian barang dari pelanggan, nota retur, dan pengembalian stok ke karantina
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>No. Retur</th>
                <th>No. Faktur Asal</th>
                <th>Pelanggan</th>
                <th>Alasan Retur</th>
                <th>Status</th>
                <th>Tanggal Retur</th>
                <th style={{ textAlign: 'right' }}>Total Retur</th>
              </tr>
            </thead>
            <tbody>
              {store.salesReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                    Belum ada retur penjualan yang dicatat.
                  </td>
                </tr>
              ) : (
                store.salesReturns.map((r) => {
                  const invoice = r.invoiceId ? store.customerInvoices.find((i) => i.id === r.invoiceId) : null;
                  const customer = r.customerName ? { name: r.customerName } : (invoice ? store.customers.find((c) => c.id === invoice.customerId) : null);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{r.returnNumber}</td>
                      <td>{invoice?.invoiceNumber || r.deliveryOrderNumber || r.deliveryOrderId || '-'}</td>
                      <td>{customer?.name || 'Pelanggan'}</td>
                      <td>{r.reason || (r.lines && r.lines[0]?.reason) || 'Cacat Pabrik'}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 4,
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                          }}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(r.returnDate).toLocaleDateString('id-ID')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        Rp {(r.totalAmount || 0).toLocaleString('id-ID')}
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

  // Leads Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Prospek & Pipeline Penjualan (Leads & CRM)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Kelola peluang bisnis baru, prospek industri, dan konversi ke pelanggan aktif
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Nama Prospek</th>
              <th>Perusahaan</th>
              <th>Kontak</th>
              <th>Sumber Prospek</th>
              <th style={{ textAlign: 'right' }}>Estimasi Nilai</th>
              <th>Sales Rep</th>
            </tr>
          </thead>
          <tbody>
            {store.leads.map((l) => (
              <tr key={l.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 4,
                      backgroundColor:
                        l.status === 'qualified'
                          ? '#dcfce7'
                          : l.status === 'contacted'
                          ? '#eff6ff'
                          : '#fef3c7',
                      color:
                        l.status === 'qualified'
                          ? '#15803d'
                          : l.status === 'contacted'
                          ? '#1d4ed8'
                          : '#b45309',
                    }}
                  >
                    {l.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{l.name}</td>
                <td>{l.company || l.companyName || '-'}</td>
                <td>
                  <div>{l.email}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{l.phone}</div>
                </td>
                <td>{l.source}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  Rp {l.estimatedValue.toLocaleString('id-ID')}
                </td>
                <td>{l.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
