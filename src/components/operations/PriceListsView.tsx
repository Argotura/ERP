// ============================================================
// NEXORA ERP — Price Lists & Commercial Rules (Daftar Harga)
// ============================================================

import React, { useState } from 'react';
import { Tag, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

export default function PriceListsView() {
  const { store } = useApp();
  const [selectedListId, setSelectedListId] = useState(store.priceLists[0]?.id || '');

  const priceLists = store.priceLists || [];
  const activeList = priceLists.find((pl) => pl.id === selectedListId) || priceLists[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-left">
          <h2>Price Lists & Commercial Matrices (Daftar Harga)</h2>
          <p>Channel-specific pricing rules, B2B wholesale tiers, and government tender catalog matrices</p>
        </div>
      </div>

      {/* Grid of Price Lists */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        {priceLists.map((pl) => {
          const isSelected = pl.id === activeList?.id;
          return (
            <div
              key={pl.id}
              className="kpi-card"
              onClick={() => setSelectedListId(pl.id)}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--accent)' : undefined,
                background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="td-sku" style={{ fontWeight: 600 }}>{pl.code}</span>
                <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
              </div>

              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                {pl.name}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Channel: <strong>{pl.channel}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-default)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Discount / Adjustment</span>
                <span style={{ fontWeight: 700, color: pl.discountRate > 0 ? 'var(--success-text)' : 'var(--text-primary)' }}>
                  {pl.discountRate > 0 ? `-${pl.discountRate}% off Retail` : 'Base Standard Price'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Catalog Preview under this Price List */}
      {activeList && (
        <div className="table-container">
          <div className="chart-header" style={{ background: 'var(--bg-surface-alt)' }}>
            <div>
              <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} /> Matrix Simulation: {activeList.name}
              </div>
              <div className="chart-subtitle">
                Applied multiplier factor: <strong>{activeList.multiplier}x</strong> base retail selling price ({activeList.channel})
              </div>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 130 }}>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right', width: 140 }}>Unit Cost (HPP)</th>
                  <th style={{ textAlign: 'right', width: 140 }}>Base Retail Price</th>
                  <th style={{ textAlign: 'right', width: 160, color: 'var(--accent)' }}>
                    Price on {activeList.code}
                  </th>
                  <th style={{ textAlign: 'right', width: 120 }}>Channel Margin</th>
                </tr>
              </thead>
              <tbody>
                {store.products.slice(0, 10).map((p) => {
                  const channelPrice = Math.round(p.sellingPrice * activeList.multiplier);
                  const channelMargin = channelPrice - p.unitCost;
                  const channelMarginPct =
                    channelPrice > 0 ? ((channelMargin / channelPrice) * 100).toFixed(1) : '0';
                  const cat = store.categories.find((c) => c.id === p.categoryId);

                  return (
                    <tr key={p.id}>
                      <td className="td-sku">{p.sku}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{cat?.name || '—'}</td>
                      <td className="td-number" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(p.unitCost)}
                      </td>
                      <td className="td-number">{formatCurrency(p.sellingPrice)}</td>
                      <td className="td-number" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {formatCurrency(channelPrice)}
                      </td>
                      <td
                        className="td-number"
                        style={{
                          fontWeight: 600,
                          color: channelMargin >= 0 ? 'var(--success-text)' : 'var(--danger-text)',
                        }}
                      >
                        {channelMarginPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

