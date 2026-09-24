-- ============================================================
-- Lo que hay que correr UNA vez en Supabase para Bichito Curioso.
--
-- Dónde: Supabase → tu proyecto → SQL Editor → New query → pegar todo
-- esto → Run.
--
-- Qué hace: crea la función que usa el botón «Borrar la cuenta» del
-- panel para padres (js/nucleo/cuenta.js). Google Play exige que una app
-- que crea cuentas deje borrarlas desde adentro de la app.
--
-- La función sólo puede borrar a QUIEN LA LLAMA (auth.uid() es el
-- usuario del permiso con el que se llama): nadie puede borrar la cuenta
-- de otro. Los que no entraron (anon) no la pueden usar.
-- ============================================================

create or replace function public.borrar_mi_cuenta()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.borrar_mi_cuenta() from public;
revoke execute on function public.borrar_mi_cuenta() from anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;
