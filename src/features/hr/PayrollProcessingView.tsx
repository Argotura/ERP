// ============================================================
// ARGOTURO ERP — Payroll Processing (Penggajian Bulanan & PPh21)
// ============================================================

import React, { useState } from 'react';
import { Wallet, Play, CheckCircle2, Calendar, FileText, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PayrollProcessingView() {
  const { store, processMonthlyPayroll, addToast } = useApp();
  const [period, setPeriod] = useState('Oktober 2026');

  const activeEmployees = store.employees.filter((e) => e.status === 'active');
  const totalBase = activeEmployees.reduce((s, e) => s + (e.basicSalary ?? e.baseSalary ?? 0), 0);
  const totalAllow = activeEmployees.reduce((s, e) => s + (e.allowances ?? e.allowance ?? 0), 0);
  const totalDeduct = Math.round((totalBase + totalAllow) * 0.05);
  const totalNet = totalBase + totalAllow - totalDeduct;

  const handleRunPayroll = () => {
    if (window.confirm(`Proses penggajian periode ${period} untuk ${activeEmployees.length} pegawai? Ini akan otomatis memposting jurnal beban gaji ke Buku Besar.`)) {
      processMonthlyPayroll(period);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Pemrosesan Penggajian Karyawan (Payroll Processing)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Perhitungan gaji pokok, tunjangan operasional, potongan BPJS/PPh21, dan posting otomatis jurnal beban gaji
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRunPayroll}
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#10b981', borderColor: '#10b981' }}
        >
          <Play size={14} fill="#ffffff" /> Jalankan Penggajian Periode {period}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Pegawai Aktif</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
            {activeEmployees.length} Orang
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>7 Departemen</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Gaji Pokok & Tunjangan</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
            Rp {(totalBase + totalAllow).toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Bruto Beban Gaji</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Potongan BPJS & PPh21 (5%)</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
            Rp {totalDeduct.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Hutang Pajak & Iuran</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Gaji Bersih (Net Pay)</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            Rp {totalNet.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Transfer Kas Keluar</div>
        </div>
      </div>

      {/* Historical Payroll Runs */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '10px 0 0' }}>
        Riwayat Pemrosesan Penggajian (Payroll Batches)
      </h3>
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>No. Batch Payroll</th>
              <th>Periode Bulan</th>
              <th>Tanggal Pembayaran</th>
              <th>Jumlah Karyawan</th>
              <th style={{ textAlign: 'right' }}>Gaji Pokok Total</th>
              <th style={{ textAlign: 'right' }}>Potongan (PPh/BPJS)</th>
              <th style={{ textAlign: 'right' }}>Gaji Bersih (Net)</th>
            </tr>
          </thead>
          <tbody>
            {store.payrollRuns.map((pr) => (
              <tr key={pr.id}>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 4,
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                    }}
                  >
                    PAID
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{pr.runNumber}</td>
                <td style={{ fontWeight: 600 }}>{pr.period}</td>
                <td>{new Date(pr.payDate || pr.paidDate || pr.createdAt).toLocaleDateString('id-ID')}</td>
                <td>{pr.totalEmployees || pr.employeeCount || 0} Pegawai</td>
                <td style={{ textAlign: 'right' }}>Rp {(pr.totalBaseSalary ?? pr.totalGross ?? 0).toLocaleString('id-ID')}</td>
                <td style={{ textAlign: 'right', color: '#ef4444' }}>
                  Rp {pr.totalDeductions.toLocaleString('id-ID')}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                  Rp {(pr.totalNetSalary ?? pr.totalNet ?? 0).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
