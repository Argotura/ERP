// ============================================================
// ARGOTURO ERP — App Context & Business Transaction Orchestrator
// Single Source of Truth with Real-Time Interconnected Workflows
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ERPStoreState,
  ERPRoute,
  DemoUser,
  Product,
  Customer,
  Supplier,
  Quotation,
  SalesOrder,
  DeliveryOrder,
  CustomerInvoice,
  CustomerPayment,
  SalesReturn,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceipt,
  SupplierInvoice,
  SupplierPayment,
  PurchaseReturn,
  StockTransfer,
  StockAdjustment,
  StockCount,
  BillOfMaterials,
  ProductionOrder,
  JournalEntry,
  Expense,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRun,
  ApprovalRequest,
  ActivityLog,
  ProductCategory,
  Warehouse,
} from '../types';
import { loadERPStore, saveERPStore, resetERPStore } from '../store/demoStore';
import { generateDocNumber } from '../core/numbering';
import { createBalancedJournal, updateAccountBalances } from '../core/accountingRules';

export interface ToastNotification {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

export interface AppContextValue {
  store: ERPStoreState;
  currentRoute: ERPRoute;
  activeUserId: string;
  activeUser: DemoUser;
  toasts: ToastNotification[];
  globalSearch: string;

  // Navigation & UI
  setRoute: (route: ERPRoute) => void;
  setActiveUserId: (id: string) => void;
  setGlobalSearch: (q: string) => void;
  addToast: (type: ToastNotification['type'], message: string) => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;

  // Work Center & Approvals
  approveRequest: (requestId: string, notes?: string) => void;
  rejectRequest: (requestId: string, notes?: string) => void;
  markNotificationRead: (id: string) => void;

  // CRM & Sales
  saveCustomer: (customer: Customer) => void;
  saveQuotation: (quotation: Quotation) => void;
  convertQuotationToSO: (quotationId: string) => void;
  saveSalesOrder: (order: SalesOrder) => void;
  approveSalesOrder: (soId: string) => void;
  createDeliveryOrder: (soId: string, warehouseId: string) => void;
  confirmDelivery: (doId: string) => void;
  createCustomerInvoice: (soId: string) => void;
  recordCustomerPayment: (invoiceId: string, amount: number, paymentMethod: string, bankAccountId: string) => void;
  saveSalesReturn: (ret: SalesReturn) => void;

  // Procurement
  saveSupplier: (supplier: Supplier) => void;
  savePurchaseRequisition: (pr: PurchaseRequisition) => void;
  approvePR: (prId: string) => void;
  convertPRToPO: (prId: string, supplierId: string) => void;
  savePurchaseOrder: (po: PurchaseOrder) => void;
  approvePO: (poId: string) => void;
  createGoodsReceipt: (poId: string, warehouseId: string) => void;
  createSupplierInvoice: (poId: string) => void;
  recordSupplierPayment: (invoiceId: string, amount: number, paymentMethod: string, bankAccountId: string) => void;
  savePurchaseReturn: (ret: PurchaseReturn) => void;

  // Inventory & Warehouse
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: ProductCategory) => void;
  saveWarehouse: (warehouse: Warehouse) => void;
  createStockTransfer: (fromWarehouseId: string, toWarehouseId: string, items: { productId: string; quantity: number }[], notes?: string) => void;
  createStockAdjustment: (warehouseId: string, productId: string, adjustmentType: 'gain' | 'loss' | 'scrap' | 'damage', quantity: number, reason: string) => void;
  createStockCount: (warehouseId: string, items: { productId: string; systemQuantity: number; countedQuantity: number; variance: number; unitCost: number; varianceValue: number; notes?: string }[], counterName: string) => void;
  generateReorderPR: (items: { productId: string; quantity: number; estimatedCost: number }[]) => void;

  // Manufacturing
  saveBOM: (bom: BillOfMaterials) => void;
  createProductionOrder: (bomId: string, quantityToProduce: number, targetWarehouseId: string, dueDate: string) => void;
  issueMaterialsForMO: (moId: string) => void;
  completeProductionOrder: (moId: string, quantityProduced: number, scrapQuantity?: number) => void;

  // Finance & Accounting
  createJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'totalDebit' | 'totalCredit'>) => void;
  saveExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>) => void;

  // HR
  saveEmployee: (emp: Employee) => void;
  createLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'requestNumber' | 'createdAt'>) => void;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string) => void;
  processMonthlyPayroll: (period: string) => void;

  // Backward compatibility fields for legacy components
  currentModule: any;
  setERPModule: (mod: any) => void;
  navigate: (page: any) => void;
  catalogTab: any;
  setCatalogTab: (tab: any) => void;
  selectedProductId: string | null;
  openProductDetail: (id: string) => void;
  closeProductDetail: () => void;
  dashboardStockFilter: boolean;
  setDashboardStockFilter: (v: boolean) => void;
  refreshData: () => void;
  createProduct: (data: any) => void;
  updateProduct: (data: any) => void;
  createCategory: (data: any) => void;
  updateCategory: (data: any) => void;
  deleteCategory: (id: string) => void;
  createSupplier: (data: any) => void;
  updateSupplier: (data: any) => void;
  deleteSupplier: (id: string) => void;
  createInboundReceipt: (data: any) => void;
  createOutboundDispatch: (data: any) => void;
  approveStockAdjustment: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<ERPStoreState>(() => loadERPStore());
  const [currentRoute, setCurrentRoute] = useState<ERPRoute>('work_center/my_work');
  const [activeUserId, setActiveUserId] = useState<string>(store.activeUserId || 'usr-001');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Persist store changes to localStorage
  useEffect(() => {
    saveERPStore(store);
  }, [store]);

  const activeUser = store.users.find((u) => u.id === activeUserId) || store.users[0];

  const addToast = useCallback((type: ToastNotification['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = resetERPStore();
    setStore(fresh);
    addToast('success', 'Seluruh data demo ARGOTURO ERP telah dikembalikan ke kondisi awal');
  }, [addToast]);

  // Helper to log system activity
  const logActivity = (
    module: ActivityLog['module'],
    action: ActivityLog['action'],
    entityId: string,
    entityNumber: string,
    description: string
  ): ActivityLog => ({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    module,
    action,
    entityId,
    entityNumber,
    description,
    user: activeUser.name,
    role: activeUser.role,
    timestamp: new Date().toISOString(),
  });

  // ── Work Center & Approvals ─────────────────────────────────
  const approveRequest = useCallback(
    (requestId: string, notes?: string) => {
      setStore((prev) => {
        const req = prev.approvalRequests.find((r) => r.id === requestId);
        if (!req) return prev;

        const updatedRequests = prev.approvalRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'approved' as const,
                approvedBy: activeUser.name,
                approvedAt: new Date().toISOString(),
                notes: notes || r.notes,
              }
            : r
        );

        let updatedPrev = { ...prev, approvalRequests: updatedRequests };

        // Handle underlying entity update based on approval type
        if (req.entityType === 'sales_order') {
          updatedPrev.salesOrders = updatedPrev.salesOrders.map((so) =>
            so.id === req.entityId ? { ...so, status: 'approved' } : so
          );
        } else if (req.entityType === 'purchase_requisition') {
          updatedPrev.purchaseRequisitions = updatedPrev.purchaseRequisitions.map((pr) =>
            pr.id === req.entityId ? { ...pr, status: 'approved' } : pr
          );
        } else if (req.entityType === 'purchase_order') {
          updatedPrev.purchaseOrders = updatedPrev.purchaseOrders.map((po) =>
            po.id === req.entityId ? { ...po, status: 'approved' } : po
          );
        } else if (req.entityType === 'leave_request') {
          updatedPrev.leaveRequests = updatedPrev.leaveRequests.map((lr) =>
            lr.id === req.entityId
              ? { ...lr, status: 'approved', approvedBy: activeUser.name, approvedAt: new Date().toISOString() }
              : lr
          );
        } else if (req.entityType === 'expense') {
          updatedPrev.expenses = updatedPrev.expenses.map((e) =>
            e.id === req.entityId
              ? { ...e, status: 'approved', approvedBy: activeUser.name, approvedAt: new Date().toISOString() }
              : e
          );
        }

        const log = logActivity(
          'approval',
          'approved',
          req.entityId || req.documentId || '',
          req.entityNumber || req.documentNumber || '',
          `Persetujuan ${req.entityType || req.type} ${req.entityNumber || req.documentNumber || ''} disetujui oleh ${activeUser.name}`
        );

        return {
          ...updatedPrev,
          activityLogs: [log, ...updatedPrev.activityLogs],
        };
      });

      addToast('success', 'Permintaan persetujuan berhasil disetujui');
    },
    [activeUser, addToast]
  );

  const rejectRequest = useCallback(
    (requestId: string, notes?: string) => {
      setStore((prev) => {
        const req = prev.approvalRequests.find((r) => r.id === requestId);
        if (!req) return prev;

        const updatedRequests = prev.approvalRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'rejected' as const,
                approvedBy: activeUser.name,
                approvedAt: new Date().toISOString(),
                notes: notes || 'Ditolak',
              }
            : r
        );

        let updatedPrev = { ...prev, approvalRequests: updatedRequests };

        if (req.entityType === 'sales_order') {
          updatedPrev.salesOrders = updatedPrev.salesOrders.map((so) =>
            so.id === req.entityId ? { ...so, status: 'rejected' } : so
          );
        } else if (req.entityType === 'purchase_requisition') {
          updatedPrev.purchaseRequisitions = updatedPrev.purchaseRequisitions.map((pr) =>
            pr.id === req.entityId ? { ...pr, status: 'rejected' } : pr
          );
        } else if (req.entityType === 'purchase_order') {
          updatedPrev.purchaseOrders = updatedPrev.purchaseOrders.map((po) =>
            po.id === req.entityId ? { ...po, status: 'rejected' } : po
          );
        } else if (req.entityType === 'leave_request') {
          updatedPrev.leaveRequests = updatedPrev.leaveRequests.map((lr) =>
            lr.id === req.entityId ? { ...lr, status: 'rejected' } : lr
          );
        } else if (req.entityType === 'expense') {
          updatedPrev.expenses = updatedPrev.expenses.map((e) =>
            e.id === req.entityId ? { ...e, status: 'rejected' } : e
          );
        }

        const log = logActivity(
          'approval',
          'rejected',
          req.entityId || req.documentId || '',
          req.entityNumber || req.documentNumber || '',
          `Permintaan ${req.entityType || req.type} ${req.entityNumber || req.documentNumber || ''} ditolak oleh ${activeUser.name}: ${notes || ''}`
        );

        return {
          ...updatedPrev,
          activityLogs: [log, ...updatedPrev.activityLogs],
        };
      });

      addToast('warning', 'Permintaan telah ditolak');
    },
    [activeUser, addToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  }, []);

  // ── CRM & Sales Workflows ──────────────────────────────────
  const saveCustomer = useCallback((customer: Customer) => {
    setStore((prev) => {
      const idx = prev.customers.findIndex((c) => c.id === customer.id);
      const updated = idx >= 0 ? prev.customers.map((c) => (c.id === customer.id ? customer : c)) : [customer, ...prev.customers];
      return { ...prev, customers: updated };
    });
  }, []);

  const saveQuotation = useCallback((quotation: Quotation) => {
    setStore((prev) => {
      const idx = prev.quotations.findIndex((q) => q.id === quotation.id);
      const updated = idx >= 0 ? prev.quotations.map((q) => (q.id === quotation.id ? quotation : q)) : [quotation, ...prev.quotations];
      return { ...prev, quotations: updated };
    });
  }, []);

  const convertQuotationToSO = useCallback(
    (quotationId: string) => {
      setStore((prev) => {
        const quotation = prev.quotations.find((q) => q.id === quotationId);
        if (!quotation) return prev;

        const soNumber = generateDocNumber(
          'SO',
          prev.salesOrders.map((s) => s.orderNumber)
        );

        const newSO: SalesOrder = {
          id: `so-${Date.now()}`,
          orderNumber: soNumber,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          customerName: quotation.customerName || prev.customers.find((c) => c.id === quotation.customerId)?.name || 'Pelanggan',
          notes: quotation.notes || '',
          orderDate: new Date().toISOString().split('T')[0],
          deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: quotation.grandTotal > prev.companySettings.soApprovalThreshold ? 'pending_approval' : 'approved',
          lines: quotation.lines.map((l, i) => ({
            id: `sol-${Date.now()}-${i}`,
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discount: l.discount,
            subtotal: l.subtotal,
            fulfilledQuantity: 0,
            unitCost: l.unitCost,
          })),
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          grandTotal: quotation.grandTotal,
          paymentTerms: quotation.paymentTerms,
          shippingAddress: quotation.deliveryAddress,
          warehouseId: prev.warehouses[0].id,
          salesperson: activeUser.name,
          createdAt: new Date().toISOString(),
        };

        const updatedQuotations = prev.quotations.map((q) =>
          q.id === quotationId ? { ...q, status: 'approved' as const } : q
        );

        let updatedApprovals = prev.approvalRequests;
        if (newSO.status === 'pending_approval') {
          const approvalReq: ApprovalRequest = {
            id: `apr-${Date.now()}`,
            entityType: 'sales_order',
            entityId: newSO.id,
            entityNumber: newSO.orderNumber,
            requestedBy: activeUser.name,
            roleRequired: 'Sales Manager',
            amount: newSO.grandTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          updatedApprovals = [approvalReq, ...updatedApprovals];
        }

        const log = logActivity('sales', 'created', newSO.id, newSO.orderNumber, `Quotation ${quotation.quotationNumber} dikonversi ke Sales Order ${newSO.orderNumber}`);

        return {
          ...prev,
          quotations: updatedQuotations,
          salesOrders: [newSO, ...prev.salesOrders],
          approvalRequests: updatedApprovals,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Quotation berhasil dikonversi menjadi Sales Order');
    },
    [activeUser, addToast]
  );

  const saveSalesOrder = useCallback((order: SalesOrder) => {
    setStore((prev) => {
      const idx = prev.salesOrders.findIndex((s) => s.id === order.id);
      const updated = idx >= 0 ? prev.salesOrders.map((s) => (s.id === order.id ? order : s)) : [order, ...prev.salesOrders];
      return { ...prev, salesOrders: updated };
    });
  }, []);

  const approveSalesOrder = useCallback(
    (soId: string) => {
      setStore((prev) => {
        const so = prev.salesOrders.find((s) => s.id === soId);
        if (!so) return prev;

        const updatedSOs = prev.salesOrders.map((s) => (s.id === soId ? { ...s, status: 'approved' as const } : s));
        const updatedApprovals = prev.approvalRequests.map((a) =>
          a.entityId === soId ? { ...a, status: 'approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() } : a
        );

        const log = logActivity('sales', 'approved', so.id, so.orderNumber, `Sales Order ${so.orderNumber} disetujui`);
        return { ...prev, salesOrders: updatedSOs, approvalRequests: updatedApprovals, activityLogs: [log, ...prev.activityLogs] };
      });
      addToast('success', 'Sales Order berhasil disetujui');
    },
    [activeUser, addToast]
  );

  const createDeliveryOrder = useCallback(
    (soId: string, warehouseId: string) => {
      setStore((prev) => {
        const so = prev.salesOrders.find((s) => s.id === soId);
        if (!so) return prev;

        const doNumber = generateDocNumber(
          'DO',
          prev.deliveryOrders.map((d) => d.deliveryNumber)
        );

        const newDO: DeliveryOrder = {
          id: `do-${Date.now()}`,
          deliveryNumber: doNumber,
          salesOrderId: so.id,
          warehouseId,
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          carrier: 'Armada Internal Logistik',
          trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          lines: so.lines.map((l) => ({
            id: `dol-${Date.now()}-${l.productId}`,
            productId: l.productId,
            quantity: l.quantity - l.fulfilledQuantity,
            uom: 'PCS',
          })),
          createdAt: new Date().toISOString(),
        };

        const log = logActivity('sales', 'created', newDO.id, newDO.deliveryNumber, `Surat Jalan (DO) ${newDO.deliveryNumber} dibuat dari Sales Order ${so.orderNumber}`);

        return {
          ...prev,
          deliveryOrders: [newDO, ...prev.deliveryOrders],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Surat Jalan (Delivery Order) berhasil dibuat');
    },
    [addToast]
  );

  const confirmDelivery = useCallback(
    (doId: string) => {
      setStore((prev) => {
        const deliv = prev.deliveryOrders.find((d) => d.id === doId);
        if (!deliv) return prev;

        const warehouse = prev.warehouses.find((w) => w.id === deliv.warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Gudang Pusat Cikarang';

        // 1. Generate inventory ledger records & update stock
        const newLedgerEntries = deliv.lines.map((line, idx) => {
          const product = prev.products.find((p) => p.id === line.productId);
          const currentStock = product ? product.onHandStock : 0;
          const newStock = Math.max(0, currentStock - line.quantity);
          const unitCost = product ? product.unitCost : 0;

          return {
            id: `led-${Date.now()}-${idx}`,
            entryNumber: `LED-${Date.now().toString().slice(-6)}-${idx}`,
            date: new Date().toISOString(),
            productId: line.productId,
            warehouseId: deliv.warehouseId,
            movementType: 'outbound' as const,
            referenceType: 'delivery_order' as const,
            referenceNumber: deliv.deliveryNumber,
            quantity: -line.quantity,
            balanceAfter: newStock,
            unitCost,
            totalCost: line.quantity * unitCost,
            notes: `Pengiriman barang ke customer via ${deliv.deliveryNumber}`,
            createdAt: new Date().toISOString(),
          };
        });

        // Update product stock allocations
        const updatedProducts = prev.products.map((p) => {
          const matchedLine = deliv.lines.find((l) => l.productId === p.id);
          if (!matchedLine) return p;

          const updatedOnHand = Math.max(0, p.onHandStock - matchedLine.quantity);
          const updatedWarehouses = (p.warehouses || []).map((w) =>
            w.warehouseId === deliv.warehouseId ? { ...w, onHandStock: Math.max(0, w.onHandStock - matchedLine.quantity) } : w
          );

          return {
            ...p,
            onHandStock: updatedOnHand,
            warehouses: updatedWarehouses,
            updatedAt: new Date().toISOString(),
          };
        });

        // 2. Mark DO as completed
        const updatedDOs = prev.deliveryOrders.map((d) =>
          d.id === doId ? { ...d, status: 'completed' as const, shippedAt: new Date().toISOString() } : d
        );

        // 3. Update Sales Order fulfillment
        const updatedSOs = prev.salesOrders.map((so) => {
          if (so.id !== deliv.salesOrderId) return so;
          const updatedLines = so.lines.map((sol) => {
            const shipped = deliv.lines.find((dl) => dl.productId === sol.productId);
            const newFulfilled = sol.fulfilledQuantity + (shipped ? shipped.quantity : 0);
            return { ...sol, fulfilledQuantity: newFulfilled };
          });
          const allFulfilled = updatedLines.every((l) => l.fulfilledQuantity >= l.quantity);
          return {
            ...so,
            lines: updatedLines,
            status: allFulfilled ? ('fulfilled' as const) : ('partially_fulfilled' as const),
          };
        });

        const log = logActivity('sales', 'confirmed', deliv.id, deliv.deliveryNumber, `Barang telah dikirim untuk DO ${deliv.deliveryNumber}. Stok di ${warehouseName} telah berkurang.`);

        return {
          ...prev,
          products: updatedProducts,
          deliveryOrders: updatedDOs,
          salesOrders: updatedSOs,
          inventoryLedger: [...newLedgerEntries, ...prev.inventoryLedger],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Pengiriman barang telah dikonfirmasi dan stok gudang otomatis terpotong');
    },
    [addToast]
  );

  const createCustomerInvoice = useCallback(
    (soId: string) => {
      setStore((prev) => {
        const so = prev.salesOrders.find((s) => s.id === soId);
        if (!so) return prev;

        const customer = prev.customers.find((c) => c.id === so.customerId);
        const invNumber = generateDocNumber(
          'INV',
          prev.customerInvoices.map((inv) => inv.invoiceNumber)
        );

        const newInvoice: CustomerInvoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: invNumber,
          salesOrderId: so.id,
          salesOrderNumber: so.orderNumber,
          customerId: so.customerId,
          customerName: customer ? customer.name : so.customerName || 'Pelanggan',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'unpaid',
          subtotal: so.subtotal,
          taxAmount: so.taxAmount ?? so.taxTotal ?? 0,
          grandTotal: so.grandTotal,
          paidAmount: 0,
          outstandingBalance: so.grandTotal,
          remainingAmount: so.grandTotal,
          lines: so.lines.map((l: any) => ({
            id: `invl-${Date.now()}-${l.productId}`,
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            subtotal: l.subtotal,
          })),
          createdAt: new Date().toISOString(),
        };

        // Automatic Balanced Double-Entry Journal:
        // Debit: 11200 Piutang Usaha (grandTotal)
        // Credit: 41100 Pendapatan Penjualan (subtotal)
        // Credit: 21400 Hutang PPN Keluaran (taxAmount)
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const journalLines = [
          { accountCode: '11200', accountName: 'Piutang Usaha', debit: newInvoice.grandTotal, credit: 0, memo: `Tagihan Penjualan ${newInvoice.invoiceNumber}` },
          { accountCode: '41100', accountName: 'Pendapatan Penjualan Barang Dagang', debit: 0, credit: newInvoice.subtotal, memo: `Penjualan ${so.orderNumber}` },
        ];

        const invTax = newInvoice.taxAmount ?? newInvoice.taxTotal ?? 0;
        if (invTax > 0) {
          journalLines.push({
            accountCode: '21400',
            accountName: 'Hutang PPN Keluaran',
            debit: 0,
            credit: invTax,
            memo: `PPN 11% Faktur ${newInvoice.invoiceNumber}`,
          });
        }

        const journal = createBalancedJournal(
          jeNumber,
          'CustomerInvoice',
          newInvoice.invoiceNumber,
          `Pengakuan Piutang & Penjualan Faktur ${newInvoice.invoiceNumber} - ${customer ? customer.name : ''}`,
          journalLines,
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('finance', 'posted', newInvoice.id, newInvoice.invoiceNumber, `Faktur Penjualan ${newInvoice.invoiceNumber} diterbitkan & Jurnal ${jeNumber} berhasil diposting`);

        return {
          ...prev,
          customerInvoices: [newInvoice, ...prev.customerInvoices],
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Faktur Penjualan berhasil diterbitkan dan jurnal piutang otomatis diposting');
    },
    [activeUser, addToast]
  );

  const recordCustomerPayment = useCallback(
    (invoiceId: string, amount: number, paymentMethod: string, bankAccountId: string) => {
      setStore((prev) => {
        const invoice = prev.customerInvoices.find((i) => i.id === invoiceId);
        if (!invoice) return prev;

        const customer = prev.customers.find((c) => c.id === invoice.customerId);
        const bankAccount = prev.bankAccounts.find((b) => b.id === bankAccountId);

        const payNumber = generateDocNumber(
          'PAY_IN',
          prev.customerPayments.map((p) => p.paymentNumber)
        );

        const newPayment: CustomerPayment = {
          id: `pay-${Date.now()}`,
          paymentNumber: payNumber,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          customerName: customer ? customer.name : invoice.customerName || 'Pelanggan',
          paymentDate: new Date().toISOString().split('T')[0],
          amount,
          paymentMethod: paymentMethod as any,
          bankAccountId,
          referenceNumber: `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
          notes: '',
          status: 'cleared',
          createdAt: new Date().toISOString(),
        };

        const newPaidAmount = invoice.paidAmount + amount;
        const newRemaining = Math.max(0, invoice.grandTotal - newPaidAmount);
        const newStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';

        const updatedInvoices = prev.customerInvoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, paidAmount: newPaidAmount, remainingAmount: newRemaining, status: newStatus as any } : inv
        );

        // Automatic Balanced Journal:
        // Debit: Kas/Bank (11110 / 11120)
        // Credit: Piutang Usaha (11200)
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const debitAccountCode = bankAccount?.accountCode || '11120';
        const debitAccountName = bankAccount?.accountName || 'Bank BCA Operasional';

        const journal = createBalancedJournal(
          jeNumber,
          'CustomerPayment',
          newPayment.paymentNumber,
          `Penerimaan Pembayaran Pelanggan ${customer ? customer.name : ''} untuk Faktur ${invoice.invoiceNumber}`,
          [
            { accountCode: debitAccountCode, accountName: debitAccountName, debit: amount, credit: 0, memo: `Penerimaan Kas/Bank via ${paymentMethod}` },
            { accountCode: '11200', accountName: 'Piutang Usaha', debit: 0, credit: amount, memo: `Pelunasan Piutang ${invoice.invoiceNumber}` },
          ],
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('finance', 'paid', newPayment.id, newPayment.paymentNumber, `Pembayaran ${newPayment.paymentNumber} sebesar Rp ${amount.toLocaleString('id-ID')} diterima`);

        return {
          ...prev,
          customerInvoices: updatedInvoices,
          customerPayments: [newPayment, ...prev.customerPayments],
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Pembayaran pelanggan berhasil dicatat dan jurnal kas/bank diperbarui');
    },
    [activeUser, addToast]
  );

  const saveSalesReturn = useCallback((ret: SalesReturn) => {
    setStore((prev) => ({ ...prev, salesReturns: [ret, ...prev.salesReturns] }));
  }, []);

  // ── Procurement Workflows ──────────────────────────────────
  const saveSupplier = useCallback((supplier: Supplier) => {
    setStore((prev) => {
      const idx = prev.suppliers.findIndex((s) => s.id === supplier.id);
      const updated = idx >= 0 ? prev.suppliers.map((s) => (s.id === supplier.id ? supplier : s)) : [supplier, ...prev.suppliers];
      return { ...prev, suppliers: updated };
    });
  }, []);

  const savePurchaseRequisition = useCallback(
    (pr: PurchaseRequisition) => {
      setStore((prev) => {
        const prNumber = pr.requisitionNumber || pr.prNumber || generateDocNumber('PR', prev.purchaseRequisitions.map((p) => p.requisitionNumber || p.prNumber || ''));
        const newPR: PurchaseRequisition = { ...pr, requisitionNumber: prNumber, prNumber: prNumber };

        let updatedApprovals = prev.approvalRequests;
        if (newPR.status === 'pending_approval') {
          const req: ApprovalRequest = {
            id: `apr-${Date.now()}`,
            entityType: 'purchase_requisition',
            entityId: newPR.id,
            entityNumber: newPR.requisitionNumber,
            requestedBy: activeUser.name,
            roleRequired: 'Purchasing Manager',
            amount: newPR.estimatedTotal || newPR.totalEstimatedAmount || 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          updatedApprovals = [req, ...updatedApprovals];
        }

        const log = logActivity('purchasing', 'created', newPR.id, newPR.requisitionNumber || newPR.prNumber || '', `Permintaan Pembelian (PR) ${newPR.requisitionNumber || newPR.prNumber} diajukan`);

        return {
          ...prev,
          purchaseRequisitions: [newPR, ...prev.purchaseRequisitions.filter((p) => p.id !== newPR.id)],
          approvalRequests: updatedApprovals,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Permintaan Pembelian (PR) berhasil dibuat');
    },
    [activeUser, addToast]
  );

  const approvePR = useCallback(
    (prId: string) => {
      setStore((prev) => {
        const pr = prev.purchaseRequisitions.find((p) => p.id === prId);
        if (!pr) return prev;

        const updatedPRs = prev.purchaseRequisitions.map((p) => (p.id === prId ? { ...p, status: 'approved' as const } : p));
        const updatedApprovals = prev.approvalRequests.map((a) =>
          a.entityId === prId ? { ...a, status: 'approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() } : a
        );

        const log = logActivity('purchasing', 'approved', pr.id, pr.requisitionNumber || pr.prNumber || '', `PR ${pr.requisitionNumber || pr.prNumber} disetujui`);
        return { ...prev, purchaseRequisitions: updatedPRs, approvalRequests: updatedApprovals, activityLogs: [log, ...prev.activityLogs] };
      });
      addToast('success', 'PR berhasil disetujui');
    },
    [activeUser, addToast]
  );

  const convertPRToPO = useCallback(
    (prId: string, supplierId: string) => {
      setStore((prev) => {
        const pr = prev.purchaseRequisitions.find((p) => p.id === prId);
        if (!pr) return prev;

        const poNumber = generateDocNumber(
          'PO',
          prev.purchaseOrders.map((p) => p.orderNumber || p.poNumber || '')
        );

        const taxRate = prev.companySettings.standardVatRate;
        const subtotal = pr.lines.reduce((s: number, l: any) => s + (l.quantity * (l.estimatedUnitCost || l.unitCost || 0)), 0);
        const taxAmount = Math.round(subtotal * (taxRate / 100));
        const grandTotal = subtotal + taxAmount;
        const supplier = prev.suppliers.find((s) => s.id === supplierId);

        const newPO: PurchaseOrder = {
          id: `po-${Date.now()}`,
          poNumber: poNumber,
          orderNumber: poNumber,
          requisitionId: pr.id,
          supplierId,
          supplierName: supplier ? supplier.name : '',
          orderDate: new Date().toISOString().split('T')[0],
          expectedArrival: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          expectedDeliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          status: grandTotal > prev.companySettings.poApprovalThreshold ? 'pending_approval' : 'approved',
          lines: pr.lines.map((l: any, i: number) => ({
            id: `pol-${Date.now()}-${i}`,
            productId: l.productId,
            quantity: l.quantity,
            unitCost: l.estimatedUnitCost || l.unitCost || 0,
            subtotal: l.quantity * (l.estimatedUnitCost || l.unitCost || 0),
            receivedQuantity: 0,
          })),
          subtotal,
          taxTotal: taxAmount,
          taxAmount,
          grandTotal,
          paymentTerms: 'NET 30',
          warehouseId: prev.warehouses[0].id,
          warehouseCode: prev.warehouses[0].code,
          notes: '',
          buyer: activeUser.name,
          createdAt: new Date().toISOString(),
        };

        const updatedPRs = prev.purchaseRequisitions.map((p) => (p.id === prId ? { ...p, status: 'ordered' as const } : p));

        let updatedApprovals = prev.approvalRequests;
        if (newPO.status === 'pending_approval') {
          const req: ApprovalRequest = {
            id: `apr-${Date.now()}`,
            entityType: 'purchase_order',
            entityId: newPO.id,
            entityNumber: newPO.orderNumber,
            requestedBy: activeUser.name,
            roleRequired: 'Purchasing Manager',
            amount: newPO.grandTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          updatedApprovals = [req, ...updatedApprovals];
        }

        const log = logActivity('purchasing', 'created', newPO.id, newPO.orderNumber || newPO.poNumber || '', `PR ${pr.requisitionNumber || pr.prNumber || ''} dikonversi ke Purchase Order ${newPO.orderNumber || newPO.poNumber || ''}`);

        return {
          ...prev,
          purchaseRequisitions: updatedPRs,
          purchaseOrders: [newPO, ...prev.purchaseOrders],
          approvalRequests: updatedApprovals,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Purchase Order berhasil dibuat dari PR');
    },
    [activeUser, addToast]
  );

  const savePurchaseOrder = useCallback((po: PurchaseOrder) => {
    setStore((prev) => {
      const idx = prev.purchaseOrders.findIndex((p) => p.id === po.id);
      const updated = idx >= 0 ? prev.purchaseOrders.map((p) => (p.id === po.id ? po : p)) : [po, ...prev.purchaseOrders];
      return { ...prev, purchaseOrders: updated };
    });
  }, []);

  const approvePO = useCallback(
    (poId: string) => {
      setStore((prev) => {
        const po = prev.purchaseOrders.find((p) => p.id === poId);
        if (!po) return prev;

        const updatedPOs = prev.purchaseOrders.map((p) => (p.id === poId ? { ...p, status: 'approved' as const } : p));
        const updatedApprovals = prev.approvalRequests.map((a) =>
          a.entityId === poId ? { ...a, status: 'approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() } : a
        );

        const log = logActivity('purchasing', 'approved', po.id, po.orderNumber || po.poNumber || '', `Purchase Order ${po.orderNumber || po.poNumber} disetujui`);
        return { ...prev, purchaseOrders: updatedPOs, approvalRequests: updatedApprovals, activityLogs: [log, ...prev.activityLogs] };
      });
      addToast('success', 'Purchase Order berhasil disetujui');
    },
    [activeUser, addToast]
  );

  const createGoodsReceipt = useCallback(
    (poId: string, warehouseId: string) => {
      setStore((prev) => {
        const po = prev.purchaseOrders.find((p) => p.id === poId);
        if (!po) return prev;

        const grNumber = generateDocNumber(
          'GR',
          prev.goodsReceipts.map((g) => g.receiptNumber || g.grNumber || '')
        );

        const warehouse = prev.warehouses.find((w) => w.id === warehouseId) || prev.warehouses[0];

        const newGR: GoodsReceipt = {
          id: `gr-${Date.now()}`,
          grNumber: grNumber,
          receiptNumber: grNumber,
          purchaseOrderId: po.id,
          warehouseId,
          receiptDate: new Date().toISOString().split('T')[0],
          status: 'received',
          receivedBy: activeUser.name,
          lines: po.lines.map((l) => ({
            id: `grl-${Date.now()}-${l.productId}`,
            productId: l.productId,
            quantityReceived: l.quantity - l.receivedQuantity,
            uom: 'PCS',
            batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
            acceptedQuantity: l.quantity - l.receivedQuantity,
            rejectedQuantity: 0,
          })),
          createdAt: new Date().toISOString(),
        };

        // 1. Generate inbound inventory ledger records
        const newLedgerEntries = newGR.lines.map((line, idx) => {
          const product = prev.products.find((p) => p.id === line.productId);
          const currentStock = product ? product.onHandStock : 0;
          const newStock = currentStock + line.acceptedQuantity;
          const poLine = po.lines.find((pl) => pl.productId === line.productId);
          const unitCost = poLine ? poLine.unitCost : product ? product.unitCost : 0;

          return {
            id: `led-${Date.now()}-${idx}`,
            entryNumber: `LED-${Date.now().toString().slice(-6)}-${idx}`,
            date: new Date().toISOString(),
            productId: line.productId,
            warehouseId,
            movementType: 'inbound' as const,
            referenceType: 'goods_receipt' as const,
            referenceNumber: newGR.receiptNumber,
            quantity: line.acceptedQuantity,
            balanceAfter: newStock,
            unitCost,
            totalCost: line.acceptedQuantity * unitCost,
            notes: `Penerimaan barang dari PO ${po.orderNumber}`,
            createdAt: new Date().toISOString(),
          };
        });

        // 2. Update physical stock in product master
        const updatedProducts = prev.products.map((p) => {
          const matched = newGR.lines.find((l) => l.productId === p.id);
          if (!matched) return p;

          const updatedOnHand = p.onHandStock + matched.acceptedQuantity;
          const updatedWarehouses = (p.warehouses || []).map((w) =>
            w.warehouseId === warehouseId ? { ...w, onHandStock: w.onHandStock + matched.acceptedQuantity } : w
          );

          return {
            ...p,
            onHandStock: updatedOnHand,
            warehouses: updatedWarehouses,
            updatedAt: new Date().toISOString(),
          };
        });

        // 3. Update PO received status
        const updatedPOs = prev.purchaseOrders.map((p) => {
          if (p.id !== poId) return p;
          const updatedLines = p.lines.map((pol) => {
            const grLine = newGR.lines.find((gl) => gl.productId === pol.productId);
            return {
              ...pol,
              receivedQuantity: pol.receivedQuantity + (grLine ? grLine.acceptedQuantity : 0),
            };
          });
          const allReceived = updatedLines.every((l) => l.receivedQuantity >= l.quantity);
          return {
            ...p,
            lines: updatedLines,
            status: allReceived ? ('received' as const) : ('partially_received' as const),
          };
        });

        const log = logActivity('purchasing', 'received', newGR.id, newGR.receiptNumber || newGR.grNumber || '', `Penerimaan Barang ${newGR.receiptNumber || newGR.grNumber} dikonfirmasi di ${warehouse.name}`);

        return {
          ...prev,
          products: updatedProducts,
          goodsReceipts: [newGR, ...prev.goodsReceipts],
          purchaseOrders: updatedPOs,
          inventoryLedger: [...newLedgerEntries, ...prev.inventoryLedger],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Penerimaan barang berhasil diproses dan stok gudang otomatis bertambah');
    },
    [activeUser, addToast]
  );

  const createSupplierInvoice = useCallback(
    (poId: string) => {
      setStore((prev) => {
        const po = prev.purchaseOrders.find((p) => p.id === poId);
        if (!po) return prev;

        const supplier = prev.suppliers.find((s) => s.id === po.supplierId);
        const billNumber = generateDocNumber(
          'BILL',
          prev.supplierInvoices.map((b) => b.invoiceNumber || b.billNumber || '')
        );

        const newBill: SupplierInvoice = {
          id: `bill-${Date.now()}`,
          billNumber: billNumber,
          invoiceNumber: billNumber,
          supplierBillRef: `VEN-${Math.floor(100000 + Math.random() * 900000)}`,
          supplierInvoiceNumber: `VEN-${Math.floor(100000 + Math.random() * 900000)}`,
          purchaseOrderId: po.id,
          purchaseOrderNumber: po.orderNumber || po.poNumber || '',
          supplierId: po.supplierId,
          supplierName: supplier ? supplier.name : po.supplierName || 'Pemasok',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'unpaid',
          subtotal: po.subtotal,
          taxAmount: po.taxAmount ?? po.taxTotal ?? 0,
          grandTotal: po.grandTotal,
          paidAmount: 0,
          outstandingBalance: po.grandTotal,
          remainingAmount: po.grandTotal,
          lines: po.lines.map((l: any) => ({
            id: `billl-${Date.now()}-${l.productId}`,
            productId: l.productId,
            quantity: l.quantity,
            unitCost: l.unitCost,
            subtotal: l.subtotal,
          })),
          createdAt: new Date().toISOString(),
        };

        // Automated Double-Entry Journal:
        // Debit: 11310 Persediaan Barang Dagang (subtotal)
        // Debit: 11610 PPN Masukan (taxAmount)
        // Credit: 21100 Hutang Usaha (grandTotal)
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const journalLines = [
          { accountCode: '11310', accountName: 'Persediaan Barang Dagang', debit: newBill.subtotal, credit: 0, memo: `Pembelian PO ${po.orderNumber}` },
          { accountCode: '21100', accountName: 'Hutang Usaha', debit: 0, credit: newBill.grandTotal, memo: `Faktur Pemasok ${newBill.invoiceNumber}` },
        ];

        const billTax = newBill.taxAmount ?? newBill.taxTotal ?? 0;
        if (billTax > 0) {
          journalLines.splice(1, 0, {
            accountCode: '11610',
            accountName: 'PPN Masukan',
            debit: billTax,
            credit: 0,
            memo: `PPN Masukan 11% Tagihan ${newBill.invoiceNumber}`,
          });
        }

        const journal = createBalancedJournal(
          jeNumber,
          'SupplierInvoice',
          newBill.invoiceNumber || newBill.billNumber || '',
          `Pengakuan Hutang Usaha Faktur Pemasok ${newBill.invoiceNumber} - ${supplier ? supplier.name : ''}`,
          journalLines,
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('finance', 'posted', newBill.id, newBill.invoiceNumber || newBill.billNumber || '', `Faktur Tagihan Pemasok ${newBill.invoiceNumber} dicatat & Jurnal ${jeNumber} berhasil diposting`);

        return {
          ...prev,
          supplierInvoices: [newBill, ...prev.supplierInvoices],
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Tagihan Pemasok berhasil dicatat dan jurnal hutang usaha otomatis diposting');
    },
    [activeUser, addToast]
  );

  const recordSupplierPayment = useCallback(
    (invoiceId: string, amount: number, paymentMethod: string, bankAccountId: string) => {
      setStore((prev) => {
        const bill = prev.supplierInvoices.find((b) => b.id === invoiceId);
        if (!bill) return prev;

        const supplier = prev.suppliers.find((s) => s.id === bill.supplierId);
        const bankAccount = prev.bankAccounts.find((b) => b.id === bankAccountId);

        const payNumber = generateDocNumber(
          'PAY_OUT',
          prev.supplierPayments.map((p) => p.paymentNumber)
        );

        const newPayment: SupplierPayment = {
          id: `sp-${Date.now()}`,
          paymentNumber: payNumber,
          billId: bill.id,
          billNumber: bill.billNumber || bill.invoiceNumber || '',
          supplierInvoiceId: bill.id,
          supplierId: bill.supplierId,
          supplierName: supplier ? supplier.name : bill.supplierName || 'Pemasok',
          paymentDate: new Date().toISOString().split('T')[0],
          amount,
          paymentMethod: paymentMethod as any,
          bankAccountId,
          referenceNumber: `TRF-${Math.floor(1000000 + Math.random() * 9000000)}`,
          notes: '',
          status: 'cleared',
          createdAt: new Date().toISOString(),
        };

        const newPaidAmount = bill.paidAmount + amount;
        const newRemaining = Math.max(0, bill.grandTotal - newPaidAmount);
        const newStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';

        const updatedBills = prev.supplierInvoices.map((b) =>
          b.id === invoiceId ? { ...b, paidAmount: newPaidAmount, remainingAmount: newRemaining, status: newStatus as any } : b
        );

        // Double-Entry Journal:
        // Debit: 21100 Hutang Usaha (amount)
        // Credit: Kas/Bank (11110 / 11120) (amount)
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const creditAccountCode = bankAccount?.accountCode || '11120';
        const creditAccountName = bankAccount?.accountName || 'Bank BCA Operasional';

        const journal = createBalancedJournal(
          jeNumber,
          'SupplierPayment',
          newPayment.paymentNumber,
          `Pembayaran Hutang ke ${supplier ? supplier.name : ''} untuk Faktur ${bill.invoiceNumber || bill.billNumber}`,
          [
            { accountCode: '21100', accountName: 'Hutang Usaha', debit: amount, credit: 0, memo: `Pelunasan Hutang ${bill.invoiceNumber || bill.billNumber}` },
            { accountCode: creditAccountCode, accountName: creditAccountName, debit: 0, credit: amount, memo: `Pengeluaran Kas/Bank via ${paymentMethod}` },
          ],
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('finance', 'paid', newPayment.id, newPayment.paymentNumber, `Pembayaran ke pemasok ${newPayment.paymentNumber} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil`);

        return {
          ...prev,
          supplierInvoices: updatedBills,
          supplierPayments: [newPayment, ...prev.supplierPayments],
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Pembayaran ke pemasok berhasil dicatat dan saldo kas/bank diperbarui');
    },
    [activeUser, addToast]
  );

  const savePurchaseReturn = useCallback((ret: PurchaseReturn) => {
    setStore((prev) => ({ ...prev, purchaseReturns: [ret, ...prev.purchaseReturns] }));
  }, []);

  // ── Inventory & Warehouse Workflows ─────────────────────────
  const saveProduct = useCallback((product: Product) => {
    setStore((prev) => {
      const idx = prev.products.findIndex((p) => p.id === product.id);
      const updated = idx >= 0 ? prev.products.map((p) => (p.id === product.id ? product : p)) : [product, ...prev.products];
      return { ...prev, products: updated };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  }, []);

  const saveCategory = useCallback((category: ProductCategory) => {
    setStore((prev) => {
      const idx = prev.categories.findIndex((c) => c.id === category.id);
      const updated = idx >= 0 ? prev.categories.map((c) => (c.id === category.id ? category : c)) : [category, ...prev.categories];
      return { ...prev, categories: updated };
    });
  }, []);

  const saveWarehouse = useCallback((warehouse: Warehouse) => {
    setStore((prev) => {
      const idx = prev.warehouses.findIndex((w) => w.id === warehouse.id);
      const updated = idx >= 0 ? prev.warehouses.map((w) => (w.id === warehouse.id ? warehouse : w)) : [warehouse, ...prev.warehouses];
      return { ...prev, warehouses: updated };
    });
  }, []);

  const createStockTransfer = useCallback(
    (fromWarehouseId: string, toWarehouseId: string, items: { productId: string; quantity: number }[], notes?: string) => {
      setStore((prev) => {
        const fromWh = prev.warehouses.find((w) => w.id === fromWarehouseId);
        const toWh = prev.warehouses.find((w) => w.id === toWarehouseId);

        const trfNumber = generateDocNumber(
          'TRF',
          prev.stockTransfers.map((t) => t.transferNumber)
        );

        const newTransfer: StockTransfer = {
          id: `trf-${Date.now()}`,
          transferNumber: trfNumber,
          fromWarehouse: fromWh?.name || fromWarehouseId,
          toWarehouse: toWh?.name || toWarehouseId,
          fromWarehouseId,
          toWarehouseId,
          date: new Date().toISOString().split('T')[0],
          transferDate: new Date().toISOString().split('T')[0],
          status: 'completed',
          requestedBy: activeUser.name,
          lines: items.map((it) => {
            const prod = prev.products.find((p) => p.id === it.productId);
            return {
              id: `trfl-${Date.now()}-${it.productId}`,
              productId: it.productId,
              sku: prod?.sku || '',
              productName: prod?.name || '',
              quantity: it.quantity,
              unit: prod?.unit || 'PCS',
            };
          }),
          notes: notes || '',
          createdAt: new Date().toISOString(),
        };

        // Inventory ledger: 1 OUT entry for origin, 1 IN entry for destination
        const newLedgerEntries: any[] = [];
        items.forEach((it, idx) => {
          const product = prev.products.find((p) => p.id === it.productId);
          const unitCost = product ? product.unitCost : 0;
          // OUT
          newLedgerEntries.push({
            id: `led-${Date.now()}-out-${idx}`,
            entryNumber: `LED-${Date.now().toString().slice(-6)}-O${idx}`,
            date: new Date().toISOString(),
            productId: it.productId,
            warehouseId: fromWarehouseId,
            movementType: 'transfer',
            referenceType: 'stock_transfer',
            referenceNumber: trfNumber,
            quantity: -it.quantity,
            balanceAfter: Math.max(0, (product?.onHandStock || 0) - it.quantity),
            unitCost,
            totalCost: it.quantity * unitCost,
            notes: `Transfer keluar ke ${toWh?.name || toWarehouseId}`,
            createdAt: new Date().toISOString(),
          });
          // IN
          newLedgerEntries.push({
            id: `led-${Date.now()}-in-${idx}`,
            entryNumber: `LED-${Date.now().toString().slice(-6)}-I${idx}`,
            date: new Date().toISOString(),
            productId: it.productId,
            warehouseId: toWarehouseId,
            movementType: 'transfer',
            referenceType: 'stock_transfer',
            referenceNumber: trfNumber,
            quantity: it.quantity,
            balanceAfter: product?.onHandStock || 0,
            unitCost,
            totalCost: it.quantity * unitCost,
            notes: `Transfer masuk dari ${fromWh?.name || fromWarehouseId}`,
            createdAt: new Date().toISOString(),
          });
        });

        // Update warehouse allocations in products
        const updatedProducts = prev.products.map((p) => {
          const item = items.find((i) => i.productId === p.id);
          if (!item) return p;

          const updatedWarehouses = (p.warehouses || []).map((wh) => {
            if (wh.warehouseId === fromWarehouseId) {
              return { ...wh, onHandStock: Math.max(0, wh.onHandStock - item.quantity) };
            }
            if (wh.warehouseId === toWarehouseId) {
              return { ...wh, onHandStock: wh.onHandStock + item.quantity };
            }
            return wh;
          });

          return { ...p, warehouses: updatedWarehouses };
        });

        const log = logActivity('inventory', 'transferred', newTransfer.id, newTransfer.transferNumber, `Transfer stok ${trfNumber} dari ${fromWh?.name} ke ${toWh?.name}`);

        return {
          ...prev,
          products: updatedProducts,
          stockTransfers: [newTransfer, ...prev.stockTransfers],
          inventoryLedger: [...newLedgerEntries, ...prev.inventoryLedger],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Transfer stok antar gudang berhasil dilakukan');
    },
    [activeUser, addToast]
  );

  const createStockAdjustment = useCallback(
    (warehouseId: string, productId: string, adjustmentType: 'gain' | 'loss' | 'scrap' | 'damage', quantity: number, reason: string) => {
      setStore((prev) => {
        const product = prev.products.find((p) => p.id === productId);
        if (!product) return prev;

        const warehouse = prev.warehouses.find((w) => w.id === warehouseId);
        const adjNumber = generateDocNumber(
          'ADJ',
          prev.stockAdjustments.map((a) => a.adjustmentNumber)
        );

        const deltaQty = adjustmentType === 'gain' ? quantity : -quantity;
        const newTotalStock = Math.max(0, product.onHandStock + deltaQty);

        const newAdj: StockAdjustment = {
          id: `adj-${Date.now()}`,
          adjustmentNumber: adjNumber,
          warehouseId,
          adjustmentDate: new Date().toISOString().split('T')[0],
          status: 'completed',
          reason,
          adjustedBy: activeUser.name,
          lines: [
            {
              id: `adjl-${Date.now()}`,
              productId,
              systemQuantity: product.onHandStock,
              actualQuantity: newTotalStock,
              variance: deltaQty,
              unitCost: product.unitCost,
              varianceValue: deltaQty * product.unitCost,
              adjustmentType,
            },
          ],
          createdAt: new Date().toISOString(),
        };

        const ledgerEntry = {
          id: `led-${Date.now()}`,
          entryNumber: `LED-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          productId,
          warehouseId,
          movementType: 'adjustment' as const,
          referenceType: 'stock_adjustment' as const,
          referenceNumber: adjNumber,
          quantity: deltaQty,
          balanceAfter: newTotalStock,
          unitCost: product.unitCost,
          totalCost: Math.abs(deltaQty * product.unitCost),
          notes: `Penyesuaian stok (${adjustmentType}): ${reason}`,
          createdAt: new Date().toISOString(),
        };

        const updatedProducts = prev.products.map((p) => {
          if (p.id !== productId) return p;
          const updatedWarehouses = (p.warehouses || []).map((wh) =>
            wh.warehouseId === warehouseId ? { ...wh, onHandStock: Math.max(0, wh.onHandStock + deltaQty) } : wh
          );
          return {
            ...p,
            onHandStock: newTotalStock,
            warehouses: updatedWarehouses,
            updatedAt: new Date().toISOString(),
          };
        });

        const log = logActivity('inventory', 'adjusted', newAdj.id, newAdj.adjustmentNumber, `Penyesuaian stok ${adjNumber} untuk ${product.name} (${deltaQty > 0 ? '+' : ''}${deltaQty} PCS)`);

        return {
          ...prev,
          products: updatedProducts,
          stockAdjustments: [newAdj, ...prev.stockAdjustments],
          inventoryLedger: [ledgerEntry, ...prev.inventoryLedger],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Penyesuaian stok berhasil dicatat');
    },
    [activeUser, addToast]
  );

  const createStockCount = useCallback(
    (warehouseId: string, items: any[], counterName: string) => {
      setStore((prev) => {
        const scNumber = generateDocNumber(
          'SC',
          prev.stockCounts.map((c) => c.countNumber)
        );

        const newCount: StockCount = {
          id: `sc-${Date.now()}`,
          countNumber: scNumber,
          warehouseId,
          countDate: new Date().toISOString().split('T')[0],
          status: 'completed',
          counterName,
          lines: items.map((it, idx) => ({
            id: `scl-${Date.now()}-${idx}`,
            ...it,
          })),
          createdAt: new Date().toISOString(),
        };

        const log = logActivity('inventory', 'counted', newCount.id, newCount.countNumber, `Stock Opname ${scNumber} diselesaikan oleh ${counterName}`);

        return {
          ...prev,
          stockCounts: [newCount, ...prev.stockCounts],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Stock Opname (Cycle Count) berhasil dicatat');
    },
    [addToast]
  );

  const generateReorderPR = useCallback(
    (items: { productId: string; quantity: number; estimatedCost: number }[]) => {
      setStore((prev) => {
        const prNumber = generateDocNumber(
          'PR',
          prev.purchaseRequisitions.map((p) => p.requisitionNumber || p.prNumber || '')
        );

        const estimatedTotal = items.reduce((s, it) => s + it.quantity * it.estimatedCost, 0);

        const newPR: PurchaseRequisition = {
          id: `pr-${Date.now()}`,
          prNumber: prNumber,
          requisitionNumber: prNumber,
          requesterId: activeUser.id,
          requesterName: activeUser.name,
          department: 'Gudang & Logistik',
          warehouseCode: prev.warehouses[0].code,
          requestDate: new Date().toISOString().split('T')[0],
          requiredDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          status: 'pending_approval',
          totalEstimatedAmount: estimatedTotal,
          estimatedTotal,
          businessJustification: 'Automated Reorder Planning: Stok berada di bawah minimum reorder point',
          justification: 'Automated Reorder Planning: Stok berada di bawah minimum reorder point',
          lines: items.map((it, idx) => {
            const prod = prev.products.find((p) => p.id === it.productId);
            return {
              id: `prl-${Date.now()}-${idx}`,
              productId: it.productId,
              sku: prod?.sku || '',
              productName: prod?.name || '',
              quantity: it.quantity,
              unit: prod?.unit || 'PCS',
              estimatedUnitCost: it.estimatedCost,
              estimatedTotal: it.quantity * it.estimatedCost,
              subtotal: it.quantity * it.estimatedCost,
            };
          }),
          createdAt: new Date().toISOString(),
        };

        const req: ApprovalRequest = {
          id: `apr-${Date.now()}`,
          entityType: 'purchase_requisition',
          entityId: newPR.id,
          entityNumber: newPR.requisitionNumber,
          requestedBy: activeUser.name,
          roleRequired: 'Purchasing Manager',
          amount: newPR.estimatedTotal,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const log = logActivity('purchasing', 'created', newPR.id, newPR.requisitionNumber || newPR.prNumber || '', `PR ${prNumber} dibuat otomatis dari Reorder Planning`);

        return {
          ...prev,
          purchaseRequisitions: [newPR, ...prev.purchaseRequisitions],
          approvalRequests: [req, ...prev.approvalRequests],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Permintaan Pembelian (PR) otomatis berhasil dibuat untuk barang low-stock');
    },
    [activeUser, addToast]
  );

  // ── Manufacturing Workflows ─────────────────────────────────
  const saveBOM = useCallback((bom: BillOfMaterials) => {
    setStore((prev) => {
      const idx = prev.billsOfMaterials.findIndex((b) => b.id === bom.id);
      const updated = idx >= 0 ? prev.billsOfMaterials.map((b) => (b.id === bom.id ? bom : b)) : [bom, ...prev.billsOfMaterials];
      return { ...prev, billsOfMaterials: updated };
    });
  }, []);

  const createProductionOrder = useCallback(
    (bomId: string, quantityToProduce: number, targetWarehouseId: string, dueDate: string) => {
      setStore((prev) => {
        const bom = prev.billsOfMaterials.find((b) => b.id === bomId);
        if (!bom) return prev;

        const moNumber = generateDocNumber(
          'MO',
          prev.productionOrders.map((m) => m.orderNumber)
        );

        const fg = prev.products.find((p) => p.id === (bom.productId || bom.finishedProductId));
        const newMO: ProductionOrder = {
          id: `mo-${Date.now()}`,
          orderNumber: moNumber,
          bomId,
          bomCode: bom.bomCode || bom.bomNumber || '',
          productId: bom.productId || bom.finishedProductId || '',
          finishedProductId: bom.productId || bom.finishedProductId || '',
          finishedSku: fg?.sku || '',
          finishedProductName: fg?.name || '',
          plannedQty: quantityToProduce,
          quantityToProduce,
          completedQty: 0,
          quantityProduced: 0,
          unit: fg?.unit || 'PCS',
          sourceWarehouse: targetWarehouseId,
          destinationWarehouse: targetWarehouseId,
          targetWarehouseId,
          startDate: new Date().toISOString().split('T')[0],
          dueDate,
          status: 'planned',
          materialsIssued: false,
          fgReceived: false,
          notes: '',
          components: (bom.components || []).map((c, idx) => ({
            id: `moc-${Date.now()}-${idx}`,
            productId: c.productId || c.componentProductId || '',
            requiredQuantity: c.quantity * quantityToProduce,
            issuedQuantity: 0,
            unitCost: c.unitCost || c.estimatedCost || 0,
          })),
          createdAt: new Date().toISOString(),
        };

        const log = logActivity('manufacturing', 'created', newMO.id, newMO.orderNumber, `Perintah Produksi ${moNumber} dibuat untuk ${quantityToProduce} unit`);

        return {
          ...prev,
          productionOrders: [newMO, ...prev.productionOrders],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Perintah Produksi (MO) berhasil dibuat');
    },
    [addToast]
  );

  const issueMaterialsForMO = useCallback(
    (moId: string) => {
      setStore((prev) => {
        const mo = prev.productionOrders.find((m) => m.id === moId);
        if (!mo) return prev;

        const moComponents = mo.components || [];
        const whId = mo.targetWarehouseId || mo.sourceWarehouse || prev.warehouses[0].id;

        // Deduct raw material components from warehouse
        const newLedgerEntries = moComponents.map((c, idx) => {
          const product = prev.products.find((p) => p.id === c.productId);
          const currentStock = product ? product.onHandStock : 0;
          const newStock = Math.max(0, currentStock - c.requiredQuantity);

          return {
            id: `led-${Date.now()}-${idx}`,
            entryNumber: `LED-${Date.now().toString().slice(-6)}-${idx}`,
            date: new Date().toISOString(),
            productId: c.productId,
            warehouseId: whId,
            movementType: 'production_issue' as const,
            referenceType: 'manufacturing_order' as const,
            referenceNumber: mo.orderNumber,
            quantity: -c.requiredQuantity,
            balanceAfter: newStock,
            unitCost: c.unitCost,
            totalCost: c.requiredQuantity * c.unitCost,
            notes: `Konsumsi bahan baku untuk MO ${mo.orderNumber}`,
            createdAt: new Date().toISOString(),
          };
        });

        // Update product stock
        const updatedProducts = prev.products.map((p) => {
          const comp = moComponents.find((c) => c.productId === p.id);
          if (!comp) return p;

          const updatedOnHand = Math.max(0, p.onHandStock - comp.requiredQuantity);
          const updatedWarehouses = (p.warehouses || []).map((w) =>
            w.warehouseId === whId ? { ...w, onHandStock: Math.max(0, w.onHandStock - comp.requiredQuantity) } : w
          );

          return { ...p, onHandStock: updatedOnHand, warehouses: updatedWarehouses };
        });

        const updatedMOs = prev.productionOrders.map((m) =>
          m.id === moId
            ? {
                ...m,
                status: 'in_progress' as const,
                materialsIssued: true,
                components: (m.components || []).map((c) => ({ ...c, issuedQuantity: c.requiredQuantity })),
              }
            : m
        );

        const log = logActivity('manufacturing', 'issued', mo.id, mo.orderNumber, `Bahan baku untuk MO ${mo.orderNumber} telah dikeluarkan ke lantai produksi`);

        return {
          ...prev,
          products: updatedProducts,
          productionOrders: updatedMOs,
          inventoryLedger: [...newLedgerEntries, ...prev.inventoryLedger],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Bahan baku berhasil dikeluarkan ke produksi dan stok terpotong');
    },
    [addToast]
  );

  const completeProductionOrder = useCallback(
    (moId: string, quantityProduced: number, scrapQuantity: number = 0) => {
      setStore((prev) => {
        const mo = prev.productionOrders.find((m) => m.id === moId);
        if (!mo) return prev;

        const pId = mo.productId || mo.finishedProductId;
        const product = prev.products.find((p) => p.id === pId);
        const currentStock = product ? product.onHandStock : 0;
        const newStock = currentStock + quantityProduced;
        const unitCost = product ? product.unitCost : 0;
        const whId = mo.targetWarehouseId || mo.destinationWarehouse || prev.warehouses[0].id;

        // Inbound ledger for finished goods
        const fgLedger = {
          id: `led-${Date.now()}`,
          entryNumber: `LED-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          productId: pId || '',
          warehouseId: whId,
          movementType: 'production_receipt' as const,
          referenceType: 'manufacturing_order' as const,
          referenceNumber: mo.orderNumber,
          quantity: quantityProduced,
          balanceAfter: newStock,
          unitCost,
          totalCost: quantityProduced * unitCost,
          notes: `Penerimaan Barang Jadi dari Perintah Produksi ${mo.orderNumber}`,
          createdAt: new Date().toISOString(),
        };

        const updatedProducts = prev.products.map((p) => {
          if (p.id !== pId) return p;
          const updatedOnHand = p.onHandStock + quantityProduced;
          const updatedWarehouses = (p.warehouses || []).map((w) =>
            w.warehouseId === whId ? { ...w, onHandStock: w.onHandStock + quantityProduced } : w
          );
          return { ...p, onHandStock: updatedOnHand, warehouses: updatedWarehouses };
        });

        const updatedMOs = prev.productionOrders.map((m) =>
          m.id === moId
            ? {
                ...m,
                quantityProduced: (m.quantityProduced || 0) + quantityProduced,
                completedQty: (m.completedQty || 0) + quantityProduced,
                fgReceived: true,
                status: 'completed' as const,
                completionDate: new Date().toISOString().split('T')[0],
              }
            : m
        );

        const log = logActivity('manufacturing', 'completed', mo.id, mo.orderNumber, `Perintah Produksi ${mo.orderNumber} selesai. ${quantityProduced} unit barang jadi masuk ke gudang.`);

        return {
          ...prev,
          products: updatedProducts,
          productionOrders: updatedMOs,
          inventoryLedger: [fgLedger, ...prev.inventoryLedger],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Perintah produksi selesai dan stok barang jadi telah ditambahkan');
    },
    [addToast]
  );

  // ── Finance & Accounting Workflows ─────────────────────────
  const createJournalEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'totalDebit' | 'totalCredit'>) => {
      setStore((prev) => {
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const journal = createBalancedJournal(
          jeNumber,
          entry.referenceType,
          entry.referenceNumber,
          entry.description,
          entry.lines,
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('finance', 'posted', journal.id, journal.entryNumber, `Jurnal Umum ${journal.entryNumber} diposting: ${journal.description}`);

        return {
          ...prev,
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Entri Jurnal Umum berhasil diposting dan buku besar diperbarui');
    },
    [activeUser, addToast]
  );

  const saveExpense = useCallback(
    (expense: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>) => {
      setStore((prev) => {
        const expNumber = generateDocNumber(
          'EXP',
          prev.expenses.map((e) => e.expenseNumber)
        );

        const newExpense: Expense = {
          ...expense,
          id: `exp-${Date.now()}`,
          expenseNumber: expNumber,
          createdAt: new Date().toISOString(),
        };

        // Create Balanced Journal for the expense
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const expenseAccount = prev.accounts.find((a) => a.id === expense.expenseAccountId);
        const bankAccount = prev.bankAccounts.find((b) => b.id === expense.bankAccountId);

        const journal = createBalancedJournal(
          jeNumber,
          'Expense',
          newExpense.expenseNumber,
          `Pencatatan Beban Operasional ${newExpense.expenseNumber}: ${newExpense.description}`,
          [
            {
              accountCode: expenseAccount?.code || '61900',
              accountName: expenseAccount?.name || 'Beban Operasional Lainnya',
              debit: newExpense.amount,
              credit: 0,
              memo: newExpense.description,
            },
            {
              accountCode: bankAccount?.accountCode || '11120',
              accountName: bankAccount?.accountName || 'Bank BCA Operasional',
              debit: 0,
              credit: newExpense.amount,
              memo: `Pengeluaran via ${newExpense.paymentMethod}`,
            },
          ],
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('finance', 'posted', newExpense.id, newExpense.expenseNumber, `Beban ${newExpense.expenseNumber} sebesar Rp ${newExpense.amount.toLocaleString('id-ID')} dicatat`);

        return {
          ...prev,
          expenses: [newExpense, ...prev.expenses],
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Pengeluaran beban operasional berhasil dicatat & jurnal diposting');
    },
    [activeUser, addToast]
  );

  // ── People & HR Workflows ──────────────────────────────────
  const saveEmployee = useCallback((emp: Employee) => {
    setStore((prev) => {
      const idx = prev.employees.findIndex((e) => e.id === emp.id);
      const updated = idx >= 0 ? prev.employees.map((e) => (e.id === emp.id ? emp : e)) : [emp, ...prev.employees];
      return { ...prev, employees: updated };
    });
  }, []);

  const createLeaveRequest = useCallback(
    (req: Omit<LeaveRequest, 'id' | 'requestNumber' | 'createdAt'>) => {
      setStore((prev) => {
        const lrNumber = generateDocNumber(
          'LR',
          prev.leaveRequests.map((l) => l.requestNumber)
        );

        const newReq: LeaveRequest = {
          ...req,
          id: `lr-${Date.now()}`,
          requestNumber: lrNumber,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const aprReq: ApprovalRequest = {
          id: `apr-${Date.now()}`,
          entityType: 'leave_request',
          entityId: newReq.id,
          entityNumber: newReq.requestNumber,
          requestedBy: prev.employees.find((e) => e.id === req.employeeId)?.name || 'Karyawan',
          roleRequired: 'HR Manager',
          amount: req.daysCount,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const log = logActivity('hr', 'created', newReq.id, newReq.requestNumber, `Pengajuan cuti ${lrNumber} (${req.daysCount} hari) diajukan`);

        return {
          ...prev,
          leaveRequests: [newReq, ...prev.leaveRequests],
          approvalRequests: [aprReq, ...prev.approvalRequests],
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Pengajuan cuti berhasil dikirim untuk persetujuan HR');
    },
    [addToast]
  );

  const approveLeaveRequest = useCallback(
    (id: string) => {
      setStore((prev) => {
        const lr = prev.leaveRequests.find((l) => l.id === id);
        if (!lr) return prev;

        const updatedLRs = prev.leaveRequests.map((l) =>
          l.id === id ? { ...l, status: 'approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() } : l
        );

        const updatedApprovals = prev.approvalRequests.map((a) =>
          a.entityId === id ? { ...a, status: 'approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() } : a
        );

        const log = logActivity('hr', 'approved', lr.id, lr.requestNumber, `Pengajuan cuti ${lr.requestNumber} disetujui`);
        return { ...prev, leaveRequests: updatedLRs, approvalRequests: updatedApprovals, activityLogs: [log, ...prev.activityLogs] };
      });
      addToast('success', 'Pengajuan cuti disetujui');
    },
    [activeUser, addToast]
  );

  const rejectLeaveRequest = useCallback(
    (id: string) => {
      setStore((prev) => {
        const lr = prev.leaveRequests.find((l) => l.id === id);
        if (!lr) return prev;

        const updatedLRs = prev.leaveRequests.map((l) => (l.id === id ? { ...l, status: 'rejected' as const } : l));
        const updatedApprovals = prev.approvalRequests.map((a) =>
          a.entityId === id ? { ...a, status: 'rejected' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() } : a
        );

        const log = logActivity('hr', 'rejected', lr.id, lr.requestNumber, `Pengajuan cuti ${lr.requestNumber} ditolak`);
        return { ...prev, leaveRequests: updatedLRs, approvalRequests: updatedApprovals, activityLogs: [log, ...prev.activityLogs] };
      });
      addToast('warning', 'Pengajuan cuti ditolak');
    },
    [activeUser, addToast]
  );

  const processMonthlyPayroll = useCallback(
    (period: string) => {
      setStore((prev) => {
        const payNumber = generateDocNumber(
          'PAY',
          prev.payrollRuns.map((p) => p.runNumber)
        );

        const activeEmployees = prev.employees.filter((e) => e.status === 'active');
        const totalBaseSalary = activeEmployees.reduce((s, e) => s + (e.basicSalary ?? e.baseSalary ?? 0), 0);
        const totalAllowances = activeEmployees.reduce((s, e) => s + (e.allowances ?? e.allowance ?? 0), 0);
        const totalDeductions = Math.round((totalBaseSalary + totalAllowances) * 0.05); // 5% BPJS & PPh21
        const totalNetSalary = totalBaseSalary + totalAllowances - totalDeductions;

        const newPayroll: PayrollRun = {
          id: `pay-${Date.now()}`,
          runNumber: payNumber,
          period,
          payDate: new Date().toISOString().split('T')[0],
          status: 'paid',
          totalEmployees: activeEmployees.length,
          totalBaseSalary,
          totalAllowances,
          totalDeductions,
          totalNetSalary,
          processedBy: activeUser.name,
          createdAt: new Date().toISOString(),
        };

        // Automatic Balanced Journal:
        // Debit: 61100 Beban Gaji & Upah (totalBaseSalary + totalAllowances)
        // Credit: 21300 Hutang Gaji / Bank BCA Operasional (totalNetSalary)
        // Credit: 21400 Hutang PPh21 & BPJS (totalDeductions)
        const jeNumber = generateDocNumber(
          'JE',
          prev.journalEntries.map((j) => j.entryNumber)
        );

        const journal = createBalancedJournal(
          jeNumber,
          'Payroll',
          payNumber,
          `Penggajian Karyawan Periode ${period} (${activeEmployees.length} Pegawai)`,
          [
            {
              accountCode: '61100',
              accountName: 'Beban Gaji dan Upah',
              debit: totalBaseSalary + totalAllowances,
              credit: 0,
              memo: `Gaji Pokok & Tunjangan Periode ${period}`,
            },
            {
              accountCode: '11120',
              accountName: 'Bank BCA Operasional',
              debit: 0,
              credit: totalNetSalary,
              memo: `Transfer Pembayaran Gaji Bersih`,
            },
            {
              accountCode: '21300',
              accountName: 'Hutang Biaya & Gaji',
              debit: 0,
              credit: totalDeductions,
              memo: `Potongan BPJS & PPh21 Karyawan`,
            },
          ],
          activeUser.name
        );

        const updatedJournals = [journal, ...prev.journalEntries];
        const updatedAccounts = updateAccountBalances(prev.accounts, updatedJournals);

        const log = logActivity('hr', 'processed', newPayroll.id, newPayroll.runNumber, `Penggajian Periode ${period} diproses untuk ${activeEmployees.length} pegawai. Total Rp ${totalNetSalary.toLocaleString('id-ID')}`);

        return {
          ...prev,
          payrollRuns: [newPayroll, ...prev.payrollRuns],
          journalEntries: updatedJournals,
          accounts: updatedAccounts,
          activityLogs: [log, ...prev.activityLogs],
        };
      });

      addToast('success', 'Proses penggajian berhasil diselesaikan dan jurnal beban gaji otomatis diposting');
    },
    [activeUser, addToast]
  );

  const [currentModule, setERPModule] = useState<any>('catalog');
  const [catalogTab, setCatalogTab] = useState<any>('products');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [dashboardStockFilter, setDashboardStockFilter] = useState(false);

  const openProductDetail = useCallback((id: string) => setSelectedProductId(id), []);
  const closeProductDetail = useCallback(() => setSelectedProductId(null), []);
  const navigate = useCallback((page: any) => {
    if (page === 'catalog') setCurrentRoute('inventory/catalog');
    else if (page === 'dashboard') setCurrentRoute('work_center/my_work');
  }, []);
  const refreshData = useCallback(() => {}, []);

  const createProduct = useCallback((data: any) => saveProduct({ ...data, id: `prod-${Date.now()}` }), [saveProduct]);
  const updateProduct = useCallback((data: any) => saveProduct(data), [saveProduct]);

  const createCategory = useCallback((data: any) => saveCategory({ ...data, id: `cat-${Date.now()}` }), [saveCategory]);
  const updateCategory = useCallback((data: any) => saveCategory(data), [saveCategory]);
  const deleteCategory = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  }, []);

  const createSupplier = useCallback((data: any) => saveSupplier({ ...data, id: `sup-${Date.now()}` }), [saveSupplier]);
  const updateSupplier = useCallback((data: any) => saveSupplier(data), [saveSupplier]);
  const deleteSupplier = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, suppliers: prev.suppliers.filter((s) => s.id !== id) }));
  }, []);

  const createInboundReceipt = useCallback((data: any) => {}, []);
  const createOutboundDispatch = useCallback((data: any) => {}, []);
  const approveStockAdjustment = useCallback((id: string) => {}, []);

  return (
    <AppContext.Provider
      value={{
        store,
        currentRoute,
        activeUserId,
        activeUser,
        toasts,
        globalSearch,
        setRoute: setCurrentRoute,
        setActiveUserId,
        setGlobalSearch,
        addToast,
        dismissToast,
        resetDemoData,
        approveRequest,
        rejectRequest,
        markNotificationRead,
        saveCustomer,
        saveQuotation,
        convertQuotationToSO,
        saveSalesOrder,
        approveSalesOrder,
        createDeliveryOrder,
        confirmDelivery,
        createCustomerInvoice,
        recordCustomerPayment,
        saveSalesReturn,
        saveSupplier,
        savePurchaseRequisition,
        approvePR,
        convertPRToPO,
        savePurchaseOrder,
        approvePO,
        createGoodsReceipt,
        createSupplierInvoice,
        recordSupplierPayment,
        savePurchaseReturn,
        saveProduct,
        deleteProduct,
        saveCategory,
        saveWarehouse,
        createStockTransfer,
        createStockAdjustment,
        createStockCount,
        generateReorderPR,
        saveBOM,
        createProductionOrder,
        issueMaterialsForMO,
        completeProductionOrder,
        createJournalEntry,
        saveExpense,
        saveEmployee,
        createLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        processMonthlyPayroll,
        currentModule,
        setERPModule,
        navigate,
        catalogTab,
        setCatalogTab,
        selectedProductId,
        openProductDetail,
        closeProductDetail,
        dashboardStockFilter,
        setDashboardStockFilter,
        refreshData,
        createProduct,
        updateProduct,
        createCategory,
        updateCategory,
        deleteCategory,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        createInboundReceipt,
        createOutboundDispatch,
        approveStockAdjustment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
