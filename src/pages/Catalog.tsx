// ============================================================
// NEXORA ERP — Product Catalog Page
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Download,
  Search,
  Filter,
  X,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Package,
  Layers,
  Archive,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  enrichProducts,
  formatCurrency,
  formatNumber,
  exportProductsToCSV,
} from '../utils/helpers';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProductForm from '../components/catalog/ProductForm';
import ProductDetailDrawer from '../components/catalog/ProductDetailDrawer';
import CategoryView from '../components/catalog/CategoryView';
import SupplierView from '../components/catalog/SupplierView';
import { Product, ProductWithRelations, StockStatus, ProductStatus } from '../types';

export default function Catalog() {
  const {
    store,
    catalogTab,
    setCatalogTab,
    selectedProductId,
    openProductDetail,
    closeProductDetail,
    dashboardStockFilter,
    setDashboardStockFilter,
    globalSearch,
    setGlobalSearch,
    deleteProduct,
    updateProduct,
  } = useApp();

  // Filters & Sorting state
  const [search, setSearch] = useState(globalSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('');
  const [selectedProductStatus, setSelectedProductStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal / Drawer state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductWithRelations | null>(null);

  // Sync global search from topbar if changed
  useEffect(() => {
    if (globalSearch) {
      setSearch(globalSearch);
    }
  }, [globalSearch]);

  // Handle low stock filter from Dashboard KPI click
  useEffect(() => {
    if (dashboardStockFilter) {
      setSelectedStockStatus('low_or_out');
    }
  }, [dashboardStockFilter]);

  // Enrich all products with relational labels and calculated margins
  const allEnrichedProducts = useMemo(
    () => enrichProducts(store.products, store.categories, store.suppliers),
    [store.products, store.categories, store.suppliers]
  );

  // Summary counts
  const summaryCounts = useMemo(() => {
    const total = store.products.length;
    const active = store.products.filter((p) => p.status === 'active').length;
    const lowStock = allEnrichedProducts.filter(
      (p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock'
    ).length;
    const inactive = store.products.filter((p) => p.status !== 'active').length;
    return { total, active, lowStock, inactive };
  }, [store.products, allEnrichedProducts]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return allEnrichedProducts.filter((p) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory && p.categoryId !== selectedCategory) {
        return false;
      }

      // Stock status
      if (selectedStockStatus) {
        if (selectedStockStatus === 'low_or_out') {
          if (p.stockStatus !== 'low_stock' && p.stockStatus !== 'out_of_stock') {
            return false;
          }
        } else if (p.stockStatus !== selectedStockStatus) {
          return false;
        }
      }

      // Product status
      if (selectedProductStatus && p.status !== selectedProductStatus) {
        return false;
      }

      return true;
    });
  }, [allEnrichedProducts, search, selectedCategory, selectedStockStatus, selectedProductStatus]);

  // Sorting
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortBy) {
        case 'sku':
          valA = a.sku;
          valB = b.sku;
          break;
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'category':
          valA = a.categoryName.toLowerCase();
          valB = b.categoryName.toLowerCase();
          break;
        case 'supplier':
          valA = a.supplierName.toLowerCase();
          valB = b.supplierName.toLowerCase();
          break;
        case 'unitCost':
          valA = a.unitCost;
          valB = b.unitCost;
          break;
        case 'sellingPrice':
          valA = a.sellingPrice;
          valB = b.sellingPrice;
          break;
        case 'onHandStock':
          valA = a.onHandStock;
          valB = b.onHandStock;
          break;
        case 'reorderLevel':
          valA = a.reorderLevel;
          valB = b.reorderLevel;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        default:
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredProducts, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedStockStatus, selectedProductStatus, pageSize]);

  // Sort toggle handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown size={12} className="sort-icon" />;
    return sortDir === 'asc' ? (
      <ArrowUp size={12} className="sort-icon" />
    ) : (
      <ArrowDown size={12} className="sort-icon" />
    );
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id));

  // Bulk Archive
  const handleBulkArchive = () => {
    selectedIds.forEach((id) => {
      const p = store.products.find((prod) => prod.id === id);
      if (p) {
        updateProduct({ ...p, status: 'inactive' });
      }
    });
    setSelectedIds([]);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStockStatus('');
    setSelectedProductStatus('');
    setDashboardStockFilter(false);
    setGlobalSearch('');
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    Boolean(selectedStockStatus) ||
    Boolean(selectedProductStatus);

  // Product Form modals
  const handleOpenCreate = () => {
    setEditingProduct(undefined);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormMode('edit');
    setFormOpen(true);
  };

  // Delete product
  const handleDeleteClick = (product: ProductWithRelations) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      if (selectedProductId === productToDelete.id) {
        closeProductDetail();
      }
      setProductToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Product Catalog</h2>
          <p>Manage product master data, attributes, supplier sourcing, and stock levels</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => exportProductsToCSV(filteredProducts)}
            title="Export currently filtered list to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <div className="tab-list">
          <button
            className={`tab-item ${catalogTab === 'products' ? 'active' : ''}`}
            onClick={() => setCatalogTab('products')}
          >
            <Package size={15} />
            Products
            <span className="tab-count">{store.products.length}</span>
          </button>
          <button
            className={`tab-item ${catalogTab === 'categories' ? 'active' : ''}`}
            onClick={() => setCatalogTab('categories')}
          >
            <Layers size={15} />
            Categories
            <span className="tab-count">{store.categories.length}</span>
          </button>
          <button
            className={`tab-item ${catalogTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setCatalogTab('suppliers')}
          >
            <Archive size={15} />
            Suppliers
            <span className="tab-count">{store.suppliers.length}</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS */}
        {catalogTab === 'products' && (
          <div>
            {/* Catalog Summary Strip */}
            <div className="catalog-summary">
              <div className="summary-item">
                <span className="summary-count">{summaryCounts.total}</span>
                <span className="summary-label">Total SKUs</span>
              </div>
              <div className="summary-sep" />
              <div className="summary-item">
                <span className="summary-count" style={{ color: 'var(--success-text)' }}>
                  {summaryCounts.active}
                </span>
                <span className="summary-label">Active</span>
              </div>
              <div className="summary-sep" />
              <div className="summary-item">
                <span className="summary-count" style={{ color: 'var(--warning-text)' }}>
                  {summaryCounts.lowStock}
                </span>
                <span className="summary-label">Low / Out of Stock</span>
              </div>
              <div className="summary-sep" />
              <div className="summary-item">
                <span className="summary-count" style={{ color: 'var(--neutral-text)' }}>
                  {summaryCounts.inactive}
                </span>
                <span className="summary-label">Inactive</span>
              </div>

              {selectedIds.length > 0 && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                    {selectedIds.length} item(s) selected
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={handleBulkArchive}>
                    Deactivate Selected
                  </button>
                </div>
              )}
            </div>

            {/* Active low stock notice if filtered via Dashboard */}
            {selectedStockStatus === 'low_or_out' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  background: 'var(--warning-bg)',
                  borderBottom: '1px solid var(--warning-border)',
                  color: 'var(--warning-text)',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={15} />
                  <span>Showing items requiring stock attention (Low Stock & Out of Stock)</span>
                </div>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setSelectedStockStatus('');
                    setDashboardStockFilter(false);
                  }}
                >
                  Clear filter <X size={14} />
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="toolbar">
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search SKU, name, category, supplier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {store.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                className="filter-select"
                value={selectedStockStatus}
                onChange={(e) => {
                  setSelectedStockStatus(e.target.value);
                  if (e.target.value !== 'low_or_out') {
                    setDashboardStockFilter(false);
                  }
                }}
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_or_out">Attention Required</option>
              </select>

              {/* Product Status Filter */}
              <select
                className="filter-select"
                value={selectedProductStatus}
                onChange={(e) => setSelectedProductStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {hasActiveFilters && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleClearFilters}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={13} /> Clear filters
                </button>
              )}

              <div className="results-info">
                Showing {sortedProducts.length} result{sortedProducts.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all products"
                      />
                    </th>
                    <th className={`sortable ${sortBy === 'sku' ? 'sorted' : ''}`} onClick={() => handleSort('sku')}>
                      <div className="th-content">
                        <span>SKU</span>
                        {getSortIcon('sku')}
                      </div>
                    </th>
                    <th className={`sortable ${sortBy === 'name' ? 'sorted' : ''}`} onClick={() => handleSort('name')}>
                      <div className="th-content">
                        <span>Product</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th className={`sortable ${sortBy === 'category' ? 'sorted' : ''}`} onClick={() => handleSort('category')}>
                      <div className="th-content">
                        <span>Category</span>
                        {getSortIcon('category')}
                      </div>
                    </th>
                    <th>Supplier</th>
                    <th style={{ width: 60 }}>Unit</th>
                    <th className={`sortable ${sortBy === 'unitCost' ? 'sorted' : ''}`} style={{ textAlign: 'right' }} onClick={() => handleSort('unitCost')}>
                      <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                        <span>Unit Cost</span>
                        {getSortIcon('unitCost')}
                      </div>
                    </th>
                    <th className={`sortable ${sortBy === 'sellingPrice' ? 'sorted' : ''}`} style={{ textAlign: 'right' }} onClick={() => handleSort('sellingPrice')}>
                      <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                        <span>Selling Price</span>
                        {getSortIcon('sellingPrice')}
                      </div>
                    </th>
                    <th className={`sortable ${sortBy === 'onHandStock' ? 'sorted' : ''}`} style={{ textAlign: 'right' }} onClick={() => handleSort('onHandStock')}>
                      <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                        <span>On-hand</span>
                        {getSortIcon('onHandStock')}
                      </div>
                    </th>
                    <th style={{ textAlign: 'right', width: 80 }}>Reorder</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ textAlign: 'right', width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
                        <div className="empty-state" style={{ padding: 0 }}>
                          <PackageSearch className="empty-state-icon" />
                          <h3>No products match your filters</h3>
                          <p>Try resetting the search terms or clearing selected filter criteria.</p>
                          {hasActiveFilters && (
                            <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr key={p.id} style={{ background: isSelected ? 'var(--accent-light)' : undefined }}>
                          <td className="checkbox-cell">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(p.id)}
                              aria-label={`Select ${p.name}`}
                            />
                          </td>
                          <td className="td-sku">{p.sku}</td>
                          <td>
                            <div className="td-product-cell">
                              <span
                                className="td-product-name"
                                onClick={() => openProductDetail(p.id)}
                              >
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td>{p.categoryName}</td>
                          <td style={{ color: 'var(--text-secondary)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.supplierName}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{p.unit}</td>
                          <td className="td-number">{formatCurrency(p.unitCost)}</td>
                          <td className="td-number" style={{ fontWeight: 600 }}>{formatCurrency(p.sellingPrice)}</td>
                          <td
                            className="td-number"
                            style={{
                              fontWeight: 600,
                              color:
                                p.onHandStock === 0
                                  ? 'var(--danger)'
                                  : p.stockStatus === 'low_stock'
                                  ? 'var(--warning-text)'
                                  : undefined,
                            }}
                          >
                            {formatNumber(p.onHandStock)}
                          </td>
                          <td className="td-number" style={{ color: 'var(--text-muted)' }}>
                            {formatNumber(p.reorderLevel)}
                          </td>
                          <td>
                            <StatusBadge status={p.stockStatus} type="stock" />
                          </td>
                          <td className="td-actions">
                            <button
                              className="action-btn"
                              title="View details"
                              onClick={() => openProductDetail(p.id)}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="action-btn"
                              title="Edit product"
                              onClick={() => handleOpenEdit(p)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="action-btn danger"
                              title="Delete product"
                              onClick={() => handleDeleteClick(p)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Page Size */}
            {sortedProducts.length > 0 && (
              <div className="table-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="table-info">
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, sortedProducts.length)} of{' '}
                    {sortedProducts.length} items
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Rows per page:</span>
                    <select
                      className="form-select"
                      style={{ height: 28, padding: '0 24px 0 8px', fontSize: 12, width: 64 }}
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Compact pagination
                      return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                    })
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
                          )}
                          <button
                            className={`page-btn ${p === currentPage ? 'active' : ''}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    className="page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {catalogTab === 'categories' && (
          <div style={{ padding: 'var(--sp-4)' }}>
            <CategoryView />
          </div>
        )}

        {/* TAB 3: SUPPLIERS */}
        {catalogTab === 'suppliers' && (
          <div style={{ padding: 'var(--sp-4)' }}>
            <SupplierView />
          </div>
        )}
      </div>

      {/* Product Form Modal (Add / Edit) */}
      <ProductForm
        open={formOpen}
        mode={formMode}
        initialData={editingProduct}
        onClose={() => setFormOpen(false)}
      />

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        productId={selectedProductId}
        onClose={closeProductDetail}
        onEdit={(p) => {
          closeProductDetail();
          handleOpenEdit(p);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message={
          productToDelete ? (
            <div>
              Are you sure you want to delete <strong>{productToDelete.name}</strong> ({productToDelete.sku})?
              <br />
              <br />
              This will remove the product and update all inventory valuations, KPIs, and charts.
            </div>
          ) : (
            ''
          )
        }
        confirmLabel="Delete Product"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}

