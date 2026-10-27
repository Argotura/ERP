// ============================================================
// ARGOTURO ERP — Pending Approvals & Authorization Queue
// ============================================================

import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Filter,
  FileText,
  Clock,
  User,
  ShieldAlert,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApprovalRequest } from '../../types';

export default function PendingApprovalsView() {
  const { store, activeUser, approveRequest, rejectRequest } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [activeModalReq, setActiveModalReq] = useState<ApprovalRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const filteredRequests = store.approvalRequests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    const reqType = r.entityType || r.type;
    if (selectedType !== 'all' && reqType !== selectedType) return false;
    return true;
  });

  const handleApprove = (req: ApprovalRequest) => {
    approveRequest(req.id, approvalNotes || 'Disetujui');
    setActiveModalReq(null);
    setApprovalNotes('');
  };

  const handleReject = (req: ApprovalRequest) => {
    rejectRequest(req.id, approvalNotes || 'Ditolak');
    setActiveModalReq(null);
    setApprovalNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Antrean Otorisasi & Persetujuan (Approval Center)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Kelola persetujuan berjenjang untuk dokumen penjualan, pengadaan, beban operasional, dan HR.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-sm"
            style={{ borderRadius: 6, border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: 12 }}
          >
            <option value="pending">Tertunda (Pending)</option>
            <option value="approved">Telah Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="all">Semua Status</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs by Entity Type */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
        {[
          { id: 'all', label: 'Semua Permohonan' },
          { id: 'sales_order', label: 'Sales Order' },
          { id: 'purchase_requisition', label: 'Purchase Requisition (PR)' },
          { id: 'purchase_order', label: 'Purchase Order (PO)' },
          { id: 'expense', label: 'Biaya Operasional' },
          { id: 'leave_request', label: 'Cuti Karyawan' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedType(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: selectedType === tab.id ? '#3b82f6' : '#f1f5f9',
              color: selectedType === tab.id ? '#ffffff' : '#475569',
              fontSize: 12.5,
              fontWeight: selectedType === tab.id ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Jenis Dokumen</th>
              <th>Nomor Dokumen</th>
              <th>Pemohon</th>
              <th>Peran Otorisasi</th>
              <th>Nilai / Kuantitas</th>
              <th>Tanggal Pengajuan</th>
              <th style={{ textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  Tidak ada data persetujuan yang sesuai filter.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor:
                          req.status === 'approved'
                            ? '#dcfce7'
                            : req.status === 'rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          req.status === 'approved'
                            ? '#15803d'
                            : req.status === 'rejected'
                            ? '#b91c1c'
                            : '#b45309',
                      }}
                    >
                      {req.status === 'approved'
                        ? 'Disetujui'
                        : req.status === 'rejected'
                        ? 'Ditolak'
                        : 'Menunggu Persetujuan'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {(req.entityType || req.type || '').toUpperCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{req.entityNumber || req.documentNumber}</td>
                  <td>{req.requestedBy || req.requesterName}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {req.roleRequired || req.targetRole}
                    </span>
                  </td>
                  <td>
                    {(req.entityType === 'leave_request' || req.type === 'leave_request')
                      ? `${req.amount || 1} Hari`
                      : req.amount
                      ? `Rp ${req.amount.toLocaleString('id-ID')}`
                      : '—'}
                  </td>
                  <td>{new Date(req.createdAt || req.submittedAt || Date.now()).toLocaleDateString('id-ID')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalReq(req);
                          setApprovalNotes('');
                        }}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                      >
                        <Eye size={12} /> Detail
                      </button>

                      {req.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveRequest(req.id, 'Disetujui via antrean cepat')}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              padding: '3px 8px',
                              fontSize: 11,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={12} /> Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectRequest(req.id, 'Ditolak via antrean')}
                            style={{
                              backgroundColor: '#f8fafc',
                              color: '#ef4444',
                              border: '1px solid #cbd5e1',
                              borderRadius: 4,
                              padding: '3px 8px',
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail / Approval Modal */}
      {activeModalReq && (
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
          <div
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckSquare size={20} color="#3b82f6" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Review Dokumen Otorisasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalReq(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Jenis Dokumen:</span>
                  <div style={{ fontWeight: 600 }}>{(activeModalReq.entityType || activeModalReq.type || '').toUpperCase().replace('_', ' ')}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Nomor Dokumen:</span>
                  <div style={{ fontWeight: 600, color: '#3b82f6' }}>{activeModalReq.entityNumber || activeModalReq.documentNumber}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Diajukan Oleh:</span>
                  <div>{activeModalReq.requestedBy || activeModalReq.requesterName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Peran Berwenang:</span>
                  <div style={{ fontWeight: 600 }}>{activeModalReq.roleRequired || activeModalReq.targetRole}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', fontSize: 11 }}>Total Nilai Transaksi:</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                    {(activeModalReq.entityType === 'leave_request' || activeModalReq.type === 'leave_request')
                      ? `${activeModalReq.amount} Hari Cuti`
                      : activeModalReq.amount
                      ? `Rp ${activeModalReq.amount.toLocaleString('id-ID')}`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Catatan Otorisasi / Alasan Penolakan:
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Tambahkan catatan resmi (opsional)..."
                rows={3}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  padding: 8,
                  fontSize: 12.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveModalReq(null)}
              >
                Tutup
              </button>
              {activeModalReq.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleReject(activeModalReq)}
                  >
                    Tolak Permohonan
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleApprove(activeModalReq)}
                  >
                    Setujui & Terbitkan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
