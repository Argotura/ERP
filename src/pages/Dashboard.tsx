// ============================================================
// NEXORA ERP — Dashboard Page
// ============================================================

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  FolderOpen,
  Download,
  RefreshCcw,
  Plus,
  Trash2,
  Boxes,
  Archive,
  Users,
  Pencil,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import {
  calcDashboardKPIs,
  calcCategoryChartData,
  enrichProducts,
  formatCurrency,
  relativeTime,
  exportDashboardReport,
} from '../utils/helpers';
import { ActivityRepository } from '../store/demoStore';
import StatusBadge from '../components/ui/StatusBadge';
import { ActivityAction, ActivityLog, ProductWithRelations } from '../types';

// ── Activity icon/color config ─────────────────────────────

interface ActivityIconConfig {
  Icon: React.ElementType;
  bgColor: string;
  iconColor: string;
}

function getActivityIconConfig(action: ActivityAction): ActivityIconConfig {
  switch (action) {
    case 'product_created':
      return { Icon: Plus, bgColor: '#f0fdf4', iconColor: '#16a34a' };
    case 'product_deleted':
      return { Icon: Trash2, bgColor: '#fef2f2', iconColor: '#dc2626' };
    case 'price_revised':
      return { Icon: DollarSign, bgColor: '#fffbeb', iconColor: '#d97706' };
    case 'stock_updated':
      return { Icon: Boxes, bgColor: '#eff4ff', iconColor: '#3b6ef0' };
    case 'product_archived':
      return { Icon: Archive, bgColor: '#f9fafb', iconColor: '#6b7280' };
    case 'category_created':
    case 'category_updated':
    case 'category_deleted':
      return { Icon: FolderOpen, bgColor: '#faf5ff', iconColor: '#7c3aed' };
    case 'supplier_created':
    case 'supplier_updated':
    case 'supplier_deleted':
      return { Icon: Users, bgColor: '#f0fdfa', iconColor: '#0d9488' };
    case 'data_reset':
      return { Icon: RefreshCcw, bgColor: '#f9fafb', iconColor: '#6b7280' };
    case 'product_updated':
    default:
      return { Icon: Pencil, bgColor: '#eff4ff', iconColor: '#3b6ef0' };
  }
}

// ── Activity label helper ──────────────────────────────────

function activityActionLabel(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    product_created: 'Product Created',
    product_updated: 'Product Updated',
    product_deleted: 'Product Deleted',
    product_archived: 'Product Archived',
    price_revised: 'Price Revised',
    stock_updated: 'Stock Updated',
    category_created: 'Category Created',
    category_updated: 'Category Updated',
    category_deleted: 'Category Deleted',
    supplier_created: 'Supplier Created',
    supplier_updated: 'Supplier Updated',
    supplier_deleted: 'Supplier Deleted',
    movement_recorded: 'Stock Movement Logged',
    adjustment_created: 'Stock Opname Adjustment',
    inbound_received: 'Inbound PO Received',
    outbound_dispatched: 'Outbound DO Dispatched',
    data_reset: 'Demo Data Reset',
  };
  return map[action] ?? action;
}

// ── ActivityItem ───────────────────────────────────────────

interface ActivityItemProps {
  log: ActivityLog;
  onProductClick: (id: string) => void;
}

function ActivityItem({ log, onProductClick }: ActivityItemProps): React.ReactElement {
  const { Icon, bgColor, iconColor } = getActivityIconConfig(log.action);

  function handleClick(): void {
    if (log.entityType === 'product') {
      onProductClick(log.entityId);
    }
  }

  return (
    <div className="activity-item" onClick={handleClick}>
      <div
        className="activity-icon"
        style={{ backgroundColor: bgColor }}
      >
        <Icon style={{ color: iconColor }} />
      </div>
      <div className="activity-content">
        <div className="activity-action">{activityActionLabel(log.action)}</div>
        <div className="activity-detail">{log.summary}</div>
      </div>
      <div className="activity-time">{relativeTime(log.timestamp)}</div>
    </div>
  );
}

// ── LowStockTable ──────────────────────────────────────────

const MAX_LOW_STOCK_ROWS = 8;

interface LowStockTableProps {
  items: ProductWithRelations[];
  onViewProduct: (id: string) => void;
}

function LowStockTable({ items, onViewProduct }: LowStockTableProps): React.ReactElement {
  const displayed = items.slice(0, MAX_LOW_STOCK_ROWS);
  const remaining = items.length - displayed.length;

  return (
    <div className="activity-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">Items Requiring Attention</div>
          <div className="chart-subtitle">
            {items.length} item{items.length !== 1 ? 's' : ''} with low or zero stock
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 className="empty-state-icon" />
          <h3>All items are well-stocked</h3>
          <p>No products are currently below reorder level.</p>
        </div>
      ) : (
        <>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>On-hand</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((p) => (
                    <tr key={p.id}>
                      <td className="td-sku">{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{p.categoryName}</td>
                      <td className="td-number">{p.onHandStock}</td>
                      <td className="td-number">{p.reorderLevel}</td>
                      <td>
                        <StatusBadge status={p.stockStatus} type="stock" />
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onViewProduct(p.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {remaining > 0 && (
            <div
              style={{
                padding: '10px 20px',
                borderTop: '1px solid var(--border-default)',
                fontSize: '12.5px',
                color: 'var(--text-muted)',
              }}
            >
              + {remaining} more item{remaining !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Dashboard (main) ───────────────────────────────────────

export default function Dashboard(): React.ReactElement {
  const app = useApp();
  const { store, navigate, openProductDetail, setDashboardStockFilter, refreshData } = app;

  // Memoized computations
  const kpis = useMemo(
    () => calcDashboardKPIs(store.products, store.categories),
    [store.products, store.categories]
  );

  const chartData = useMemo(
    () => calcCategoryChartData(store.products, store.categories),
    [store.products, store.categories]
  );

  const enrichedProducts = useMemo(
    () => enrichProducts(store.products, store.categories, store.suppliers),
    [store.products, store.categories, store.suppliers]
  );

  const lowStockItems = useMemo(
    () =>
      enrichedProducts.filter(
        (p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock'
      ),
    [enrichedProducts]
  );

  const activityLogs = useMemo(
    () => ActivityRepository.getAll(store).slice(0, 10),
    [store]
  );

  const inactiveCount = useMemo(
    () => store.products.filter((p) => p.status === 'inactive').length,
    [store.products]
  );

  const archivedCount = useMemo(
    () => store.products.filter((p) => p.status === 'archived').length,
    [store.products]
  );

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handlers
  function handleExportReport(): void {
    exportDashboardReport(kpis, enrichedProducts, store.categories);
  }

  function handleRefreshData(): void {
    refreshData();
  }

  function handleLowStockKpiClick(): void {
    setDashboardStockFilter(true);
    navigate('catalog');
  }

  function handleViewProduct(id: string): void {
    openProductDetail(id);
    navigate('catalog');
  }

  function handleActivityProductClick(id: string): void {
    openProductDetail(id);
    navigate('catalog');
  }

  return (
    <div>
      {/* ── Page Header ─────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Operations Overview</h2>
          <p>Real-time snapshot of inventory, stock health, and activity.</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {todayLabel}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleExportReport}>
            <Download />
            Export Report
          </button>
          <button className="btn btn-primary" onClick={handleRefreshData}>
            <RefreshCcw />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────── */}
      <div className="kpi-grid">
        {/* 1. Total SKUs */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-label">Total SKUs</div>
            <div className="kpi-icon" style={{ backgroundColor: '#eff4ff' }}>
              <Package style={{ color: '#3b6ef0' }} />
            </div>
          </div>
          <div className="kpi-value">{kpis.totalSKUs}</div>
          <div className="kpi-meta">Across all categories</div>
        </div>

        {/* 2. Active Products */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-label">Active Products</div>
            <div className="kpi-icon" style={{ backgroundColor: '#f0fdf4' }}>
              <CheckCircle2 style={{ color: '#16a34a' }} />
            </div>
          </div>
          <div className="kpi-value">{kpis.activeProducts}</div>
          <div className="kpi-meta">
            {inactiveCount} inactive / {archivedCount} archived
          </div>
        </div>

        {/* 3. Low Stock Items */}
        <div className="kpi-card" onClick={handleLowStockKpiClick}>
          <div className="kpi-card-header">
            <div className="kpi-label">Low Stock Items</div>
            <div className="kpi-icon" style={{ backgroundColor: '#fffbeb' }}>
              <AlertTriangle style={{ color: '#d97706' }} />
            </div>
          </div>
          <div className="kpi-value">{kpis.lowStockItems}</div>
          <div className="kpi-meta">Requiring attention</div>
        </div>

        {/* 4. Total Inventory Value */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-label">Total Inventory Value</div>
            <div className="kpi-icon" style={{ backgroundColor: '#f5f3ff' }}>
              <DollarSign style={{ color: '#7c3aed' }} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '18px' }}>
            {formatCurrency(kpis.totalInventoryValue)}
          </div>
          <div className="kpi-meta">On-hand × Unit Cost</div>
        </div>

        {/* 5. Total Categories */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-label">Total Categories</div>
            <div className="kpi-icon" style={{ backgroundColor: '#f0fdfa' }}>
              <FolderOpen style={{ color: '#0d9488' }} />
            </div>
          </div>
          <div className="kpi-value">{kpis.totalCategories}</div>
          <div className="kpi-meta">Active product categories</div>
        </div>
      </div>

      {/* ── Charts Grid ─────────────────────────────── */}
      <div className="charts-grid">
        {/* Chart 1: SKU Count by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Inventory by Category</div>
              <div className="chart-subtitle">SKU count per category</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={chartData} height={220}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => [v, 'SKUs']} />
                <Bar dataKey="skuCount" fill="#3b6ef0" radius={[0, 3, 3, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory Value by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Inventory Value by Category</div>
              <div className="chart-subtitle">On-hand value (IDR) per category</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={chartData} height={220}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(v as number), 'Value']}
                />
                <Bar
                  dataKey="inventoryValue"
                  fill="#0d9488"
                  radius={[0, 3, 3, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Dashboard Bottom ─────────────────────────── */}
      <div className="dashboard-bottom">
        {/* Low Stock Table */}
        <LowStockTable items={lowStockItems} onViewProduct={handleViewProduct} />

        {/* Activity Feed */}
        <div className="activity-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Recent Activity</div>
              <div className="chart-subtitle">Last {activityLogs.length} actions</div>
            </div>
          </div>

          {activityLogs.length === 0 ? (
            <div className="empty-state">
              <Boxes className="empty-state-icon" />
              <h3>No activity yet</h3>
              <p>Actions you take in NEXORA ERP will appear here.</p>
            </div>
          ) : (
            activityLogs.map((log) => (
              <ActivityItem
                key={log.id}
                log={log}
                onProductClick={handleActivityProductClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
