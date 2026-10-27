// ============================================================
// ARGOTURO ERP — Employee Directory (Direktori SDM & Karyawan)
// ============================================================

import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, Calendar, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

export default function EmployeeDirectoryView() {
  const { store, saveEmployee, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(store.departments[0]?.id || '');
  const [jobTitle, setJobTitle] = useState('Staff Operasional');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [basicSalary, setBasicSalary] = useState(8500000);

  const filtered = store.employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const empNum = `EMP-2026-${String(store.employees.length + 1).padStart(3, '0')}`;
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeNumber: empNum,
      name,
      departmentId,
      departmentName: store.departments.find((d) => d.id === departmentId)?.name || 'Operasional',
      position: jobTitle,
      jobTitle,
      email,
      phone,
      joinDate: new Date().toISOString().split('T')[0],
      employmentStatus: 'Permanent',
      baseSalary: basicSalary,
      basicSalary,
      allowance: 1000000,
      allowances: 1000000,
      status: 'active',
    };

    saveEmployee(newEmp);
    setShowModal(false);
    addToast('success', `Karyawan ${name} (${empNum}) berhasil didaftarkan`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Direktori Data Karyawan (Employee Directory)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Data induk SDM, departemen, jabatan, remunerasi gaji pokok, dan status ketenagakerjaan
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Tambah Karyawan Baru
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
        <input
          type="text"
          className="input"
          placeholder="Cari NIK atau nama karyawan..."
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
              <th>NIK Karyawan</th>
              <th>Nama Pegawai</th>
              <th>Departemen</th>
              <th>Jabatan / Posisi</th>
              <th>Kontak</th>
              <th>Tanggal Bergabung</th>
              <th style={{ textAlign: 'right' }}>Gaji Pokok (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => {
              const dept = store.departments.find((d) => d.id === emp.departmentId);
              return (
                <tr key={emp.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: emp.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: emp.status === 'active' ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {emp.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{emp.employeeNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{emp.email}</div>
                  </td>
                  <td>{dept?.name || emp.departmentId}</td>
                  <td>{emp.jobTitle || emp.position}</td>
                  <td>{emp.phone}</td>
                  <td>{new Date(emp.joinDate).toLocaleDateString('id-ID')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    Rp {(emp.basicSalary ?? emp.baseSalary ?? 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Tambah Karyawan Baru</h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nama Lengkap:</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Departemen:</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="input"
                >
                  {store.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Jabatan:</label>
                <input
                  type="text"
                  className="input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Email Resmi:</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nomor Telepon:</label>
                <input
                  type="text"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Gaji Pokok (Rp):</label>
                <input
                  type="number"
                  className="input"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan Pegawai
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
