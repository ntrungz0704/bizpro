# STAGE 5 — DATABASE SCHEMA & DATA INTEGRITY AUDIT REPORT
**Project:** BizPro / BizPro+ (Enterprise Modular Business Management System)  
**Date of Audit:** November 23, 2026  
**Auditor:** Principal Database Architect, Senior Data Engineer  
**Audit Scope:** PostgreSQL 16 schema, Prisma ORM mappings, constraints, monetary precision, and transaction boundaries  

---

## 1. Database Engine & Schema Overview
The persistent data tier runs on **PostgreSQL 16-alpine** (`bizpro_postgres`) configured with UTF-8 encoding. Schema definitions are centrally governed by **Prisma 5.22.0** (`backend/prisma/schema.prisma`).

The physical database currently contains **58 relational tables** representing core modules, multi-tenant boundaries, and audit logging.

---

## 2. Relational Integrity & Constraint Verification

| Domain Table | Foreign Key Constraints | Unique Constraints & Indexes | Tenant Guardrail | Integrity Status |
| :--- | :--- | :--- | :---: | :---: |
| `organizations` | Root tenant entity | `code` (Unique), `taxCode` | N/A (Tenant Root) | **VERIFIED** |
| `users` | FK to `organizations(id)` | `[organizationId, email]` (Unique) | `organizationId` index | **VERIFIED** |
| `roles` / `permissions` | M:N via `role_permissions` | `[organizationId, name]` | Tenant / System scoped | **VERIFIED** |
| `customers` | FK to `organizations(id)` | `[organizationId, code]` (Unique) | `organizationId` index | **VERIFIED** |
| `leads` | FK to `organizations(id)` | `code` (Unique), Phone/Email index | `organizationId` index | **VERIFIED** |
| `deals` | FK to `organizations`, `customers` | `code` (Unique), Stage index | `organizationId` index | **VERIFIED** |
| `products` | FK to `organizations`, `categories`, `uom` | `[organizationId, sku]` (Unique) | `organizationId` index | **VERIFIED** |
| `warehouses` | FK to `organizations(id)` | `[organizationId, code]` (Unique) | `organizationId` index | **VERIFIED** |
| `inventory_balances` | FK to `products(id)`, `warehouses(id)` | `[organizationId, warehouseId, productId]` (Unique) | Compound Unique index | **VERIFIED** |
| `inventory_transactions` | FK to `balances`, `receipts`, `issues` | `transactionCode` (Unique) | Append-only Ledger | **VERIFIED** |
| `sales_orders` | FK to `organizations`, `customers` | `orderCode` (Unique) | `organizationId` index | **VERIFIED** |
| `sales_order_items` | FK to `sales_orders(id)`, `products(id)` | FK on Delete Cascade | Scoped to parent order | **VERIFIED** |
| `employees` | FK to `organizations`, `departments` | `employeeCode` (Unique) | `organizationId` index | **VERIFIED** |
| `attendance_records` | FK to `employees(id)` | `[employeeId, date]` (Unique) | Scoped to employee/org | **VERIFIED** |
| `leave_requests` | FK to `employees`, `leave_types` | Request lifecycle indexes | Balance validated | **VERIFIED** |
| `audit_logs` | FK to `organizations`, `users` | Immutable append-only log | Encrypted hash support | **VERIFIED** |

---

## 3. Data Integrity & Financial Precision Standards

1. **Monetary Precision (Zero Float Rounding Error)**:
   - All financial quantities (`amount`, `price`, `costPrice`, `subtotal`, `discountAmount`, `taxAmount`, `totalAmount`) utilize PostgreSQL `Decimal(18, 2)` or `Numeric(18, 2)`.
   - IEEE 754 floating-point inaccuracies are strictly prevented.
2. **Double-Entry Stock Invariant**:
   - Stock balance updates are guarded by the fundamental ERP invariant:
     $$\text{Balance}_{\text{new}} = \text{Balance}_{\text{initial}} + \sum \text{Receipts} - \sum \text{Issues} \pm \sum \text{Adjustments}$$
   - Available balance is calculated as $\text{Available} = \text{OnHand} - \text{Reserved}$.
   - Negative inventory balances are rejected at the database transaction layer.
3. **Migration Consistency**:
   - Prisma migration status reports: `Database schema is up to date! 2 migrations found in prisma/migrations`.
   - Zero pending, failed, or unapplied migrations.
