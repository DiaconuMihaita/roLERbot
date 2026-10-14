-- roLERbot Field Sim 3D: salvarea carierei în contul online.
-- Rulează o singură dată în Supabase → SQL Editor → New query → Run.
-- (Dacă ai rulat deja schema.sql actualizat, nu mai e nevoie.)

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
