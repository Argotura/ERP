// ============================================================
// ARGOTURO ERP — Purchase Requisitions (Permintaan Pembelian)
// ============================================================

import React, { useState } from 'react';
import { FileText, Plus, CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseRequisition } from '../../types';

export default function PurchaseRequisitionsView() {
  const { store, activeUser, savePurchaseRequisition, approvePR, convertPRToPO, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<PurchaseRequisition | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(store.suppliers[0]?.id || '');

  // Form State
  const [department, setDepartment] = useState('Gudang & Logistik');
  const [justification, setJustification] = useState('Pengadaan rutin untuk replenishment inventaris');
  const [lines, setLines] = useState([
    { productId: store.products[0]?.id || '', quantity: 20, estimatedUnitCost: store.products[0]?.unitCost || 0 },
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const estimatedTotal = lines.reduce((s, l) => s + l.quantity * l.estimatedUnitCost, 0);
    const prNumber = `PR-${new Date().getFullYear()}-${String(store.purchaseRequisitions.length + 1).padStart(5, '0')}`;

    const newPR: PurchaseRequisition = {
      id: `pr-${Date.now()}`,
      prNumber,
      requisitionNumber: prNumber,
      requesterName: activeUser.name,
      department,
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      warehouseCode: store.warehouses[0].code,
      status: 'pending_approval',
      totalEstimatedAmount: estimatedTotal,
      estimatedTotal,
      businessJustification: justification,
      justification,
      lines: lines.map((l, i) => {
        const prod = store.products.find((p) => p.id === l.productId);
        return {
          id: `prl-${Date.now()}-${i}`,
          productId: l.productId,
          sku: prod?.sku || 'SKU',
          productName: prod?.name || 'Item',
          quantity: l.quantity,
          unit: prod?.unit || 'PCS',
          estimatedUnitCost: l.estimatedUnitCost,
          estimatedTotal: l.quantity * l.estimatedUnitCost,
          subtotal: l.quantity * l.estimatedUnitCost,
        };
      }),
      createdAt: new Date().toISOString(),
    };

    savePurchaseRequisition(newPR);
    setShowCreateModal(false);
    addToast('success', `Purchase Requisition ${prNumber} berhasil diajukan`);
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertModal) return;
    convertPRToPO(showConvertModal.id, selectedSupplierId);
    setShowConvertModal(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Permintaan Pembelian (Purchase Requisitions / PR)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Pengajuan kebutuhan pengadaan internal sebelum diterbitkan PO resmi ke vendor
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Buat PR Baru
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Permintaan</th>
              <th>Departemen</th>
              <th>Tanggal Pengajuan</th>
              <th>Tanggal Diperlukan</th>
              <th>Justifikasi Kebutuhan</th>
              <th style={{ textAlign: 'right' }}>Estimasi Total</th>
              <th style={{ textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {store.purchaseRequisitions.map((pr) => (
              <tr key={pr.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 4,
                      backgroundColor:
                        pr.status === 'ordered'
                          ? '#dcfce7'
                          : pr.status === 'approved'
                          ? '#eff6ff'
                          : '#fef3c7',
                      color:
                        pr.status === 'ordered'
                          ? '#15803d'
                          : pr.status === 'approved'
                          ? '#1d4ed8'
                          : '#b45309',
                    }}
                  >
                    {pr.status === 'ordered'
                      ? 'Dipesan (PO)'
                      : pr.status === 'approved'
                      ? 'Disetujui'
                      : 'Pending Approval'}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{pr.requisitionNumber || pr.prNumber}</td>
                <td>{pr.department}</td>
                <td>{new Date(pr.requestDate).toLocaleDateString('id-ID')}</td>
                <td>{new Date(pr.requiredDate).toLocaleDateString('id-ID')}</td>
                <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pr.justification || pr.businessJustification}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  Rp {(pr.estimatedTotal ?? pr.totalEstimatedAmount ?? 0).toLocaleString('id-ID')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    {pr.status === 'pending_approval' && (
                      <button
                        type="button"
                        onClick={() => approvePR(pr.id)}
                        className="btn btn-sm btn-success"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                      >
                        <CheckCircle2 size={12} /> Setujui
                      </button>
                    )}
                    {pr.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => setShowConvertModal(pr)}
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        Konversi ke PO <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convert to PO Modal */}
      {showConvertModal && (
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
            onSubmit={handleConvert}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 480,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
              Penerbitan PO dari PR {showConvertModal.requisitionNumber}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Pilih vendor pemasok untuk menerbitkan Purchase Order resmi.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Pemasok / Vendor:</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="input"
                required
              >
                {store.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name} ({s.paymentTerms})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowConvertModal(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Terbitkan Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create PR Modal */}
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
            onSubmit={handleCreate}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 640,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Buat Permintaan Pembelian (PR)</h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Departemen:</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input">
                  <option value="Gudang & Logistik">Gudang & Logistik</option>
                  <option value="Produksi & Perakitan">Produksi & Perakitan</option>
                  <option value="Teknik & Engineering">Teknik & Engineering</option>
                  <option value="Operasional Kantor">Operasional Kantor</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Alasan / Justifikasi:</label>
                <input
                  type="text"
                  className="input"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Item Produk:</label>
              {lines.map((l, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <select
                    value={l.productId}
                    onChange={(e) => {
                      const prod = store.products.find((p) => p.id === e.target.value);
                      const updated = [...lines];
                      updated[idx] = { ...updated[idx], productId: e.target.value, estimatedUnitCost: prod?.unitCost || 0 };
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
                    value={l.estimatedUnitCost}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].estimatedUnitCost = parseInt(e.target.value, 10) || 0;
                      setLines(updated);
                    }}
                    style={{ width: 140 }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Ajukan PR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
