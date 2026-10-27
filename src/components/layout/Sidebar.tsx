// ============================================================
// ARGOTURO ERP — Enterprise Sidebar Navigation (9 Core Groups)
// ============================================================

import React, { useState } from 'react';
import {
  Briefcase,
  CheckSquare,
  Bell,
  Activity,
  Users,
  Building2,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  FileCheck,
  CreditCard,
  RotateCcw,
  FileText,
  Warehouse,
  Package,
  Layers,
  ArrowLeftRight,
  Sliders,
  AlertTriangle,
  Factory,
  Boxes,
  Hammer,
  ClipboardList,
  BookOpen,
  DollarSign,
  Landmark,
  PieChart,
  UserCheck,
  Calendar,
  Wallet,
  ShieldAlert,
  Settings,
  Hash,
  Database,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  FolderMinus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ERPRoute } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

interface NavItem {
  id: ERPRoute;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: 'accent' | 'warning' | 'danger' | 'success';
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { currentRoute, setRoute, store, activeUser } = useApp();

  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    work_center: true,
    sales: true,
    procurement: false,
    inventory: false,
    manufacturing: false,
    finance: false,
    hr: false,
    reports: false,
    admin: false,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Metrics for badges
  const pendingApprovalsCount = store.approvalRequests.filter((r) => r.status === 'pending').length;
  const unreadNotificationsCount = store.notifications.filter((n) => !n.isRead).length;
  const lowStockCount = store.products.filter((p) => p.onHandStock <= p.reorderLevel).length;
  const openSOCount = store.salesOrders.filter((s) => s.status === 'approved' || s.status === 'pending_approval').length;
  const unpaidInvoicesCount = store.customerInvoices.filter((i) => i.status !== 'paid').length;
  const openPOCount = store.purchaseOrders.filter((p) => p.status === 'approved' || p.status === 'ordered').length;
  const pendingLeavesCount = store.leaveRequests.filter((l) => l.status === 'pending' || (l.status as any) === 'pending_approval').length;

  const navGroups: NavGroup[] = [
    {
      id: 'work_center',
      title: 'Work Center',
      icon: <Briefcase size={16} />,
      items: [
        { id: 'work_center/my_work', label: 'My Work & Queue', icon: <Briefcase size={15} /> },
        {
          id: 'work_center/approvals',
          label: 'Pending Approvals',
          icon: <CheckSquare size={15} />,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'warning',
        },
        {
          id: 'work_center/notifications',
          label: 'Notifications',
          icon: <Bell size={15} />,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          badgeColor: 'accent',
        },
        { id: 'work_center/activities', label: 'Recent Activities', icon: <Activity size={15} /> },
      ],
    },
    {
      id: 'sales',
      title: 'CRM & Sales',
      icon: <ShoppingCart size={16} />,
      items: [
        { id: 'sales/leads', label: 'Leads & Pipeline', icon: <Users size={15} /> },
        { id: 'sales/customers', label: 'Customers', icon: <Building2 size={15} />, badge: store.customers.length },
        { id: 'sales/quotations', label: 'Quotations', icon: <FileSpreadsheet size={15} /> },
        {
          id: 'sales/orders',
          label: 'Sales Orders',
          icon: <ShoppingCart size={15} />,
          badge: openSOCount > 0 ? openSOCount : undefined,
          badgeColor: 'accent',
        },
        { id: 'sales/deliveries', label: 'Delivery Orders (DO)', icon: <Truck size={15} /> },
        {
          id: 'sales/invoices',
          label: 'Customer Invoices',
          icon: <FileCheck size={15} />,
          badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
          badgeColor: 'warning',
        },
        { id: 'sales/payments', label: 'Customer Payments', icon: <CreditCard size={15} /> },
        { id: 'sales/returns', label: 'Sales Returns', icon: <RotateCcw size={15} /> },
      ],
    },
    {
      id: 'procurement',
      title: 'Procurement',
      icon: <FileText size={16} />,
      items: [
        { id: 'procurement/requisitions', label: 'Purchase Requisitions (PR)', icon: <FileText size={15} /> },
        { id: 'procurement/suppliers', label: 'Vendors & Suppliers', icon: <Building2 size={15} />, badge: store.suppliers.length },
        {
          id: 'procurement/orders',
          label: 'Purchase Orders (PO)',
          icon: <ShoppingCart size={15} />,
          badge: openPOCount > 0 ? openPOCount : undefined,
          badgeColor: 'accent',
        },
        { id: 'procurement/receipts', label: 'Goods Receipts (GRN)', icon: <Truck size={15} /> },
        { id: 'procurement/invoices', label: 'Supplier Invoices (Bills)', icon: <FileCheck size={15} /> },
        { id: 'procurement/payments', label: 'Supplier Payments', icon: <CreditCard size={15} /> },
        { id: 'procurement/returns', label: 'Purchase Returns', icon: <RotateCcw size={15} /> },
      ],
    },
    {
      id: 'inventory',
      title: 'Inventory & Warehouse',
      icon: <Warehouse size={16} />,
      items: [
        { id: 'inventory/catalog', label: 'Product Catalog', icon: <Package size={15} />, badge: store.products.length },
        { id: 'inventory/categories', label: 'Categories & UOM', icon: <Layers size={15} /> },
        { id: 'inventory/overview', label: 'Stock Overview', icon: <Boxes size={15} /> },
        { id: 'inventory/ledger', label: 'Inventory Ledger (Kartu)', icon: <BookOpen size={15} /> },
        { id: 'inventory/warehouses', label: 'Warehouses & Bins', icon: <Warehouse size={15} />, badge: store.warehouses.length },
        { id: 'inventory/transfers', label: 'Stock Transfers', icon: <ArrowLeftRight size={15} /> },
        { id: 'inventory/adjustments', label: 'Stock Adjustments', icon: <Sliders size={15} /> },
        { id: 'inventory/counts', label: 'Stock Opname (Count)', icon: <ClipboardList size={15} /> },
        {
          id: 'inventory/reorder',
          label: 'Reorder Planning',
          icon: <AlertTriangle size={15} />,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          badgeColor: 'danger',
        },
      ],
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing',
      icon: <Factory size={16} />,
      items: [
        { id: 'manufacturing/bom', label: 'Bills of Materials (BOM)', icon: <Layers size={15} />, badge: store.billsOfMaterials.length },
        { id: 'manufacturing/orders', label: 'Production Orders (MO)', icon: <Hammer size={15} />, badge: store.productionOrders.length },
        { id: 'manufacturing/consumption', label: 'Material Consumption', icon: <Boxes size={15} /> },
        { id: 'manufacturing/receipts', label: 'Finished Goods Receipt', icon: <Package size={15} /> },
        { id: 'manufacturing/history', label: 'Production History', icon: <Activity size={15} /> },
      ],
    },
    {
      id: 'finance',
      title: 'Finance & Accounting',
      icon: <DollarSign size={16} />,
      items: [
        { id: 'finance/coa', label: 'Chart of Accounts (COA)', icon: <BookOpen size={15} /> },
        { id: 'finance/journals', label: 'Journal Entries (GL)', icon: <FileText size={15} />, badge: store.journalEntries.length },
        { id: 'finance/ledger', label: 'General Ledger', icon: <BookOpen size={15} /> },
        { id: 'finance/trial_balance', label: 'Trial Balance', icon: <FileCheck size={15} /> },
        { id: 'finance/ar', label: 'Accounts Receivable (AR)', icon: <CreditCard size={15} /> },
        { id: 'finance/ap', label: 'Accounts Payable (AP)', icon: <CreditCard size={15} /> },
        { id: 'finance/cash_bank', label: 'Cash & Bank Balances', icon: <Landmark size={15} />, badge: store.bankAccounts.length },
        { id: 'finance/expenses', label: 'Operating Expenses', icon: <Wallet size={15} /> },
        { id: 'finance/reports', label: 'Financial Statements', icon: <PieChart size={15} /> },
      ],
    },
    {
      id: 'hr',
      title: 'People & HR',
      icon: <UserCheck size={16} />,
      items: [
        { id: 'hr/employees', label: 'Employee Directory', icon: <Users size={15} />, badge: store.employees.length },
        { id: 'hr/departments', label: 'Departments & Orgs', icon: <Building2 size={15} /> },
        { id: 'hr/attendance', label: 'Daily Attendance', icon: <Calendar size={15} /> },
        {
          id: 'hr/leaves',
          label: 'Leave Requests',
          icon: <FolderMinus size={15} />,
          badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
          badgeColor: 'warning',
        },
        { id: 'hr/payroll', label: 'Payroll Processing', icon: <Wallet size={15} /> },
      ],
    },
    {
      id: 'reports',
      title: 'Reports & Audit',
      icon: <PieChart size={16} />,
      items: [
        { id: 'reports/sales', label: 'Operational Sales Report', icon: <FileSpreadsheet size={15} /> },
        { id: 'reports/purchasing', label: 'Procurement Summary', icon: <FileSpreadsheet size={15} /> },
        { id: 'reports/inventory_valuation', label: 'Inventory Valuation Report', icon: <PieChart size={15} /> },
        { id: 'reports/audit_trail', label: 'System Audit Trail', icon: <ShieldAlert size={15} /> },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: <Settings size={16} />,
      items: [
        { id: 'admin/users', label: 'Users & Roles Switcher', icon: <Users size={15} /> },
        { id: 'admin/settings', label: 'Company Settings', icon: <Settings size={15} /> },
        { id: 'admin/numbering', label: 'Document Numbering', icon: <Hash size={15} /> },
        { id: 'admin/demo_data', label: 'Demo Data Manager', icon: <Database size={15} /> },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand & Wordmark */}
      <div className="sidebar-header">
        <div className="sidebar-logo" title="ARGOTURO ERP">
          <Warehouse size={18} />
        </div>
        {!collapsed && (
          <div className="sidebar-wordmark">
            <h1>ARGOTURO ERP</h1>
            <span>Operations Platform</span>
          </div>
        )}
      </div>

      {/* Role Pill */}
      {!collapsed && (
        <div
          style={{
            padding: '8px 14px',
            backgroundColor: '#151924',
            borderBottom: '1px solid #23293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
              }}
            >
              {activeUser.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f4', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeUser.name}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--sidebar-text-muted)' }}>{activeUser.role}</div>
            </div>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              backgroundColor: '#2d3748',
              color: '#90cdf4',
              padding: '2px 5px',
              borderRadius: 3,
              letterSpacing: '0.04em',
            }}
          >
            DEMO
          </span>
        </div>
      )}

      {/* Collapsible Navigation Tree */}
      <nav className="sidebar-nav" style={{ paddingBottom: 60 }}>
        {navGroups.map((group) => {
          const isExpanded = expandedGroups[group.id] || collapsed;
          const hasActiveItem = group.items.some((item) => item.id === currentRoute);

          return (
            <div key={group.id} style={{ marginBottom: 4 }}>
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '7px 10px',
                    background: 'none',
                    border: 'none',
                    color: hasActiveItem ? '#60a5fa' : 'var(--sidebar-text-muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                  className="sidebar-group-heading"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {group.icon}
                    {group.title}
                  </span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '8px 0',
                    color: hasActiveItem ? '#60a5fa' : 'var(--sidebar-text-muted)',
                  }}
                  title={group.title}
                >
                  {group.icon}
                </div>
              )}

              {(isExpanded || collapsed) && (
                <div style={{ paddingLeft: collapsed ? 0 : 6 }}>
                  {group.items.map((item) => {
                    const isActive = currentRoute === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setRoute(item.id)}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        title={collapsed ? item.label : undefined}
                        style={{
                          padding: '6px 10px',
                          margin: '1px 0',
                          fontSize: 12.5,
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isActive ? '#ffffff' : '#94a3b8',
                          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                          borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                          <span style={{ color: isActive ? '#60a5fa' : 'inherit' }}>{item.icon}</span>
                          {!collapsed && (
                            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {item.label}
                            </span>
                          )}
                        </span>

                        {!collapsed && item.badge !== undefined && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: 10,
                              backgroundColor:
                                item.badgeColor === 'danger'
                                  ? 'rgba(239, 68, 68, 0.2)'
                                  : item.badgeColor === 'warning'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : item.badgeColor === 'success'
                                  ? 'rgba(34, 197, 94, 0.2)'
                                  : 'rgba(59, 130, 246, 0.2)',
                              color:
                                item.badgeColor === 'danger'
                                  ? '#fca5a5'
                                  : item.badgeColor === 'warning'
                                  ? '#fcd34d'
                                  : item.badgeColor === 'success'
                                  ? '#86efac'
                                  : '#93c5fd',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 44,
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: 'var(--sidebar-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0 12px',
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 10.5, color: 'var(--sidebar-text-muted)' }}>
            v2.0 • Indonesian Demo
          </span>
        )}
        <button
          type="button"
          onClick={onCollapse}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sidebar-text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
