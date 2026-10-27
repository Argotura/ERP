// ============================================================
// ARGOTURO ERP — Comprehensive Enterprise Domain Model
// ============================================================

// ── Global & Common Types ──────────────────────────────────
export type DocumentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'completed'
  | 'cancelled'
  | 'void';

export type ProductStatus = 'active' | 'inactive' | 'archived';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type MovementType = 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'production_issue' | 'production_receipt';

// Backward-compatible UI Types
export type Category = ProductCategory;
export type CategoryStatus = 'active' | 'inactive';
export type SupplierStatus = 'active' | 'inactive';
export type Page = 'dashboard' | 'catalog' | 'operations';
export type CatalogTab = 'products' | 'categories' | 'suppliers' | 'operations';
export type ERPModule =
  | 'catalog'
  | 'categories'
  | 'suppliers'
  | 'price_lists'
  | 'stock_movements'
  | 'stock_adjustments'
  | 'warehouses'
  | 'inbound'
  | 'outbound'
  | 'audit_trail';

export interface CategoryWithCount extends ProductCategory {
  productCount: number;
}

export interface SupplierWithCount extends Supplier {
  productCount: number;
}

export interface CategoryChartData {
  name: string;
  count: number;
  value: number;
  categoryId?: string;
  categoryName?: string;
  skuCount?: number;
  inventoryValue?: number;
}

export interface DashboardKPIs {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalInventoryValue: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeProductsCount: number;
  averageMargin: number;
  totalSKUs?: number;
  activeProducts?: number;
  lowStockItems?: number;
}

export type ActivityAction = string;

export interface StockMovement {
  id: string;
  date: string;
  type: MovementType;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;
  sourceLocation?: string;
  targetLocation?: string;
  user: string;
  notes?: string;
  timestamp?: string;
}

export interface InboundReceipt {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  warehouseCode: string;
  status: string;
  items: any[];
  totalQuantity: number;
  receivedBy: string;
  notes?: string;
}

export interface OutboundDispatch {
  id: string;
  doNumber: string;
  customerId: string;
  customerName: string;
  dispatchDate: string;
  warehouseCode: string;
  status: string;
  items: any[];
  totalQuantity: number;
  carrier: string;
  trackingRef: string;
  dispatchedBy: string;
  notes?: string;
}

// ── Role Simulation ────────────────────────────────────────
export type DemoRole =
  | 'General Manager'
  | 'Sales Manager'
  | 'Sales Representative'
  | 'Purchasing Manager'
  | 'Procurement Staff'
  | 'Warehouse Supervisor'
  | 'Warehouse Operator'
  | 'Finance & Accounting Manager'
  | 'Finance Staff'
  | 'Production Manager'
  | 'HR Manager'
  | 'System Administrator';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  department: string;
  avatar: string;
}

// ── Company Settings ───────────────────────────────────────
export interface CompanySettings {
  companyName: string;
  tagline: string;
  taxId: string; // NPWP
  address: string;
  phone: string;
  email: string;
  defaultCurrency: string;
  fiscalYear: string;
  standardVatRate: number; // e.g. 11% PPN
  soApprovalThreshold: number; // e.g. Rp 50.000.000
  poApprovalThreshold: number; // e.g. Rp 25.000.000
}

// ── Master Data: Products & Inventory ──────────────────────
export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: 'active' | 'inactive';
}

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  zone: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'central' | 'regional' | 'transit' | 'quarantine';
  address: string;
  capacityPercentage: number;
  manager: string;
  status: 'active' | 'inactive';
  locations: WarehouseLocation[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  unit?: string;
  uom?: string;
  unitCost: number;
  sellingPrice: number;
  minSellingPrice?: number;
  onHandStock: number;
  reservedStock?: number;
  reorderLevel: number;
  safetyStock?: number;
  leadTimeDays?: number;
  targetStockLevel?: number;
  warehouseLocation?: string;
  warehouses?: { warehouseId: string; binLocation: string; onHandStock: number }[];
  barcode?: string;
  status: ProductStatus;
  isManufactured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithRelations extends Product {
  categoryName: string;
  supplierName: string;
  stockStatus: StockStatus;
  availableStock?: number;
  margin: number;
  marginPercentage: number;
  inventoryValue: number;
}

// ── Master Data: CRM & Sales ───────────────────────────────
export interface Lead {
  id: string;
  leadCode: string;
  name: string;
  companyName?: string;
  company?: string;
  email: string;
  phone: string;
  estimatedValue: number;
  assignedTo: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'converted' | 'lost';
  source: string;
  notes: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  customerType?: 'Corporate B2B' | 'Retail Client' | 'Government Agency' | 'Distributor';
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  billingAddress?: string;
  shippingAddress?: string;
  taxId: string; // NPWP
  paymentTerms: string; // e.g. Net 30
  creditLimit: number;
  currentReceivable: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DocumentLine {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName?: string;
  date?: string;
  quotationDate?: string;
  validUntil: string;
  lines: any[];
  subtotal: number;
  taxTotal?: number;
  taxAmount?: number;
  grandTotal: number;
  notes?: string;
  status: 'draft' | 'submitted' | 'accepted' | 'approved' | 'pending_approval' | 'rejected' | 'expired' | 'converted';
  salesRep?: string;
  salesperson?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
  convertedSalesOrderId?: string;
  createdAt: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerName?: string;
  orderDate: string;
  requestedDeliveryDate?: string;
  deliveryDate?: string;
  warehouseCode?: string;
  warehouseId?: string;
  lines: any[];
  subtotal: number;
  taxTotal?: number;
  taxAmount?: number;
  grandTotal: number;
  notes?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  salesperson?: string;
  salesRep?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface DeliveryOrder {
  id: string;
  deliveryNumber: string;
  salesOrderId: string;
  salesOrderNumber?: string;
  customerId?: string;
  customerName?: string;
  warehouseCode?: string;
  warehouseId?: string;
  date?: string;
  deliveryDate?: string;
  carrier?: string;
  trackingRef?: string;
  trackingNumber?: string;
  lines: any[];
  status: 'draft' | 'dispatched' | 'delivered' | 'completed' | 'cancelled';
  dispatchedBy?: string;
  deliveredAt?: string;
  shippedAt?: string;
  createdAt: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId: string;
  salesOrderNumber?: string;
  deliveryOrderId?: string;
  customerId: string;
  customerName?: string;
  invoiceDate: string;
  dueDate: string;
  lines: any[];
  subtotal: number;
  taxTotal?: number;
  taxAmount?: number;
  grandTotal: number;
  paidAmount: number;
  outstandingBalance?: number;
  remainingAmount?: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'overdue' | 'void' | 'unpaid';
  journalEntryId?: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName?: string;
  invoiceId: string;
  invoiceNumber?: string;
  paymentDate: string;
  paymentMethod: 'Bank Transfer (BCA)' | 'Bank Transfer (Mandiri)' | 'Cash' | 'Corporate Cheque';
  bankAccountId: string;
  referenceNumber: string;
  amount: number;
  notes?: string;
  status?: string;
  journalEntryId?: string;
  createdAt: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  deliveryOrderId?: string;
  deliveryOrderNumber?: string;
  invoiceId?: string;
  customerId?: string;
  customerName?: string;
  returnDate: string;
  warehouseCode?: string;
  reason?: string;
  totalAmount?: number;
  lines: {
    productId: string;
    sku?: string;
    productName?: string;
    quantity: number;
    reason: string;
    restocked?: boolean;
  }[];
  status: 'completed' | 'pending_inspection';
  notes: string;
  createdAt: string;
}

// ── Master Data: Procurement ───────────────────────────────
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string; // Net 30, Net 60, COD
  leadTimeDays: number;
  currentPayable: number;
  rating?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  requisitionNumber?: string;
  requesterId?: string;
  requesterName: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  warehouseCode: string;
  lines: any[];
  totalEstimatedAmount: number;
  estimatedTotal?: number;
  businessJustification?: string;
  justification?: string;
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'converted';
  approvedBy?: string;
  approvedAt?: string;
  purchaseOrderId?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderNumber?: string;
  requisitionId?: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedArrival: string;
  expectedDeliveryDate?: string;
  buyer?: string;
  paymentTerms?: string;
  warehouseId?: string;
  warehouseCode: string;
  lines: any[];
  subtotal: number;
  taxTotal: number;
  taxAmount?: number;
  grandTotal: number;
  notes?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'partially_received' | 'received' | 'closed' | 'cancelled';
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  receiptNumber?: string;
  purchaseOrderId: string;
  purchaseOrderNumber?: string;
  supplierId?: string;
  supplierName?: string;
  warehouseCode?: string;
  warehouseId?: string;
  receiptDate: string;
  deliveryNoteRef?: string;
  lines: any[];
  status: any;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface SupplierInvoice {
  id: string;
  billNumber?: string; // e.g. BILL-2026-00001
  invoiceNumber?: string;
  supplierBillRef?: string; // Vendor's tax invoice number
  supplierInvoiceNumber?: string;
  purchaseOrderId: string;
  purchaseOrderNumber?: string;
  goodsReceiptId?: string;
  supplierId: string;
  supplierName?: string;
  invoiceDate: string;
  dueDate: string;
  lines: any[];
  subtotal: number;
  taxTotal?: number;
  taxAmount?: number;
  grandTotal: number;
  paidAmount: number;
  outstandingBalance?: number;
  remainingAmount?: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'overdue' | 'unpaid';
  journalEntryId?: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  billId?: string;
  billNumber?: string;
  supplierInvoiceId?: string;
  paymentDate: string;
  paymentMethod: 'Bank Transfer (BCA)' | 'Bank Transfer (Mandiri)' | 'Corporate Cheque' | 'Cash';
  bankAccountId: string;
  referenceNumber: string;
  amount: number;
  notes?: string;
  status?: string;
  journalEntryId?: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  goodsReceiptId: string;
  goodsReceiptNumber: string;
  supplierId: string;
  supplierName: string;
  returnDate: string;
  warehouseCode: string;
  lines: {
    productId: string;
    sku: string;
    productName: string;
    quantity: number;
    reason: string;
  }[];
  status: 'completed' | 'pending';
  notes: string;
  createdAt: string;
}

// ── Inventory Ledger & Operations ──────────────────────────
export interface InventoryLedgerEntry {
  id: string;
  transactionNumber?: string;
  entryNumber?: string;
  date: string;
  sourceDocType?: string;
  movementType?: string;
  referenceType?: string;
  sourceDocNumber?: string;
  referenceNumber?: string;
  productId: string;
  sku?: string;
  productName?: string;
  warehouseCode?: string;
  warehouseId?: string;
  quantity?: number;
  quantityIn?: number;
  quantityOut?: number;
  unitCost: number;
  totalCost?: number;
  balanceAfter: number;
  notes: string;
  user?: string;
  createdAt?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  date: string;
  transferDate?: string;
  requestedBy: string;
  lines: any[];
  status: 'draft' | 'approved' | 'in_transit' | 'received' | 'completed';
  notes: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  refNo?: string;
  warehouseCode?: string;
  warehouseId?: string;
  sku?: string;
  productName?: string;
  warehouseLocation?: string;
  date?: string;
  adjustmentDate?: string;
  reasonCode?: any;
  reason?: string;
  justification?: string;
  requestedBy?: string;
  adjustedBy?: string;
  auditor?: string;
  variance?: number;
  status: any;
  approvedBy?: string;
  lines: any[];
  createdAt: string;
}

export interface StockCount {
  id: string;
  countNumber: string;
  warehouseCode?: string;
  warehouseId?: string;
  countDate: string;
  status: 'in_progress' | 'completed' | 'reconciled';
  auditor?: string;
  counterName?: string;
  lines: any[];
  createdAt: string;
}

// ── Manufacturing ──────────────────────────────────────────
export interface BillOfMaterialsLine {
  id: string;
  componentProductId?: string;
  productId?: string;
  componentSku?: string;
  sku?: string;
  componentName?: string;
  productName?: string;
  quantity: number;
  unit?: string;
  scrapAllowancePercent?: number;
  estimatedCost?: number;
  unitCost?: number;
}

export interface BillOfMaterials {
  id: string;
  bomCode: string;
  bomNumber?: string;
  name?: string;
  finishedProductId?: string;
  productId?: string;
  finishedSku?: string;
  finishedProductName?: string;
  version?: string;
  outputQuantity?: number;
  outputUnit?: string;
  laborCost?: number;
  overheadCost?: number;
  components: BillOfMaterialsLine[];
  routingInstructions?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string; // MO-2026-00001
  finishedProductId?: string;
  productId?: string;
  finishedSku?: string;
  finishedProductName?: string;
  bomId?: string;
  bomCode?: string;
  plannedQty?: number;
  quantityToProduce?: number;
  completedQty?: number;
  quantityProduced?: number;
  unit?: string;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  targetWarehouseId?: string;
  status: 'draft' | 'planned' | 'released' | 'in_progress' | 'completed' | 'cancelled';
  materialsIssued?: boolean;
  fgReceived?: boolean;
  components?: any[];
  notes?: string;
  createdAt: string;
}

export interface MaterialConsumptionRecord {
  id: string;
  productionOrderId: string;
  productionOrderNumber: string;
  date: string;
  warehouseCode: string;
  lines: {
    productId: string;
    sku: string;
    productName: string;
    quantityIssued: number;
    unit: string;
    unitCost: number;
  }[];
  issuedBy: string;
}

export interface FinishedGoodsReceiptRecord {
  id: string;
  productionOrderId: string;
  productionOrderNumber: string;
  date: string;
  warehouseCode: string;
  productId: string;
  sku: string;
  productName: string;
  quantityReceived: number;
  unit: string;
  totalCost: number;
  receivedBy: string;
}

// ── Finance & Accounting ───────────────────────────────────
export type AccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'COGS' | 'Operating Expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  type?: string;
  normalBalance: 'debit' | 'credit';
  currentBalance: number;
  isSystem: boolean; // cannot be deleted
  description: string;
}

export interface JournalEntryLine {
  id?: string;
  accountId?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // JE-2026-00001
  date: string;
  referenceType: 'CustomerInvoice' | 'CustomerPayment' | 'GoodsReceipt' | 'SupplierInvoice' | 'SupplierPayment' | 'Expense' | 'Manufacturing' | 'Payroll' | 'Manual';
  referenceNumber: string;
  description: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'void';
  postedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: any;
  description: string;
  amount: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentMethod: any;
  paidFromAccountId?: string;
  expenseAccountId: string;
  bankAccountId?: string;
  submittedBy?: string;
  status: 'draft' | 'approved' | 'rejected' | 'posted';
  receiptRef?: string;
  journalEntryId?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountName?: string;
  accountCode?: string;
  bankName: string;
  accountHolder: string;
  currentBalance: number;
  balance?: number;
  currency: string;
  generalLedgerAccountId: string;
}

// ── People & HR ────────────────────────────────────────────
export interface Department {
  id: string;
  code: string;
  name: string;
  managerName: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  employeeNumber: string; // EMP-001
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  position: string;
  jobTitle?: string;
  joinDate: string;
  employmentStatus: 'Permanent' | 'Contract' | 'Probation';
  baseSalary: number;
  basicSalary?: number;
  allowance: number;
  allowances?: number;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  clockIn?: string;
  clockOut?: string;
  overtimeHours?: number;
  status: any;
  notes: string;
}

export interface LeaveRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName?: string;
  departmentName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  daysCount?: number;
  reason: string;
  status: 'pending' | 'pending_approval' | 'approved' | 'rejected';
  approverName?: string;
  approvedBy?: string;
  approvedAt?: string;
  decisionDate?: string;
  decisionNotes?: string;
  createdAt: string;
}

export interface PayrollItem {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  baseSalary: number;
  allowance: number;
  deduction: number;
  netSalary: number;
}

export interface PayrollRun {
  id: string;
  runNumber: string; // PAY-2026-10
  periodMonth?: string; // e.g. "October 2026"
  period?: string;
  periodYear?: number;
  totalGross?: number;
  totalBaseSalary?: number;
  totalAllowances?: number;
  totalDeductions: number;
  totalNet?: number;
  totalNetSalary?: number;
  totalEmployees?: number;
  employeeCount?: number;
  items?: PayrollItem[];
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: string;
  processedBy?: string;
  paidDate?: string;
  payDate?: string;
  journalEntryId?: string;
  createdAt: string;
}

// ── Approvals & Cross-Cutting ──────────────────────────────
export type ApprovalType = 'sales_order' | 'purchase_requisition' | 'purchase_order' | 'stock_adjustment' | 'leave_request' | 'expense' | 'payroll';

export interface ApprovalRequest {
  id: string;
  type?: ApprovalType;
  entityType?: ApprovalType;
  documentId?: string;
  entityId?: string;
  documentNumber?: string;
  entityNumber?: string;
  title?: string;
  summary?: string;
  amount?: number;
  requesterName?: string;
  requestedBy?: string;
  requesterRole?: string;
  targetRole?: DemoRole;
  roleRequired?: string;
  submittedAt?: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  decisionBy?: string;
  approvedBy?: string;
  decisionAt?: string;
  approvedAt?: string;
  comments?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  module: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityNumber?: string;
  entityName?: string;
  summary?: string;
  description: string;
  user: string;
  role: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  targetRole?: DemoRole;
  linkRoute?: string;
  isRead: boolean;
  createdAt: string;
}

// ── Navigation & ERP Routing ───────────────────────────────
export type ERPRoute =
  // Work Center
  | 'work_center/my_work'
  | 'work_center/approvals'
  | 'work_center/notifications'
  | 'work_center/activities'
  // CRM & Sales
  | 'sales/leads'
  | 'sales/customers'
  | 'sales/quotations'
  | 'sales/orders'
  | 'sales/deliveries'
  | 'sales/invoices'
  | 'sales/payments'
  | 'sales/returns'
  // Procurement
  | 'procurement/requisitions'
  | 'procurement/suppliers'
  | 'procurement/orders'
  | 'procurement/receipts'
  | 'procurement/invoices'
  | 'procurement/payments'
  | 'procurement/returns'
  // Inventory
  | 'inventory/catalog'
  | 'inventory/categories'
  | 'inventory/uom'
  | 'inventory/overview'
  | 'inventory/ledger'
  | 'inventory/warehouses'
  | 'inventory/transfers'
  | 'inventory/adjustments'
  | 'inventory/counts'
  | 'inventory/reorder'
  // Manufacturing
  | 'manufacturing/bom'
  | 'manufacturing/planning'
  | 'manufacturing/orders'
  | 'manufacturing/consumption'
  | 'manufacturing/receipts'
  | 'manufacturing/history'
  // Finance & Accounting
  | 'finance/coa'
  | 'finance/journals'
  | 'finance/ledger'
  | 'finance/trial_balance'
  | 'finance/ar'
  | 'finance/ap'
  | 'finance/cash_bank'
  | 'finance/expenses'
  | 'finance/tax'
  | 'finance/reports'
  // People & HR
  | 'hr/employees'
  | 'hr/departments'
  | 'hr/attendance'
  | 'hr/leaves'
  | 'hr/payroll'
  // Reports & Audit
  | 'reports/sales'
  | 'reports/purchasing'
  | 'reports/inventory_valuation'
  | 'reports/stock_movement'
  | 'reports/production'
  | 'reports/employee'
  | 'reports/audit_trail'
  // Administration
  | 'admin/users'
  | 'admin/roles'
  | 'admin/settings'
  | 'admin/numbering'
  | 'admin/mappings'
  | 'admin/demo_data';

// ── Complete Store Schema ──────────────────────────────────
export interface ERPStoreState {
  version: string;
  lastUpdated: string;
  companySettings: CompanySettings;
  users: DemoUser[];
  activeUserId: string;

  // Master Data
  categories: ProductCategory[];
  uomList: UnitOfMeasure[];
  warehouses: Warehouse[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  departments: Department[];
  employees: Employee[];
  accounts: Account[];
  bankAccounts: BankAccount[];

  // Sales
  leads: Lead[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
  customerInvoices: CustomerInvoice[];
  customerPayments: CustomerPayment[];
  salesReturns: SalesReturn[];

  // Procurement
  purchaseRequisitions: PurchaseRequisition[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  supplierInvoices: SupplierInvoice[];
  supplierPayments: SupplierPayment[];
  purchaseReturns: PurchaseReturn[];

  // Inventory & Warehouse
  inventoryLedger: InventoryLedgerEntry[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  stockCounts: StockCount[];
  priceLists?: any[];
  inboundReceipts?: any[];
  outboundDispatches?: any[];

  // Manufacturing
  billsOfMaterials: BillOfMaterials[];
  productionOrders: ProductionOrder[];
  materialConsumptions: MaterialConsumptionRecord[];
  finishedGoodsReceipts: FinishedGoodsReceiptRecord[];

  // Finance
  journalEntries: JournalEntry[];
  expenses: Expense[];

  // HR
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payrollRuns: PayrollRun[];

  // Cross-cutting
  approvalRequests: ApprovalRequest[];
  activityLogs: ActivityLog[];
  notifications: SystemNotification[];
}
