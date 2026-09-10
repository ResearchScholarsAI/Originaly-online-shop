-- Originaly storefront schema
create table if not exists products (
  id text primary key,
  slug text not null unique,
  name_fa text not null,
  name_en text not null,
  brand text not null default 'Originaly',
  description_fa text not null default '',
  department text not null,
  gender text not null,
  subcategory text not null,
  price integer not null,
  compare_at integer,
  image text not null,
  sizes text not null default 'M,L,XL',
  stock integer not null default 8,
  created_at timestamptz not null default now()
);
create index if not exists products_dept_idx on products (department, gender, subcategory);

create table if not exists profiles (
  user_id text primary key,
  name text,
  email text,
  phone text,
  phone_verified_at timestamptz,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists addresses (
  id text primary key,
  user_id text not null,
  title text not null default 'منزل',
  address text not null,
  city text not null,
  postal_code text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on addresses (user_id);

create table if not exists phone_verifications (
  id text primary key,
  user_id text not null,
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists sms_log (
  id text primary key,
  phone text not null,
  payload text not null,
  provider text not null default 'log',
  status text not null default 'logged',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  user_id text not null,
  status text not null default 'pending',
  payment_method text not null default 'offline',
  payment_status text not null default 'unpaid',
  authority text,
  total integer not null,
  customer_name text,
  customer_phone text,
  city text,
  postal_code text,
  address text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id);

create table if not exists order_items (
  id text primary key,
  order_id text not null,
  product_id text not null,
  name_fa text not null,
  size text,
  qty integer not null,
  price integer not null
);
