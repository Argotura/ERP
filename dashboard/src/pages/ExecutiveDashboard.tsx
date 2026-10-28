// ============================================================
// NEXORA Executive Dashboard — Real-time Operational Intelligence
// ============================================================

import React, { useMemo } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Download,
  Boxes,
  Truck,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSharedStore } from '../store/sharedStore';
import { formatCurrency, formatNumber, enrichProduct, relativeTime } from '../utils/helpers';

export default function ExecutiveDashboard() {
  const { store, refresh } = useSharedStore();

  const products = store?.products || [];
  const categories = store?.categories || [];
  const suppliers = store?.suppliers || [];
  const movements = store?.stockMovements || [];
  const warehouses = store?.warehouses || [];
  const activities = store?.activityLogs || [];

  // Enriched products
  const enrichedProducts = useMemo(() => {
    return products.map((p) => enrichProduct(p, categories, suppliers));
  }, [products, categories, suppliers]);

  // Executive Metrics
  const totalValuation = useMemo(() => {
    return enrichedProducts.reduce((sum, p) => sum + p.inventoryValue, 0);
  }, [enrichedProducts]);

  const lowStockItems = useMemo(() => {
    return enrichedProducts.filter(
      (p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock'
    );
  }, [enrichedProducts]);

  // Category chart distribution
  const categoryData = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = enrichedProducts.filter((p) => p.categoryId === cat.id);
      const catValue = catProducts.reduce((sum, p) => sum + p.inventoryValue, 0);
      return {
        name: cat.name,
        code: cat.code,
        skuCount: catProducts.length,
        totalValue: catValue,
      };
    });
  }, [categories, enrichedProducts]);

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Inventory Valuation', totalValuation],
      ['Total Active SKUs', products.length],
      ['Items Requiring Attention', lowStockItems.length],
      ['Total Warehouses', warehouses.length],
      [''],
      ['Category', 'SKU Count', 'Valuation (IDR)'],
      ...categoryData.map((c) => [c.name, c.skuCount, c.totalValue]),
    ];

    const content = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-executive-kpi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      {/* Executive Header Banner */}
      <header className="exec-header">
        <div className="brand-section">
          <div className="brand-logo">
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                NEXORA Executive Intelligence
              </h1>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                  }}
                />
                Live Connected (Port 5174)
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Real-time executive oversight of inventory valuations, stock alerts, and cross-warehouse telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary" onClick={refresh} title="Force refresh from local cache">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export KPI Report
          </button>
          <a
            href={import.meta.env.PROD ? '/' : 'http://localhost:5173'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontWeight: 600 }}
          >
            <span>{import.meta.env.PROD ? 'Open Operations ERP' : 'Open Operations ERP (Port 5173)'}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        {/* Total Valuation */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Inventory Asset Valuation</span>
            <TrendingUp size={18} color="var(--accent)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>
            {formatCurrency(totalValuation)}
          </div>
          <div className="kpi-sub">Calculated via on-hand stock × unit cost</div>
        </div>

        {/* Total SKUs */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Catalog Products</span>
            <Package size={18} color="#0284c7" />
          </div>
          <div className="kpi-value">{products.length}</div>
          <div className="kpi-sub">{categories.length} active master categories</div>
        </div>

        {/* Low Stock Items */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Critical Stock Alerts</span>
            <AlertTriangle size={18} color={lowStockItems.length > 0 ? '#d97706' : '#16a34a'} />
          </div>
          <div
            className="kpi-value"
            style={{ color: lowStockItems.length > 0 ? '#d97706' : '#16a34a' }}
          >
            {lowStockItems.length}
          </div>
          <div className="kpi-sub">Items at or below reorder threshold</div>
        </div>

        {/* Logistics Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Recorded Movements</span>
            <Truck size={18} color="#7c3aed" />
          </div>
          <div className="kpi-value">{movements.length}</div>
          <div className="kpi-sub">Ledger transactions logged</div>
        </div>

        {/* Facilities */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Warehouses</span>
            <Boxes size={18} color="#0d9488" />
          </div>
          <div className="kpi-value">{warehouses.length}</div>
          <div className="kpi-sub">Central, regional & transit hubs</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-row">
        {/* Valuation by Category */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Inventory Valuation by Category</div>
              <div className="card-subtitle">Total asset value in IDR per product family</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Valuation']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="totalValue" fill="#4f46e5" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SKU Count Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">SKU Distribution by Category</div>
              <div className="card-subtitle">Number of master catalog items per classification</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} SKUs`, 'Count']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="skuCount" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock Radar Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="var(--warning)" /> Items Requiring Inventory Attention
            </div>
            <div className="card-subtitle">
              {lowStockItems.length} products currently at or below minimum threshold
            </div>
          </div>
          <a
            href={import.meta.env.PROD ? '/' : 'http://localhost:5173'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: 12 }}
          >
            Manage in ERP Catalog <ArrowRight size={13} />
          </a>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <th style={{ width: 130 }}>SKU</th>
                <th>Product Description</th>
                <th>Category</th>
                <th style={{ width: 100 }}>Warehouse</th>
                <th style={{ textAlign: 'right', width: 120 }}>On-Hand Stock</th>
                <th style={{ textAlign: 'right', width: 120 }}>Reorder Point</th>
                <th style={{ width: 130 }}>Stock Status</th>
                <th style={{ textAlign: 'right', width: 140 }}>Estimated Value</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#16a34a' }}>
                    <CheckCircle2 size={24} style={{ display: 'inline-block', marginBottom: 6 }} />
                    <div>All catalog products are currently adequately stocked!</div>
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.sku}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.categoryName}</td>
                    <td>{item.warehouseLocation}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: item.onHandStock === 0 ? 'var(--danger)' : 'var(--warning)',
                      }}
                    >
                      {formatNumber(item.onHandStock)} {item.unit}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatNumber(item.reorderLevel)} {item.unit}
                    </td>
                    <td>
                      {item.stockStatus === 'out_of_stock' ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : (
                        <span className="badge badge-warning">Low Stock</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(item.inventoryValue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Ticker */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} /> Live Operational Audit Stream
            </div>
            <div className="card-subtitle">Real-time business activities executed in NEXORA ERP</div>
          </div>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {activities.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
              No activities recorded yet.
            </div>
          ) : (
            activities.slice(0, 8).map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-default)',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    className="badge badge-success"
                    style={{ textTransform: 'capitalize', fontSize: 10 }}
                  >
                    {act.entityType}
                  </span>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {act.entityName}
                    </span>{' '}
                    — <span style={{ color: 'var(--text-secondary)' }}>{act.summary}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {relativeTime(act.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

