alter table phone_verifications
  add column if not exists attempts smallint not null default 0;

create index if not exists phone_verifications_user_created_idx
  on phone_verifications (user_id, created_at desc);
