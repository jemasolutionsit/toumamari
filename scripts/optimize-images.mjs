/**
 * Saneamiento de public/: borra huérfanos y duplicados, y convierte el resto a WebP.
 *
 * Las fotos de galería venían del móvil a 5712x4284 (~24 MP) y se servían en
 * tarjetas de pocos cientos de píxeles. Redimensionar es lo que recupera el peso;
 * el cambio de formato solo aporta el último tramo.
 *
 * Idempotente: si el .webp ya existe y es más nuevo que el original, no rehace.
 */
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";

const PUBLIC = "public";

// Sin referencia en el código. anakena/orongo/tongariki solo se nombran en la
// columna image_url de Supabase, que slugImageMap siempre pisa.
const ORPHANS = [
  "anakena.jpg",
  "orongo.jpg",
  "tongariki.jpg",
  "images/tours/costa-acantilado.jpg",
  "images/tours/rano-raraku-sector.jpg",
  "images/tours/pukao-detalle.jpg",
  "images/tours/rano-raraku.jpg",
  "images/tours/hero-rapanui.jpg",
  "images/tours/moai-derribado.jpg",
  "images/tours/ahu-tongariki-sunset.jpg",
  "images/tours/cuevas-costas-2.jpg",
];

// Ancho máximo por carpeta. Nada se amplía si ya es menor.
const MAX_WIDTH = [
  [join("images", "galeria"), 1600],
  [join("images", "tours"), 1200],
  ["", 1920],
];

const widthFor = (file) =>
  MAX_WIDTH.find(([dir]) => relative(PUBLIC, file).startsWith(dir))?.[1] ?? 1920;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

let freed = 0;
for (const rel of ORPHANS) {
  const file = join(PUBLIC, ...rel.split("/"));
  if (existsSync(file)) {
    freed += statSync(file).size;
    unlinkSync(file);
    console.log(`borrado  ${rel}`);
  }
}
console.log(`\nHuérfanos y duplicados: ${(freed / 1024 / 1024).toFixed(1)} MB liberados\n`);

let before = 0;
let after = 0;
for (const file of walk(PUBLIC)) {
  if (!/\.(jpe?g|png)$/i.test(extname(file))) continue;

  const webp = file.replace(/\.(jpe?g|png)$/i, ".webp");
  const srcSize = statSync(file).size;
  before += srcSize;

  if (!existsSync(webp) || statSync(webp).mtimeMs < statSync(file).mtimeMs) {
    await sharp(file)
      .rotate() // respeta la orientación EXIF antes de descartar metadatos
      .resize({ width: widthFor(file), withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(webp);
  }

  const dstSize = statSync(webp).size;
  after += dstSize;
  unlinkSync(file);

  const pct = (100 - (dstSize / srcSize) * 100).toFixed(0);
  console.log(
    `${(srcSize / 1024).toFixed(0).padStart(6)} KB -> ${(dstSize / 1024)
      .toFixed(0)
      .padStart(5)} KB  (-${pct}%)  ${relative(PUBLIC, webp)}`,
  );
}

console.log(
  `\nTotal imágenes: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB`,
);
