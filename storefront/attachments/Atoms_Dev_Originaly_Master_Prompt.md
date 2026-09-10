# MASTER PROMPT — Originaly (اورجینالی) E-Commerce Platform Evolution
### Development Directive for Atoms.dev — grounded in the real, already-deployed codebase

---

You are the **Lead Full-Stack E-Commerce Architect & Motion/UI Designer** continuing development of **Originaly (اورجینالی)** — a live Persian-language sneaker/apparel resale storefront (`originally.ir`, owner: پژوهان‌مهر, based in Nazarabad, Alborz). You have been given the project's real codebase. Before changing anything, confirm you have located these exact files, because every instruction below assumes them as the current state:

- **Stack**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui (`app/frontend/`), Supabase (Postgres + Auth + client SDK) as the backend (`app/frontend/src/lib/store.ts`), with a real connected Supabase project (`SUPABASE_URL`, `SUPABASE_ANON_KEY` already set — do not regenerate these).
- **Current data model**: a single flat `Product` type with `category` (free text) and `gender` (`men` / `women` / `unisex`) fields, `Cart`/`Order` types, and existing pages `Home.tsx`, `Shop.tsx`, `ProductDetail.tsx`, `Cart.tsx`, `Admin.tsx`.
- **Current scope**: shoes only (see `public/assets/products/`), no clothing category yet, no phone verification, no real payment gateway (`payment_method` is currently a plain string with no gateway logic behind it).
- **Already present and must be reused, not rebuilt**: `productsToWooJSON()` and `productsToCSV()` in `store.ts` — a WooCommerce export bridge already exists; extend it, don't replace it.
- **Visual identity today**: dark navy/near-black background (`hsl(240 10% 5%)`) with a warm gold/amber primary accent (`hsl(42 70% 55%)`), Vazirmatn font, full RTL. This is the *current* premium-dark-gold look — the client has asked for this to evolve (see §5).

Do not restart the project or change the backend provider. **Extend** what exists.

---

## 1. New Category Architecture — Clothing + Footwear, Fully Nested

Replace the current flat `category: string` field with a **three-level taxonomy**: Department → Gender → Subcategory. This is a real data-model migration, not just a UI relabel.

```
Department: پوشاک (Clothing)
├── مردانه (Men)
│   ├── تیشرت اورجینال (Original T-Shirts)
│   ├── لباس اورجینال (Original Apparel)
│   ├── کاپشن اورجینال (Original Jackets)
│   ├── ست ترند اورجینال (Original Trend Sets)
│   └── [additional trending subcategories — see §1.1]
└── زنانه (Women)
    ├── تیشرت اورجینال (Original T-Shirts)
    ├── مانتو اورجینال (Original Manteau/Coats)
    ├── ست ترند اورجینال (Original Trend Sets)
    └── [additional trending subcategories — see §1.1]

Department: کفش (Footwear)
├── مردانه (Men)
│   ├── کوهستانی (Hiking/Outdoor)
│   ├── اسپرت (Sport)
│   └── [additional trending subcategories]
└── زنانه (Women)
    ├── کوهستانی (Hiking/Outdoor)
    ├── اسپرت (Sport)
    └── [additional trending subcategories]
```

### 1.1 Additional subcategories (fill out both departments — do not leave them thin)

Add current, trend-relevant subcategories the client didn't explicitly list but expects a professional store to have — for example: شلوار (pants/denim), هودی/سویشرت (hoodie/sweatshirt), اکسسوری (accessories: caps, bags, socks) under Clothing; کتانی روزمره (everyday sneakers), کتانی دویدن (running), صندل/دمپایی (sandals) under Footwear. Use real, current streetwear/sneaker-resale market category naming — this is a resale-authentic ("اورجینال") store, so category names should read as trustworthy and specific, not generic.

### 1.2 Data model changes required

- `products` table: replace `category` (free text) with `department_id`, `gender`, `subcategory_id` (foreign keys to a new `categories` table with `parent_id` for nesting).
- New `categories` table: `id, slug, name_fa, name_en, parent_id, department (clothing|footwear), sort_order, icon`.
- Migrate existing shoe products into `کفش` with a sensible default subcategory; do not lose existing product data.
- `productsToWooJSON()` / `productsToCSV()` (§6) must be updated to emit WooCommerce's native nested category format (`categories: [{name, parent}]`) so the taxonomy survives the eventual WordPress migration.

### 1.3 Navigation UI

Rebuild the header navigation as a **mega-menu**: Department tabs (پوشاک / کفش) → Gender columns → Subcategory links with a small representative product thumbnail per subcategory (not just text), matching the existing glass/gold visual language until §5's restyle lands.

---

## 2. Motion & Visual Effects — Be Specific, Not Vague

"Make transitions amazing" is not actionable; implement these concretely:

1. **Page/route transitions**: use `framer-motion`'s `AnimatePresence` with a shared-layout crossfade + subtle scale (0.98 → 1) and a directional slide matching RTL (enter from the visual left, since content flows right-to-left) — 250–350ms, easing `cubic-bezier(0.16, 1, 0.3, 1)` ("ease-out-expo" feel).
2. **Category tile hover/press**: 3D tilt-on-hover (`framer-motion`'s `useMotionValue` + `rotateX`/`rotateY` bound to pointer position, max ±6°), a soft gold glow (`box-shadow` pulse using the existing `--primary` token), and a bold-weight label transition (`font-weight: 500 → 700`) on hover/focus — apply consistently across every clickable category/product tile, not just one page.
3. **Active-state highlighting**: every navigation item, filter chip, and size selector must have a single consistent "active" treatment (filled background using `--primary`, `scale(1.03)`, and a 150ms spring) reused as one shared component/class — not styled ad hoc per page.
4. **Micro-interactions**: add-to-cart should trigger a small flying-image-to-cart-icon animation (`framer-motion` `layoutId` shared element transition from the product image to the cart badge) plus a badge-count bounce.
5. **Loading/skeleton states**: replace any blank loading gaps with shimmer skeletons matching the final layout's shape (shadcn's `Skeleton` component already in the project — use it everywhere data is fetched, not just on the product grid).
6. Respect `prefers-reduced-motion`: every animation above must have a reduced/instant fallback — this is a real accessibility requirement, not optional polish.

---

## 3. Customer Database + Mandatory Phone (OTP) Verification

### 3.1 Why this needs a real architecture decision now (Iran-specific)

International SMS providers (Twilio, etc.) do not reliably or affordably deliver OTP SMS to Iranian mobile numbers. Design the OTP layer against a **real Iranian SMS gateway** from day one, even before it's activated — e.g. **Kavenegar**, **Melipayamak**, **IPPanel**, or **Faraz SMS** (any one is fine; pick one and keep the adapter swappable). Do not design around Twilio.

### 3.2 Required flow

1. User registers with name + phone number.
2. Backend (Supabase Edge Function, matching this project's existing `skills_docs/supabase_edge_functions.md` pattern) calls the SMS provider's OTP-send API, stores a hashed OTP + expiry (5 minutes) in a `phone_verifications` table.
3. User enters the received code; an Edge Function verifies it against the stored hash and marks the account `phone_verified_at`.
4. **Checkout is blocked** (button disabled with a clear inline message) until `phone_verified_at` is set — enforce this both in the UI and as a server-side check (Postgres Row Level Security policy or Edge Function guard) so it cannot be bypassed by editing client code.
5. Until the real SMS provider API key is supplied, build the entire flow with the provider call abstracted behind one function (`sendOtpSms(phone, code)`) that currently logs to a `sms_log` table instead of actually sending — so the moment a real API key is added, only that one function changes.

### 3.3 Structured customer/address database (Admin panel)

Add to the Admin panel a new **"مشتریان" (Customers)** section, separate from the existing product/order management, with:
- `customers`: id, name, phone, phone_verified_at, created_at, total_orders, total_spent (computed).
- `addresses`: id, customer_id, address, city, postal_code, is_default — a customer can have multiple saved addresses.
- A searchable, sortable, filterable table (by city, verification status, order count, date range).
- **Export to CSV** (reuse the existing `downloadFile()` helper already in `store.ts`) for two real, named use cases the client stated: (a) SMS marketing campaigns, (b) tax/accounting submission. Make sure the exported CSV includes exactly the fields an Iranian tax filing or SMS campaign tool would need (name, verified phone, city, postal code, total purchases, order dates) — not an arbitrary field dump.
- Note in the admin UI, visibly, that customer phone numbers and addresses are personal data — access to this page should be restricted to the authenticated admin account only (already enforced via `ADMIN_EMAIL` in `store.ts`; extend the same guard to this new section, don't create a separate weaker check).

---

## 4. Payment Gateway — ZarinPal Integration Point (Ready, Not Yet Live)

The client does not have ZarinPal merchant credentials yet. Build the **complete integration scaffold** so activation later requires only adding one credential:

1. Add a `payment_gateway` abstraction: `createPaymentRequest(order)` → returns a redirect URL, `verifyPayment(authority, status)` → confirms and updates `orders.payment_status`.
2. Implement the ZarinPal adapter concretely (ZarinPal's REST API is simple and well-documented: `request.json` → redirect to `https://www.zarinpal.com/pg/StartPay/{authority}` → `verify.json` on return) as a Supabase Edge Function, reading the merchant ID from an environment variable (`ZARINPAL_MERCHANT_ID`) that is currently empty/placeholder.
3. Until that variable is set, the checkout page must clearly show **"پرداخت آنلاین (به‌زودی)"** and fall back to the already-existing manual/offline payment_method option — never silently fail or show a broken payment button.
4. Design the `orders.payment_method` field and checkout UI to support adding a second gateway later (e.g., another Iranian PSP) without a rewrite — same adapter pattern, just register a second implementation.

---

## 5. Visual Redesign — Modern, Youthful, On-Trend (Replace, Don't Patch, the Current Theme)

The current dark-navy/gold look must be evolved into something more contemporary and youth-oriented while staying premium (this is a resale-authenticity store, not a discount outlet — the new look must still say "trustworthy" and "اورجینال," not "cheap"). Concretely:

- Design direction options to choose from (pick one coherent direction, don't blend all of them): **(a)** a vivid gradient-mesh dark theme (deep charcoal base + electric gradient accents — violet-to-cyan or magenta-to-orange — used sparingly on CTAs and highlights, not the whole page), **(b)** a glassmorphism 2.0 look (frosted translucent cards, soft multi-layer shadows, subtle animated gradient backgrounds), or **(c)** a bold bento-grid layout for the homepage (asymmetric card grid showcasing categories/drops) paired with kinetic typography on hero headlines.
- Whichever direction is chosen, define it as a proper design-token update in `tailwind.config.ts` and the `:root` CSS variables in `src/index.css` — not one-off inline styles — so it stays consistent across every page and survives future edits.
- Keep full Vazirmatn/RTL support and accessible contrast ratios (WCAG AA minimum) through the restyle; a trendier theme must not become harder to read.

---

## 6. WordPress Portability — What "Portable" Honestly Means Here

A Vite/React SPA cannot become a literal WordPress theme without a full rewrite — be upfront about this rather than implying a one-click conversion. What **is** realistic and must be delivered:

1. **Keep and extend the existing `productsToWooJSON()` / `productsToCSV()` bridge** (§1.2) so the full product catalog — including the new nested categories, images, sizes, and pricing — can be imported into a WooCommerce store via WooCommerce's native CSV/REST importer at any time.
2. **Keep the data layer swappable**: all Supabase calls should stay inside `lib/store.ts`'s exported functions (already the pattern) rather than being called directly from UI components — so if the client later moves to a WordPress + WooCommerce REST API backend instead of Supabase, only `store.ts`'s internals change, not every page.
3. Provide a short `docs/WORDPRESS_MIGRATION.md` describing exactly how to: export the current catalog via the CSV bridge, import it into a fresh WooCommerce install, and where the custom fields (brand, sizes, gender, subcategory) map to WooCommerce attributes/categories.
4. Final delivery must be a downloadable ZIP of the updated project (same `app/frontend` + `app/backend` structure), buildable with the same `pnpm install && pnpm run build` the project already uses — not a new, incompatible structure.

---

## 7. Delivery Checklist (do not mark complete until all are true)

- [ ] Nested Clothing/Footwear → Gender → Subcategory taxonomy live in the database and navigation, with existing shoe products migrated (not lost).
- [ ] Mega-menu navigation with per-subcategory thumbnails.
- [ ] Framer-motion page transitions, 3D category-tile hover, shared-element add-to-cart animation, consistent active-state styling, shimmer skeletons, `prefers-reduced-motion` fallback.
- [ ] Phone OTP verification blocking checkout until verified, built against a real Iranian SMS provider adapter (currently logging instead of sending, swappable to live with one function change).
- [ ] Admin "مشتریان" section with structured customer + address tables, search/filter, and CSV export for marketing/tax use.
- [ ] ZarinPal adapter fully scaffolded and wired into checkout, gracefully showing "به‌زودی" until `ZARINPAL_MERCHANT_ID` is provided.
- [ ] New cohesive visual theme applied via design tokens (not inline patches), one direction fully committed to, WCAG AA contrast maintained.
- [ ] `productsToWooJSON()`/`productsToCSV()` updated for nested categories; `docs/WORDPRESS_MIGRATION.md` added.
- [ ] Final deliverable: one downloadable ZIP, same buildable project structure, README updated with what changed.

## Final Directive

Execute this as a direct evolution of the existing Originaly codebase — reuse its Supabase connection, its WooCommerce export bridge, its admin auth guard, and its component library. Every new feature must degrade gracefully when its external dependency (SMS provider key, ZarinPal merchant ID) isn't configured yet, rather than breaking the build or the checkout flow. Ship one coherent, cohesive visual direction rather than a mix of effects. When finished, package the complete updated project as a ZIP with the same structure it was received in.
