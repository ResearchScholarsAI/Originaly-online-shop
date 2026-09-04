-- ============================================================================
-- Originaly (اورجینالی) — Migration: nested taxonomy + customers + phone OTP
-- Run this against the project's existing Supabase Postgres database.
-- Table name prefix (app_a3f9f1497d_) matches the existing tables already
-- used in src/lib/store.ts — keep it consistent so the same Supabase project
-- can be reused without reconfiguring SUPABASE_URL/ANON_KEY.
-- ============================================================================

-- 1) Extend the existing products table with the new taxonomy fields.
--    `category` is kept (nullable) for backward compatibility with any
--    existing rows / exports during the transition; new code reads
--    department + subcategory_slug instead.
alter table app_a3f9f1497d_products
  add column if not exists department text check (department in ('clothing', 'footwear')),
  add column if not exists subcategory_slug text;

-- Backfill: every existing product in this store was a shoe.
update app_a3f9f1497d_products
set department = 'footwear'
where department is null;

-- 2) Customers table — created/updated the first time a phone number
--    successfully completes OTP verification.
create table if not exists app_a3f9f1497d_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null unique,
  phone_verified_at timestamptz,
  created_at timestamptz not null default now(),
  total_orders integer not null default 0,
  total_spent numeric not null default 0
);

-- 3) Saved addresses, one customer can have several.
create table if not exists app_a3f9f1497d_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references app_a3f9f1497d_customers(id) on delete cascade,
  address text not null,
  city text not null,
  postal_code text not null default '',
  is_default boolean not null default false
);

-- 4) Phone OTP verification codes. Codes are stored HASHED, never plain —
--    the edge function must hash (e.g. SHA-256) before insert and compare
--    hashes on verify, never store or log the raw code.
create table if not exists app_a3f9f1497d_phone_verifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_phone_verifications_phone on app_a3f9f1497d_phone_verifications(phone);

-- 5) SMS send log — used as the placeholder "provider" until a real
--    Iranian SMS gateway (Kavenegar / Melipayamak / IPPanel) API key is
--    configured in the send-otp edge function. Every attempted send is
--    recorded here regardless of whether the real provider is live yet.
create table if not exists app_a3f9f1497d_sms_log (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  message text not null,
  provider text not null default 'not_configured',
  sent_at timestamptz not null default now(),
  success boolean not null default false
);

-- 6) Row Level Security — customers/addresses/verification codes must never
--    be readable by the anon client key directly; all access goes through
--    edge functions (service role) or the authenticated admin.
alter table app_a3f9f1497d_customers enable row level security;
alter table app_a3f9f1497d_addresses enable row level security;
alter table app_a3f9f1497d_phone_verifications enable row level security;
alter table app_a3f9f1497d_sms_log enable row level security;

drop policy if exists "admin_read_customers" on app_a3f9f1497d_customers;
create policy "admin_read_customers" on app_a3f9f1497d_customers
  for select using (auth.jwt() ->> 'email' = 'admin@originally.ir');

drop policy if exists "admin_read_addresses" on app_a3f9f1497d_addresses;
create policy "admin_read_addresses" on app_a3f9f1497d_addresses
  for select using (auth.jwt() ->> 'email' = 'admin@originally.ir');

-- phone_verifications and sms_log get NO client-readable policy at all —
-- they are only ever touched by edge functions using the service role key.
