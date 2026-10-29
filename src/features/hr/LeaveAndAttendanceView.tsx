// ============================================================
// ARGOTURO ERP — Attendance & Leave Requests
// ============================================================

import React, { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LeaveAndAttendanceView({ mode }: { mode: 'attendance' | 'leaves' }) {
  const { store, createLeaveRequest, approveLeaveRequest, rejectLeaveRequest } = useApp();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState(store.employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'maternity' | 'unpaid' | 'special'>('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [daysCount, setDaysCount] = useState(3);
  const [reason, setReason] = useState('Urgent family matter');

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
            Daily Attendance & Time Tracking
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Employee clock-in/out records, tardiness tracking, and department attendance summaries
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Clock-In</th>
                <th>Clock-Out</th>
                <th>Remarks / Overtime</th>
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
                    <td>{new Date(att.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ color: '#15803d', fontWeight: 600 }}>{att.clockIn || att.checkIn || '—'}</td>
                    <td>{att.clockOut || att.checkOut || '—'}</td>
                    <td style={{ color: '#64748b' }}>
                      {att.overtimeHours ? `Overtime ${att.overtimeHours} hrs` : 'Standard Shift'}
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
            Employee Leave Requests
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Annual leave, medical absence, personal time off, and management approvals
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowLeaveModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Request Leave
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Request No.</th>
              <th>Employee Name</th>
              <th>Leave Type</th>
              <th>Date Period</th>
              <th>Duration</th>
              <th>Reason</th>
              <th style={{ textAlign: 'right' }}>HR Actions</th>
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
                    {new Date(lr.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(lr.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <strong>{lr.daysCount} Day(s)</strong>
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
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectLeaveRequest(lr.id)}
                          className="btn btn-sm btn-danger"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Processed by {lr.approvedBy || 'HR'}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Submit Leave Request</h3>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Requesting Employee:</label>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Leave Type:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="input"
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="special">Special / Marriage Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Start Date:</label>
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>End Date:</label>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Working Days:</label>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reason / Justification:</label>
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
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
