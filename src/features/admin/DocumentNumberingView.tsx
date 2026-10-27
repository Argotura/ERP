// ============================================================
// ARGOTURO ERP — Document Numbering & Sequence Engine
// ============================================================

import React from 'react';
import { Hash, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DocumentNumberingView() {
  const { store } = useApp();

  const numberingRules = [
    { type: 'Quotation Penawaran', prefix: 'QUO', sample: 'QUO-2026-00004', count: store.quotations.length },
    { type: 'Sales Order (Pesanan)', prefix: 'SO', sample: 'SO-2026-00005', count: store.salesOrders.length },
    { type: 'Delivery Order (Surat Jalan)', prefix: 'DO', sample: 'DO-2026-00003', count: store.deliveryOrders.length },
    { type: 'Faktur Penjualan (Invoice)', prefix: 'INV', sample: 'INV-2026-00004', count: store.customerInvoices.length },
    { type: 'Penerimaan Pembayaran', prefix: 'CP', sample: 'CP-2026-00003', count: store.customerPayments.length },
    { type: 'Purchase Requisition (PR)', prefix: 'PR', sample: 'PR-2026-00003', count: store.purchaseRequisitions.length },
    { type: 'Purchase Order (PO)', prefix: 'PO', sample: 'PO-2026-00004', count: store.purchaseOrders.length },
    { type: 'Penerimaan Barang (GRN)', prefix: 'GR', sample: 'GR-2026-00003', count: store.goodsReceipts.length },
    { type: 'Tagihan Pemasok (Bill)', prefix: 'BILL', sample: 'BILL-2026-00003', count: store.supplierInvoices.length },
    { type: 'Pembayaran ke Vendor', prefix: 'SP', sample: 'SP-2026-00002', count: store.supplierPayments.length },
    { type: 'Perintah Produksi (MO)', prefix: 'MO', sample: 'MO-2026-00003', count: store.productionOrders.length },
    { type: 'Transfer Antar Gudang', prefix: 'TRF', sample: 'TRF-2026-00002', count: store.stockTransfers.length },
    { type: 'Penyesuaian Stok (Adj)', prefix: 'ADJ', sample: 'ADJ-2026-00002', count: store.stockAdjustments.length },
    { type: 'Buku Jurnal Umum', prefix: 'JE', sample: 'JE-2026-00010', count: store.journalEntries.length },
    { type: 'Biaya Beban Operasional', prefix: 'EXP', sample: 'EXP-2026-00003', count: store.expenses.length },
    { type: 'Penggajian Karyawan', prefix: 'PAY', sample: 'PAY-2026-00002', count: store.payrollRuns.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Pola Penomoran Dokumen Otomatis (Document Sequences)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Format sequence number enterprise standar per tahun berjalan untuk mencegah duplikasi nomor dokumen
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Jenis Dokumen Bisnis</th>
              <th>Awalan Kode (Prefix)</th>
              <th>Pola Format Sequence</th>
              <th>Contoh Nomor Dokumen Terbit</th>
              <th style={{ textAlign: 'right' }}>Total Dokumen Tercatat</th>
            </tr>
          </thead>
          <tbody>
            {numberingRules.map((rule, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{rule.type}</td>
                <td>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {rule.prefix}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', color: '#64748b' }}>
                  {rule.prefix}-[YYYY]-[00001]
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
                  {rule.sample}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#3b82f6' }}>
                  {rule.count} Dokumen
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

