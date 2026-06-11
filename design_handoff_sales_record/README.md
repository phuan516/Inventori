# Handoff: Sales Discounts (Record a Sale)

## Overview

The **Record a Sale** register — a scan-first "Quick ticket" point-of-sale screen for the Inventori inventory app — is **already built**. This handoff adds **discounts** to it. The work is purely additive: the scan field, ticket list, hold/held, qty steppers, and "Record sale" flow stay exactly as they are; we layer three discount surfaces on top.

**Three discount surfaces:**
1. **Item discount** — `% off`, `$ off`, or **set a new unit price** on a single ticket line.
2. **Sale discount** — one `% off` / `$ off` applied to the **whole ticket**.
3. **Partial-quantity discount** — when a line's `qty > 1`, discount **only N of those units** (e.g. one damaged box out of three); the remaining units stay at full price.

> **Discounts are price adjustments on the sale record only.** Inventori does **not** process payment — there is no card, no cash drawer, **no tax, and no tender step** anywhere in this feature. Recording the sale deducts the **full quantity** from stock regardless of discount; only the recorded **sale value** changes. Money itself is handled by whatever till the shop already uses.

## About the Design Files

The files in this bundle are **design references created in HTML** — wireframe prototypes showing intended layout and behavior, **not production code to copy directly**. They are built with React + inline Babel purely so the prototype runs in a browser; that stack is **not** a recommendation.

Your task is to **recreate these designs in the register's existing codebase**, using its established components, patterns, and styling (the `Panel`, `Btn`, `Stepper`, pill, and popover primitives the register already uses). Read the HTML/JSX to understand structure and exact measurements, but implement with the real app's component library and design tokens — do not ship the HTML.

## Fidelity

**Low-fidelity (lofi) — grayscale wireframes.** The mocks deliberately use a desaturated palette so the focus stays on **structure, copy, and interaction**, not final visual styling. Use them as the source of truth for:
- which affordances exist and where they sit,
- the popover's fields and flow,
- the exact copy and the totals math,
- relative sizing and spacing.

Apply the register's **own** live styling for color, type, elevation, and motion (see Design Tokens for the intended target values). Geometry in the wireframe is accurate and can be matched closely; color in the wireframe is a placeholder.

## Screens / Views

The wireframe (`Record a Sale (B) — Discounts.html`) is a pan/zoom canvas with **three sections / six artboards**.

### What gets added to the existing register

| Existing register element | Discount addition |
|---|---|
| **Ticket line row** | A muted, dashed **"⊘ Add discount"** chip under the item name (indented past the thumbnail). Once a discount exists, it is replaced by an **applied-discount pill**: `⊘ −10% · Loyalty │ EDIT`. |
| **Affected line — Price & Total cells** | Original value **struck through** with the adjusted value beneath it (mono). |
| **Secondary actions row** (`Attach customer · Add note`) | A third button: **"Add sale discount"**. When a sale discount is active it becomes a filled/primary button showing the value (`Sale discount · 10%`). |
| **Content column** (above the sticky bar) | A new **Totals card** — rendered only when at least one discount is active. |
| **Sticky record bar** | Big total shows the **net** (post-discount) value; overline switches from `N items · Sale total` to `N items · N discounts applied`. The behavior hint ("Records the sale and deducts N units from stock") is unchanged. |

### Section 01 · Discounts in the register
- **Artboard A — At rest.** Shows where the affordances live: per-line "Add discount" chips + "Add sale discount" in the actions row. No discounts applied yet.
- **Artboard B — Three discounts applied.** Nu Gundam line has a −10% item discount; Gouf line has a partial-qty discount (1 of 2 units, "damaged box"); plus a 10% sale discount. The **Totals card** is visible.

**Totals card layout** (a standard `Panel`, full content width, appears above the sticky bar):
```
Subtotal · 4 units            $146.96
⊘ Item discounts (2)          −$14.00
⊘ Sale discount · 10%         −$13.30
────────────────────────────────────
Sale total                    $119.66       ← 20px mono, bold
⊘ Customer saves $27.30 on this sale         ← 11.5px mute
```
Rows: label left, mono value right. Discount rows carry the `⊘` tag glyph. A 1px rule separates the discount rows from the bold "Sale total". The optional "Customer saves" line sums all discounts.

### Section 02 · Item discount popover
Tapping a line's discount chip/pill opens a **popover anchored to that row** (≈312px wide, panel background, 12px radius, soft drop shadow `0 20px 50px rgba(0,0,0,.18)`). Top → bottom:

- **Header** — title "Item discount" + secondary line with item name / SKU (or `qty N`) + an `×` close button.
- **Type toggle** — full-width segmented control, 3 segments: **`% off` · `$ off` · `Set price`**. Active segment = solid ink fill, white text. `Set price` overrides the unit price directly (e.g. mark one unit down to $71.99 each).
- **Amount field** — 52px tall, 1.5px active border, 9px radius. Large mono entry (24px, weight 600) with a contextual prefix/suffix: `% off`, `$ … off`, or `$ … each`. Below it, a row of **quick-value chips** — `5% 10% 15% 20%` (pct) or `$2 $5 $10 $20` (amt). One chip can be shown pre-selected (ink fill).
- **Apply to** — the partial-quantity control, **rendered only when `qty > 1`** (see Section 03).
- **Reason** (optional) — a select labelled "REASON": `Floor model`, `Damaged`, `Staff`, `Loyalty`, `Clearance`, `Other`. Stored as metadata for reporting.
- **Footer** — `Remove` (subtle, left-aligned) · spacer · **`Apply discount`** (primary, check icon). The header `×` cancels without saving.

Artboards: **A — single unit (qty = 1)** (no partial control) and **B — multi-unit (qty > 1)** (partial control visible, shown in `$ off` mode).

### Section 03 · Partial quantity & sale discount
**Partial-quantity control** ("Apply to" block, only when `qty > 1`) — two radio options:
- **All N units** — discount applies to every unit on the line.
- **Part of the quantity** — a `−` / count / `+` stepper picks **how many of the N units** the discount hits (e.g. `1 of 2`); the remaining units stay at full price. Sub-label example: "Only some units (damaged box, floor model…)".

**Resulting line** (Artboard A) — the line keeps its single qty stepper but renders a **breakdown** beneath the applied-discount pill, one sub-row per price tier:
```
HG Gouf Custom                    $24.99   − 2 +     $44.98   (was $49.98)
   ⊘ 1 unit −$5.00 · Damaged box │ EDIT
   [1] × $24.99   full price                         $24.99
   [1] × $19.99   −$5.00 · damaged box               $19.99
```
Each sub-row: a small boxed qty count, `×`, the unit price, the reason tag (faint), and the row subtotal (right). **Stock still deducts the full quantity (2)** — only the recorded value is reduced.

**Sale-level discount popover** (Artboard B) — "Add sale discount" opens the **same popover component**, titled "Sale discount" / "Applies to the whole ticket" (no per-line context, no partial control). It **stacks on top of** any item discounts and recomputes the total live. Offer `% off` / `$ off` (`Set price` is item-only). The artboard pairs the popover with a live Totals card so the stacking is legible.

## Interactions & Behavior

| Surface | Trigger | Effect |
|---|---|---|
| Line — **⊘ Add discount** chip | click | open the item discount popover anchored to that row |
| Line — applied **discount pill** | click `EDIT` | reopen the popover with current values |
| Popover — **type toggle** | click a segment | switch `% off` / `$ off` / `Set price`; reformat the amount field's prefix/suffix and chips |
| Popover — **quick chip** | click | set the amount to that value |
| Popover — **Apply to** (qty>1) | choose *All* / *Part* + adjust stepper | scope the discount to all or N units |
| Popover — **Reason** | select | attach optional reason metadata |
| Popover — **Apply discount** | click | apply the discount, strike-through the line price/total, show the pill, refresh the Totals card + sticky total, close popover |
| Popover — **Remove** | click | drop the discount from that line/ticket |
| Popover — **×** (header) | click | cancel without saving |
| Actions row — **Add sale discount** | click | open the popover in whole-ticket (sale) mode |
| **Record sale** | click | commit (see below) |

**Recording a discounted sale** — the only deltas from current register behavior:
1. Decrement each line's `stock` by its **full `qty`** (discounts never change units moved).
2. Persist each line's `discount` (including `appliesToQty` for partials) and the ticket-level `saleDiscount` on the `Sale`.
3. `Sale.total` is the **net** (post-discount) value; also store `grossTotal` and `discountTotal` so reports can show what was saved.
4. Toast and re-focus the scan field exactly as today.

**Stacking order:** item discounts apply per line first, then the sale discount applies to the **post-item-discount** subtotal.

**Motion** (match the register's existing tokens):
- Popover open: scale `.97 → 1` + opacity, ~180ms.
- Apply: briefly flag the affected line (reuse the register's new-line highlight background).
- Amount-field focus: brand-color border + 3px soft focus ring.

## State Management

```ts
type Discount = {
  mode: 'pct' | 'amt' | 'set';   // % off | $ off | set unit price
  value: number;                 // 10 (=10%), 5 (=$5), or 71.99 (=$ each)
  appliesToQty?: number;         // partial-qty: how many units; omit = whole line
  reason?: string;               // 'Floor model' | 'Damaged' | 'Staff' | …
};

// Added to the EXISTING TicketLine:
lineDiscount?: Discount;

// New ticket-level field:
saleDiscount: Discount | null;

// Derived — all recompute live on any ticket/discount change:
function unitNet(line): number;  // net $ for a line, honoring appliesToQty
const lineGross    = ticket.reduce((s, l) => s + l.price * l.qty, 0);
const lineNet      = ticket.reduce((s, l) => s + unitNet(l), 0);
const itemSavings  = lineGross - lineNet;
const saleTotal    = lineNet - applyDiscount(lineNet, saleDiscount); // % or $ off lineNet
const discountTotal = lineGross - saleTotal;   // drives the Totals-card "saves" line
```

## Design Tokens

The wireframe is grayscale; these are the **target** values to apply from the register's real system. Match your built register's tokens where they differ.

**Color (intended target):**
```css
--brand: #1f4cd8;   --brand-soft: #eef1ff;   /* primary action + focus ring */
--ink:  #0f1419;    --ink2: #3b4452;          /* primary / secondary text */
--mute: #6b7382;    --faint: #9aa1ad;         /* labels / struck-through prices */
--rule: #e6e8ec;    --rule2: #f0f1f4;         /* borders / hairlines */
--bg:   #f6f7f9;    --panel: #ffffff;         /* surfaces */
```
(The wireframe's own grayscale kit uses ink `#1b1f24`, mutes through `#8b9099`, rules `#e3e4e6`/`#eceded`, panel `#fff`, fill `#f4f4f5` — useful for reading the mock, not for shipping.)

**Type:** UI sans for labels/body; **monospace for all prices, amounts, SKUs, and the big totals**. Sizes seen in the mock — Sale total 20px/700, amount entry 24px/600, body 13px, line meta 11–11.5px, uppercase field labels 11.5px with `.04em` tracking. Struck-through originals: 11px mono, `--faint`, `line-through`.

**Spacing / radius / elevation:**
```
radius:  popover 12px · amount field 9px · pills/chips 5–6px · sub-row qty box 4px
borders: amount field active 1.5px · panels/chips 1px · dashed 1px for the rest chip
shadow:  popover 0 20px 50px rgba(0,0,0,.18) · sticky bar 0 -6px 20px rgba(0,0,0,.05)
sizes:   popover ≈312px · amount field 52px tall · type toggle + chips full-width
```

## Assets

- **Icons** — simple line icons (16px, `currentColor`): search/scan, check, chevron-down, `×`, plus the custom **`⊘` discount-tag glyph** (a price-tag with a slash). Defined in `app/icons.jsx` and inline in `app/sales-discounts.jsx`. Recreate with the register's existing icon set.
- **Product thumbnails** — gray placeholder squares (38px, 6px radius). Use real product imagery in the app.
- **Fonts** — wireframe uses Geist / Geist Mono via Google Fonts; substitute the app's own UI + mono families.
- No raster/brand assets are required to implement this feature.

## Files

| File | What it is |
|---|---|
| `Record a Sale (B) — Discounts.html` | The discount wireframes — pan/zoom canvas, three sections, six artboards. Open this in a browser to see everything. |
| `app/sales-discounts.jsx` | Discount kit (the spec components): `DiscountCard` (the popover), `TicketRowD` (a ticket line in `rest` / `item` / `partial` modes), `TotalsCard`, `DiscountPill`, `AddDiscountLink`, `AmountField`, `Radio`, `Selectish`, `PriceWas`, the `⊘` `DTag` glyph, and the `dmoney`/grid constants. |
| `app/sales-discount-screens.jsx` | The six wireframe screens assembled on the canvas (`RegisterRest`, `RegisterApplied`, `ItemPopoverQ1`, `ItemPopoverQN`, `PartialDetail`, `SalePopover`) — read these to see how the pieces compose into the register. |
| `app/sales-kit.jsx` | The shared grayscale wireframe kit (sidebar, topbar, `Panel`, `Btn`, `Stepper`, page header, image placeholder) and the `WT` token object. Mirrors the register's real layout DNA. |
| `app/icons.jsx` | Base line-icon set. |
| `design-canvas.jsx` | The pan/zoom canvas wrapper that hosts the artboards (presentation only — not part of the feature). |

## Summary for the implementer

Bolt **three discount surfaces** onto the existing Record-a-Sale register: a **per-line popover** (`% off` / `$ off` / `Set price` + optional reason), a **whole-ticket "Add sale discount"** that stacks on top, and — for lines with `qty > 1` — an **"Apply to: all / part of the quantity"** control so only some units are discounted. Surface the math in a **Totals card** (subtotal → item discounts → sale discount → sale total) and keep the sticky bar on the **net** total. Discounts are **price-only**: stock always deducts the full quantity, and there is still **no tax, tender, or payment** anywhere in the flow. The bundled HTML is a grayscale **design reference** — recreate it with the register's real components and tokens.
