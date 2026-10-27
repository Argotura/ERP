// ============================================================
// NEXORA ERP — Product Detail Drawer
// ============================================================

import React from 'react';
import { X, Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { enrichProduct, formatCurrency, formatNumber } from '../../utils/helpers';
import StatusBadge from '../ui/StatusBadge';
import { ProductWithRelations } from '../../types';

interface ProductDetailDrawerProps {
  productId: string | null;
  onClose: () => void;
  onEdit: (product: ProductWithRelations) => void;
}

export default function ProductDetailDrawer({
  productId,
  onClose,
  onEdit,
}: ProductDetailDrawerProps) {
  const { store } = useApp();

  if (!productId) return null;

  const rawProduct = store.products.find((p) => p.id === productId);
  if (!rawProduct) return null;

  const product = enrichProduct(rawProduct, store.categories, store.suppliers);

  const formattedMargin = formatCurrency(product.margin);
  const formattedMarginPercent = `${product.marginPercentage.toFixed(1)}%`;
  const isPositiveMargin = product.margin >= 0;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer" aria-label="Product Details">
        <div className="drawer-header">
          <div className="drawer-title">Product Details</div>
          <button className="modal-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Section 1: Overview */}
          <div className="detail-section">
            <div className="detail-section-title">Product Overview</div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Product Name</div>
                <div className="detail-value" style={{ fontWeight: 600 }}>
                  {product.name}
                </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">SKU</div>
                <div className="detail-value mono">{product.sku}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Product Status</div>
                <div className="detail-value">
                  <StatusBadge status={product.status} type="product" />
                </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Category</div>
                <div className="detail-value">{product.categoryName}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Supplier</div>
                <div className="detail-value">{product.supplierName}</div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Description</div>
                <div className="detail-value" style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                  {product.description || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="detail-section">
            <div className="detail-section-title">Pricing & Margins</div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Unit Cost</div>
                <div className="detail-value price">{formatCurrency(product.unitCost)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Selling Price</div>
                <div className="detail-value price">{formatCurrency(product.sellingPrice)}</div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Min Selling Price</div>
                <div className="detail-value price">{formatCurrency(product.minSellingPrice)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Nominal Margin</div>
                <div className={`detail-value price ${isPositiveMargin ? 'positive' : 'negative'}`}>
                  {formattedMargin}
                </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Profit Margin %</div>
                <div className={`detail-value price ${isPositiveMargin ? 'positive' : 'negative'}`}>
                  {formattedMarginPercent}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Total Inventory Value</div>
                <div className="detail-value price">{formatCurrency(product.inventoryValue)}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Inventory */}
          <div className="detail-section">
            <div className="detail-section-title">Inventory & Storage</div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">On-hand Stock</div>
                <div className="detail-value" style={{ fontWeight: 600, fontSize: 16 }}>
                  {formatNumber(product.onHandStock)} {product.unit}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Reorder Level</div>
                <div className="detail-value">
                  {formatNumber(product.reorderLevel)} {product.unit}
                </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Stock Status</div>
                <div className="detail-value">
                  <StatusBadge status={product.stockStatus} type="stock" />
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Warehouse Location</div>
                <div className="detail-value mono">{product.warehouseLocation}</div>
              </div>
            </div>
          </div>

          {/* Section 4: Metadata */}
          <div className="detail-section" style={{ marginBottom: 0 }}>
            <div className="detail-section-title">Record Metadata</div>

            <div className="detail-row">
              <div className="detail-field">
                <div className="detail-label">Created At</div>
                <div className="detail-value" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(product.createdAt).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(product.updatedAt).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => onEdit(product)}
          >
            <Edit3 size={14} />
            Edit Product
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </aside>
    </>
  );
}

