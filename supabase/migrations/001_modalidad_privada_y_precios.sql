-- Toumamari — cambios de los informes del 4 de julio de 2026.
--
-- IMPORTANTE: los tours de producción se leen de esta tabla, no de src/data.ts.
-- Sin ejecutar esto, los precios nuevos y la modalidad privada NO se ven en el sitio.
--
-- Ejecutar en Supabase → SQL Editor. Es idempotente: se puede correr dos veces.

begin;

-- 1. Respaldo de las filas antes de tocar nada.
create table if not exists tours_backup_20260709 as
  select * from public.tours;

-- 2. Modalidad privada. NULL = el tour no la ofrece.
alter table public.tours
  add column if not exists price_usd_private numeric,
  add column if not exists price_clp_private numeric;

comment on column public.tours.price_usd_private is
  'Precio por persona en modalidad privada (USD). NULL si no se ofrece.';

-- 3. Precios nuevos (informe de requerimientos).
--    Se filtra por slug: los ids son UUID y cambian entre entornos.
update public.tours
   set price_usd         = 70,
       price_usd_private = 120
 where slug = 'full-day-anakena-moai';

update public.tours
   set price_usd        = 50,
       price_usd_private = 80
 where slug = 'orongo-tangata-manu';

-- 4. Textos: la clienta indica que el Full Day no pasa por Ovahe
--    y que Ahu Te Peu no corresponde al tour de Orongo.
update public.tours
   set description_es = replace(description_es, ', Ovahe', ''),
       description_en = replace(description_en, ', Ovahe', ''),
       experience_es  = replace(experience_es,  ', Ovahe', ''),
       experience_en  = replace(experience_en,  ', Ovahe', '')
 where slug = 'full-day-anakena-moai';

update public.tours
   set description_es = replace(description_es, ' y Ahu Te Peu', ''),
       description_en = replace(description_en, ' and Ahu Te Peu', ''),
       experience_es  = replace(experience_es,  ', y Ahu Te Peu', ''),
       experience_en  = replace(experience_en,  ', and Ahu Te Peu', '')
 where slug = 'orongo-tangata-manu';

-- 4b. Los itinerarios son JSONB y también nombran los lugares eliminados.
--     Se sustituye sobre el texto y se reconstruye el JSON.
--     Ojo: "caleta secreta" / "secret cove" ES Ovahe, aunque no lo nombre.
update public.tours
   set itinerary_es = replace(
         replace(itinerary_es::text, 'Te Pito Kura & Ovahe', 'Te Pito Kura'),
         'El ombligo del mundo y caleta secreta.', 'El ombligo del mundo.'
       )::jsonb,
       itinerary_en = replace(
         replace(itinerary_en::text, 'Te Pito Kura & Ovahe', 'Te Pito Kura'),
         'The navel of the world and secret cove.', 'The navel of the world.'
       )::jsonb
 where slug = 'full-day-anakena-moai';

-- "ruinas costeras" / "coastal ruins" describe Ahu Te Peu.
update public.tours
   set itinerary_es = replace(
         replace(itinerary_es::text, 'Ahu Akivi & Ahu Te Peu', 'Ahu Akivi'),
         'Los 7 moais y ruinas costeras.', 'Los 7 moais alineados con los equinoccios.'
       )::jsonb,
       itinerary_en = replace(
         replace(itinerary_en::text, 'Ahu Akivi & Ahu Te Peu', 'Ahu Akivi'),
         'The 7 moais and coastal ruins.', 'The 7 moais aligned with the equinoxes.'
       )::jsonb
 where slug = 'orongo-tangata-manu';

-- 5. Rutas de imagen. Las columnas apuntaban a .jpg que ya no existen
--    (convertidos a WebP; anakena/orongo/tongariki fueron borrados por huérfanos).
--    Se fijan explícitamente a los archivos que sí están en el repositorio,
--    replicando el slugImageMap de src/lib/api.ts.
--    tour-navegable-anakena cambia de foto: la anterior mostraba a una persona
--    identificable y la clienta pidió retirarla por derechos de imagen.
update public.tours set image_url = '/images/tours/ahu-tongariki-dia.webp'      where slug = 'full-day-anakena-moai';
update public.tours set image_url = '/images/tours/rano-kau-crater.webp'        where slug = 'orongo-tangata-manu';
update public.tours set image_url = '/images/tours/ahu-tongariki-amanecer.webp' where slug = 'amanecer-tongariki';
update public.tours set image_url = '/images/tours/motu-islotes.webp'           where slug = 'experiencia-motu';
update public.tours set image_url = '/images/tours/ana-te-pahu.webp'            where slug = 'tour-navegable-anakena';
update public.tours set image_url = '/images/tours/rano-raraku-sector1.webp'    where slug = 'super-full-day-privado';

-- 7. Verificación dentro de la transacción: si algo no cuadró, aborta todo.
do $$
declare
  restos int;
begin
  select count(*) into restos
    from public.tours
   where description_es ilike '%ovahe%' or description_en ilike '%ovahe%'
      or experience_es  ilike '%ovahe%' or experience_en  ilike '%ovahe%'
      or itinerary_es::text ilike '%ovahe%' or itinerary_en::text ilike '%ovahe%'
      or description_es ilike '%te peu%' or description_en ilike '%te peu%'
      or experience_es  ilike '%te peu%' or experience_en  ilike '%te peu%'
      or itinerary_es::text ilike '%te peu%' or itinerary_en::text ilike '%te peu%';
  if restos > 0 then
    raise exception 'Quedan % filas con Ovahe o Ahu Te Peu. Se revierte todo.', restos;
  end if;

  if not exists (select 1 from public.tours where slug = 'full-day-anakena-moai' and price_usd = 70 and price_usd_private = 120) then
    raise exception 'El Full Day no quedó en 70/120. Se revierte todo.';
  end if;

  if not exists (select 1 from public.tours where slug = 'orongo-tangata-manu' and price_usd = 50 and price_usd_private = 80) then
    raise exception 'Orongo no quedó en 50/80. Se revierte todo.';
  end if;

  if exists (select 1 from public.tours where image_url like '%.jpg') then
    raise exception 'Quedan image_url apuntando a .jpg inexistentes. Se revierte todo.';
  end if;
end $$;

commit;

-- Comprobación manual (ejecutar aparte, después del commit):
--   select slug, price_usd, price_usd_private, image_url
--     from public.tours order by sort_order;
--
-- Reversión completa:
--   begin;
--     delete from public.tours;
--     insert into public.tours select * from tours_backup_20260709;
--   commit;
