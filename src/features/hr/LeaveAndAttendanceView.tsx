// ============================================================
// ARGOTURO ERP — Attendance & Leave Requests (Presensi & Cuti)
// ============================================================

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Plus, Clock, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LeaveAndAttendanceView({ mode }: { mode: 'attendance' | 'leaves' }) {
  const { store, createLeaveRequest, approveLeaveRequest, rejectLeaveRequest, addToast } = useApp();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState(store.employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'maternity' | 'unpaid' | 'special'>('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [daysCount, setDaysCount] = useState(3);
  const [reason, setReason] = useState('Keperluan keluarga mendesak');

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    createLeaveRequest({
      employeeId,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'pending',
    });
    setShowLeaveModal(false);
  };

  if (mode === 'attendance') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Presensi & Kehadiran Harian (Daily Attendance)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Rekap jam masuk/keluar pegawai, keterlambatan, dan rekapitulasi kehadiran per divisi
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Nama Karyawan</th>
                <th>Tanggal</th>
                <th>Jam Masuk (In)</th>
                <th>Jam Keluar (Out)</th>
                <th>Keterangan / Lembur</th>
              </tr>
            </thead>
            <tbody>
              {store.attendanceRecords.map((att) => {
                const emp = store.employees.find((e) => e.id === att.employeeId);
                return (
                  <tr key={att.id}>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 4,
                          backgroundColor:
                            String(att.status).toLowerCase() === 'present'
                              ? '#dcfce7'
                              : String(att.status).toLowerCase() === 'late'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            String(att.status).toLowerCase() === 'present'
                              ? '#15803d'
                              : String(att.status).toLowerCase() === 'late'
                              ? '#b45309'
                              : '#b91c1c',
                        }}
                      >
                        {String(att.status).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{emp?.name || att.employeeId}</td>
                    <td>{new Date(att.date).toLocaleDateString('id-ID')}</td>
                    <td style={{ color: '#15803d', fontWeight: 600 }}>{att.clockIn || att.checkIn || '—'}</td>
                    <td>{att.clockOut || att.checkOut || '—'}</td>
                    <td style={{ color: '#64748b' }}>
                      {att.overtimeHours ? `Lembur ${att.overtimeHours} jam` : 'Reguler'}
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

  // Leaves Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Permohonan Cuti Karyawan (Leave Requests)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Pengajuan cuti tahunan, sakit, izin khusus, dan persetujuan manajer HR
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowLeaveModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Ajukan Permohonan Cuti
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Pengajuan</th>
              <th>Nama Pegawai</th>
              <th>Jenis Cuti</th>
              <th>Periode Tanggal</th>
              <th>Durasi</th>
              <th>Alasan Cuti</th>
              <th style={{ textAlign: 'right' }}>Aksi HR</th>
            </tr>
          </thead>
          <tbody>
            {store.leaveRequests.map((lr) => {
              const emp = store.employees.find((e) => e.id === lr.employeeId);
              return (
                <tr key={lr.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor:
                          lr.status === 'approved'
                            ? '#dcfce7'
                            : lr.status === 'rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          lr.status === 'approved'
                            ? '#15803d'
                            : lr.status === 'rejected'
                            ? '#b91c1c'
                            : '#b45309',
                      }}
                    >
                      {lr.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{lr.requestNumber}</td>
                  <td style={{ fontWeight: 600 }}>{emp?.name || lr.employeeId}</td>
                  <td>{lr.leaveType.toUpperCase()}</td>
                  <td>
                    {new Date(lr.startDate).toLocaleDateString('id-ID')} s/d{' '}
                    {new Date(lr.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <strong>{lr.daysCount} Hari</strong>
                  </td>
                  <td style={{ color: '#475569' }}>{lr.reason}</td>
                  <td style={{ textAlign: 'right' }}>
                    {lr.status === 'pending' ? (
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => approveLeaveRequest(lr.id)}
                          className="btn btn-sm btn-success"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                        >
                          <CheckCircle2 size={12} /> Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectLeaveRequest(lr.id)}
                          className="btn btn-sm btn-danger"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Diproses oleh {lr.approvedBy || 'HR'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showLeaveModal && (
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
            onSubmit={handleCreateLeave}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 500,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Form Pengajuan Cuti</h3>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Pegawai Pemohon:</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="input"
                >
                  {store.employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.jobTitle || emp.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Jenis Cuti:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="input"
                >
                  <option value="annual">Cuti Tahunan</option>
                  <option value="sick">Cuti Sakit</option>
                  <option value="special">Cuti Khusus / Pernikahan</option>
                  <option value="unpaid">Cuti di Luar Tanggungan</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Dari Tanggal:</label>
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Sampai Tanggal:</label>
                  <input
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Jumlah Hari Kerja:</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={daysCount}
                  onChange={(e) => setDaysCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Alasan / Keterangan:</label>
                <input
                  type="text"
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Kirim Pengajuan Cuti
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
