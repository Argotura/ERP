// ============================================================
// ARGOTURO ERP — Central Demo Store & Repository Layer
// Single source of truth with browser localStorage persistence
// ============================================================

import {
  ERPStoreState,
  Product,
  Customer,
  Supplier,
  Quotation,
  SalesOrder,
  DeliveryOrder,
  CustomerInvoice,
  CustomerPayment,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceipt,
  SupplierInvoice,
  SupplierPayment,
  InventoryLedgerEntry,
  StockTransfer,
  StockAdjustment,
  StockCount,
  BillOfMaterials,
  ProductionOrder,
  JournalEntry,
  Expense,
  LeaveRequest,
  PayrollRun,
  ApprovalRequest,
  ActivityLog,
  SystemNotification,
} from '../types';
import { buildCompleteInitialState } from '../data/seedData';
import { updateAccountBalances } from '../core/accountingRules';

const STORAGE_KEY = 'argoturo_erp_v2';

export function loadERPStore(): ERPStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ERPStoreState;
      if (parsed.version === '2.0.0' && parsed.products && parsed.accounts) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored ERP data, loading fresh initial state', err);
  }

  const initial = buildCompleteInitialState();
  saveERPStore(initial);
  return initial;
}

export function saveERPStore(state: ERPStoreState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, lastUpdated: new Date().toISOString() })
    );
  } catch (err) {
    console.warn('Storage quota exceeded or error writing to localStorage', err);
  }
}

export function resetERPStore(): ERPStoreState {
  const initial = buildCompleteInitialState();
  saveERPStore(initial);
  return initial;
}

// ── Central Repositories ───────────────────────────────────

export const MasterDataRepository = {
  // Products
  saveProduct: (state: ERPStoreState, product: Product): ERPStoreState => {
    const existing = state.products.findIndex((p) => p.id === product.id);
    const updatedProducts =
      existing >= 0
        ? state.products.map((p) => (p.id === product.id ? product : p))
        : [...state.products, product];
    return { ...state, products: updatedProducts };
  },

  deleteProduct: (state: ERPStoreState, id: string): ERPStoreState => {
    // Check if referenced in transactions
    const isReferenced =
      state.salesOrders.some((so) => so.lines.some((l) => l.productId === id)) ||
      state.purchaseOrders.some((po) => po.lines.some((l) => l.productId === id));
    if (isReferenced) {
      // Instead of hard delete, archive
      return {
        ...state,
        products: state.products.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)),
      };
    }
    return {
      ...state,
      products: state.products.filter((p) => p.id !== id),
    };
  },

  // Customers
  saveCustomer: (state: ERPStoreState, customer: Customer): ERPStoreState => {
    const existing = state.customers.findIndex((c) => c.id === customer.id);
    const updated =
      existing >= 0
        ? state.customers.map((c) => (c.id === customer.id ? customer : c))
        : [...state.customers, customer];
    return { ...state, customers: updated };
  },

  // Suppliers
  saveSupplier: (state: ERPStoreState, supplier: Supplier): ERPStoreState => {
    const existing = state.suppliers.findIndex((s) => s.id === supplier.id);
    const updated =
      existing >= 0
        ? state.suppliers.map((s) => (s.id === supplier.id ? supplier : s))
        : [...state.suppliers, supplier];
    return { ...state, suppliers: updated };
  },
};

export const SalesRepository = {
  saveQuotation: (state: ERPStoreState, quotation: Quotation): ERPStoreState => {
    const existing = state.quotations.findIndex((q) => q.id === quotation.id);
    const updated =
      existing >= 0
        ? state.quotations.map((q) => (q.id === quotation.id ? quotation : q))
        : [...state.quotations, quotation];
    return { ...state, quotations: updated };
  },

  saveSalesOrder: (state: ERPStoreState, order: SalesOrder): ERPStoreState => {
    const existing = state.salesOrders.findIndex((so) => so.id === order.id);
    const updated =
      existing >= 0
        ? state.salesOrders.map((so) => (so.id === order.id ? order : so))
        : [...state.salesOrders, order];
    return { ...state, salesOrders: updated };
  },

  saveDeliveryOrder: (state: ERPStoreState, delivery: DeliveryOrder): ERPStoreState => {
    const existing = state.deliveryOrders.findIndex((d) => d.id === delivery.id);
    const updated =
      existing >= 0
        ? state.deliveryOrders.map((d) => (d.id === delivery.id ? delivery : d))
        : [...state.deliveryOrders, delivery];
    return { ...state, deliveryOrders: updated };
  },

  saveCustomerInvoice: (state: ERPStoreState, invoice: CustomerInvoice): ERPStoreState => {
    const existing = state.customerInvoices.findIndex((inv) => inv.id === invoice.id);
    const updated =
      existing >= 0
        ? state.customerInvoices.map((inv) => (inv.id === invoice.id ? invoice : inv))
        : [...state.customerInvoices, invoice];
    return { ...state, customerInvoices: updated };
  },

  saveCustomerPayment: (state: ERPStoreState, payment: CustomerPayment): ERPStoreState => {
    return {
      ...state,
      customerPayments: [payment, ...state.customerPayments],
    };
  },
};

export const ProcurementRepository = {
  savePurchaseRequisition: (
    state: ERPStoreState,
    requisition: PurchaseRequisition
  ): ERPStoreState => {
    const existing = state.purchaseRequisitions.findIndex((r) => r.id === requisition.id);
    const updated =
      existing >= 0
        ? state.purchaseRequisitions.map((r) => (r.id === requisition.id ? requisition : r))
        : [...state.purchaseRequisitions, requisition];
    return { ...state, purchaseRequisitions: updated };
  },

  savePurchaseOrder: (state: ERPStoreState, order: PurchaseOrder): ERPStoreState => {
    const existing = state.purchaseOrders.findIndex((po) => po.id === order.id);
    const updated =
      existing >= 0
        ? state.purchaseOrders.map((po) => (po.id === order.id ? order : po))
        : [...state.purchaseOrders, order];
    return { ...state, purchaseOrders: updated };
  },

  saveGoodsReceipt: (state: ERPStoreState, receipt: GoodsReceipt): ERPStoreState => {
    const existing = state.goodsReceipts.findIndex((gr) => gr.id === receipt.id);
    const updated =
      existing >= 0
        ? state.goodsReceipts.map((gr) => (gr.id === receipt.id ? receipt : gr))
        : [...state.goodsReceipts, receipt];
    return { ...state, goodsReceipts: updated };
  },

  saveSupplierInvoice: (state: ERPStoreState, invoice: SupplierInvoice): ERPStoreState => {
    const existing = state.supplierInvoices.findIndex((bi) => bi.id === invoice.id);
    const updated =
      existing >= 0
        ? state.supplierInvoices.map((bi) => (bi.id === invoice.id ? invoice : bi))
        : [...state.supplierInvoices, invoice];
    return { ...state, supplierInvoices: updated };
  },

  saveSupplierPayment: (state: ERPStoreState, payment: SupplierPayment): ERPStoreState => {
    return {
      ...state,
      supplierPayments: [payment, ...state.supplierPayments],
    };
  },
};

export const InventoryRepository = {
  recordLedgerEntry: (state: ERPStoreState, entry: InventoryLedgerEntry): ERPStoreState => {
    return {
      ...state,
      inventoryLedger: [entry, ...state.inventoryLedger],
    };
  },

  saveTransfer: (state: ERPStoreState, transfer: StockTransfer): ERPStoreState => {
    const existing = state.stockTransfers.findIndex((t) => t.id === transfer.id);
    const updated =
      existing >= 0
        ? state.stockTransfers.map((t) => (t.id === transfer.id ? transfer : t))
        : [...state.stockTransfers, transfer];
    return { ...state, stockTransfers: updated };
  },

  saveAdjustment: (state: ERPStoreState, adjustment: StockAdjustment): ERPStoreState => {
    const existing = state.stockAdjustments.findIndex((a) => a.id === adjustment.id);
    const updated =
      existing >= 0
        ? state.stockAdjustments.map((a) => (a.id === adjustment.id ? adjustment : a))
        : [...state.stockAdjustments, adjustment];
    return { ...state, stockAdjustments: updated };
  },

  saveStockCount: (state: ERPStoreState, count: StockCount): ERPStoreState => {
    const existing = state.stockCounts.findIndex((c) => c.id === count.id);
    const updated =
      existing >= 0
        ? state.stockCounts.map((c) => (c.id === count.id ? count : c))
        : [...state.stockCounts, count];
    return { ...state, stockCounts: updated };
  },
};

export const ManufacturingRepository = {
  saveBOM: (state: ERPStoreState, bom: BillOfMaterials): ERPStoreState => {
    const existing = state.billsOfMaterials.findIndex((b) => b.id === bom.id);
    const updated =
      existing >= 0
        ? state.billsOfMaterials.map((b) => (b.id === bom.id ? bom : b))
        : [...state.billsOfMaterials, bom];
    return { ...state, billsOfMaterials: updated };
  },

  saveProductionOrder: (state: ERPStoreState, order: ProductionOrder): ERPStoreState => {
    const existing = state.productionOrders.findIndex((mo) => mo.id === order.id);
    const updated =
      existing >= 0
        ? state.productionOrders.map((mo) => (mo.id === order.id ? order : mo))
        : [...state.productionOrders, order];
    return { ...state, productionOrders: updated };
  },
};

export const FinanceRepository = {
  postJournalEntry: (state: ERPStoreState, journal: JournalEntry): ERPStoreState => {
    const updatedJournals = [journal, ...state.journalEntries];
    const updatedAccounts = updateAccountBalances(state.accounts, updatedJournals);
    return {
      ...state,
      journalEntries: updatedJournals,
      accounts: updatedAccounts,
    };
  },

  saveExpense: (state: ERPStoreState, expense: Expense): ERPStoreState => {
    const existing = state.expenses.findIndex((e) => e.id === expense.id);
    const updated =
      existing >= 0
        ? state.expenses.map((e) => (e.id === expense.id ? expense : e))
        : [...state.expenses, expense];
    return { ...state, expenses: updated };
  },
};

export const HRRepository = {
  saveLeaveRequest: (state: ERPStoreState, request: LeaveRequest): ERPStoreState => {
    const existing = state.leaveRequests.findIndex((lr) => lr.id === request.id);
    const updated =
      existing >= 0
        ? state.leaveRequests.map((lr) => (lr.id === request.id ? request : lr))
        : [...state.leaveRequests, request];
    return { ...state, leaveRequests: updated };
  },

  savePayrollRun: (state: ERPStoreState, run: PayrollRun): ERPStoreState => {
    const existing = state.payrollRuns.findIndex((pr) => pr.id === run.id);
    const updated =
      existing >= 0
        ? state.payrollRuns.map((pr) => (pr.id === run.id ? run : pr))
        : [...state.payrollRuns, run];
    return { ...state, payrollRuns: updated };
  },
};

