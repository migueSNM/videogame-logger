-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- for the project backing NEXT_PUBLIC_SUPABASE_URL.

create table public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  console text not null,
  status text not null check (status in ('playing', 'completed', 'dropped', 'backlog', 'wishlist')),
  days_played integer check (days_played is null or days_played >= 0),
  start_date date,
  end_date date,
  rating integer check (rating is null or (rating >= 1 and rating <= 10)),
  notes text,
  cover_url text,
  created_at timestamptz not null default now()
);

create index games_user_id_idx on public.games(user_id);

alter table public.games enable row level security;

create policy "Users can view their own games"
  on public.games for select
  using (auth.uid() = user_id);

create policy "Users can insert their own games"
  on public.games for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own games"
  on public.games for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own games"
  on public.games for delete
  using (auth.uid() = user_id);
