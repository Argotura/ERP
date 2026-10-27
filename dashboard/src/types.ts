// ============================================================
// NEXORA Executive Dashboard — Type Definitions
// ============================================================

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  unit: string;
  unitCost: number;
  sellingPrice: number;
  minSellingPrice: number;
  onHandStock: number;
  reorderLevel: number;
  warehouseLocation: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface StockMovement {
  id: string;
  refNo: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  notes: string;
  date: string;
  performedBy: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  capacityPercentage: number;
  totalItemsCount: number;
  manager: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  summary: string;
  timestamp: string;
}

export interface DemoStore {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  stockMovements?: StockMovement[];
  warehouses?: Warehouse[];
  activityLogs: ActivityLog[];
  lastUpdated: string;
}

export interface EnrichedProduct extends Product {
  categoryName: string;
  supplierName: string;
  stockStatus: StockStatus;
  inventoryValue: number;
}

