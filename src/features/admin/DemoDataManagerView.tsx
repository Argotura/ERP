// ============================================================
// ARGOTURO ERP — Demo Data Management & LocalStorage Engine
// ============================================================

import React from 'react';
import { Database, RotateCcw, Download, ShieldCheck, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DemoDataManagerView() {
  const { store, resetDemoData, addToast } = useApp();

  const rawStorage = localStorage.getItem('argoturo_erp_v2') || '';
  const storageKb = (rawStorage.length / 1024).toFixed(1);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `argoturo_erp_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('success', 'File snapshot backup data demo berhasil diunduh');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Manajemen Penyimpanan Data Demo (Demo Data Cache)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Status persistensi lokal di browser peramban, inspeksi memori, cadangan data, dan reset data pabrik
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Ukuran Cache Browser</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
            {storageKb} KB
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Kunci: 'argoturo_erp_v2'</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Transaksi Finansial</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            {store.journalEntries.length} Jurnal
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>100% Balanced</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Mutasi Kartu Stok</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
            {store.inventoryLedger.length} Mutasi
          </div>
          <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4 }}>Audit Trail Aktif</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
          Tindakan Pemeliharaan Data Demo
        </h3>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportJSON}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} /> Ekspor Snapshot JSON Data Demo
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan semua data ke setelan awal demo? Semua transaksi yang baru dibuat akan dihapus.')) {
                resetDemoData();
              }
            }}
            className="btn btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={15} /> Reset Data ke Setelan Awal Pabrik
          </button>
        </div>
      </div>
    </div>
  );
}

