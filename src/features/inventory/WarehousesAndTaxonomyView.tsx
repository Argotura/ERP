// ============================================================
// ARGOTURO ERP — Warehouses, Locations & Taxonomy
// ============================================================

import React from 'react';
import { Warehouse } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function WarehousesAndTaxonomyView({ mode }: { mode: 'warehouses' | 'categories' }) {
  const { store } = useApp();

  if (mode === 'categories') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Product Taxonomy & Categories
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Product classification hierarchies, industrial groupings, and units of measure (UOM)
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Category Code</th>
                <th>Category Name</th>
                <th>Industry Description</th>
                <th>Registered SKUs</th>
              </tr>
            </thead>
            <tbody>
              {store.categories.map((c) => {
                const count = store.products.filter((p) => p.categoryId === c.id).length;
                return (
                  <tr key={c.id}>
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
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{c.code}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: '#64748b' }}>{c.description}</td>
                    <td>
                      <strong style={{ color: '#3b82f6' }}>{count} SKU(s)</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Warehouses Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Warehouses & Storage Facilities
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Distribution hubs, regional cross-dock transit, quarantine zones, and storage capacity utilization
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {store.warehouses.map((w) => (
          <div
            key={w.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 3,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      textTransform: 'uppercase',
                    }}
                  >
                    {w.type}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '6px 0 2px' }}>
                    {w.name}
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Code: {w.code}</div>
                </div>

                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6',
                  }}
                >
                  <Warehouse size={18} />
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: '#475569', margin: '12px 0 8px', lineHeight: 1.4 }}>
                {w.address}
              </p>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Facility Manager: <strong>{w.manager}</strong>
              </div>
            </div>

            <div style={{ marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Storage Capacity Utilization:</span>
                <span style={{ fontWeight: 700, color: w.capacityPercentage > 80 ? '#ea580c' : '#10b981' }}>
                  {w.capacityPercentage}%
                </span>
              </div>
              <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${w.capacityPercentage}%`,
                    height: '100%',
                    backgroundColor: w.capacityPercentage > 80 ? '#ea580c' : '#10b981',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
