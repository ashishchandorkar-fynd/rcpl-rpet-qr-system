# RCPL rPET QR Code Information System

## Project Overview
QR Code-based product information system for RCPL's rPET product line. Consumers scan a QR code on bottles, enter the batch code printed on the bottle neck, and get manufacturer/compliance details. Regulatory team manages data via admin portal.

## Architecture
- **Frontend**: React 18 + TypeScript (strict) + Tailwind CSS + Vite — port 5173
- **Backend**: Node.js + Express + SQLite (better-sqlite3) — port 3001
- **Monorepo**: `frontend/` and `backend/` folders

## Three Components
1. **Consumer Landing Page** (`/`) — QR scan entry, batch code search box
2. **Product Info Page** (`/product/:code`) — displays SKU, manufacturer, FSSAI details
3. **Admin Portal** (`/admin/*`) — regulatory team CRUD for rPET records

## Key Rules
- Mobile-first on consumer-facing pages (landing + product info)
- This system is COMPLETELY INDEPENDENT from existing RLL/RCPM vendor management system
- New URL from this system will be mapped to QR Planet QR code
- No authentication for MVP (P2 requirement for future)
- Input validation on all forms — FSSAI must be 14 digits, batch_code alphanumeric
- Batch codes are case-insensitive (stored uppercase, lookup case-insensitive)

## Code Style
- Functional React components only, no class components
- Use @tanstack/react-query for data fetching
- Use express-validator for backend input validation
- Tailwind classes for all styling, no inline styles
- TypeScript strict mode — no `any` types

## Data Model
```
rpet_products: id, batch_code (UNIQUE), category, subcategory, vendor_name,
vendor_address, fssai_license (14 digits), sku, product_name, manufacturer,
status (active|inactive), created_at, updated_at
```
