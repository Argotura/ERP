// ============================================================
// ARGOTURO ERP — Operational Reports & Inventory Valuation
// ============================================================

import React, { useState } from 'react';
import { FileSpreadsheet, PieChart, TrendingUp, BarChart2, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OperationalReportsView({ mode }: { mode: 'sales' | 'purchasing' | 'valuation' }) {
  const { store } = useApp();

  if (mode === 'purchasing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Laporan Rekapitulasi Pengadaan (Purchasing Summary Report)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Statistik pengeluaran pembelian barang per vendor pemasok dan tren pengadaan barang
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Pemasok / Vendor</th>
                <th>Jumlah Purchase Order</th>
                <th>Status Pembayaran</th>
                <th style={{ textAlign: 'right' }}>Total Pembelian (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {store.suppliers.map((s) => {
                const pos = store.purchaseOrders.filter((po) => po.supplierId === s.id);
                const totalSpent = pos.reduce((sum, po) => sum + po.grandTotal, 0);

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{s.code}</div>
                    </td>
                    <td>{pos.length} Pesanan (PO)</td>
                    <td>{s.paymentTerms}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      Rp {totalSpent.toLocaleString('id-ID')}
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

  if (mode === 'valuation') {
    const totalValuation = store.products.reduce((s, p) => s + p.onHandStock * p.unitCost, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Laporan Valuasi Nilai Persediaan (Inventory Valuation)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Penilaian nilai aset barang dagang dan komponen manufaktur menggunakan metode FIFO Perpetual
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 320 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Nilai Buku Persediaan</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            Rp {totalValuation.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Tercatat di Akun 11310 GL</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'right' }}>Stok Fisik</th>
                <th style={{ textAlign: 'right' }}>Harga Beli Standar (HPP)</th>
                <th style={{ textAlign: 'right' }}>Total Nilai Aset</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((p) => {
                const cat = store.categories.find((c) => c.id === p.categoryId);
                const val = p.onHandStock * p.unitCost;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{p.sku}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{cat?.name || 'Umum'}</td>
                    <td style={{ textAlign: 'right' }}>{p.onHandStock} {p.uom}</td>
                    <td style={{ textAlign: 'right' }}>Rp {p.unitCost.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      Rp {val.toLocaleString('id-ID')}
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

  // Sales Mode (Default)
  const totalSalesRevenue = store.salesOrders.reduce((s, so) => s + so.grandTotal, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Laporan Operasional Penjualan (Sales Operational Report)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Rekapitulasi transaksi penjualan per pelanggan industri, status pemenuhan, dan total pendapatan
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 320 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Nilai Pesanan Penjualan</span>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
          Rp {totalSalesRevenue.toLocaleString('id-ID')}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
          {store.salesOrders.length} Pesanan Terbit
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Pelanggan</th>
              <th>Total Transaksi (SO)</th>
              <th>Status Pemenuhan</th>
              <th style={{ textAlign: 'right' }}>Akumulasi Nilai Penjualan (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {store.customers.map((c) => {
              const sos = store.salesOrders.filter((s) => s.customerId === c.id);
              const totalVal = sos.reduce((sum, so) => sum + so.grandTotal, 0);

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{c.code}</div>
                  </td>
                  <td>{sos.length} Orders</td>
                  <td>{sos.some((s) => s.status === 'fulfilled') ? 'Aktif Terkirim' : 'Menunggu / Proses'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                    Rp {totalVal.toLocaleString('id-ID')}
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

