-- ═══════════════════════════════════════════════════════════════
-- HomeLedger Database Schema for Supabase
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- 1. Create Accounts Table
create table if not exists public.accounts (
  id text primary key,
  name text not null,
  type text not null default 'checking',
  balance bigint not null default 0,
  emoji text default '💳',
  color text default '#6366f1',
  created_at timestamptz not null default now()
);

-- 2. Create Categories Table
create table if not exists public.categories (
  name text primary key,
  color text not null default '#6366f1',
  budget bigint not null default 0,
  spent bigint not null default 0,
  is_income boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Create Transactions Table
create table if not exists public.transactions (
  id text primary key,
  date text not null,
  payee text not null,
  amount bigint not null,
  category text not null,
  account text not null,
  type text not null check (type in ('income', 'expense')),
  notes text,
  created_at timestamptz not null default now()
);

-- 4. Create Goals Table
create table if not exists public.goals (
  id text primary key,
  name text not null,
  target bigint not null default 0,
  current bigint not null default 0,
  deadline text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- 5. Create Upcoming Bills Table
create table if not exists public.bills (
  id text primary key,
  name text not null,
  amount bigint not null default 0,
  due_date text not null,
  category text not null,
  is_paid boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.bills enable row level security;

-- Policies allowing public/anon read and write (no login screen required)
drop policy if exists "Allow all access to accounts" on public.accounts;
create policy "Allow all access to accounts" on public.accounts for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow all access to categories" on public.categories;
create policy "Allow all access to categories" on public.categories for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow all access to transactions" on public.transactions;
create policy "Allow all access to transactions" on public.transactions for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow all access to goals" on public.goals;
create policy "Allow all access to goals" on public.goals for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow all access to bills" on public.bills;
create policy "Allow all access to bills" on public.bills for all to anon, authenticated using (true) with check (true);

-- Seed Initial Accounts
insert into public.accounts (id, name, type, balance, emoji, color) values
  ('1', 'Main Checking', 'checking', 1284350, '💳', '#6366f1'),
  ('2', 'Savings', 'savings', 4520000, '🏦', '#22c55e'),
  ('3', 'Credit Card', 'credit_card', -185420, '💳', '#ef4444'),
  ('4', 'Investment', 'investment', 12750000, '📈', '#f59e0b')
on conflict (id) do update set
  balance = excluded.balance;

-- Seed Initial Categories
insert into public.categories (name, color, budget, spent, is_income) values
  ('Housing', '#6366f1', 200000, 175000, false),
  ('Groceries', '#22c55e', 60000, 52340, false),
  ('Transport', '#f59e0b', 40000, 38200, false),
  ('Utilities', '#06b6d4', 25000, 21800, false),
  ('Dining', '#ec4899', 30000, 27650, false),
  ('Entertainment', '#8b5cf6', 20000, 14500, false),
  ('Healthcare', '#ef4444', 15000, 8200, false),
  ('Education', '#14b8a6', 10000, 9500, false),
  ('Fitness', '#f97316', 8000, 7500, false),
  ('Travel', '#a855f7', 25000, 0, false),
  ('Gifts', '#e879f9', 10000, 4200, false),
  ('Salary', '#22c55e', 0, 0, true)
on conflict (name) do update set
  budget = excluded.budget,
  spent = excluded.spent;

-- Seed Initial Goals
insert into public.goals (id, name, target, current, deadline, color) values
  ('1', 'Emergency Fund', 10000000, 4520000, '2027-06-01', '#6366f1'),
  ('2', 'Vacation Fund', 3000000, 1200000, '2027-03-01', '#ec4899'),
  ('3', 'New Car', 25000000, 8500000, '2028-01-01', '#f59e0b')
on conflict (id) do nothing;
