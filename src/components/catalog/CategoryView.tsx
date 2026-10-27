// ============================================================
// NEXORA ERP — Category Management Subview
// ============================================================

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, FolderOpen, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { enrichCategories } from '../../utils/helpers';
import StatusBadge from '../ui/StatusBadge';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Category, CategoryStatus } from '../../types';

interface CategoryFormData {
  code: string;
  name: string;
  description: string;
  status: CategoryStatus;
}

const initialFormData: CategoryFormData = {
  code: '',
  name: '',
  description: '',
  status: 'active',
};

export default function CategoryView() {
  const { store, createCategory, updateCategory, deleteCategory } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Deletion state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [blockedDeleteMsg, setBlockedDeleteMsg] = useState<string | null>(null);

  // Enriched categories with product count
  const categoriesWithCount = useMemo(
    () => enrichCategories(store.categories, store.products),
    [store.categories, store.products]
  );

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categoriesWithCount;
    const q = search.toLowerCase().trim();
    return categoriesWithCount.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [categoriesWithCount, search]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const codeTrim = formData.code.trim().toUpperCase();
    const nameTrim = formData.name.trim();

    if (!codeTrim) {
      errors.code = 'Category code is required';
    } else if (codeTrim.length < 2 || codeTrim.length > 5) {
      errors.code = 'Code must be between 2 and 5 uppercase characters';
    } else {
      const isDuplicate = store.categories.some(
        (c) => c.code.toUpperCase() === codeTrim && c.id !== editingCategory?.id
      );
      if (isDuplicate) {
        errors.code = 'Category code already exists';
      }
    }

    if (!nameTrim) {
      errors.name = 'Category name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      });
    } else {
      createCategory({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteClick = (category: Category) => {
    const assignedProducts = store.products.filter((p) => p.categoryId === category.id);
    if (assignedProducts.length > 0) {
      setBlockedDeleteMsg(
        `Cannot delete "${category.name}" because it still contains ${assignedProducts.length} product(s). Please reassign or delete the products first, or set this category status to Inactive.`
      );
      return;
    }
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Blocked delete notification modal */}
      {blockedDeleteMsg && (
        <div className="overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} /> Cannot Delete Category
              </div>
              <button className="modal-close" onClick={() => setBlockedDeleteMsg(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {blockedDeleteMsg}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setBlockedDeleteMsg(null)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="results-info">
          Showing {filteredCategories.length} of {categoriesWithCount.length} categories
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Code</th>
                <th>Category Name</th>
                <th>Description</th>
                <th style={{ textAlign: 'right', width: 120 }}>Products</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ textAlign: 'right', width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <FolderOpen className="empty-state-icon" />
                      <h3>No categories found</h3>
                      <p>Try modifying your search query or add a new category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="td-sku" style={{ fontWeight: 600 }}>{cat.code}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.description || '—'}
                    </td>
                    <td className="td-number" style={{ fontWeight: 600 }}>
                      {cat.productCount}
                    </td>
                    <td>
                      <StatusBadge status={cat.status} type="category" />
                    </td>
                    <td className="td-actions">
                      <button
                        className="action-btn"
                        title="Edit category"
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="action-btn danger"
                        title="Delete category"
                        onClick={() => handleDeleteClick(cat)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="overlay">
          <div className="modal modal-md">
            <div className="modal-header">
              <div className="modal-title">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label required">Category Code</label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.code ? 'error' : ''}`}
                      placeholder="e.g. NET, SAF, IND"
                      maxLength={5}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                    {formErrors.code && <span className="form-error">{formErrors.code}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CategoryStatus })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Category Name</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Networking Hardware"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter short description of this category scope..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}" (${categoryToDelete?.code})? This action cannot be undone.`}
        confirmLabel="Delete Category"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}

