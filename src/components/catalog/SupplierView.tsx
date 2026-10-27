// ============================================================
// NEXORA ERP — Supplier Management Subview
// ============================================================

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Users, X, AlertCircle, Phone, Mail, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { enrichSuppliers } from '../../utils/helpers';
import StatusBadge from '../ui/StatusBadge';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Supplier, SupplierStatus } from '../../types';

interface SupplierFormData {
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: SupplierStatus;
}

const initialFormData: SupplierFormData = {
  code: '',
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  status: 'active',
};

export default function SupplierView() {
  const { store, createSupplier, updateSupplier, deleteSupplier } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Deletion state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [blockedDeleteMsg, setBlockedDeleteMsg] = useState<string | null>(null);

  // Enriched suppliers with product count
  const suppliersWithCount = useMemo(
    () => enrichSuppliers(store.suppliers, store.products),
    [store.suppliers, store.products]
  );

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliersWithCount;
    const q = search.toLowerCase().trim();
    return suppliersWithCount.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
    );
  }, [suppliersWithCount, search]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData(initialFormData);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const codeTrim = formData.code.trim().toUpperCase();
    const nameTrim = formData.name.trim();

    if (!codeTrim) {
      errors.code = 'Supplier code is required';
    } else {
      const isDuplicate = store.suppliers.some(
        (s) => s.code.toUpperCase() === codeTrim && s.id !== editingSupplier?.id
      );
      if (isDuplicate) {
        errors.code = 'Supplier code already exists';
      }
    }

    if (!nameTrim) {
      errors.name = 'Supplier name is required';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
      });
    } else {
      createSupplier({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    const assignedProducts = store.products.filter((p) => p.supplierId === supplier.id);
    if (assignedProducts.length > 0) {
      setBlockedDeleteMsg(
        `Cannot delete supplier "${supplier.name}" because ${assignedProducts.length} product(s) are linked to it. Please reassign the products first or mark this supplier as Inactive.`
      );
      return;
    }
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
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
                <AlertCircle size={18} /> Cannot Delete Supplier
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
            placeholder="Search suppliers by name, code, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="results-info">
          Showing {filteredSuppliers.length} of {suppliersWithCount.length} suppliers
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
          <Plus size={14} /> Add Supplier
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Code</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Contact Details</th>
                <th style={{ textAlign: 'right', width: 110 }}>Products</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ textAlign: 'right', width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <Users className="empty-state-icon" />
                      <h3>No suppliers found</h3>
                      <p>Try modifying your search query or add a new supplier record.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td className="td-sku" style={{ fontWeight: 600 }}>{sup.code}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{sup.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <User size={13} style={{ color: 'var(--text-muted)' }} />
                        {sup.contactPerson || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 }}>
                        {sup.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                            <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {sup.email}
                          </div>
                        )}
                        {sup.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                            <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {sup.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="td-number" style={{ fontWeight: 600 }}>
                      {sup.productCount}
                    </td>
                    <td>
                      <StatusBadge status={sup.status} type="supplier" />
                    </td>
                    <td className="td-actions">
                      <button
                        className="action-btn"
                        title="Edit supplier"
                        onClick={() => handleOpenEdit(sup)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="action-btn danger"
                        title="Delete supplier"
                        onClick={() => handleDeleteClick(sup)}
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
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label required">Supplier Code</label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.code ? 'error' : ''}`}
                      placeholder="e.g. SUP-TKN"
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
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as SupplierStatus })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label required">Supplier Company Name</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="e.g. PT Teknindo Persada"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Budi Santoso"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                      placeholder="e.g. sales@vendor.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. +62-21-555-0101"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${supplierToDelete?.name}" (${supplierToDelete?.code})? This action cannot be undone.`}
        confirmLabel="Delete Supplier"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSupplierToDelete(null);
        }}
      />
    </div>
  );
}

