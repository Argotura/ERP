// ============================================================
// ARGOTURO ERP — Bills of Materials (BOM)
// ============================================================

import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BillOfMaterials } from '../../types';

export default function BOMView() {
  const { store, saveBOM, addToast } = useApp();
  const [selectedBOM, setSelectedBOM] = useState<BillOfMaterials | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [laborCost, setLaborCost] = useState(150000);
  const [overheadCost, setOverheadCost] = useState(100000);
  const [components, setComponents] = useState([
    { productId: store.products[1]?.id || '', quantity: 2, unitCost: store.products[1]?.unitCost || 0 },
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const bomNumber = `BOM-${String(store.billsOfMaterials.length + 1).padStart(4, '0')}`;
    const fg = store.products.find((p) => p.id === productId);
    const newBOM: BillOfMaterials = {
      id: `bom-${Date.now()}`,
      bomCode: bomNumber,
      bomNumber,
      name,
      productId,
      finishedProductId: productId,
      finishedSku: fg?.sku || '',
      finishedProductName: fg?.name || name,
      outputQuantity: 1,
      laborCost,
      overheadCost,
      status: 'active',
      components: components.map((c, i) => {
        const comp = store.products.find((p) => p.id === c.productId);
        return {
          id: `bomc-${Date.now()}-${i}`,
          productId: c.productId,
          componentProductId: c.productId,
          sku: comp?.sku || '',
          productName: comp?.name || '',
          quantity: c.quantity,
          unit: comp?.unit || 'PCS',
          unitCost: c.unitCost,
          estimatedCost: c.quantity * c.unitCost,
        };
      }),
      createdAt: new Date().toISOString(),
    };

    saveBOM(newBOM);
    setShowModal(false);
    addToast('success', `BOM formula ${bomNumber} saved successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Bills of Materials (BOM)
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Product formulations, raw material component breakdowns, direct labor costing, and factory overhead allocations
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} /> Create BOM Formula
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>BOM Formula No.</th>
              <th>Formula Name</th>
              <th>Finished Good Output</th>
              <th>Component Count</th>
              <th>Direct Labor Cost</th>
              <th>Overhead Cost</th>
              <th style={{ textAlign: 'right' }}>Total Standard Cost</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.billsOfMaterials.map((bom) => {
              const fgProduct = store.products.find((p) => p.id === bom.productId || p.id === bom.finishedProductId);
              const materialCost = bom.components.reduce((s, c) => s + c.quantity * (c.unitCost ?? c.estimatedCost ?? 0), 0);
              const totalStdCost = materialCost + (bom.laborCost || 0) + (bom.overheadCost || 0);

              return (
                <tr key={bom.id}>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      ACTIVE
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{bom.bomNumber || bom.bomCode}</td>
                  <td style={{ fontWeight: 600 }}>{bom.name || bom.finishedProductName}</td>
                  <td>
                    <div>{fgProduct?.name || 'Finished Good'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{fgProduct?.sku}</div>
                  </td>
                  <td>{bom.components.length} Component(s)</td>
                  <td>IDR {(bom.laborCost || 0).toLocaleString('en-US')}</td>
                  <td>IDR {(bom.overheadCost || 0).toLocaleString('en-US')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                    IDR {totalStdCost.toLocaleString('en-US')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedBOM(bom)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      <Eye size={12} /> View Components
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BOM Detail Drawer */}
      {selectedBOM && (
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
              width: 620,
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {selectedBOM.bomNumber}: {selectedBOM.name}
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Target Output:{' '}
                  {store.products.find((p) => p.id === selectedBOM.productId)?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBOM(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Raw Material Components Required:
            </h4>
            <table className="data-table" style={{ width: '100%', fontSize: 12.5, marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Qty per Unit</th>
                  <th>Unit Cost</th>
                  <th style={{ textAlign: 'right' }}>Total Component Cost</th>
                </tr>
              </thead>
              <tbody>
                {selectedBOM.components.map((c) => {
                  const p = store.products.find((prod) => prod.id === c.productId);
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{p?.sku}</strong> — {p?.name}
                      </td>
                      <td>{c.quantity} PCS</td>
                      <td>IDR {(c.unitCost ?? c.estimatedCost ?? 0).toLocaleString('en-US')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        IDR {(c.quantity * (c.unitCost ?? c.estimatedCost ?? 0)).toLocaleString('en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 6, fontSize: 12.5, textAlign: 'right' }}>
              <div>Direct Labor Cost: IDR {(selectedBOM.laborCost || 0).toLocaleString('en-US')}</div>
              <div style={{ margin: '4px 0' }}>Factory Overhead Cost: IDR {(selectedBOM.overheadCost || 0).toLocaleString('en-US')}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                Cost of Goods Manufactured (COGM): IDR{' '}
                {(
                  selectedBOM.components.reduce((s, c) => s + c.quantity * (c.unitCost ?? c.estimatedCost ?? 0), 0) +
                  (selectedBOM.laborCost || 0) +
                  (selectedBOM.overheadCost || 0)
                ).toLocaleString('en-US')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedBOM(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
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
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Create BOM Formula</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Formula Name:</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Assembling Sensor Modul v1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Finished Good Output:</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="input"
                >
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Direct Labor Cost (IDR):</label>
                <input
                  type="number"
                  className="input"
                  value={laborCost}
                  onChange={(e) => setLaborCost(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Factory Overhead Cost (IDR):</label>
                <input
                  type="number"
                  className="input"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save BOM Formula
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
