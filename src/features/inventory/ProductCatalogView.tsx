// ============================================================
// ARGOTURO ERP — Product Catalog (Master Item Data)
// ============================================================

import React, { useState } from 'react';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export default function ProductCatalogView() {
  const { store, saveProduct, deleteProduct, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(store.categories[0]?.id || '');
  const [uom, setUom] = useState('PCS');
  const [sellingPrice, setSellingPrice] = useState(1000000);
  const [unitCost, setUnitCost] = useState(700000);
  const [reorderLevel, setReorderLevel] = useState(15);
  const [safetyStock, setSafetyStock] = useState(10);
  const [initialStock, setInitialStock] = useState(50);

  const filteredProducts = store.products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      name,
      description: `${name} enterprise grade industrial specification`,
      categoryId,
      supplierId: store.suppliers[0]?.id || 'sup-001',
      unit: uom,
      uom,
      sellingPrice,
      unitCost,
      minSellingPrice: Math.round(sellingPrice * 0.9),
      onHandStock: initialStock,
      reservedStock: 0,
      reorderLevel,
      safetyStock,
      leadTimeDays: 7,
      targetStockLevel: reorderLevel * 2,
      warehouseLocation: 'A-01-01',
      status: 'active',
      warehouses: [
        { warehouseId: store.warehouses[0]?.id || 'wh-cikarang', binLocation: 'A-01-01', onHandStock: initialStock },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProduct(newProduct);
    setShowCreateModal(false);
    addToast('success', `Product ${name} (${newProduct.sku}) saved successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Product Catalog
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Industrial components, assemblies, price lists, target margins, and stock control parameters
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Add New Product
        </button>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            className="input"
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input"
          style={{ width: 240 }}
        >
          <option value="all">All Categories ({store.categories.length})</option>
          {store.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Stock Status</th>
              <th>Product SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>UOM</th>
              <th style={{ textAlign: 'right' }}>On-Hand Stock</th>
              <th style={{ textAlign: 'right' }}>Unit Cost</th>
              <th style={{ textAlign: 'right' }}>Selling Price</th>
              <th style={{ textAlign: 'right' }}>Margin (%)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const category = store.categories.find((c) => c.id === p.categoryId);
              const isLowStock = p.onHandStock <= p.reorderLevel;
              const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.unitCost) / p.sellingPrice) * 100 : 0;

              return (
                <tr key={p.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: p.onHandStock === 0 ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7',
                        color: p.onHandStock === 0 ? '#b91c1c' : isLowStock ? '#b45309' : '#15803d',
                      }}
                    >
                      {p.onHandStock === 0 ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{p.sku}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                  </td>
                  <td>{category?.name || 'General'}</td>
                  <td>{p.uom}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: isLowStock ? '#ef4444' : '#1e293b' }}>
                    {p.onHandStock} {p.uom}
                  </td>
                  <td style={{ textAlign: 'right' }}>IDR {p.unitCost.toLocaleString('en-US')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>IDR {p.sellingPrice.toLocaleString('en-US')}</td>
                  <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                    {margin.toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                      >
                        <Eye size={12} /> Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete product ${p.name}?`)) {
                            deleteProduct(p.id);
                            addToast('info', `Product ${p.name} deleted/archived.`);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                        title="Delete / Archive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 580,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {selectedProduct.sku} — {selectedProduct.name}
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Category:{' '}
                  {store.categories.find((c) => c.id === selectedProduct.categoryId)?.name || selectedProduct.categoryId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16, fontSize: 13 }}>
              <div>
                <span style={{ color: '#64748b', fontSize: 11 }}>Current On-Hand Stock:</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                  {selectedProduct.onHandStock} {selectedProduct.uom}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11 }}>Inventory Valuation:</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                  IDR {(selectedProduct.onHandStock * selectedProduct.unitCost).toLocaleString('en-US')}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11 }}>Reorder Point (ROP):</span>
                <div style={{ fontWeight: 600 }}>{selectedProduct.reorderLevel} {selectedProduct.uom}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: 11 }}>Safety Stock Level:</span>
                <div style={{ fontWeight: 600 }}>{selectedProduct.safetyStock} {selectedProduct.uom}</div>
              </div>
            </div>

            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Warehouse Location Allocations
            </h4>
            <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 12.5, marginBottom: 20 }}>
              {(selectedProduct.warehouses || []).map((w, idx) => {
                const wh = store.warehouses.find((item) => item.id === w.warehouseId);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>
                      {wh?.name || w.warehouseId} (Bin: {w.binLocation || 'A-01'})
                    </span>
                    <strong style={{ color: '#3b82f6' }}>{w.onHandStock} Units</strong>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <form
            onSubmit={handleCreate}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: 24,
              width: 580,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Add Master Product</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Product SKU:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. ELEC-SENS-099"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Product Name:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Digital Pressure Sensor 0-10 Bar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Category:</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input"
                >
                  {store.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Unit of Measure (UOM):</label>
                <select value={uom} onChange={(e) => setUom(e.target.value)} className="input">
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="SET">SET (Set / Unit)</option>
                  <option value="MTR">MTR (Meter)</option>
                  <option value="BOX">BOX (Box / Carton)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Unit Cost (HPP):</label>
                <input
                  type="number"
                  className="input"
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Standard Selling Price:</label>
                <input
                  type="number"
                  className="input"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Initial On-Hand Stock:</label>
                <input
                  type="number"
                  className="input"
                  value={initialStock}
                  onChange={(e) => setInitialStock(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reorder Point (ROP):</label>
                <input
                  type="number"
                  className="input"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
