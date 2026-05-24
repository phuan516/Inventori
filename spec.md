# Inventori — Product Specification

## Overview

Inventori is a free inventory management web app for independent hobby shops that sell Gunpla, scale models, anime figures, and related products. The differentiator: **the user's data lives in a Google Sheet they own.** Inventori authenticates with Google, creates one spreadsheet in the user's Drive using the `drive.file` scope, and reads/writes that file as the source of truth. There is no app-owned database.

### Core value props

- Free, always — no server storage means no server bill to pass on.
- No lock-in — the sheet exists in the user's Drive whether or not Inventori does.
- Familiar fallback — users can open and edit the sheet directly in Google Sheets at any time.

---

## Screens

### 1. Landing page (`/`)

Marketing surface for first-time visitors. Converts hobby shop owners into sign-ups by explaining the product and the "your data in your Google Sheet" model.

**Sections (top → bottom):**

| Section | Notes |
|---|---|
| Sticky header | Logo, nav links (How it works / For hobby shops / FAQ), Sign in link, primary "Open in Google" CTA |
| Hero | Two-column grid. Left: pill badge, H1, body copy, Google sign-in + demo CTAs, trust checkmarks. Right: `HeroVisual` — stacked dashboard card + Google Sheets card connected by a "Synced with…" pill. |
| How it works | 3-column step cards (01 / 02 / 03) on a white panel background |
| What's in the app | 3-column feature grid with icon tiles |
| Your data, your file | Two-column callout card — copy on left, mini Sheets preview on right |
| FAQ | 2×2 grid of Q&A pairs |
| Bottom CTA | Two-column card — headline + Google sign-in button |
| Footer | Logo, copyright, Privacy / Terms / Open source links |

All "Sign in" / "Open in Google" / "Continue with Google" CTAs navigate to `/login`.

---

### 2. Login page (`/login`)

Single-action sign-in screen. The only real CTA is **Continue with Google**.

**Layout:** Two-column, full viewport height — `minmax(0, 480px) 1fr`.

**Left panel (dark brand `#0f1419`):**
- Two radial gradient blooms (brand blue top-right, deep blue bottom-left)
- Logo at top
- Bottom-anchored: green pill ("Your sheet, in your Drive"), H2, paragraph, 3-stat row ($0 · 1 file · 0 other files)

**Right panel:**
- Top bar: Back button (→ `/`), "New here? Create an account" link
- Centered card (max-width 380px):
  - H1 "Sign in to Inventori"
  - Full-width 48px Google button (black, `#0f1419` background)
  - "or" divider
  - Two disabled provider rows (Microsoft / email) with "Coming soon" / "Not supported" badges
  - Scope reassurance card — green shield + `drive.file` mention in inline code
  - Terms/Privacy line
- Footer: copyright + Help / Privacy / Status links

**On "Continue with Google":** opens Google OAuth flow (GIS popup in production). On success, navigate to `/inventory` and persist session. Currently mocked — see `AuthContext.tsx`.

---

### 3. Inventory dashboard (`/inventory`)

The primary signed-in surface. View, search, filter, sort, and adjust stock for every product.

**Layout:** `232px 1fr`, full viewport height.

**Sidebar (232px, sticky, white, right border):**
- Header: logo tile + "Inventori" wordmark + shop name subtitle
- Nav: Inventory (active), Reports (disabled "Soon"), Settings
- Footer: user avatar (initials, colored by `user.tone`), name + email, sign-out icon

**Topbar (sticky, white, bottom border):**
- 480px search input (leading search icon, clearable ×)
- Notification bell with red dot indicator

**Body (28px horizontal padding):**
- Page heading row: overline + H1 "Inventory" + action buttons (Scan barcode ghost, Export CSV ghost, Add product primary)
- 4-up KPI strip: Products · Units on hand · Low stock (clickable → filter) · Inventory value
- Filter bar: status segmented control + category select + sort select + "Showing X of Y" + "Clear filters"
- Inventory table (Panel, horizontal scroll below 960px)

**Table columns:** image (60px) · Product (1fr) · Category (110px) · Grade (60px) · Stock (110px) · Status (110px) · Price (90px) · chevron (40px)

**Stock cell:** `−` stepper · numeric stock (colored by status) · `+` stepper · "/ N" threshold

**Empty state:** centered icon tile + message + "Clear filters" button

---

### 4. Product drawer (`/inventory` + row selected)

Full-height right-anchored overlay, 460px wide. Triggered by clicking any table row.

**Dismiss:** Esc key, backdrop click, or × button.

**Content (top → bottom):**
- Header strip: × close · SKU (mono, center) · Delete danger button
- Hero block: 120×120 image placeholder + name, manufacturer, series, status/category/grade pills
- Stock control panel: large −/+ buttons (48×48) flanking a 38px mono quantity + threshold label
- Editable fields grid (2 columns): Selling price · Cost · Low-stock threshold · Grade · Category (full width) · Manufacturer · Series
- Margin readout card: Margin % · Per unit $ · Stock value $

**Delete flow:** clicking Delete shows a confirmation overlay inside the drawer (white sheet, trash icon, Cancel + Delete buttons). On confirm: remove item, close drawer, show warn toast.

---

### 5. Add product modal (`/inventory` + adding)

Centered modal (max-width 560px, max-height 92vh). Triggered by the "Add product" button.

**Dismiss:** Esc key or backdrop click.

**Layout:**
- Header: "Add product" title + subhead + × close
- Scrollable body: Product name (full width) → SKU / Category / Manufacturer / Series / Grade / Initial stock / Low-stock threshold / Cost (2-column grid) → Selling price (full width)
- Footer: Cancel ghost + "Add to inventory" primary

**Validation:** Product name and SKU are required. Empty submit shows red "Required" under offending fields.

**On submit:** append to items list, close modal, show success toast (bottom-right, 2.4s auto-dismiss).

---

## Interactions

| Trigger | Effect |
|---|---|
| Any sign-in CTA (landing) | Navigate to `/login` |
| Login — Continue with Google | Google OAuth → navigate to `/inventory` |
| Login — Back | Navigate to `/` |
| Sidebar — sign-out | Clear session, navigate to `/` |
| Search input change | Live-filter by name OR sku OR series OR manufacturer (case-insensitive substring) |
| Search × | Clear query |
| Status segmented control | Filter by status |
| Category select | Filter by category |
| Sort select | Re-sort list |
| Clear filters | Reset query + cat + statusFilter |
| KPI "Low stock" card | Set statusFilter to `low` |
| Table row click | Open drawer for that product |
| Table `−`/`+` stepper | Decrement/increment stock (floor at 0), recolor status pill |
| Drawer Esc / backdrop | Close drawer |
| Drawer `−`/`+` big buttons | Adjust selected item's stock |
| Drawer any field | Live-update item |
| Drawer Delete → Confirm | Remove item, close drawer, warn toast |
| Add modal Esc / backdrop | Close without adding |
| Add modal submit | Validate → add → close → toast |

---

## Animations

| Class / Keyframe | Trigger | Spec |
|---|---|---|
| `.inv-fade-in` | Page enter | opacity 0 + translateY(4px) → 1 + 0, 250ms ease |
| `.inv-pop` | Modal open | scale 0.97 + opacity → 1 + 1, 180ms ease |
| `invSlide` | Drawer open | translateX(20px) + opacity → 0 + 1, 220ms cubic-bezier(.2,.7,.3,1) |
| `invToast` | Toast enter | translateY(8px) + opacity → 0 + 1, 250ms cubic-bezier(.2,.7,.3,1) |
| `.inv-spinner` | Loading | 18px circle, 2px border, brand top, 0.8s linear infinite rotate |

---

## State model

```ts
// Auth (AuthContext)
user: User | null

// Inventory page
items: Product[]
query: string
cat: 'all' | Category
statusFilter: 'all' | 'ok' | 'low' | 'out'
sort: 'updated' | 'name' | 'stockAsc' | 'stockDesc' | 'priceDesc'
selected: string | null      // product id with open drawer
adding: boolean              // add-modal open
toast: { msg, tone, id } | null

// Derived (memoized)
filtered: Product[]          // applyFilters(items, query, cat, statusFilter, sort)
kpis: { skus, total, low, out, value }
```

---

## Data model

```ts
type Product = {
  id: string;         // 'p01' — stable across syncs
  sku: string;        // manufacturer or shop barcode
  name: string;
  cat: 'Gunpla' | 'Scale Models' | 'Figures' | 'Accessories' | 'Tools';
  grade: 'HG' | 'RG' | 'MG' | 'PG' | 'SD' | '—';
  mfr: string;
  series: string;
  stock: number;
  low: number;        // low-stock threshold (per-SKU)
  price: number;      // retail
  cost: number;       // wholesale
  hue: number;        // 0–360, used to color the image placeholder
};

function statusOf(p: Product): 'ok' | 'low' | 'out' {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.low) return 'low';
  return 'ok';
}
```

**Google Sheet schema** (one row per SKU):

| Column | A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Field | id | sku | name | cat | grade | mfr | series | stock | low | price | cost | hue |

---

## Design tokens

```ts
// Colors
ink:        '#0f1419'   // primary text
ink2:       '#3b4452'   // secondary text
mute:       '#6b7382'   // tertiary text, meta
faint:      '#9aa1ad'   // placeholders, disabled
rule:       '#e6e8ec'   // primary borders
rule2:      '#f0f1f4'   // internal hairlines
bg:         '#f6f7f9'   // app background, hover
panel:      '#ffffff'   // card / surface bg
brand:      '#1f4cd8'   // cobalt — primary action
brandHi:    '#2d62ff'   // brand hover
brandSoft:  '#eef1ff'   // brand tinted bg
warn:       '#b67200'
warnSoft:   '#fdf3dd'
danger:     '#c1372f'
dangerSoft: '#fde9e6'
ok:         '#1f7a3a'
okSoft:     '#e3f3e8'

// Typography
fontSans: 'Geist', 'Inter', system-ui, sans-serif
fontMono: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace

// Radii
pill:   100px   // pills, chips, capsule buttons
card:   10px    // panels, cards
modal:  14px    // dialogs
input:  7px     // inputs, buttons
badge:  4px     // status pills

// Shadows
card:   0 1px 0 rgba(0,0,0,.02)
modal:  0 30px 80px rgba(0,0,0,.35)
drawer: -12px 0 32px rgba(0,0,0,.12)
hero:   0 30px 80px -30px rgba(15,20,25,.18), 0 4px 12px rgba(15,20,25,.04)
```

---

## Google OAuth + Sheets integration (not yet implemented)

### OAuth scope

Inventori requests two scopes:
- `openid email profile` — to identify the user
- `https://www.googleapis.com/auth/drive.file` — to create and access only the sheet Inventori creates (not the user's other Drive files)

### First sign-in flow

1. GIS popup → user grants scopes → app receives access + refresh token
2. `POST /api/sheets/init`: check if a sheet named "Inventori · {shop name}" already exists in Drive; if not, create it and write the header row
3. Store sheet ID in session; navigate to `/inventory`
4. `GET /api/sheets/items`: read all data rows and hydrate the items list

### Sync on mutation

Every change to `items` should:
1. Optimistically update local state (immediate UI response)
2. Debounce-flush to the sheet via `PUT /api/sheets/items` (250–500ms)
3. On 401, refresh token via GIS and retry once

### Planned API routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/google` | Exchange GIS code/token, set session |
| `DELETE` | `/api/auth/session` | Sign out, clear session |
| `POST` | `/api/sheets/init` | Create sheet on first sign-in |
| `GET` | `/api/sheets/items` | Read all product rows |
| `PUT` | `/api/sheets/items` | Batch-write all mutations |

---

## Routing

| Path | Screen |
|---|---|
| `/` | Landing |
| `/login` | Login |
| `/inventory` | Dashboard |
| `/inventory?product=p01` | Dashboard with drawer open *(TODO: switch from state to searchParams)* |
| `/inventory?adding=1` | Dashboard with add modal open *(TODO)* |
| `/settings` | Settings placeholder |
| `/api/...` | Backend routes (Google Sheets / Auth) |

---

## Out of scope for MVP

- Multi-shop / multi-location switching
- Pre-order tracking
- Supplier records
- Sales / POS integration
- Reports & analytics (sidebar shows "Soon")
- Mobile-specific shell (responsive but not designed for mobile-first)
- Barcode scanner camera UI ("Scan barcode" button is a placeholder)
- CSV export ("Export CSV" button is a placeholder)
