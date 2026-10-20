-- HomeLedger Chat schema. Run in the Supabase SQL editor (or as a migration).
create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  display_name text,
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) <= 60),
  type text not null default 'cash' check (type in ('cash','bank','card','wallet','other')),
  opening_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) <= 40),
  kind text not null default 'expense' check (kind in ('expense','income')),
  color text not null default '#64748B',
  icon text,
  unique (user_id, name, kind)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  account_id uuid references public.accounts on delete set null,
  category_id uuid references public.categories on delete set null,
  kind text not null check (kind in ('expense','income')),
  amount numeric(12,2) not null check (amount > 0),
  date date not null,
  payee text check (char_length(payee) <= 120),
  note text check (char_length(note) <= 300),
  payment_method text,
  source text not null default 'manual' check (source in ('chat','manual','recurring')),
  raw_message text check (char_length(raw_message) <= 500),
  ai_confidence numeric(3,2) check (ai_confidence between 0 and 1),
  created_at timestamptz not null default now()
);
create index transactions_user_date_idx on public.transactions (user_id, date);
create index transactions_user_category_idx on public.transactions (user_id, category_id);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  category_id uuid not null references public.categories on delete cascade,
  month date not null check (month = date_trunc('month', month)::date),
  amount numeric(12,2) not null check (amount > 0),
  unique (user_id, category_id, month)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) <= 2000),
  structured_payload jsonb,
  created_at timestamptz not null default now()
);
create index chat_messages_user_created_idx on public.chat_messages (user_id, created_at);

-- Row Level Security: every table is private to its owner.
do $$
declare t text;
begin
  foreach t in array array['accounts','categories','transactions','budgets','chat_messages'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "owner all" on public.%I for all to authenticated
                    using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
alter table public.profiles enable row level security;
create policy "owner all" on public.profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- New user: create profile, default account, and seed categories.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name) values (new.id, split_part(new.email, '@', 1));
  insert into public.accounts (user_id, name, type) values (new.id, 'Cash', 'cash');
  insert into public.categories (user_id, name, kind, color, icon) values
    (new.id,'Groceries','expense','#2F855A','shopping-basket'),
    (new.id,'Dining','expense','#C8452D','utensils'),
    (new.id,'Transport','expense','#2B6CB0','car'),
    (new.id,'Bills & Utilities','expense','#B7791F','receipt'),
    (new.id,'Rent','expense','#6B46C1','home'),
    (new.id,'Health','expense','#C53030','heart-pulse'),
    (new.id,'Shopping','expense','#D53F8C','shopping-bag'),
    (new.id,'Entertainment','expense','#0987A0','film'),
    (new.id,'Subscriptions','expense','#4A5568','repeat'),
    (new.id,'Other','expense','#718096','circle'),
    (new.id,'Salary','income','#0F7B63','banknote'),
    (new.id,'Other income','income','#38A169','plus-circle');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reporting functions. SECURITY INVOKER (default) so RLS keeps them scoped to the caller.
create or replace function public.daily_totals(p_month date)
returns table (day date, spent numeric, earned numeric, tx_count bigint)
language sql stable as $$
  select d::date,
         coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
         coalesce(sum(t.amount) filter (where t.kind = 'income'), 0),
         count(t.id)
  from generate_series(date_trunc('month', p_month), date_trunc('month', p_month) + interval '1 month - 1 day', interval '1 day') d
  left join public.transactions t on t.date = d::date and t.user_id = auth.uid()
  group by d order by d;
$$;

create or replace function public.monthly_totals(p_months int default 6)
returns table (month date, spent numeric, earned numeric)
language sql stable as $$
  select m::date,
         coalesce(sum(t.amount) filter (where t.kind = 'expense'), 0),
         coalesce(sum(t.amount) filter (where t.kind = 'income'), 0)
  from generate_series(date_trunc('month', current_date) - make_interval(months => least(greatest(p_months,1),24) - 1),
                       date_trunc('month', current_date), interval '1 month') m
  left join public.transactions t
    on date_trunc('month', t.date) = m and t.user_id = auth.uid()
  group by m order by m;
$$;

create or replace function public.top_categories(p_from date, p_to date)
returns table (category_id uuid, name text, color text, total numeric, pct numeric)
language sql stable as $$
  with s as (
    select c.id, c.name, c.color, sum(t.amount) total
    from public.transactions t join public.categories c on c.id = t.category_id
    where t.kind = 'expense' and t.date between p_from and p_to
    group by c.id, c.name, c.color)
  select id, name, color, total, round(100 * total / nullif(sum(total) over (), 0), 1)
  from s order by total desc;
$$;

create or replace function public.top_expenses(p_from date, p_to date, p_limit int default 5)
returns table (id uuid, date date, amount numeric, payee text, note text, category text)
language sql stable as $$
  select t.id, t.date, t.amount, t.payee, t.note, c.name
  from public.transactions t left join public.categories c on c.id = t.category_id
  where t.kind = 'expense' and t.date between p_from and p_to
  order by t.amount desc limit least(greatest(p_limit,1),50);
$$;

-- Realtime
alter publication supabase_realtime add table public.transactions, public.chat_messages;
alter table public.transactions replica identity full;
