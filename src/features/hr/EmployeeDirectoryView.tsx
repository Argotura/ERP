// ============================================================
// ARGOTURO ERP — Employee Directory
// ============================================================

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

export default function EmployeeDirectoryView() {
  const { store, saveEmployee, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(store.departments[0]?.id || '');
  const [jobTitle, setJobTitle] = useState('Operations Specialist');
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
      departmentName: store.departments.find((d) => d.id === departmentId)?.name || 'Operations',
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
    addToast('success', `Employee ${name} (${empNum}) added successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Employee Directory
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Personnel master data, department assignments, job positions, base compensation, and employment status
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Add New Employee
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
        <input
          type="text"
          className="input"
          placeholder="Search by employee ID or name..."
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
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Position / Title</th>
              <th>Contact Details</th>
              <th>Hire Date</th>
              <th style={{ textAlign: 'right' }}>Base Salary</th>
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
                  <td>{new Date(emp.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    IDR {(emp.basicSalary ?? emp.baseSalary ?? 0).toLocaleString('en-US')}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Add New Employee</h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Full Name:</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Department:</label>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Position / Job Title:</label>
                <input
                  type="text"
                  className="input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Corporate Email:</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Phone Number:</label>
                <input
                  type="text"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Base Salary (IDR):</label>
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
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Employee
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
