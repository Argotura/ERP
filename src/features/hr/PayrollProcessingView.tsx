// ============================================================
// ARGOTURO ERP — Payroll Processing
// ============================================================

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PayrollProcessingView() {
  const { store, processMonthlyPayroll } = useApp();
  const [period] = useState('October 2026');

  const activeEmployees = store.employees.filter((e) => e.status === 'active');
  const totalBase = activeEmployees.reduce((s, e) => s + (e.basicSalary ?? e.baseSalary ?? 0), 0);
  const totalAllow = activeEmployees.reduce((s, e) => s + (e.allowances ?? e.allowance ?? 0), 0);
  const totalDeduct = Math.round((totalBase + totalAllow) * 0.05);
  const totalNet = totalBase + totalAllow - totalDeduct;

  const handleRunPayroll = () => {
    if (window.confirm(`Execute payroll for ${period} for ${activeEmployees.length} personnel? This will automatically post salary expense journals to the General Ledger.`)) {
      processMonthlyPayroll(period);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Payroll Processing & Compensation
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Base salary computation, operational allowances, tax withholdings, and automatic salary expense journal posting
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRunPayroll}
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#10b981', borderColor: '#10b981' }}
        >
          <Play size={14} fill="#ffffff" /> Run Payroll for Period {period}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Active Personnel</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
            {activeEmployees.length} Personnel
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Across 7 Departments</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Gross Salary & Allowances</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
            IDR {(totalBase + totalAllow).toLocaleString('en-US')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Gross Payroll Expense</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Statutory Withholdings & Tax (5%)</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
            IDR {totalDeduct.toLocaleString('en-US')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Tax & Benefit Liability</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Net Disbursed Compensation</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            IDR {totalNet.toLocaleString('en-US')}
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Direct Bank Transfer</div>
        </div>
      </div>

      {/* Historical Payroll Runs */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '10px 0 0' }}>
        Processed Payroll Batches
      </h3>
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Payroll Batch No.</th>
              <th>Pay Period</th>
              <th>Disbursement Date</th>
              <th>Personnel Count</th>
              <th style={{ textAlign: 'right' }}>Gross Compensation</th>
              <th style={{ textAlign: 'right' }}>Withholdings (Tax/BPJS)</th>
              <th style={{ textAlign: 'right' }}>Net Compensation</th>
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
                <td>{new Date(pr.payDate || pr.paidDate || pr.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td>{pr.totalEmployees || pr.employeeCount || 0} Employees</td>
                <td style={{ textAlign: 'right' }}>IDR {(pr.totalBaseSalary ?? pr.totalGross ?? 0).toLocaleString('en-US')}</td>
                <td style={{ textAlign: 'right', color: '#ef4444' }}>
                  IDR {pr.totalDeductions.toLocaleString('en-US')}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                  IDR {(pr.totalNetSalary ?? pr.totalNet ?? 0).toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
