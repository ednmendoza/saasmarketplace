# AppHub — Enterprise SaaS/Software Marketplace Dashboard

## Original Problem Statement
Application for an organization to browse a SaaS/software marketplace with immediate categorization, logo, information, and features of each application. Delivered as a dashboard.

## User Choices
- Admin-only catalog management (JWT login)
- Apps added via BOTH manual form and AI-assisted auto-fill
- Core: Search + category filter, stats overview, detailed app view (features & screenshots)
- Preload popular sample apps
- Clean & light professional design

## Architecture
- Frontend: React (CRA + craco), Tailwind, shadcn/ui, framer-motion, sonner. Single Dashboard page.
- Backend: FastAPI, MongoDB (motor). JWT Bearer auth (localStorage). emergentintegrations LLM (Claude claude-sonnet-4-6) for AI auto-fill.
- All backend routes under /api. Frontend uses REACT_APP_BACKEND_URL.

## User Personas
- Employee/browser: discovers and evaluates apps, requests install.
- Admin/IT: manages catalog (add/edit/delete), records governance data.

## Implemented (2026-08-19)
- JWT auth: /api/auth/login, /api/auth/me. Admin seeded (admin@marketplace.com / admin123).
- App catalog: GET /api/apps (search+category), GET /api/apps/stats, GET /api/apps/{id}, POST/PUT/DELETE (admin-only).
- AI auto-fill: POST /api/apps/ai-autofill (real Claude LLM → structured metadata).
- 16 preloaded apps (Slack, Notion, Figma, GitHub, Stripe, HubSpot, Datadog, Salesforce, Zendesk, Postman, Jira, Loom, Zoom, Vercel, Linear, Framer).
- Frontend: stats bar, search, category chips w/ counts, sort, grid/list toggle, app cards (logo, badge, rating, cost, approval), detail modal (screenshots, features, compliance, governance), admin login, add/edit form (manual + AI auto-fill), delete confirmation.
- Governance fields added (2026-08-19): vendor (owned by), annual_cost, security_approved + approved_by, managed_by. Shown on cards + detail modal, editable in form, estimated by AI auto-fill. Startup migration backfills existing apps.
- Backend regression suite: /app/backend/tests/test_marketplace_api.py (18 tests passing).

## Backlog
- P1: pagination/virtualization for large catalogs; per-app real screenshot uploads (object storage).
- P2: reviews/ratings submission, favorites/bookmarks, CSV import/export, audit log of catalog changes.
- Tech debt: migrate FastAPI on_event → lifespan; tighten CORS for prod; add aria-describedby to dialogs.
