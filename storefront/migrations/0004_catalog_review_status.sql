alter table products
  add column if not exists catalog_status text not null default 'under_review';

update products
set catalog_status = 'under_review',
    price = 0,
    compare_at = null,
    stock = 0
where id like 'p-m-%' or id like 'p-w-%';

update products
set catalog_status = 'under_review'
where id like 'p-d4-%';

create index if not exists products_catalog_status_idx
  on products (catalog_status, department, gender, subcategory);
