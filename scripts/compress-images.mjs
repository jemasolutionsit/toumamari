// scripts/compress-images.mjs
// Fase 1: Comprime todas las imágenes a /public/images-tmp/ (misma estructura).
// Fase 2: Genera un script PowerShell que copia los archivos comprimidos sobre los originales.
import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(__dirname, "..", "public", "images");
const TMP_ROOT = path.resolve(__dirname, "..", "public", "images-tmp");

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return getFiles(full);
      return full;
    })
  );
  return files.flat().filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f));
}

const copyLines = [];

async function compress(srcPath) {
  const before = (await stat(srcPath)).size;
  const isGallery = srcPath.includes("galeria");
  const quality = isGallery ? 72 : 78;
  const maxWidth = isGallery ? 1400 : 1000;

  const relative = path.relative(SRC_ROOT, srcPath);
  const destPath = path.join(TMP_ROOT, relative);
  const destDir = path.dirname(destPath);
  await mkdir(destDir, { recursive: true });

  const image = sharp(srcPath);
  const meta = await image.metadata();
  if (!meta.width) return;

  let pipeline = image;
  if (meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }
  pipeline = pipeline.webp({ quality, effort: 6 });
  await pipeline.toFile(destPath);

  const after = (await stat(destPath)).size;
  if (after < before) {
    const saved = (((before - after) / before) * 100).toFixed(1);
    console.log(`✓  ${path.basename(srcPath).padEnd(36)} ${(before/1024).toFixed(0).padStart(5)} kB → ${(after/1024).toFixed(0).padStart(5)} kB  (-${saved}%)`);
    // Queue the copy command
    copyLines.push(`Copy-Item '${destPath}' '${srcPath}' -Force`);
  } else {
    console.log(`-  ${path.basename(srcPath).padEnd(36)} already optimal`);
  }
}

const files = await getFiles(SRC_ROOT);
console.log(`\nComprimiendo ${files.length} imagenes en public/images...\n`);
for (const f of files) await compress(f);

// Write PowerShell copy script
const ps1 = copyLines.join("\r\n") + "\r\nWrite-Host 'Copia completa!'\r\n";
const ps1Path = path.resolve(__dirname, "..", "scripts", "_do-copy.ps1");
writeFileSync(ps1Path, ps1);
console.log(`\n✅ Archivos comprimidos en images-tmp/`);
console.log(`Ahora ejecuta: powershell -ExecutionPolicy Bypass scripts/_do-copy.ps1`);
