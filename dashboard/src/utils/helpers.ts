// ============================================================
// NEXORA Executive Dashboard — Helpers
// ============================================================

import { Product, Category, Supplier, EnrichedProduct, StockStatus } from '../types';

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

export function classifyStock(onHandStock: number, reorderLevel: number): StockStatus {
  if (onHandStock === 0) return 'out_of_stock';
  if (onHandStock <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

export function enrichProduct(
  p: Product,
  categories: Category[],
  suppliers: Supplier[]
): EnrichedProduct {
  const cat = categories.find((c) => c.id === p.categoryId);
  const sup = suppliers.find((s) => s.id === p.supplierId);
  return {
    ...p,
    categoryName: cat?.name || '—',
    supplierName: sup?.name || '—',
    stockStatus: classifyStock(p.onHandStock, p.reorderLevel),
    inventoryValue: p.onHandStock * p.unitCost,
  };
}

export function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

