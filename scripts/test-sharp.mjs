// scripts/test-sharp.mjs
import sharp from "sharp";
const meta = await sharp("public/images/galeria/moai-heic-1.webp").metadata();
console.log("width:", meta.width, "height:", meta.height);
await sharp("public/images/galeria/moai-heic-1.webp")
  .webp({ quality: 72 })
  .toFile("test-out.webp");
console.log("ok - wrote test-out.webp");
