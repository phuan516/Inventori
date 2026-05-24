# Inventori

A free, simple inventory tracker for independent hobby shops — Gunpla, scale models, figures, and related products. The core idea: **your data lives in a Google Sheet you own.** Inventori is just a nicer face on top of it.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Inline styles** with a shared token object (`src/lib/theme.ts`) — no CSS framework
- **Google Identity Services (GIS)** for sign-in *(not yet implemented — see below)*
- **Google Sheets API** for data persistence *(not yet implemented)*
- **Next.js API routes** (`src/app/api/`) will handle all backend calls to Google

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign-in is currently mocked — clicking **Continue with Google** on the login page sets a mock user (`Kenji Saito / Saito Hobby`) and navigates to the dashboard. No Google credentials are required to run locally.

## Project structure

```
src/
  app/
    layout.tsx              # root layout — Geist fonts, AuthProvider
    globals.css             # resets, animation keyframes
    page.tsx                # / — landing page
    login/page.tsx          # /login
    inventory/page.tsx      # /inventory — full dashboard
    settings/page.tsx       # /settings — placeholder
    api/                    # backend routes (Google Sheets API calls go here)
  components/
    ui/                     # Panel, Btn, Pill, Field, Input, Select, Icon, ImgPlaceholder, Toast
    Logo.tsx
    GoogleButton.tsx
    inventory/
      Sidebar.tsx
      Topbar.tsx
      FilterBar.tsx
      InventoryTable.tsx    # TableHeader, Row, EmptyState
      ProductDrawer.tsx     # slide-in detail/edit panel + delete confirm
      AddProductModal.tsx   # add-product form modal
  context/
    AuthContext.tsx          # auth state — replace signIn() with real GIS flow
  lib/
    theme.ts                # design tokens (T object)
    types.ts                # Product, User, and filter/sort types
    data.ts                 # seed data (18 products) + statusOf() helper
```

## What's built

| Page | Route | Status |
|---|---|---|
| Landing | `/` | Done |
| Login | `/login` | Done (mock sign-in) |
| Inventory dashboard | `/inventory` | Done |
| Product drawer | `/inventory` (overlay) | Done |
| Add product modal | `/inventory` (overlay) | Done |
| Settings | `/settings` | Placeholder |

All UI interactions work against in-memory state seeded from `src/lib/data.ts`.

## What's not built yet

- **Google OAuth** — `AuthContext.signIn()` is a stub. Wire it up with Google Identity Services (GIS) and store the access/refresh token.
- **Google Sheets API** — add routes under `src/app/api/` to create, read, and write the user's sheet. The sheet schema mirrors the `Product` type: one row per SKU with columns `id | sku | name | cat | grade | mfr | series | stock | low | price | cost | hue`.
- **Real-time sync** — on every `items` mutation, debounce-flush to the sheet (250–500ms). On 401, refresh via GIS and retry.
- **URL-routable drawer/modal** — drawer and add modal currently use React state. Switch to `useSearchParams` (`?product=p01`, `?adding=1`) so deep-links and browser back-button work.
- **Barcode scanner** — the "Scan barcode" button is a placeholder.
- **CSV export** — the "Export CSV" button is a placeholder.
- **Reports page** — listed in the sidebar as "Soon".

## Adding Google OAuth + Sheets

1. Replace `signIn()` in `src/context/AuthContext.tsx` with a real GIS popup flow that yields an access token and user profile.
2. Store the token (httpOnly cookie or server session).
3. Add API routes:
   - `POST /api/sheets/init` — create the sheet on first sign-in
   - `GET  /api/sheets/items` — read all rows
   - `PUT  /api/sheets/items` — batch-write mutations
4. In `src/app/inventory/page.tsx`, replace the `SEED` initial state with a fetch to `GET /api/sheets/items`, and wire mutations to `PUT /api/sheets/items`.

See `spec.md` for the full product and data specification.
