-- Toumamari — habilita autenticación real para /admin.
--
-- Hoy el panel usa la clave pública (anon) para todo, incluidas las escrituras,
-- y RLS las bloquea en silencio: PostgREST responde 200 con array vacío en vez
-- de error, así que el panel *parece* guardar sin guardar nada.
--
-- Este script ata los permisos de escritura a un usuario autenticado específico
-- (por email, vía el JWT), no a "cualquiera con sesión": así no depende de que
-- el registro público de Supabase Auth esté deshabilitado.
--
-- Requiere haber creado antes el usuario admin en Authentication → Users,
-- o con el Admin API.
--
-- ⚠️ IMPORTANTE: el editor SQL de Supabase no soporta variables (\set de psql
-- no aplica aquí), así que 'CAMBIAR-ESTE-EMAIL@ejemplo.com' se repite varias
-- veces en este archivo. Antes de correrlo, usa buscar-y-reemplazar-todo de
-- tu editor de texto para cambiarlas TODAS por el email real de una vez — no
-- las reemplaces a mano una por una. Si queda una sin cambiar, esa política
-- deniega en silencio para el admin, sin ningún error visible.
--
-- El bloque de verificación al final aborta la transacción entera si detecta
-- que quedó algún placeholder sin reemplazar en pg_policies.
--
-- Ejecutar en Supabase → SQL Editor. Es idempotente: se puede correr dos veces.

begin;

-- ── tours ────────────────────────────────────────────────────────────────
alter table public.tours enable row level security;

drop policy if exists "tours: lectura publica de activos" on public.tours;
create policy "tours: lectura publica de activos"
  on public.tours for select
  to anon, authenticated
  using (active = true);

drop policy if exists "tours: admin ve todo" on public.tours;
create policy "tours: admin ve todo"
  on public.tours for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

drop policy if exists "tours: admin escribe" on public.tours;
create policy "tours: admin escribe"
  on public.tours for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com')
  with check ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

-- ── bookings ─────────────────────────────────────────────────────────────
-- El público necesita crear su reserva, pero NO leer reservas ajenas: la fila
-- tiene guest_name/guest_email, y RLS filtra filas, no columnas, así que un
-- SELECT abierto expondría los datos de todos los clientes a cualquiera con
-- la clave pública (que es pública por diseño, está en cada carga de página).
--
-- La disponibilidad (cupos ocupados por tour y fecha) se resuelve con una
-- función SECURITY DEFINER que solo devuelve un conteo, nunca las filas.
alter table public.bookings enable row level security;

-- SECURITY DEFINER: corre con los permisos del dueño de la función (que sí ve
-- todas las filas), no con los del que la invoca. Por eso puede agregar sin
-- que el llamador necesite (ni tenga) acceso de lectura a la tabla.
--
-- Se asume tours.id / bookings.tour_id de tipo uuid (es lo que se observó en
-- las filas de tours consultadas antes). Si tour_id fuera texto, esta función
-- fallará con un error claro de tipos al primer llamado — cambiar "uuid" por
-- "text" en ese caso.
create or replace function public.get_booked_spots(p_tour_id uuid, p_travel_date date)
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(sum(travelers), 0)::integer
    from public.bookings
   where tour_id = p_tour_id
     and travel_date = p_travel_date
     and status <> 'cancelled';
$$;

revoke all on function public.get_booked_spots(uuid, date) from public;
grant execute on function public.get_booked_spots(uuid, date) to anon, authenticated;

drop policy if exists "bookings: publico puede reservar" on public.bookings;
create policy "bookings: publico puede reservar"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

-- Si existía de una versión anterior de este script, se retira: exponía PII.
drop policy if exists "bookings: publico consulta disponibilidad" on public.bookings;

drop policy if exists "bookings: admin lee" on public.bookings;
create policy "bookings: admin lee"
  on public.bookings for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

drop policy if exists "bookings: admin administra" on public.bookings;
create policy "bookings: admin administra"
  on public.bookings for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com')
  with check ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

drop policy if exists "bookings: admin borra" on public.bookings;
create policy "bookings: admin borra"
  on public.bookings for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

-- ── contact_messages ─────────────────────────────────────────────────────
-- El público puede enviar un mensaje, pero no leer los mensajes de otros.
alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages: publico envia" on public.contact_messages;
create policy "contact_messages: publico envia"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_messages: admin lee y administra" on public.contact_messages;
create policy "contact_messages: admin lee y administra"
  on public.contact_messages for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com')
  with check ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

-- ── discount_codes ───────────────────────────────────────────────────────
-- Ningún flujo público los consulta hoy (no hay validación de cupón en el
-- checkout): admin-only en todas las operaciones.
alter table public.discount_codes enable row level security;

drop policy if exists "discount_codes: solo admin" on public.discount_codes;
create policy "discount_codes: solo admin"
  on public.discount_codes for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com')
  with check ((auth.jwt() ->> 'email') = 'CAMBIAR-ESTE-EMAIL@ejemplo.com');

-- Verificación: si alguna política quedó con el placeholder sin reemplazar,
-- aborta toda la transacción en vez de dejar una política rota en silencio.
do $$
declare
  restos int;
begin
  select count(*) into restos
    from pg_policies
   where schemaname = 'public'
     and (coalesce(qual, '') like '%CAMBIAR-ESTE-EMAIL%'
       or coalesce(with_check, '') like '%CAMBIAR-ESTE-EMAIL%');
  if restos > 0 then
    raise exception 'Quedan % políticas con el email sin reemplazar. Revisa el archivo y corre de nuevo.', restos;
  end if;
end $$;

commit;

-- Verificación manual (aparte, después del commit):
--   select tablename, policyname, roles, cmd, qual, with_check
--     from pg_policies
--    where schemaname = 'public'
--    order by tablename, policyname;
