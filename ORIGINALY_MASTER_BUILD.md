# Originaly Master Build — Phase 1

## Product architecture

Originaly is a Persian RTL commerce storefront for the Iranian market. The primary customer-facing taxonomy is **Gender → Product Family**:

- مردانه: کتونی، تیشرت، جوراب، کلاه، کاپشن، لباس گرم
- زنانه: کتونی، تیشرت، جوراب، کلاه، کاپشن، لباس گرم

`department` remains internal metadata (`footwear` for کتونی, `clothing` for the other families) to preserve compatibility with the existing data model and future WooCommerce mapping.

## Phase 1 changes

- Reframed primary navigation around Men/Women.
- Rebuilt the mega-menu to show both Clothing and Footwear families under the selected gender.
- Fixed category links to use `subcategory` consistently.
- Replaced the broad category assumptions with the store's actual six product families.
- Updated Home to present Men/Women as the primary discovery layer.
- Updated Shop filters for department → gender → subcategory navigation.
- Updated Admin product creation/editing to write `department`, `gender`, and `subcategory_slug`.
- Added a canonical Supabase taxonomy migration (`002_originaly_master_taxonomy.sql`).
- Added a PWA manifest foundation for the future Android companion strategy.
- Preserved the existing Supabase project, product data, WooCommerce bridge, and component library.

## Important validation status

The environment available for this run did not have `pnpm` installed. An `npm install` attempt did not finish within the execution window, so a local production build could not be truthfully marked as passed. No claim of a successful deployment is made in this phase.

## Next engineering gates

1. Install dependencies and run TypeScript/build/lint.
2. Apply and validate Supabase migrations against the connected project.
3. Harden OTP with rate limiting, server-authoritative verification state, and provider adapter configuration.
4. Move checkout/order creation behind a server-authoritative function with price/stock/customer verification.
5. Complete payment state machine and ZarinPal callback verification.
6. Finish Admin dashboard, inventory, order lifecycle, customer/address views, exports and audit events.
7. Add automated browser smoke tests and mobile visual verification.
8. Package a release ZIP and deploy a public preview only after the gates pass.
9. Build the Android companion from the shared backend contract (PWA/TWA vs native decision after web stabilization).

## Phase 2 — Backend & Commerce Security Hardening
- Added OTP request cooldown and daily abuse limits.
- OTP generation now uses Web Crypto rather than `Math.random()`.
- OTP hashes support a server-side `OTP_PEPPER` secret.
- OTP verification is atomically consumed through a Postgres security-definer RPC.
- Failed OTP attempts are counted and capped.
- Sensitive OTP/SMS tables remain inaccessible to browser roles.
- Centralized admin authorization helper added for customer/address RLS policies.
- Client now treats an unconfigured SMS provider as an actual unavailable service rather than a successful send.
