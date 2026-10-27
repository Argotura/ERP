// ============================================================
// NEXORA ERP — Warehouses & Locations (Multi-Gudang)
// ============================================================

import React, { useState } from 'react';
import { Warehouse as WarehouseIcon, MapPin, User, ShieldCheck, Box } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function WarehousesView() {
  const { store } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');

  const warehouses = store.warehouses || [];

  const filteredWarehouses = warehouses.filter((wh) => {
    if (selectedType !== 'all' && wh.type !== selectedType) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Warehouses & Distribution Facilities</h2>
          <p>Multi-location storage capacity, zoning, bin locations, and site leadership</p>
        </div>
        <div className="page-header-actions">
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'central', 'regional', 'transit', 'quarantine'].map((t) => (
              <button
                key={t}
                className={`btn btn-sm ${selectedType === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedType(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t === 'all' ? 'All Locations' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Warehouses */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        {filteredWarehouses.map((wh) => {
          // Calculate products stored in this warehouse
          const storedProducts = store.products.filter(
            (p) => p.warehouseLocation === wh.code
          );
          const totalStockCount = storedProducts.reduce((sum, p) => sum + p.onHandStock, 0);

          return (
            <div
              key={wh.id}
              className="kpi-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="kpi-icon"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    <WarehouseIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                      {wh.code}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{wh.name}</div>
                  </div>
                </div>
                <span
                  className="badge badge-info"
                  style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em' }}
                >
                  {wh.type}
                </span>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--text-muted)' }} />
                <span>{wh.address}</span>
              </div>

              {/* Capacity meter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Occupied Capacity</span>
                  <span style={{ fontWeight: 600, color: wh.capacityPercentage > 80 ? 'var(--warning-text)' : 'var(--text-primary)' }}>
                    {wh.capacityPercentage}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${wh.capacityPercentage}%`,
                      background:
                        wh.capacityPercentage > 85
                          ? 'var(--danger)'
                          : wh.capacityPercentage > 70
                          ? 'var(--warning)'
                          : 'var(--accent)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>

              {/* Footer stats */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-default)',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <User size={13} style={{ color: 'var(--text-muted)' }} />
                  <span>{wh.manager}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--accent)' }}>
                  <Box size={13} />
                  <span>{storedProducts.length} SKUs ({totalStockCount} units)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

