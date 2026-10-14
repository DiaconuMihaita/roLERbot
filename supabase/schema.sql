-- roLERbot Field Sim 3D: schema pentru conturi și prieteni. Rulează o singură dată în Supabase → SQL Editor.
-- Camerele și meciurile NU au tabele: folosesc Supabase Realtime (broadcast + presence).

-- ---------- profile (numele de jucător) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  username_lower text generated always as (lower(username)) stored unique,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: citire pentru utilizatori logati" on public.profiles;
create policy "profiles: citire pentru utilizatori logati" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles: creezi doar profilul tau" on public.profiles;
create policy "profiles: creezi doar profilul tau" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- ---------- prietenii (cerere + acceptare) ----------
create table if not exists public.friendships (
  id bigint generated always as identity primary key,
  requester uuid not null references public.profiles (id) on delete cascade,
  addressee uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee)
);
create unique index if not exists friendships_pair
  on public.friendships (least(requester, addressee), greatest(requester, addressee));
alter table public.friendships enable row level security;

drop policy if exists "friendships: vezi doar ale tale" on public.friendships;
create policy "friendships: vezi doar ale tale" on public.friendships
  for select to authenticated using (auth.uid() in (requester, addressee));

drop policy if exists "friendships: trimiti cereri" on public.friendships;
create policy "friendships: trimiti cereri" on public.friendships
  for insert to authenticated with check (requester = auth.uid() and status = 'pending');

drop policy if exists "friendships: accepta cel care a primit cererea" on public.friendships;
create policy "friendships: accepta cel care a primit cererea" on public.friendships
  for update to authenticated
  using (addressee = auth.uid())
  with check (addressee = auth.uid() and status = 'accepted');

drop policy if exists "friendships: stergi ale tale" on public.friendships;
create policy "friendships: stergi ale tale" on public.friendships
  for delete to authenticated using (auth.uid() in (requester, addressee));

-- ---------- notificari live pentru cereri/acceptari ----------
do $$
begin
  alter publication supabase_realtime add table public.friendships;
exception when duplicate_object then null;
end $$;

-- ---------- salvarea carierei in cont (vezi si career.sql) ----------
create table if not exists public.career_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.career_saves enable row level security;

drop policy if exists "career_saves: citesti doar salvarea ta" on public.career_saves;
create policy "career_saves: citesti doar salvarea ta" on public.career_saves
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "career_saves: creezi doar salvarea ta" on public.career_saves;
create policy "career_saves: creezi doar salvarea ta" on public.career_saves
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "career_saves: actualizezi doar salvarea ta" on public.career_saves;
create policy "career_saves: actualizezi doar salvarea ta" on public.career_saves
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "career_saves: stergi doar salvarea ta" on public.career_saves;
create policy "career_saves: stergi doar salvarea ta" on public.career_saves
  for delete to authenticated using (user_id = auth.uid());
