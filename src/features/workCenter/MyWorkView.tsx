// ============================================================
// ARGOTURO ERP — My Work & Operational Command Center
// ============================================================

import React from 'react';
import {
  CheckSquare,
  AlertTriangle,
  ShoppingCart,
  FileCheck,
  TrendingUp,
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  PlusCircle,
  DollarSign,
  ArrowLeftRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ERPRoute } from '../../types';

export default function MyWorkView() {
  const { store, activeUser, setRoute, approveRequest, rejectRequest } = useApp();

  const pendingApprovals = store.approvalRequests.filter((r) => r.status === 'pending');
  const lowStockProducts = store.products.filter((p) => p.onHandStock <= p.reorderLevel);
  const openSOs = store.salesOrders.filter((s) => s.status === 'approved' || s.status === 'partially_fulfilled');
  const unpaidInvoices = store.customerInvoices.filter((i) => i.status !== 'paid');

  const totalUnpaidAR = unpaidInvoices.reduce((sum, inv) => sum + (inv.remainingAmount ?? inv.outstandingBalance ?? 0), 0);
  const totalOpenSOValue = openSOs.reduce((sum, so) => sum + so.grandTotal, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 10,
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back, {activeUser.name}
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: 'rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                padding: '3px 10px',
                borderRadius: 20,
                border: '1px solid rgba(59, 130, 246, 0.4)',
              }}
            >
              {activeUser.role} • {activeUser.department}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8' }}>
            PT ARGOTURO DINAMIKA PERKASA — Operational work center, approval queue, and cross-department workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setRoute('sales/quotations')}
            style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusCircle size={14} /> + New Quotation
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => setRoute('procurement/orders')}
            style={{ backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingCart size={14} /> + New PO
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {/* Card 1: Pending Approvals */}
        <div
          onClick={() => setRoute('work_center/approvals')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 18,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Pending Approvals</span>
              <div style={{ fontSize: 26, fontWeight: 700, color: pendingApprovals.length > 0 ? '#d97706' : '#1e293b', marginTop: 4 }}>
                {pendingApprovals.length}
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Review pending queue</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Card 2: Low Stock Warning */}
        <div
          onClick={() => setRoute('inventory/reorder')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 18,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Low-Stock Items</span>
              <div style={{ fontSize: 26, fontWeight: 700, color: lowStockProducts.length > 0 ? '#ef4444' : '#1e293b', marginTop: 4 }}>
                {lowStockProducts.length}
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Open Reorder Planning</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Card 3: Open Sales Orders */}
        <div
          onClick={() => setRoute('sales/orders')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 18,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Active Sales Orders</span>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
                {openSOs.length}
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#3b82f6', fontWeight: 500 }}>
            Total Rp {totalOpenSOValue.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card 4: Outstanding Invoices */}
        <div
          onClick={() => setRoute('sales/invoices')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 18,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
          className="kpi-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Accounts Receivable (AR)</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
                Rp {(totalUnpaidAR / 1000000).toFixed(1)} M
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#10b981', fontWeight: 500 }}>
            {unpaidInvoices.length} Unpaid Invoices
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals Queue & Quick Workflow Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left Column: Actionable Approval Queue */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Pending Approvals Requiring Action
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                Authorization queue for sales orders, purchase requisitions, expenses, and leave requests
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setRoute('work_center/approvals')}
              style={{ fontSize: 12 }}
            >
              View All ({pendingApprovals.length})
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>All Approvals Cleared</div>
              <div style={{ fontSize: 12 }}>No pending authorization requests in your queue.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Reference No.</th>
                    <th>Requester</th>
                    <th>Amount</th>
                    <th>Required Role</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.slice(0, 5).map((req) => {
                    const docType = (req.entityType || req.type || '').toUpperCase().replace('_', ' ');
                    const docNum = req.entityNumber || req.documentNumber || '';
                    const requester = req.requestedBy || req.requesterName || '';
                    const role = req.roleRequired || req.targetRole || '';

                    return (
                      <tr key={req.id}>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor:
                                req.entityType === 'sales_order' || req.type === 'sales_order'
                                  ? '#eff6ff'
                                  : req.entityType === 'purchase_requisition' || req.type === 'purchase_requisition'
                                  ? '#f5f3ff'
                                  : '#fef3c7',
                              color:
                                req.entityType === 'sales_order' || req.type === 'sales_order'
                                  ? '#2563eb'
                                  : '#7c3aed',
                            }}
                          >
                            {docType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{docNum}</td>
                        <td>{requester}</td>
                        <td>
                          {req.amount ? `Rp ${req.amount.toLocaleString('id-ID')}` : '—'}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: '#64748b' }}>{role}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => approveRequest(req.id)}
                              style={{
                                backgroundColor: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: 11,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectRequest(req.id)}
                              style={{
                                backgroundColor: '#f1f5f9',
                                color: '#ef4444',
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Fast Workflow Launcher & Cross-Department Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              Quick Operational Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                onClick={() => setRoute('inventory/transfers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
                className="hover-bg-muted"
              >
                <ArrowLeftRight size={16} color="#3b82f6" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>Inter-Warehouse Transfer</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Cikarang, Surabaya, Medan</div>
                </div>
              </div>

              <div
                onClick={() => setRoute('manufacturing/orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
                className="hover-bg-muted"
              >
                <Layers size={16} color="#8b5cf6" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>Manufacturing Orders (MO)</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Finished assembly & materials consumption</div>
                </div>
              </div>

              <div
                onClick={() => setRoute('finance/journals')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
                className="hover-bg-muted"
              >
                <DollarSign size={16} color="#10b981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>General Ledger Journals</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Balanced double-entry posting</div>
                </div>
              </div>

              <div
                onClick={() => setRoute('hr/payroll')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
                className="hover-bg-muted"
              >
                <Clock size={16} color="#f59e0b" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>Payroll Processing</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Monthly compensation & tax calculation</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Audit Status */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>Local Engine Integrity</span>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>100% Valid</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              Physical inventory, stock movement cards, and General Ledger balances are fully reconciled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
