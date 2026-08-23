-- ============================================================
-- RESTOCK RUNNER V2 - COMPLETE DATABASE SCHEMA
-- Copy entire content to Supabase SQL Editor and run
-- ============================================================

-- 1. USERS TABLE
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text default 'runner',
  created_at timestamp default now()
);

-- 2. ITEMS TABLE  
DROP TABLE IF EXISTS items CASCADE;
CREATE TABLE items (
  id integer primary key,
  name_es text not null,
  name_en text not null,
  req_outside integer,
  req_main integer,
  pcs_box integer,
  priority integer default 2,
  unit_measure text,
  active boolean default true
);

-- 3. REPORTS TABLE
DROP TABLE IF EXISTS reports CASCADE;
CREATE TABLE reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  entity text,
  lodge_num integer,
  piso_name text,
  bridge_num integer,
  restock_type text,
  item_fill_data jsonb,
  created_at timestamp default now()
);

-- 4. INVENTORY SNAPSHOT
DROP TABLE IF EXISTS inventory_snapshot CASCADE;
CREATE TABLE inventory_snapshot (
  id uuid primary key default gen_random_uuid(),
  entity text,
  lodge_num integer,
  piso_name text,
  bridge_num integer,
  item_id integer references items(id),
  fill_percent integer,
  updated_at timestamp default now()
);

-- 5. INSERT ALL ITEMS (22 items total)
INSERT INTO items VALUES
(1, 'Toilet Paper', 'Toilet Paper', 48, 144, 60, 1, 'hilera', true),
(2, 'Kleenex', 'Kleenex', 80, 80, 30, 2, 'piezas', true),
(3, 'Paper Towel', 'Paper Towel', 15, NULL, 30, 2, 'hileras', true),
(4, 'Soap', 'Soap', 135, 200, 200, 1, 'bin', true),
(5, 'Coffee Pods', 'Coffee Pods', 48, 288, 100, 1, 'caja verde', true),
(6, 'Tea Pods', 'Tea Pods', 48, 288, 100, 1, 'caja verde', true),
(7, 'Decaf Pods', 'Decaf Pods', 48, 288, 100, 1, 'caja verde', true),
(8, 'Water', 'Water', 4, 10, 24, 1, 'case', true),
(9, 'Vanity Kit', 'Vanity Kit', 35, 240, 100, 2, 'bin', true),
(10, 'Coffee Cups', 'Coffee Cups', 42, 126, 400, 2, 'sleeve', true),
(11, 'Shower Caps', 'Shower Caps', 35, 100, 100, 2, 'bin', true),
(12, 'Laundry Bags', 'Laundry Bags', 30, 1, 1, 2, 'bolsa', true),
(14, 'Slippers', 'Slippers', NULL, 100, 100, 2, 'caja', true),
(15, 'Condiment Kit', 'Condiment Kit', NULL, 240, 240, 2, 'caja', true),
(16, 'Palmolive', 'Palmolive', NULL, 72, 72, 2, 'caja', true),
(18, 'Pens', 'Pens', NULL, NULL, 150, 3, 'caja', true),
(19, 'Toothpaste', 'Toothpaste', NULL, 24, 24, 2, 'caja', true),
(20, 'Razors', 'Razors', NULL, NULL, 144, 3, 'caja', true),
(21, 'Notepads', 'Notepads', NULL, 120, 30, 3, 'pack', true);

-- OPTIONAL: Enable Row Level Security if needed
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_snapshot ENABLE ROW LEVEL SECURITY;

-- DONE ✅
