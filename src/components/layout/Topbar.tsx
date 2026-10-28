// ============================================================
// ARGOTURO ERP — Enterprise Topbar Component
// Breadcrumb, Persona Switcher, Global Search, Notifications & Demo Reset
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingCart,
  FileText,
  Building2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ERPRoute } from '../../types';

interface TopbarProps {
  collapsed: boolean;
  onSearch?: (query: string) => void;
}

const ROUTE_LABELS: Record<string, { group: string; title: string }> = {
  'work_center/my_work': { group: 'Work Center', title: 'My Work & Queue' },
  'work_center/approvals': { group: 'Work Center', title: 'Pending Approvals' },
  'work_center/notifications': { group: 'Work Center', title: 'System Notifications' },
  'work_center/activities': { group: 'Work Center', title: 'Audit Activities' },
  'sales/leads': { group: 'CRM & Sales', title: 'Leads & Pipeline' },
  'sales/customers': { group: 'CRM & Sales', title: 'Customers Directory' },
  'sales/quotations': { group: 'CRM & Sales', title: 'Sales Quotations' },
  'sales/orders': { group: 'CRM & Sales', title: 'Sales Orders' },
  'sales/deliveries': { group: 'CRM & Sales', title: 'Delivery Orders (DO)' },
  'sales/invoices': { group: 'CRM & Sales', title: 'Customer Invoices' },
  'sales/payments': { group: 'CRM & Sales', title: 'Customer Payments' },
  'sales/returns': { group: 'CRM & Sales', title: 'Sales Returns' },
  'procurement/requisitions': { group: 'Procurement', title: 'Purchase Requisitions (PR)' },
  'procurement/suppliers': { group: 'Procurement', title: 'Vendors & Suppliers' },
  'procurement/orders': { group: 'Procurement', title: 'Purchase Orders (PO)' },
  'procurement/receipts': { group: 'Procurement', title: 'Goods Receipts (GRN)' },
  'procurement/invoices': { group: 'Procurement', title: 'Supplier Invoices (Bills)' },
  'procurement/payments': { group: 'Procurement', title: 'Supplier Payments' },
  'procurement/returns': { group: 'Procurement', title: 'Purchase Returns' },
  'inventory/catalog': { group: 'Inventory & Warehouse', title: 'Product Catalog' },
  'inventory/categories': { group: 'Inventory & Warehouse', title: 'Categories & UOM' },
  'inventory/overview': { group: 'Inventory & Warehouse', title: 'Stock Overview' },
  'inventory/ledger': { group: 'Inventory & Warehouse', title: 'Inventory Ledger (Kartu Stok)' },
  'inventory/warehouses': { group: 'Inventory & Warehouse', title: 'Warehouses & Locations' },
  'inventory/transfers': { group: 'Inventory & Warehouse', title: 'Stock Transfers' },
  'inventory/adjustments': { group: 'Inventory & Warehouse', title: 'Stock Adjustments' },
  'inventory/counts': { group: 'Inventory & Warehouse', title: 'Stock Opname' },
  'inventory/reorder': { group: 'Inventory & Warehouse', title: 'Reorder Planning' },
  'manufacturing/bom': { group: 'Manufacturing', title: 'Bills of Materials (BOM)' },
  'manufacturing/planning': { group: 'Manufacturing', title: 'Production Planning' },
  'manufacturing/orders': { group: 'Manufacturing', title: 'Production Orders (MO)' },
  'manufacturing/consumption': { group: 'Manufacturing', title: 'Material Consumption' },
  'manufacturing/receipts': { group: 'Manufacturing', title: 'Finished Goods Receipt' },
  'manufacturing/history': { group: 'Manufacturing', title: 'Production History' },
  'finance/coa': { group: 'Finance & Accounting', title: 'Chart of Accounts (COA)' },
  'finance/journals': { group: 'Finance & Accounting', title: 'Journal Entries' },
  'finance/ledger': { group: 'Finance & Accounting', title: 'General Ledger' },
  'finance/trial_balance': { group: 'Finance & Accounting', title: 'Trial Balance' },
  'finance/ar': { group: 'Finance & Accounting', title: 'Accounts Receivable (AR)' },
  'finance/ap': { group: 'Finance & Accounting', title: 'Accounts Payable (AP)' },
  'finance/cash_bank': { group: 'Finance & Accounting', title: 'Cash & Bank' },
  'finance/expenses': { group: 'Finance & Accounting', title: 'Operational Expenses' },
  'finance/reports': { group: 'Finance & Accounting', title: 'Financial Statements' },
  'hr/employees': { group: 'People & HR', title: 'Employee Directory' },
  'hr/departments': { group: 'People & HR', title: 'Departments' },
  'hr/attendance': { group: 'People & HR', title: 'Daily Attendance' },
  'hr/leaves': { group: 'People & HR', title: 'Leave Requests' },
  'hr/payroll': { group: 'People & HR', title: 'Payroll Processing' },
  'reports/sales': { group: 'Reports & Audit', title: 'Operational Sales Report' },
  'reports/purchasing': { group: 'Reports & Audit', title: 'Purchasing Report' },
  'reports/inventory_valuation': { group: 'Reports & Audit', title: 'Inventory Valuation Report' },
  'reports/audit_trail': { group: 'Reports & Audit', title: 'Audit Trail & Compliance' },
  'admin/users': { group: 'Administration', title: 'Users & Roles' },
  'admin/settings': { group: 'Administration', title: 'Company Settings' },
  'admin/numbering': { group: 'Administration', title: 'Document Numbering' },
  'admin/demo_data': { group: 'Administration', title: 'Demo Data Management' },
};

export default function Topbar({ collapsed }: TopbarProps) {
  const {
    currentRoute,
    setRoute,
    store,
    activeUserId,
    setActiveUserId,
    activeUser,
    markNotificationRead,
    resetDemoData,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifDrawer(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeInfo = ROUTE_LABELS[currentRoute] || { group: 'Operations', title: 'Dashboard' };
  const unreadNotifications = store.notifications.filter((n) => !n.isRead);

  // Global search matching
  const searchMatches = searchQuery.trim()
    ? {
        products: store.products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3),
        customers: store.customers
          .filter(
            (c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.code.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3),
        salesOrders: store.salesOrders
          .filter((s) => s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3),
        purchaseOrders: store.purchaseOrders
          .filter((p) => (p.orderNumber || p.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3),
      }
    : null;

  const totalMatches = searchMatches
    ? searchMatches.products.length +
      searchMatches.customers.length +
      searchMatches.salesOrders.length +
      searchMatches.purchaseOrders.length
    : 0;

  return (
    <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Breadcrumb */}
      <div className="topbar-breadcrumb" style={{ minWidth: 260 }}>
        <span className="breadcrumb-item" style={{ color: 'var(--text-muted)' }}>
          ARGOTURO ERP
        </span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-item" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          {routeInfo.group}
        </span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-item active" style={{ fontWeight: 600 }}>
          {routeInfo.title}
        </span>
      </div>

      {/* Global Search Box with Instant Results */}
      <div className="topbar-search" ref={searchBoxRef} style={{ position: 'relative', width: 340 }}>
        <Search size={15} className="topbar-search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Cari SKU, produk, pelanggan, SO, PO..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          >
            <X size={14} />
          </button>
        )}

        {showSearchResults && searchQuery.trim() && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              backgroundColor: '#ffffff',
              borderRadius: 6,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              zIndex: 1000,
              maxHeight: 380,
              overflowY: 'auto',
              padding: '6px 0',
            }}
          >
            {totalMatches === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                Tidak ditemukan hasil untuk "{searchQuery}"
              </div>
            ) : (
              <>
                {searchMatches && searchMatches.products.length > 0 && (
                  <div>
                    <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                      Produk
                    </div>
                    {searchMatches.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setRoute('inventory/catalog');
                          setShowSearchResults(false);
                        }}
                        style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}
                        className="search-item-hover"
                      >
                        <Package size={14} color="#3b82f6" />
                        <div>
                          <strong>{p.sku}</strong> — {p.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchMatches && searchMatches.customers.length > 0 && (
                  <div>
                    <div style={{ padding: '6px 12px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                      Pelanggan
                    </div>
                    {searchMatches.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setRoute('sales/customers');
                          setShowSearchResults(false);
                        }}
                        style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}
                        className="search-item-hover"
                      >
                        <Building2 size={14} color="#10b981" />
                        <div>
                          <strong>{c.code}</strong> — {c.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchMatches && searchMatches.salesOrders.length > 0 && (
                  <div>
                    <div style={{ padding: '6px 12px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                      Sales Orders
                    </div>
                    {searchMatches.salesOrders.map((so) => (
                      <div
                        key={so.id}
                        onClick={() => {
                          setRoute('sales/orders');
                          setShowSearchResults(false);
                        }}
                        style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}
                        className="search-item-hover"
                      >
                        <ShoppingCart size={14} color="#f59e0b" />
                        <div>
                          <strong>{so.orderNumber}</strong> — Rp {so.grandTotal.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchMatches && searchMatches.purchaseOrders.length > 0 && (
                  <div>
                    <div style={{ padding: '6px 12px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                      Purchase Orders
                    </div>
                    {searchMatches.purchaseOrders.map((po) => (
                      <div
                        key={po.id}
                        onClick={() => {
                          setRoute('procurement/orders');
                          setShowSearchResults(false);
                        }}
                        style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}
                        className="search-item-hover"
                      >
                        <FileText size={14} color="#8b5cf6" />
                        <div>
                          <strong>{po.orderNumber || po.poNumber}</strong> — Rp {po.grandTotal.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Link to Executive Analytics Dashboard */}
        <a
          href={import.meta.env.PROD ? '/dashboard/' : 'http://localhost:5174'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-secondary"
          title="Buka Executive Analytics Dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
        >
          <ExternalLink size={13} />
          Executive Analytics
        </a>

        {/* Role & Persona Switcher */}
        <div style={{ position: 'relative' }} ref={roleMenuRef}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '5px 10px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {activeUser.name.charAt(0)}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#1e293b' }}>{activeUser.name}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{activeUser.role}</div>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 280,
                backgroundColor: '#ffffff',
                borderRadius: 8,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0',
                padding: '8px 0',
                zIndex: 1000,
              }}
            >
              <div style={{ padding: '6px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                  Simulasi Pengguna & Peran (Persona)
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Pilih peran untuk menguji alur persetujuan & otorisasi
                </div>
              </div>

              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {store.users.map((user) => {
                  const isSelected = user.id === activeUserId;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        setActiveUserId(user.id);
                        setShowRoleDropdown(false);
                        addToast('info', `Beralih ke pengguna: ${user.name} (${user.role})`);
                      }}
                      style={{
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      }}
                      className="role-item-hover"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#3b82f6' : '#cbd5e1',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: isSelected ? 600 : 500, color: '#1e293b' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>
                            {user.role} • {user.department}
                          </div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={15} color="#3b82f6" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button
            type="button"
            className="topbar-action-btn"
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            title="Notifikasi Sistem"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadNotifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }}
              />
            )}
          </button>

          {showNotifDrawer && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                width: 320,
                backgroundColor: '#ffffff',
                borderRadius: 8,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
                border: '1px solid #e2e8f0',
                padding: '8px 0',
                zIndex: 1000,
              }}
            >
              <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>Notifikasi Operasional</span>
                <span style={{ fontSize: 11, color: '#3b82f6' }}>{unreadNotifications.length} Baru</span>
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {store.notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  store.notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: notif.isRead ? '#ffffff' : '#f0f9ff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{notif.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{notif.message}</div>
                      <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Reset Button */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="btn btn-sm btn-secondary"
          title="Reset Demo Data"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}
        >
          <RotateCcw size={13} />
          Reset Demo
        </button>

        {/* DEMO MODE Badge */}
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            letterSpacing: '0.04em',
          }}
          title="Aplikasi berjalan dalam mode demonstrasi dengan local storage"
        >
          DEMO MODE
        </span>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
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
              width: 440,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Reset Semua Data Demo?</h3>
                <p style={{ fontSize: 12, color: '#6b7280' }}>Tindakan ini akan mengembalikan data ke setelan awal pabrik.</p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, marginBottom: 20 }}>
              Semua transaksi baru yang Anda buat (Sales Order, Purchase Order, Pengiriman, Faktur, Jurnal, Penggajian) akan dihapus dari penyimpanan peramban (localStorage) dan dikembalikan ke kondisi seed data demo resmi ARGOTURO ERP.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
              >
                Ya, Reset Data Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
