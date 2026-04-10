# RCPL rPET QR Code Information System

**Three-component web system** for RCPL's rPET product line QR code compliance.

## What's Built

| Component | Route | Users |
|---|---|---|
| Consumer Landing Page | `/` | Consumers (QR scan → batch code entry) |
| Product Info Page | `/product/:code` | Consumers (displays FSSAI/manufacturer details) |
| Admin Portal | `/admin/*` | Regulatory team (CRUD for product records) |

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Test
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Project Structure
```
rcpl-rpet-qr-system/
├── PRD.html              ← Open in browser/Word to view full PRD
├── PRD.md                ← Markdown PRD
├── CLAUDE.md             ← AI agent context
├── frontend/             ← React 18 + TypeScript + Tailwind
│   └── src/
│       ├── pages/        ← LandingPage, ProductInfoPage, AdminPortal, AdminProductList, AdminProductForm
│       ├── components/   ← StatusBadge, Toast, LoadingSkeleton, ConfirmModal
│       ├── api/          ← API client + products functions
│       └── __tests__/    ← Vitest tests
├── backend/              ← Node.js + Express + SQLite
│   └── src/
│       ├── routes/       ← products.ts (public), admin.ts (CRUD)
│       ├── middleware/   ← errorHandler.ts
│       ├── database.ts   ← SQLite setup + seed data
│       └── __tests__/    ← Jest + Supertest tests
└── .github/workflows/    ← 4-job CI/CD pipeline
    └── ci.yml
```

## QR Planet Integration
Once deployed, provide the URL `https://your-domain.com/` to QR Planet and map it to the rPET QR code. No further configuration needed.

## Data Model
Key fields in `rpet_products` table:
- `batch_code` — printed on bottle neck, used by consumer for lookup
- `category` / `subcategory` — product classification
- `vendor_name` / `vendor_address` — manufacturer details
- `fssai_license` — 14-digit FSSAI compliance number
- `tag` — brand tag (RCPL / RRL)
- `status` — active/inactive (inactive = hidden from consumers)

## Sample Data (Seeded)
- Code `AA` → rPET Full Cream Milk (active)
- Code `BB` → rPET Toned Milk (active)
- Code `CC` → rPET Skimmed Milk (inactive — shows unavailable message)
