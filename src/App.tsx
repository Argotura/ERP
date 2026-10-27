// ============================================================
// ARGOTURO ERP — Main Application Shell & Route Dispatcher
// ============================================================

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Toast from './components/ui/Toast';

// Work Center Views
import MyWorkView from './features/workCenter/MyWorkView';
import PendingApprovalsView from './features/workCenter/PendingApprovalsView';
import NotificationsView from './features/workCenter/NotificationsView';
import ActivitiesView from './features/workCenter/ActivitiesView';

// CRM & Sales Views
import SalesOrdersView from './features/sales/SalesOrdersView';
import QuotationsView from './features/sales/QuotationsView';
import CustomersView from './features/sales/CustomersView';
import DeliveryOrdersView from './features/sales/DeliveryOrdersView';
import CustomerInvoicesView from './features/sales/CustomerInvoicesView';
import CustomerPaymentsView from './features/sales/CustomerPaymentsView';
import LeadsAndReturnsView from './features/sales/LeadsAndReturnsView';

// Procurement Views
import PurchaseRequisitionsView from './features/procurement/PurchaseRequisitionsView';
import PurchaseOrdersView from './features/procurement/PurchaseOrdersView';
import SuppliersView from './features/procurement/SuppliersView';
import GoodsReceiptsView from './features/procurement/GoodsReceiptsView';
import SupplierInvoicesView from './features/procurement/SupplierInvoicesView';
import SupplierPaymentsView from './features/procurement/SupplierPaymentsView';

// Inventory & Warehouse Views
import ProductCatalogView from './features/inventory/ProductCatalogView';
import StockOverviewView from './features/inventory/StockOverviewView';
import InventoryLedgerView from './features/inventory/InventoryLedgerView';
import StockTransfersView from './features/inventory/StockTransfersView';
import StockAdjustmentsAndCountsView from './features/inventory/StockAdjustmentsAndCountsView';
import ReorderPlanningView from './features/inventory/ReorderPlanningView';
import WarehousesAndTaxonomyView from './features/inventory/WarehousesAndTaxonomyView';

// Manufacturing Views
import BOMView from './features/manufacturing/BOMView';
import ProductionOrdersView from './features/manufacturing/ProductionOrdersView';
import ProductionHistoryView from './features/manufacturing/ProductionHistoryView';

// Finance & Accounting Views
import ChartOfAccountsView from './features/finance/ChartOfAccountsView';
import JournalEntriesView from './features/finance/JournalEntriesView';
import GeneralLedgerView from './features/finance/GeneralLedgerView';
import TrialBalanceView from './features/finance/TrialBalanceView';
import AccountsReceivableAndPayableView from './features/finance/AccountsReceivableAndPayableView';
import CashBankAndExpensesView from './features/finance/CashBankAndExpensesView';
import FinancialReportsView from './features/finance/FinancialReportsView';

// People & HR Views
import EmployeeDirectoryView from './features/hr/EmployeeDirectoryView';
import LeaveAndAttendanceView from './features/hr/LeaveAndAttendanceView';
import PayrollProcessingView from './features/hr/PayrollProcessingView';

// Reports & Audit Views
import OperationalReportsView from './features/reports/OperationalReportsView';
import AuditTrailView from './features/reports/AuditTrailView';

// Administration Views
import UsersRolesView from './features/admin/UsersRolesView';
import CompanySettingsView from './features/admin/CompanySettingsView';
import DocumentNumberingView from './features/admin/DocumentNumberingView';
import DemoDataManagerView from './features/admin/DemoDataManagerView';

import './index.css';

function AppShell() {
  const { currentRoute } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveModule = () => {
    switch (currentRoute) {
      // ── Group A: Work Center ──
      case 'work_center/my_work':
        return <MyWorkView />;
      case 'work_center/approvals':
        return <PendingApprovalsView />;
      case 'work_center/notifications':
        return <NotificationsView />;
      case 'work_center/activities':
        return <ActivitiesView />;

      // ── Group B: CRM & Sales ──
      case 'sales/leads':
        return <LeadsAndReturnsView mode="leads" />;
      case 'sales/customers':
        return <CustomersView />;
      case 'sales/quotations':
        return <QuotationsView />;
      case 'sales/orders':
        return <SalesOrdersView />;
      case 'sales/deliveries':
        return <DeliveryOrdersView />;
      case 'sales/invoices':
        return <CustomerInvoicesView />;
      case 'sales/payments':
        return <CustomerPaymentsView />;
      case 'sales/returns':
        return <LeadsAndReturnsView mode="returns" />;

      // ── Group C: Procurement ──
      case 'procurement/requisitions':
        return <PurchaseRequisitionsView />;
      case 'procurement/suppliers':
        return <SuppliersView />;
      case 'procurement/orders':
        return <PurchaseOrdersView />;
      case 'procurement/receipts':
        return <GoodsReceiptsView />;
      case 'procurement/invoices':
        return <SupplierInvoicesView />;
      case 'procurement/payments':
        return <SupplierPaymentsView />;
      case 'procurement/returns':
        return <LeadsAndReturnsView mode="returns" />;

      // ── Group D: Inventory & Warehouse ──
      case 'inventory/catalog':
        return <ProductCatalogView />;
      case 'inventory/categories':
      case 'inventory/uom':
        return <WarehousesAndTaxonomyView mode="categories" />;
      case 'inventory/overview':
        return <StockOverviewView />;
      case 'inventory/ledger':
        return <InventoryLedgerView />;
      case 'inventory/warehouses':
        return <WarehousesAndTaxonomyView mode="warehouses" />;
      case 'inventory/transfers':
        return <StockTransfersView />;
      case 'inventory/adjustments':
        return <StockAdjustmentsAndCountsView mode="adjustments" />;
      case 'inventory/counts':
        return <StockAdjustmentsAndCountsView mode="counts" />;
      case 'inventory/reorder':
        return <ReorderPlanningView />;

      // ── Group E: Manufacturing ──
      case 'manufacturing/bom':
        return <BOMView />;
      case 'manufacturing/planning':
      case 'manufacturing/orders':
        return <ProductionOrdersView />;
      case 'manufacturing/consumption':
      case 'manufacturing/receipts':
      case 'manufacturing/history':
        return <ProductionHistoryView />;

      // ── Group F: Finance & Accounting ──
      case 'finance/coa':
        return <ChartOfAccountsView />;
      case 'finance/journals':
        return <JournalEntriesView />;
      case 'finance/ledger':
        return <GeneralLedgerView />;
      case 'finance/trial_balance':
        return <TrialBalanceView />;
      case 'finance/ar':
        return <AccountsReceivableAndPayableView mode="ar" />;
      case 'finance/ap':
        return <AccountsReceivableAndPayableView mode="ap" />;
      case 'finance/cash_bank':
        return <CashBankAndExpensesView mode="cash_bank" />;
      case 'finance/expenses':
        return <CashBankAndExpensesView mode="expenses" />;
      case 'finance/tax':
        return <CompanySettingsView />;
      case 'finance/reports':
        return <FinancialReportsView />;

      // ── Group G: People & HR ──
      case 'hr/employees':
      case 'hr/departments':
        return <EmployeeDirectoryView />;
      case 'hr/attendance':
        return <LeaveAndAttendanceView mode="attendance" />;
      case 'hr/leaves':
        return <LeaveAndAttendanceView mode="leaves" />;
      case 'hr/payroll':
        return <PayrollProcessingView />;

      // ── Group H: Reports & Audit ──
      case 'reports/sales':
        return <OperationalReportsView mode="sales" />;
      case 'reports/purchasing':
        return <OperationalReportsView mode="purchasing" />;
      case 'reports/inventory_valuation':
        return <OperationalReportsView mode="valuation" />;
      case 'reports/stock_movement':
        return <InventoryLedgerView />;
      case 'reports/production':
        return <ProductionHistoryView />;
      case 'reports/employee':
        return <EmployeeDirectoryView />;
      case 'reports/audit_trail':
        return <AuditTrailView />;

      // ── Group I: Administration ──
      case 'admin/users':
      case 'admin/roles':
        return <UsersRolesView />;
      case 'admin/settings':
      case 'admin/mappings':
        return <CompanySettingsView />;
      case 'admin/numbering':
        return <DocumentNumberingView />;
      case 'admin/demo_data':
        return <DemoDataManagerView />;

      default:
        return <MyWorkView />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div className={`app-main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar collapsed={sidebarCollapsed} />
        <main className="app-content">{renderActiveModule()}</main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
