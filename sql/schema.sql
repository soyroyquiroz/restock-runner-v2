-- ============================================================
-- RESTOCK RUNNER — ESQUEMA (login por PIN + progreso en vivo)
-- Sin DROP: no borra nada existente.
-- ============================================================

-- 1. RUNNERS — login por nombre + PIN de 4 dígitos
create table if not exists runners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  pin         text not null check (pin ~ '^[0-9]{4}$'),
  role        text not null default 'runner',   -- runner | supervisor | admin
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create unique index if not exists runners_name_uniq on runners (lower(name));

-- 2. REPORTS — un reporte por espacio capturado
create table if not exists reports (
  id           uuid primary key default gen_random_uuid(),
  runner_id    uuid references runners(id) on delete set null,
  runner_name  text not null,
  entity       text not null,          -- outside | main
  lodge_num    integer,
  bridge_num   integer,
  space_name   text,                   -- Piso 1..3, Hank's Closet
  restock_type text not null,          -- profundidad | urgente
  created_at   timestamptz not null default now()
);
create index if not exists reports_created_idx on reports (created_at desc);

-- 3. REPORT_ITEMS — detalle por item de cada reporte
create table if not exists report_items (
  id             bigserial primary key,
  report_id      uuid not null references reports(id) on delete cascade,
  item_id        integer not null,
  item_name      text not null,
  steps_present  numeric(6,2) not null,
  steps_standard numeric(6,2) not null,
  missing_pcs    integer not null
);
create index if not exists report_items_report_idx on report_items (report_id);

-- 4. SPACE_STATUS — nivel actual de cada espacio (se sobrescribe en cada captura)
create table if not exists space_status (
  space_key      text not null,        -- o-7-3  |  m-Piso 2
  item_id        integer not null,
  entity         text not null,
  lodge_num      integer,
  bridge_num     integer,
  space_name     text,
  item_name      text not null,
  steps_present  numeric(6,2) not null,
  steps_standard numeric(6,2) not null,
  missing_pcs    integer not null,
  updated_by     text,
  updated_at     timestamptz not null default now(),
  primary key (space_key, item_id)
);

-- 5. RLS — app interna, acceso con la anon key
alter table runners      enable row level security;
alter table reports      enable row level security;
alter table report_items enable row level security;
alter table space_status enable row level security;

drop policy if exists p_runners      on runners;
drop policy if exists p_reports      on reports;
drop policy if exists p_report_items on report_items;
drop policy if exists p_space_status on space_status;

create policy p_runners      on runners      for all using (true) with check (true);
create policy p_reports      on reports      for all using (true) with check (true);
create policy p_report_items on report_items for all using (true) with check (true);
create policy p_space_status on space_status for all using (true) with check (true);

-- 6. Usuario inicial (admin). Cambia el PIN después desde la app.
insert into runners (name, pin, role)
values ('Rodrigo', '1234', 'admin')
on conflict do nothing;
