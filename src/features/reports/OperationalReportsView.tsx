// ============================================================
// ARGOTURO ERP — Operational Reports & Inventory Valuation
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function OperationalReportsView({ mode }: { mode: 'sales' | 'purchasing' | 'valuation' }) {
  const { store } = useApp();

  if (mode === 'purchasing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Procurement & Purchasing Summary Report
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Vendor purchasing expenditure statistics, payment terms, and procurement volume trends
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Supplier / Vendor</th>
                <th>Purchase Orders Placed</th>
                <th>Payment Terms</th>
                <th style={{ textAlign: 'right' }}>Total Procurement Value</th>
              </tr>
            </thead>
            <tbody>
              {store.suppliers.map((s) => {
                const pos = store.purchaseOrders.filter((po) => po.supplierId === s.id);
                const totalSpent = pos.reduce((sum, po) => sum + po.grandTotal, 0);

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{s.code}</div>
                    </td>
                    <td>{pos.length} Order(s)</td>
                    <td>{s.paymentTerms}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      IDR {totalSpent.toLocaleString('en-US')}
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

  if (mode === 'valuation') {
    const totalValuation = store.products.reduce((s, p) => s + p.onHandStock * p.unitCost, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Inventory Valuation Report
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Asset valuation of merchandise and manufacturing components using FIFO Perpetual Costing
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 320 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Inventory Book Value</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            IDR {totalValuation.toLocaleString('en-US')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Recognized in GL Account 11310</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>On-Hand Stock</th>
                <th style={{ textAlign: 'right' }}>Standard Cost (HPP)</th>
                <th style={{ textAlign: 'right' }}>Total Asset Value</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((p) => {
                const cat = store.categories.find((c) => c.id === p.categoryId);
                const val = p.onHandStock * p.unitCost;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{p.sku}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{cat?.name || 'General'}</td>
                    <td style={{ textAlign: 'right' }}>{p.onHandStock} {p.uom}</td>
                    <td style={{ textAlign: 'right' }}>IDR {p.unitCost.toLocaleString('en-US')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      IDR {val.toLocaleString('en-US')}
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

  // Sales Mode (Default)
  const totalSalesRevenue = store.salesOrders.reduce((s, so) => s + so.grandTotal, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Sales Operational Report
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Commercial sales transactions per industrial client, fulfillment status, and revenue volume
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 18, border: '1px solid #e2e8f0', maxWidth: 320 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Sales Order Value</span>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>
          IDR {totalSalesRevenue.toLocaleString('en-US')}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
          {store.salesOrders.length} Order(s) Issued
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th>Customer Account</th>
              <th>Total Orders (SO)</th>
              <th>Fulfillment Status</th>
              <th style={{ textAlign: 'right' }}>Cumulative Sales Value</th>
            </tr>
          </thead>
          <tbody>
            {store.customers.map((c) => {
              const sos = store.salesOrders.filter((s) => s.customerId === c.id);
              const totalVal = sos.reduce((sum, so) => sum + so.grandTotal, 0);

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{c.code}</div>
                  </td>
                  <td>{sos.length} Orders</td>
                  <td>{sos.some((s) => s.status === 'fulfilled') ? 'Active Fulfillment' : 'Pending / Processing'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                    IDR {totalVal.toLocaleString('en-US')}
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
