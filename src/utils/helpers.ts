// ============================================================
// NEXORA ERP — Utility Functions
// ============================================================

import {
  Product,
  Category,
  Supplier,
  ProductWithRelations,
  CategoryWithCount,
  SupplierWithCount,
  StockStatus,
  DashboardKPIs,
  CategoryChartData,
  ActivityLog,
  ActivityAction,
} from '../types';

// ── Currency Formatting ────────────────────────────────────
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

// ── Stock Classification ──────────────────────────────────
export function classifyStock(onHandStock: number, reorderLevel: number): StockStatus {
  if (onHandStock === 0) return 'out_of_stock';
  if (onHandStock <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

export function stockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'in_stock': return 'In Stock';
    case 'low_stock': return 'Low Stock';
    case 'out_of_stock': return 'Out of Stock';
  }
}

// ── Margin Calculation ────────────────────────────────────
export function calcMargin(sellingPrice: number, unitCost: number): number {
  return sellingPrice - unitCost;
}

export function calcMarginPercentage(sellingPrice: number, unitCost: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - unitCost) / sellingPrice) * 100;
}

// ── Inventory Value ───────────────────────────────────────
export function calcInventoryValue(onHandStock: number, unitCost: number): number {
  return onHandStock * unitCost;
}

// ── Product Enrichment ────────────────────────────────────
export function enrichProduct(
  product: Product,
  categories: Category[],
  suppliers: Supplier[]
): ProductWithRelations {
  const category = categories.find((c) => c.id === product.categoryId);
  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const stockStatus = classifyStock(product.onHandStock, product.reorderLevel);
  const margin = calcMargin(product.sellingPrice, product.unitCost);
  const marginPercentage = calcMarginPercentage(product.sellingPrice, product.unitCost);
  const inventoryValue = calcInventoryValue(product.onHandStock, product.unitCost);

  return {
    ...product,
    categoryName: category?.name ?? '—',
    supplierName: supplier?.name ?? '—',
    stockStatus,
    availableStock: Math.max(0, product.onHandStock - (product.reservedStock || 0)),
    margin,
    marginPercentage,
    inventoryValue,
  };
}

export function enrichProducts(
  products: Product[],
  categories: Category[],
  suppliers: Supplier[]
): ProductWithRelations[] {
  return products.map((p) => enrichProduct(p, categories, suppliers));
}

// ── Category Enrichment ───────────────────────────────────
export function enrichCategories(
  categories: Category[],
  products: Product[]
): CategoryWithCount[] {
  return categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.categoryId === cat.id).length,
  }));
}

// ── Supplier Enrichment ───────────────────────────────────
export function enrichSuppliers(
  suppliers: Supplier[],
  products: Product[]
): SupplierWithCount[] {
  return suppliers.map((sup) => ({
    ...sup,
    productCount: products.filter((p) => p.supplierId === sup.id).length,
  }));
}

// ── Dashboard KPIs ────────────────────────────────────────
export function calcDashboardKPIs(
  products: Product[],
  categories: Category[]
): DashboardKPIs {
  const totalSKUs = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const inStockCount = products.filter((p) => classifyStock(p.onHandStock, p.reorderLevel) === 'in_stock').length;
  const lowStockCount = products.filter((p) => classifyStock(p.onHandStock, p.reorderLevel) === 'low_stock').length;
  const outOfStockCount = products.filter((p) => classifyStock(p.onHandStock, p.reorderLevel) === 'out_of_stock').length;
  const lowStockItems = lowStockCount + outOfStockCount;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + calcInventoryValue(p.onHandStock, p.unitCost),
    0
  );
  const totalCategories = categories.filter((c) => c.status === 'active').length;

  return {
    totalProducts: totalSKUs,
    totalCategories,
    totalSuppliers: 0,
    totalInventoryValue,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    activeProductsCount: activeProducts,
    averageMargin: 0,
    totalSKUs,
    activeProducts,
    lowStockItems,
  };
}

// ── Chart Data ────────────────────────────────────────────
export function calcCategoryChartData(
  products: Product[],
  categories: Category[]
): CategoryChartData[] {
  return categories
    .filter((c) => c.status === 'active')
    .map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      const inventoryValue = catProducts.reduce(
        (sum, p) => sum + calcInventoryValue(p.onHandStock, p.unitCost),
        0
      );
      return {
        name: cat.name,
        count: catProducts.length,
        value: inventoryValue,
        categoryId: cat.id,
        categoryName: cat.name,
        skuCount: catProducts.length,
        inventoryValue,
      };
    })
    .sort((a, b) => (b.skuCount || 0) - (a.skuCount || 0));
}

// ── Search & Filter ───────────────────────────────────────
export function filterProducts(
  products: ProductWithRelations[],
  opts: {
    search?: string;
    categoryId?: string;
    stockStatus?: string;
    productStatus?: string;
  }
): ProductWithRelations[] {
  let result = [...products];

  if (opts.search && opts.search.trim() !== '') {
    const q = opts.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
    );
  }

  if (opts.categoryId && opts.categoryId !== '') {
    result = result.filter((p) => p.categoryId === opts.categoryId);
  }

  if (opts.stockStatus && opts.stockStatus !== '') {
    result = result.filter((p) => p.stockStatus === opts.stockStatus);
  }

  if (opts.productStatus && opts.productStatus !== '') {
    result = result.filter((p) => p.status === opts.productStatus);
  }

  return result;
}

// ── Sorting ───────────────────────────────────────────────
type SortKey =
  | 'sku'
  | 'name'
  | 'categoryName'
  | 'supplierName'
  | 'unitCost'
  | 'sellingPrice'
  | 'onHandStock'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

export function sortProducts(
  products: ProductWithRelations[],
  sortBy: string,
  sortDir: 'asc' | 'desc'
): ProductWithRelations[] {
  const key = sortBy as SortKey;
  return [...products].sort((a, b) => {
    const aVal = a[key] ?? '';
    const bVal = b[key] ?? '';
    let cmp = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

// ── Pagination ────────────────────────────────────────────
export function paginateArray<T>(
  arr: T[],
  page: number,
  pageSize: number
): { data: T[]; totalPages: number; total: number } {
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const data = arr.slice(start, start + pageSize);
  return { data, totalPages, total };
}

// ── SKU Validation ────────────────────────────────────────
export function isSKUUnique(
  sku: string,
  products: Product[],
  excludeId?: string
): boolean {
  return !products.some(
    (p) =>
      p.sku.toLowerCase() === sku.toLowerCase() && p.id !== excludeId
  );
}

// ── CSV Export ────────────────────────────────────────────
function escapeCSV(val: string | number | undefined | null): string {
  const str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProductsToCSV(products: ProductWithRelations[]): void {
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'Supplier',
    'Unit',
    'Unit Cost (IDR)',
    'Selling Price (IDR)',
    'On-hand Stock',
    'Reorder Level',
    'Stock Status',
    'Product Status',
    'Warehouse',
    'Created At',
  ];

  const rows = products.map((p) => [
    p.sku,
    p.name,
    p.categoryName,
    p.supplierName,
    p.unit,
    p.unitCost,
    p.sellingPrice,
    p.onHandStock,
    p.reorderLevel,
    stockStatusLabel(p.stockStatus),
    p.status,
    p.warehouseLocation,
    new Date(p.createdAt).toLocaleDateString('id-ID'),
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexora-product-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportDashboardReport(
  kpis: DashboardKPIs,
  products: ProductWithRelations[],
  categories: Category[]
): void {
  const headers = ['Metric', 'Value'];
  const kpiRows = [
    ['Total SKUs', kpis.totalSKUs],
    ['Active Products', kpis.activeProducts],
    ['Low/Out-of-Stock Items', kpis.lowStockItems],
    ['Total Inventory Value (IDR)', kpis.totalInventoryValue],
    ['Active Categories', kpis.totalCategories],
  ];

  const divider = ['---', '---'];
  const catHeader = ['Category', 'SKU Count', 'Inventory Value (IDR)'];
  const catData = calcCategoryChartData(products, categories);
  const catRows = catData.map((c) => [c.categoryName, c.skuCount, c.inventoryValue]);

  const csvContent = [
    'NEXORA ERP — Dashboard Report',
    `Generated: ${new Date().toLocaleString('id-ID')}`,
    '',
    headers.join(','),
    ...kpiRows.map((r) => r.map(escapeCSV).join(',')),
    '',
    'Inventory by Category',
    catHeader.join(','),
    ...catRows.map((r) => r.map(escapeCSV).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexora-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Activity Log ──────────────────────────────────────────
export function activityLabel(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    product_created: 'Product Created',
    product_updated: 'Product Updated',
    product_deleted: 'Product Deleted',
    product_archived: 'Product Archived',
    price_revised: 'Price Revised',
    stock_updated: 'Stock Updated',
    category_created: 'Category Created',
    category_updated: 'Category Updated',
    category_deleted: 'Category Deleted',
    supplier_created: 'Supplier Created',
    supplier_updated: 'Supplier Updated',
    supplier_deleted: 'Supplier Deleted',
    movement_recorded: 'Stock Movement Logged',
    adjustment_created: 'Stock Opname Adjustment',
    inbound_received: 'Inbound PO Received',
    outbound_dispatched: 'Outbound DO Dispatched',
    data_reset: 'Demo Data Reset',
  };
  return map[action] ?? action;
}

export function createActivityLog(
  action: ActivityAction,
  entityType: string,
  entityId: string,
  entityName: string,
  summary: string
): ActivityLog {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    module: entityType,
    action,
    entityType,
    entityId,
    entityNumber: entityId,
    entityName,
    summary,
    description: summary,
    user: 'Demo User',
    role: 'General Manager',
    timestamp: new Date().toISOString(),
  };
}

export function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── ID Generator ──────────────────────────────────────────
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

