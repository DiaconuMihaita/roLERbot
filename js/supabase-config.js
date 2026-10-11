/* roLERbot Field Sim 3D — configurare Supabase (conturi, prieteni, meciuri online).
 *
 * 1. supabase.com → New project (gratuit). Alege regiunea Frankfurt/Europe și o parolă pentru baza de date.
 * 2. Authentication → Providers → Email: pentru început dezactivează "Confirm email" (altfel fiecare jucător trebuie să-și confirme emailul).
 * 3. SQL Editor → New query → lipește conținutul din supabase/schema.sql → Run.
 * 4. Project Settings → API: copiază "Project URL" și cheia "anon public" mai jos.
 *    Cheia anon e publică prin design; securitatea vine din regulile (RLS) din schema.sql.
 */
window.SUPABASE_CONFIG = {
  url: "https://oaaesbjupwfvhsdkexhu.supabase.co",
  anonKey: "sb_publishable_nP8tnVDK5gblAYUxxdOXCg_eX8HwUIx"
};
