# SMM Panel — Static Admin Dashboard (Frontend Prototype)

## Original Problem Statement
Build a COMPLETE STATIC admin frontend for an SMM Panel (admin side only). No backend, DB, PHP, Node, real APIs, payments, auth or order processing. All data is static/mock. Strict stack: HTML5, Bootstrap 5.1, custom CSS, vanilla JS, jQuery + jQuery UI Sortable, Font Awesome 6. Forbidden: React/TS/Vue/Angular/Svelte/Next/Nuxt/Tailwind/Bootstrap 3-4/MUI.

## User Choices
- Accent: charcoal / muted-black
- Theme: match system (with light/dark toggle, persisted in localStorage)
- Static design only, no server required (files are the deliverable)

## Architecture
- Static `.html` files at web root + `assets/css/admin.css` (single universal stylesheet) + `assets/js/admin.js` (single universal script).
- `admin.js` injects the shared shell (sidebar + navbar + offcanvas + toast host) via `renderLayout()` on load; each page uses `body[data-page]` and puts its content inside `#page-content`. Page-specific `init*` functions render mock tables and wire interactions based on `data-page`.
- CDNs: Bootstrap 5.1.3, jQuery 3.6.0, jQuery UI 1.13.2, Font Awesome 6.5.1, Google Font "Figtree".
- Served for preview via `python3 -m http.server 3000` (preview URL routes port 3000). No real backend.

## Pages (14)
index (redirect) → admin-dashboard, admin-users, admin-orders, admin-tasks, admin-services, admin-categories, admin-providers, admin-payments, admin-tickets, admin-reports, admin-affiliates, admin-child-panels, admin-appearance, admin-settings.

## Implemented (2026-06)
- Charcoal SaaS theme, CSS variables, light/dark mode (system default + toggle + localStorage).
- Sidebar (grouped nav, active highlight, account dropdown), sticky navbar (global search, notifications w/ unread + mark-all-read, theme toggle, account menu), mobile Offcanvas.
- Dashboard: 6 stat cards, CSS bar chart, status breakdown, quick actions, recent orders/users.
- Users: table + search/filters + three-dot menu (view/edit/funds/group/reset/block/delete) + Add/Edit/Details/Funds/Group modals + confirm modals + toasts.
- Orders: table + filters + details/status/change-provider/resend modals.
- Tasks, Providers, Payments, Tickets (conversation + reply), Reports (charts + tables), Affiliates, Child Panels — all with mock data.
- Services (core): all-services table with varied feature badges + detailed **modal-xl New/Edit/Duplicate** form (sections A–V) with conditional fields (refill/auto-refill/cancel/country/non-drop/auto-complete/drip-feed/package/subscription), live price margin + drip total, user-group pricing, country chips.
- Categories: drag-to-sort (jQuery UI Sortable, handle + placeholder + auto-renumber + toast + localStorage `admin_category_order`). Category modal lists sortable services. Services also sortable per category (`admin_service_order_<catId>`).
- Appearance: branding + color swatches + live preview. Settings: two-column vertical nav with 13 grouped panels (General detailed per spec).
- Empty states, form validation, toasts, confirmation modals throughout. data-testid on interactive elements.

## Testing
- testing_agent iteration_1: all 14 pages load with no console errors; modals/toasts/filters/tabs/theme/ticket-reply verified. ~97% (only jQuery UI drag-reorder not conclusively driven by Playwright synthetic events — sortable is correctly initialized).

## Backlog / Future (P2)
- Optional: split admin.js into modules; add name/id to a few modal inputs; full a11y sweep.
- Persist a couple more UI states if desired.
