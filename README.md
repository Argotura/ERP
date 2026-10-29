# ARGOTURO ERP — Integrated Business Operations Platform

> Enterprise Resource Planning (ERP) Platform & Standalone Executive Analytics Dashboard.

A comprehensive B2B enterprise ERP platform engineered for industrial distribution and assembly manufacturing enterprises. Equipped with a mathematically balanced double-entry general ledger, Quote-to-Cash commercial workflow, Procure-to-Pay procurement cycle, shop-floor manufacturing assembly, Human Resources & monthly payroll processing, real-time perpetual inventory ledger, and an interconnected standalone Executive Analytics Dashboard.

---

## 🚀 Key Modules & Capabilities

- **Work Center**: My Work Command Center, Pending Approvals Queue, Operational Notifications, and Real-Time Activity Audit Trail.
- **CRM & Commercial Sales**: Sales Leads Pipeline, Customer Accounts & Credit Limits, Quotations, Sales Orders, Delivery Orders (DO), Customer Invoices (AR), Cash/Bank Receipts, and Sales Return RMA.
- **Procurement & Supply Chain**: Purchase Requisitions (PR), Vendor Directory, Purchase Orders (PO), Inbound Goods Receipts (GRN), Vendor Bills (AP), and Accounts Payable Disbursements.
- **Inventory & Warehousing**: 40+ Master Industrial SKUs, Multi-Warehouse Operations (Cikarang, Surabaya, Medan), Perpetual Inventory Ledger, Inter-Warehouse Transfers, Cycle Counts & Adjustments, and Automated Reorder Point Replenishment.
- **Manufacturing & Assembly**: Multi-level Bills of Materials (BOM) with standard labor and factory overhead costing, Manufacturing Orders (MO), Raw Material Issuance, and Finished Goods Intake.
- **Finance & Corporate Accounting**: Standard 5-digit Chart of Accounts (COA), Strict Double-Entry General Journal (*Total Debit === Total Credit*), General Ledger Detail, Reconciled Trial Balance, Comprehensive Profit & Loss (P&L), Balance Sheet, Direct Cash Flow Statement, and Aging Reports (AR/AP).
- **Human Resources (HR)**: Personnel Directory, Daily Clock-in/Clock-out Attendance, Leave Requests & Manager Approvals, and Monthly Payroll Processing with automatic salary expense journal posting.
- **Executive Analytics Dashboard**: Standalone visual executive application for C-Level leadership with real-time synchronized operational metrics.

---

## 💻 Local Development Setup

### 1. Run Core ERP Platform (Port 5173)
```bash
npm install
npm run dev
```
Access in your browser: `http://localhost:5173`

### 2. Run Executive Analytics Dashboard (Port 5174)
Open a separate terminal window:
```bash
npm run dashboard
```
Access in your browser: `http://localhost:5174`

---

## ☁️ Deployment Guide (Vercel)

The repository is pre-configured for seamless multi-SPA deployment on Vercel:
- **Root (`/`)** automatically serves **ARGOTURO ERP**.
- **Subpath (`/dashboard/`)** automatically serves the **Executive Analytics Dashboard**.
- The **"Executive Analytics ↗"** button in the ERP top bar smoothly navigates to `/dashboard/`.

### Method 1: Git-Based Deployment (Recommended)
1. Push this repository to GitHub or GitLab:
   ```bash
   git add .
   git commit -m "feat: complete Argoturo ERP enterprise platform"
   git push origin main
   ```
2. Navigate to your [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository.
4. Under **Build & Output Settings**:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

### Method 2: Deploy via Vercel CLI
If you have the Vercel CLI installed:
```bash
npm i -g vercel
vercel
```

---

## 🛠️ Production Build Verification
To test and verify the multi-SPA production build locally:
```bash
npm run build
npm run preview
```
Both the core ERP (`dist/`) and executive dashboard (`dist/dashboard/`) compile with exit code 0.
