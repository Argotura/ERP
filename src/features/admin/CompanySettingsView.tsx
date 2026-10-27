// ============================================================
// ARGOTURO ERP — Company Settings (Pengaturan Perusahaan)
// ============================================================

import React, { useState } from 'react';
import { Settings, Building2, Shield, DollarSign, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CompanySettingsView() {
  const { store, addToast } = useApp();
  const [settings, setSettings] = useState(store.companySettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.companySettings = settings;
    addToast('success', 'Pengaturan parameter perusahaan berhasil diperbarui');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Pengaturan Konfigurasi Perusahaan (Company Settings)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Identitas badan usaha, NPWP, tahun fiskal, tarif PPN standar, dan threshold otorisasi manajerial
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 24, maxWidth: 760 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nama Perusahaan:</label>
              <input
                type="text"
                className="input"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Tagline Resmi:</label>
              <input
                type="text"
                className="input"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>NPWP Perusahaan:</label>
              <input
                type="text"
                className="input"
                value={settings.taxId}
                onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Alamat Kantor Pusat & Pabrik:</label>
              <input
                type="text"
                className="input"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Tarif Standar PPN (%):</label>
              <input
                type="number"
                className="input"
                value={settings.standardVatRate}
                onChange={(e) => setSettings({ ...settings, standardVatRate: parseInt(e.target.value, 10) || 11 })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Mata Uang Utama:</label>
              <input
                type="text"
                className="input"
                value={settings.defaultCurrency}
                disabled
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Batas Approval SO Manajer (Rp):
              </label>
              <input
                type="number"
                className="input"
                value={settings.soApprovalThreshold}
                onChange={(e) => setSettings({ ...settings, soApprovalThreshold: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Batas Approval PO Manajer (Rp):
              </label>
              <input
                type="number"
                className="input"
                value={settings.poApprovalThreshold}
                onChange={(e) => setSettings({ ...settings, poApprovalThreshold: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={15} /> Simpan Perubahan Parameter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

