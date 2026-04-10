# Product Requirements Document
## RCPL rPET QR Code Information System
**Version:** 1.0 | **Date:** April 2026 | **Author:** Ashish Chandorkar | **Status:** Approved

---

## 1. Executive Summary

RCPL (dairy/FMCG) requires a QR Code-based product information system for their **rPET** product line. A QR code has been purchased from QR Planet. This system provides three independent components: a consumer-facing landing page, a product information display page, and a regulatory team admin portal. The system must be fully independent from existing RLL/RCPM QR systems.

**Key Deliverable:** A URL that RCPL's regulatory team maps to the QR Planet-hosted QR code. Consumers scan the QR code on the bottle, enter the batch code, and get manufacturer/FSSAI compliance details.

---

## 2. Problem Statement

### Consumer Problem
Consumers purchasing RCPL rPET products have no easy way to verify product authenticity, manufacturer details, or FSSAI compliance information. Regulatory requirements mandate this information be accessible.

### Regulatory Team Problem
The existing vendor management system (IT team, used for RLL/RCPM) cannot be modified or extended. A new independent system is needed to manage rPET product information that the regulatory team can update without IT dependency.

### Technical Problem
Connecting a QR code → landing page → dynamic product lookup requires a 3-tier architecture (admin data entry → database → consumer UI) that doesn't exist for the rPET product line.

---

## 3. Stakeholders

| Stakeholder | Role | Needs |
|---|---|---|
| Consumers | End users scanning QR code | Fast, mobile-friendly product info display |
| Regulatory Team (Nidhi et al.) | Data managers | Simple form to add/edit rPET product records |
| RCPL IT (Ashcharna/Pankaj) | Technical reference | New system, no changes to existing |
| Ashish Chandorkar | Developer | Clear requirements, URL to provide to QR Planet |
| QR Planet | QR code provider | Landing page URL to attach to QR code |

---

## 4. User Stories

### Consumer (Persona: End Customer)
- **US-01** As a consumer, I want to scan the QR code on my rPET bottle and see the manufacturer details, so I can verify product authenticity.
- **US-02** As a consumer, I want to enter only 1-2 characters from the bottle neck batch code, so the process is quick on mobile.
- **US-03** As a consumer, I want to see FSSAI license number, vendor name, address, and product category, so I have complete compliance information.
- **US-04** As a consumer, I want the page to load fast on mobile data, so I don't wait more than 3 seconds.

### Regulatory Team (Persona: Nidhi / Admin)
- **US-05** As a regulatory team member, I want to add new rPET product records with all required fields, so consumer-facing information stays current.
- **US-06** As a regulatory team member, I want to edit existing product records, so I can update FSSAI licenses or addresses when they change.
- **US-07** As a regulatory team member, I want to deactivate a product record, so outdated or discontinued products don't show to consumers.
- **US-08** As a regulatory team member, I want to search products by vendor name or category, so I can find records quickly.

---

## 5. Functional Requirements

### P0 — Must Have (Launch Blockers)

| ID | Requirement |
|---|---|
| FR-01 | Consumer landing page with QR scan instructions (3-5 lines) and batch code search box |
| FR-02 | Batch code entry: 1-10 alphanumeric characters, case-insensitive, auto-uppercase |
| FR-03 | On valid code entry, display: Product Name, Category, Subcategory, Vendor Name, Vendor Address, Manufacturer, FSSAI License, SKU, Status |
| FR-04 | Admin form to CREATE product records with all fields |
| FR-05 | Admin form to EDIT existing product records |
| FR-06 | Inactive products show "information not available" message to consumers (not a 404) |
| FR-07 | Invalid/non-existent codes show "product not found" with a clear message |
| FR-08 | System provides a standalone URL that maps to the landing page |

### P1 — Should Have

| ID | Requirement |
|---|---|
| FR-09 | Admin product list with search (by vendor, category, batch code) |
| FR-10 | Pagination on admin product list |
| FR-11 | Admin soft-delete (deactivate) with confirmation modal |
| FR-12 | Input validation: FSSAI must be exactly 14 digits |
| FR-13 | Rate limiting on public lookup endpoint (100 req/15 min) |
| FR-14 | Health check endpoint at /health |

### P2 — Nice to Have

| ID | Requirement |
|---|---|
| FR-15 | Admin portal authentication (login with credentials) |
| FR-16 | Audit log of all admin changes |
| FR-17 | Bulk import via CSV |
| FR-18 | QR code generation preview in admin |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Consumer pages load in < 3s on 4G mobile; API response < 500ms |
| Mobile-first | Landing page and product info page optimized for 375px+ screens |
| Security | Helmet.js security headers; input sanitization; no SQL injection vectors; rate limiting |
| Availability | 99% uptime; SQLite WAL mode for concurrent reads |
| Independence | Zero dependencies on existing RLL/RCPM vendor management system |
| URL Stability | The public URL must not change once mapped to QR Planet |

---

## 7. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  QR Planet (3rd party)                                  │
│  QR Code → maps to → https://[your-domain]/            │
└────────────────────┬────────────────────────────────────┘
                     │ Consumer scans QR
                     ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + Tailwind, Vite)                      │
│  /              → Landing Page (search box)             │
│  /product/:code → Product Info Page                     │
│  /admin/*       → Admin Portal (CRUD forms)             │
└────────────────────┬────────────────────────────────────┘
                     │ REST API calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                            │
│  GET /api/products/lookup?code=XX  ← Public            │
│  GET/POST/PUT/DELETE /api/admin/*  ← Regulatory team   │
│  Rate limiting + Helmet + CORS                          │
└────────────────────┬────────────────────────────────────┘
                     │ better-sqlite3
                     ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE (SQLite)                                      │
│  Table: rpet_products                                  │
│  batch_code (UNIQUE), category, vendor_name,           │
│  fssai_license, status, ...                            │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Data Model

### Table: `rpet_products`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal ID |
| batch_code | TEXT | UNIQUE, NOT NULL, COLLATE NOCASE | Printed on bottle neck |
| category | TEXT | NOT NULL | e.g. Dairy |
| subcategory | TEXT | NOT NULL | e.g. Full Cream Milk |
| vendor_name | TEXT | NOT NULL | Manufacturer unit name |
| vendor_address | TEXT | NOT NULL | Full address with PIN |
| fssai_license | TEXT | NOT NULL | 14-digit FSSAI number |
| sku | TEXT | nullable | Stock Keeping Unit |
| product_name | TEXT | nullable | Full product name |
| manufacturer | TEXT | nullable | Parent company |
| status | TEXT | DEFAULT 'active', CHECK IN ('active','inactive') | Active/Inactive |
| created_at | TEXT | DEFAULT datetime('now') | ISO timestamp |
| updated_at | TEXT | DEFAULT datetime('now') | ISO timestamp |

---

## 9. API Specification

### Public Endpoints

#### `GET /api/products/lookup?code={batchCode}`
- **Purpose:** Consumer product lookup
- **Auth:** None
- **Rate limit:** 100 req / 15 min
- **Query params:** `code` — alphanumeric, 1-10 chars
- **Response 200:** `{ success: true, data: RpetProduct }`
- **Response 400:** Invalid code format OR inactive product
- **Response 404:** Product not found

### Admin Endpoints

#### `GET /api/admin/products?page=1&limit=20`
**Response 200:** `{ success: true, data: { data: RpetProduct[], total, page, limit, totalPages } }`

#### `GET /api/admin/products/:id`
**Response 200:** `{ success: true, data: RpetProduct }`

#### `POST /api/admin/products`
**Body:** `{ batch_code, category, subcategory, vendor_name, vendor_address, fssai_license, sku?, product_name?, manufacturer?, status? }`
**Response 201:** `{ success: true, data: RpetProduct, message: "Product created successfully" }`

#### `PUT /api/admin/products/:id`
**Body:** Any fields except `batch_code`
**Response 200:** `{ success: true, data: RpetProduct }`

#### `DELETE /api/admin/products/:id` (soft delete)
**Response 200:** `{ success: true, message: "Product deactivated successfully" }`

---

## 10. UI/UX Requirements

### Page 1: Consumer Landing Page (`/`)
- Mobile-first, full-screen blue gradient background
- RCPL logo (text-based) + "rPET Product Information" subtitle
- White card with blue header containing scan icon + "Product Verification" title
- Blue instructional box with 3-step guide
- Large centered input field (monospace, auto-uppercase, 2 chars typical)
- Full-width "Get Product Details →" button
- FSSAI compliance footer

### Page 2: Product Information Page (`/product/:code`)
- Blue gradient header with back button + batch code display
- Product name hero card with status badge (green=active)
- Info card 1: Product Details (Category, Subcategory, SKU, Product Name)
- Info card 2: Manufacturer Details (Manufacturer, Vendor Name, Address)
- Info card 3: Compliance (FSSAI License, Batch Code, Status)
- Loading state: animated shimmer skeleton cards
- Error state: centered error card with "Try Again" button

### Page 3: Admin Portal (`/admin/*`)
- Sidebar navigation (collapsible on mobile)
- Responsive data table with search + pagination
- Create/Edit form with validation inline
- Confirmation modal for deactivation
- Toast notifications for success/error

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Consumer page load time | < 3 seconds on 4G |
| API lookup response time | < 500ms P95 |
| Admin form error rate | < 2% of submissions |
| QR code scan → info display | < 10 seconds end-to-end |
| Regulatory team onboarding | < 30 min with zero training |

---

## 12. Out of Scope

- Integration with existing RLL/RCPM vendor management system
- Consumer authentication or account creation
- QR code generation (handled by QR Planet)
- Email/SMS notifications
- Multi-language support
- Mobile app (PWA is acceptable future enhancement)

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| QR Planet URL mapping delay | Low | High | Provide URL early; test with direct URL first |
| Regulatory team needs more fields | Medium | Medium | Schema designed to add columns easily |
| Mobile network failures | Medium | High | Error states with retry; loading skeletons |
| SQLite concurrency under load | Low | Medium | WAL mode enabled; upgrade to Postgres if needed |
| Admin portal misuse (no auth) | Medium | Medium | P2: Add auth in sprint 2 |

---

## 14. Acceptance Criteria

- [ ] Consumer can scan QR, enter "AA", see full product details within 10 seconds
- [ ] Inactive product code returns "information not available" (not 404)
- [ ] Non-existent code returns friendly "product not found" message
- [ ] Admin can create a new product record with all required fields
- [ ] Admin can edit vendor address and FSSAI license number
- [ ] Admin can deactivate a product (soft delete)
- [ ] FSSAI validation rejects anything that is not exactly 14 digits
- [ ] All pages render correctly on iPhone SE (375px) screen width
- [ ] CI/CD pipeline passes: lint → test → build → security audit

---

## 15. Delivery Plan

| Phase | Deliverable | Timeline |
|---|---|---|
| Phase 0 | Foundation: CLAUDE.md, package.json, tsconfig, CI/CD | Day 1 |
| Phase 1 | Backend API: Express + SQLite + all endpoints | Day 1 |
| Phase 2 | Frontend: Landing Page + Product Info Page | Day 1-2 |
| Phase 3 | Admin Portal: List + Create/Edit forms | Day 2 |
| Phase 4 | Testing: Unit + integration tests | Day 2 |
| Phase 5 | Review, security check, URL delivery to QR Planet | Day 3 |
| Phase 6 | Regulatory team demo + feedback | Week 2 |
