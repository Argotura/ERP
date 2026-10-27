// ============================================================
// NEXORA ERP — Product Form Modal (Create / Edit)
// ============================================================

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSKUUnique, generateId } from '../../utils/helpers';
import { Product, ProductStatus } from '../../types';

interface ProductFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Product;
  onClose: () => void;
}

type UnitOption = 'Unit' | 'Pcs' | 'Box' | 'Set' | 'Pack' | 'Ream' | 'Pair' | 'Pail';
type WarehouseOption = 'WH-A1' | 'WH-A2' | 'WH-B1' | 'WH-B2' | 'WH-C1' | 'WH-C2' | 'WH-D1';

const UNIT_OPTIONS: UnitOption[] = ['Unit', 'Pcs', 'Box', 'Set', 'Pack', 'Ream', 'Pair', 'Pail'];
const WAREHOUSE_OPTIONS: WarehouseOption[] = [
  'WH-A1', 'WH-A2', 'WH-B1', 'WH-B2', 'WH-C1', 'WH-C2', 'WH-D1',
];

interface FormData {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  supplierId: string;
  unit: string;
  status: ProductStatus;
  unitCost: string;
  sellingPrice: string;
  minSellingPrice: string;
  onHandStock: string;
  reorderLevel: string;
  warehouseLocation: string;
}

interface FormErrors {
  name?: string;
  sku?: string;
  categoryId?: string;
  supplierId?: string;
  unit?: string;
  unitCost?: string;
  sellingPrice?: string;
  minSellingPrice?: string;
  onHandStock?: string;
  reorderLevel?: string;
}

function buildInitialFormData(initialData?: Product): FormData {
  if (initialData) {
    return {
      name: initialData.name,
      sku: initialData.sku,
      description: initialData.description,
      categoryId: initialData.categoryId,
      supplierId: initialData.supplierId,
      unit: initialData.unit,
      status: initialData.status as ProductStatus,
      unitCost: String(initialData.unitCost),
      sellingPrice: String(initialData.sellingPrice),
      minSellingPrice: String(initialData.minSellingPrice),
      onHandStock: String(initialData.onHandStock),
      reorderLevel: String(initialData.reorderLevel),
      warehouseLocation: initialData.warehouseLocation,
    };
  }
  return {
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    supplierId: '',
    unit: '',
    status: 'active',
    unitCost: '',
    sellingPrice: '',
    minSellingPrice: '',
    onHandStock: '',
    reorderLevel: '',
    warehouseLocation: '',
  };
}

export default function ProductForm({ open, mode, initialData, onClose }: ProductFormProps) {
  const { store, createProduct, updateProduct } = useApp();
  const [form, setForm] = useState<FormData>(() => buildInitialFormData(initialData));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      setForm(buildInitialFormData(initialData));
      setErrors({});
      setSubmitting(false);
    }
  }, [open, initialData]);

  if (!open) return null;

  const activeCategories = store.categories.filter((c) => c.status === 'active');
  const activeSuppliers = store.suppliers.filter((s) => s.status === 'active');

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (!form.sku.trim()) {
      newErrors.sku = 'SKU is required.';
    } else if (
      !isSKUUnique(
        form.sku.trim(),
        store.products,
        mode === 'edit' ? initialData?.id : undefined
      )
    ) {
      newErrors.sku = 'This SKU is already in use. Please enter a unique SKU.';
    }

    if (!form.categoryId) {
      newErrors.categoryId = 'Category is required.';
    }

    if (!form.supplierId) {
      newErrors.supplierId = 'Supplier is required.';
    }

    if (!form.unit) {
      newErrors.unit = 'Unit of measurement is required.';
    }

    const unitCostNum = parseFloat(form.unitCost);
    if (form.unitCost === '' || isNaN(unitCostNum) || unitCostNum < 0) {
      newErrors.unitCost = 'Unit cost must be a number ≥ 0.';
    }

    const sellingPriceNum = parseFloat(form.sellingPrice);
    if (form.sellingPrice === '' || isNaN(sellingPriceNum) || sellingPriceNum < 0) {
      newErrors.sellingPrice = 'Selling price must be a number ≥ 0.';
    }

    if (form.minSellingPrice !== '') {
      const minPrice = parseFloat(form.minSellingPrice);
      if (isNaN(minPrice) || minPrice < 0) {
        newErrors.minSellingPrice = 'Minimum selling price must be a number ≥ 0.';
      }
    }

    const onHandStockNum = parseInt(form.onHandStock, 10);
    if (
      form.onHandStock === '' ||
      isNaN(onHandStockNum) ||
      onHandStockNum < 0 ||
      !Number.isInteger(onHandStockNum)
    ) {
      newErrors.onHandStock = 'Opening stock must be a whole number ≥ 0.';
    }

    const reorderLevelNum = parseInt(form.reorderLevel, 10);
    if (
      form.reorderLevel === '' ||
      isNaN(reorderLevelNum) ||
      reorderLevelNum < 0 ||
      !Number.isInteger(reorderLevelNum)
    ) {
      newErrors.reorderLevel = 'Reorder level must be a whole number ≥ 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const productData = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      supplierId: form.supplierId,
      unit: form.unit,
      status: form.status,
      unitCost: parseFloat(form.unitCost),
      sellingPrice: parseFloat(form.sellingPrice),
      minSellingPrice: form.minSellingPrice !== '' ? parseFloat(form.minSellingPrice) : 0,
      onHandStock: parseInt(form.onHandStock, 10),
      reorderLevel: parseInt(form.reorderLevel, 10),
      warehouseLocation: form.warehouseLocation,
    };

    if (mode === 'create') {
      createProduct(productData);
    } else if (initialData) {
      updateProduct({ ...productData, id: initialData.id, createdAt: initialData.createdAt, updatedAt: initialData.updatedAt });
    }

    setSubmitting(false);
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onClick={handleOverlayClick}>
      <div className="modal modal-lg">
        {/* Header */}
        <div className="modal-header">
          <h2 id="product-form-title" className="modal-title">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* ── Section 1: General Information ── */}
            <div className="form-section">
              <h3 className="form-section-title">General Information</h3>
              <div className="form-grid">

                {/* Product Name */}
                <div className="form-group">
                  <label htmlFor="pf-name" className="form-label">
                    Product Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="pf-name"
                    type="text"
                    className={`form-input${errors.name ? ' input-error' : ''}`}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Office Chair Pro"
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* SKU */}
                <div className="form-group">
                  <label htmlFor="pf-sku" className="form-label">
                    SKU <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="pf-sku"
                    type="text"
                    className={`form-input${errors.sku ? ' input-error' : ''}`}
                    value={form.sku}
                    onChange={(e) => setField('sku', e.target.value)}
                    placeholder="e.g. OFC-CHR-001"
                  />
                  {errors.sku ? (
                    <span className="form-error">{errors.sku}</span>
                  ) : (
                    <span className="form-hint">Must be unique across all products.</span>
                  )}
                </div>

                {/* Description */}
                <div className="form-group form-group-full">
                  <label htmlFor="pf-desc" className="form-label">Description</label>
                  <textarea
                    id="pf-desc"
                    className="form-textarea"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Optional product description..."
                    rows={3}
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label htmlFor="pf-category" className="form-label">
                    Category <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="pf-category"
                    className={`form-select${errors.categoryId ? ' input-error' : ''}`}
                    value={form.categoryId}
                    onChange={(e) => setField('categoryId', e.target.value)}
                  >
                    <option value="">— Select Category —</option>
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
                </div>

                {/* Supplier */}
                <div className="form-group">
                  <label htmlFor="pf-supplier" className="form-label">
                    Supplier <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="pf-supplier"
                    className={`form-select${errors.supplierId ? ' input-error' : ''}`}
                    value={form.supplierId}
                    onChange={(e) => setField('supplierId', e.target.value)}
                  >
                    <option value="">— Select Supplier —</option>
                    {activeSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.supplierId && <span className="form-error">{errors.supplierId}</span>}
                </div>

                {/* Unit of Measurement */}
                <div className="form-group">
                  <label htmlFor="pf-unit" className="form-label">
                    Unit of Measurement <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="pf-unit"
                    className={`form-select${errors.unit ? ' input-error' : ''}`}
                    value={form.unit}
                    onChange={(e) => setField('unit', e.target.value)}
                  >
                    <option value="">— Select Unit —</option>
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {errors.unit && <span className="form-error">{errors.unit}</span>}
                </div>

                {/* Product Status */}
                <div className="form-group">
                  <label htmlFor="pf-status" className="form-label">Product Status</label>
                  <select
                    id="pf-status"
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value as ProductStatus)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

              </div>
            </div>

            {/* ── Section 2: Pricing ── */}
            <div className="form-section">
              <h3 className="form-section-title">Pricing</h3>
              <div className="form-grid">

                {/* Unit Cost */}
                <div className="form-group">
                  <label htmlFor="pf-unit-cost" className="form-label">
                    Unit Cost (IDR) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="pf-unit-cost"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input${errors.unitCost ? ' input-error' : ''}`}
                    value={form.unitCost}
                    onChange={(e) => setField('unitCost', e.target.value)}
                    placeholder="0"
                  />
                  {errors.unitCost && <span className="form-error">{errors.unitCost}</span>}
                </div>

                {/* Selling Price */}
                <div className="form-group">
                  <label htmlFor="pf-selling-price" className="form-label">
                    Selling Price (IDR) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="pf-selling-price"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input${errors.sellingPrice ? ' input-error' : ''}`}
                    value={form.sellingPrice}
                    onChange={(e) => setField('sellingPrice', e.target.value)}
                    placeholder="0"
                  />
                  {errors.sellingPrice && <span className="form-error">{errors.sellingPrice}</span>}
                </div>

                {/* Minimum Selling Price */}
                <div className="form-group">
                  <label htmlFor="pf-min-price" className="form-label">Minimum Selling Price (IDR)</label>
                  <input
                    id="pf-min-price"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input${errors.minSellingPrice ? ' input-error' : ''}`}
                    value={form.minSellingPrice}
                    onChange={(e) => setField('minSellingPrice', e.target.value)}
                    placeholder="0"
                  />
                  {errors.minSellingPrice ? (
                    <span className="form-error">{errors.minSellingPrice}</span>
                  ) : (
                    <span className="form-hint">Optional. Leave blank to default to 0.</span>
                  )}
                </div>

              </div>
            </div>

            {/* ── Section 3: Inventory ── */}
            <div className="form-section">
              <h3 className="form-section-title">Inventory</h3>
              <div className="form-grid">

                {/* Opening Stock */}
                <div className="form-group">
                  <label htmlFor="pf-stock" className="form-label">
                    Opening Stock <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="pf-stock"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input${errors.onHandStock ? ' input-error' : ''}`}
                    value={form.onHandStock}
                    onChange={(e) => setField('onHandStock', e.target.value)}
                    placeholder="0"
                  />
                  {errors.onHandStock ? (
                    <span className="form-error">{errors.onHandStock}</span>
                  ) : (
                    <span className="form-hint">Must be a whole number.</span>
                  )}
                </div>

                {/* Reorder Level */}
                <div className="form-group">
                  <label htmlFor="pf-reorder" className="form-label">
                    Reorder Level <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="pf-reorder"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input${errors.reorderLevel ? ' input-error' : ''}`}
                    value={form.reorderLevel}
                    onChange={(e) => setField('reorderLevel', e.target.value)}
                    placeholder="0"
                  />
                  {errors.reorderLevel ? (
                    <span className="form-error">{errors.reorderLevel}</span>
                  ) : (
                    <span className="form-hint">Alert triggers when stock falls to this level.</span>
                  )}
                </div>

                {/* Warehouse Location */}
                <div className="form-group">
                  <label htmlFor="pf-warehouse" className="form-label">Warehouse Location</label>
                  <select
                    id="pf-warehouse"
                    className="form-select"
                    value={form.warehouseLocation}
                    onChange={(e) => setField('warehouseLocation', e.target.value)}
                  >
                    <option value="">— Not Assigned —</option>
                    {WAREHOUSE_OPTIONS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
