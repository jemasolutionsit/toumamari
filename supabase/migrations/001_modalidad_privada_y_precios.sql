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
--     Se hace la sustitución sobre el texto y se reconstruye el JSON.
update public.tours
   set itinerary_es = replace(itinerary_es::text, 'Te Pito Kura & Ovahe', 'Te Pito Kura')::jsonb,
       itinerary_en = replace(itinerary_en::text, 'Te Pito Kura & Ovahe', 'Te Pito Kura')::jsonb
 where slug = 'full-day-anakena-moai';

update public.tours
   set itinerary_es = replace(itinerary_es::text, 'Ahu Akivi & Ahu Te Peu', 'Ahu Akivi')::jsonb,
       itinerary_en = replace(itinerary_en::text, 'Ahu Akivi & Ahu Te Peu', 'Ahu Akivi')::jsonb
 where slug = 'orongo-tangata-manu';

-- 5. Rutas de imagen: los .jpg fueron convertidos a .webp y los huérfanos
--    borrados del repositorio. Estas columnas apuntaban a archivos que ya no existen.
update public.tours
   set image_url = replace(image_url, '.jpg', '.webp')
 where image_url like '%.jpg';

-- 6. La foto del Tour Navegable Anakena mostraba a una persona identificable.
update public.tours
   set image_url = '/images/tours/ana-te-pahu.webp'
 where slug = 'tour-navegable-anakena';

commit;

-- Verificación (ejecutar aparte):
--   select slug, price_usd, price_usd_private, image_url from public.tours order by sort_order;
--
-- Reversión:
--   begin;
--     delete from public.tours;
--     insert into public.tours select * from tours_backup_20260709;
--   commit;
