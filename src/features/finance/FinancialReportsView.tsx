// ============================================================
// ARGOTURO ERP — Financial Statements (Laporan Keuangan Standar)
// ============================================================

import React, { useState } from 'react';
import { PieChart, TrendingUp, Scale, Landmark, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FinancialReportsView() {
  const { store } = useApp();
  const [activeTab, setActiveTab] = useState<'pnl' | 'balance_sheet' | 'cash_flow'>('pnl');

  // Revenue & Expenses calculation from accounts
  const revenueAccounts = store.accounts.filter((a) => a.category === 'Revenue' || a.type === 'revenue');
  const cogsAccounts = store.accounts.filter((a) => a.category === 'COGS' || a.category === ('Cost of Goods Sold' as any));
  const expenseAccounts = store.accounts.filter((a) => a.category === 'Operating Expense' || (a.type === 'expense' && a.category !== 'COGS'));

  const totalRevenue = revenueAccounts.reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  const totalCOGS = cogsAccounts.reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpense = expenseAccounts.reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  const netIncome = grossProfit - totalOperatingExpense;

  // Balance sheet accounts
  const assetAccounts = store.accounts.filter((a) => a.category === 'Asset' || a.type === 'asset');
  const liabilityAccounts = store.accounts.filter((a) => a.category === 'Liability' || a.type === 'liability');
  const equityAccounts = store.accounts.filter((a) => a.category === 'Equity' || a.type === 'equity');

  const totalAssets = assetAccounts.reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  const totalLiabilities = liabilityAccounts.reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  const totalEquity = equityAccounts.reduce((s, a) => s + Math.abs(a.currentBalance), 0) + netIncome;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Laporan Keuangan Perusahaan (Financial Statements)
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Laporan Laba Rugi komprehensif, Neraca posisi keuangan, dan arus kas yang terhubung langsung ke buku besar
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
        {[
          { id: 'pnl', label: 'Laba Rugi (Profit & Loss)' },
          { id: 'balance_sheet', label: 'Neraca (Balance Sheet)' },
          { id: 'cash_flow', label: 'Arus Kas (Cash Flow)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#3b82f6' : '#f1f5f9',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: P&L */}
      {activeTab === 'pnl' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            Laporan Laba Rugi Komprehensif (Tahun Berjalan 2026)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Revenue */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                <span>1. Pendapatan Penjualan & Usaha</span>
                <span>Rp {totalRevenue.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ paddingLeft: 16, marginTop: 8 }}>
                {revenueAccounts.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: '#475569' }}>
                    <span>{a.code} — {a.name}</span>
                    <span>Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COGS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                <span>2. Harga Pokok Penjualan (HPP)</span>
                <span>(Rp {totalCOGS.toLocaleString('id-ID')})</span>
              </div>
              <div style={{ paddingLeft: 16, marginTop: 8 }}>
                {cogsAccounts.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: '#475569' }}>
                    <span>{a.code} — {a.name}</span>
                    <span>Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gross Profit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14.5, backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 6, color: '#1e293b' }}>
              <span>LABA KOTOR (GROSS PROFIT):</span>
              <span style={{ color: grossProfit >= 0 ? '#10b981' : '#ef4444' }}>
                Rp {grossProfit.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Operating Expenses */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                <span>3. Beban Operasional & Administrasi Umum</span>
                <span>(Rp {totalOperatingExpense.toLocaleString('id-ID')})</span>
              </div>
              <div style={{ paddingLeft: 16, marginTop: 8 }}>
                {expenseAccounts.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: '#475569' }}>
                    <span>{a.code} — {a.name}</span>
                    <span>Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: 6, color: '#1e3a8a' }}>
              <span>LABA BERSIH TAHUN BERJALAN (NET INCOME):</span>
              <span style={{ color: netIncome >= 0 ? '#16a34a' : '#dc2626' }}>
                Rp {netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {activeTab === 'balance_sheet' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            Neraca Posisi Keuangan (Balance Sheet)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Assets */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', borderBottom: '2px solid #3b82f6', paddingBottom: 6, margin: '0 0 12px' }}>
                AKTIVA (ASSETS)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {assetAccounts.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
                    <span>{a.code} — {a.name}</span>
                    <span style={{ fontWeight: 500 }}>Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14.5, borderTop: '2px solid #1e293b', paddingTop: 8, marginTop: 10, color: '#1e293b' }}>
                  <span>TOTAL AKTIVA:</span>
                  <span style={{ color: '#10b981' }}>Rp {totalAssets.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', borderBottom: '2px solid #ea580c', paddingBottom: 6, margin: '0 0 12px' }}>
                KEWAJIBAN & EKUITAS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#334155' }}>Kewajiban / Hutang:</div>
                {liabilityAccounts.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
                    <span>{a.code} — {a.name}</span>
                    <span style={{ fontWeight: 500 }}>Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')}</span>
                  </div>
                ))}

                <div style={{ fontWeight: 700, fontSize: 13, color: '#334155', marginTop: 10 }}>Ekuitas Pemilik:</div>
                {equityAccounts.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
                    <span>{a.code} — {a.name}</span>
                    <span style={{ fontWeight: 500 }}>Rp {Math.abs(a.currentBalance).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#3b82f6', fontWeight: 600 }}>
                  <span>Laba Bersih Tahun Berjalan</span>
                  <span>Rp {netIncome.toLocaleString('id-ID')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14.5, borderTop: '2px solid #1e293b', paddingTop: 8, marginTop: 10, color: '#1e293b' }}>
                  <span>TOTAL PASIVA (HUTANG + EKUITAS):</span>
                  <span style={{ color: '#10b981' }}>Rp {(totalLiabilities + totalEquity).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cash Flow */}
      {activeTab === 'cash_flow' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            Laporan Arus Kas Operasional (Direct Cash Flow)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>Penerimaan Kas dari Pelanggan (Inflow Penjualan)</span>
              <strong style={{ color: '#10b981' }}>
                +Rp {store.customerPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('id-ID')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>Pembayaran Kas ke Pemasok (Outflow Pengadaan)</span>
              <strong style={{ color: '#ef4444' }}>
                -Rp {store.supplierPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('id-ID')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>Pengeluaran Kas untuk Beban Operasional & Kantor</span>
              <strong style={{ color: '#ef4444' }}>
                -Rp {store.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('id-ID')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>Pengeluaran Kas untuk Pembayaran Gaji Karyawan</span>
              <strong style={{ color: '#ef4444' }}>
                -Rp {store.payrollRuns.reduce((s, p) => s + (p.totalNetSalary ?? p.totalNet ?? 0), 0).toLocaleString('id-ID')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, marginTop: 10 }}>
              <span>ARUS KAS BERSIH:</span>
              <span style={{ color: '#10b981' }}>
                Rp{' '}
                {(
                  store.customerPayments.reduce((s, p) => s + p.amount, 0) -
                  store.supplierPayments.reduce((s, p) => s + p.amount, 0) -
                  store.expenses.reduce((s, e) => s + e.amount, 0) -
                  store.payrollRuns.reduce((s, p) => s + (p.totalNetSalary ?? p.totalNet ?? 0), 0)
                ).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
