#!/usr/bin/env node
// Downloads photos from Pexels into public/images/pexels/<query>/.
// Usage: node --env-file=.env.local scripts/fetch-pexels-images.mjs "pivoines roses" 6

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PEXELS_API_BASE = "https://api.pexels.com/v1";

const [, , query, countArg] = process.argv;
const count = Math.min(Number(countArg) || 6, 80);

if (!query) {
  console.error('Usage: node --env-file=.env.local scripts/fetch-pexels-images.mjs "<recherche>" [nombre]');
  process.exit(1);
}

const apiKey = process.env.PEXELS_API_KEY;
if (!apiKey) {
  console.error("PEXELS_API_KEY est manquant. Ajoute-le dans .env.local (voir .env.local.example).");
  process.exit(1);
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const params = new URLSearchParams({ query, per_page: String(count) });
  const searchResponse = await fetch(`${PEXELS_API_BASE}/search?${params.toString()}`, {
    headers: { Authorization: apiKey },
  });

  if (!searchResponse.ok) {
    throw new Error(`Pexels search failed (${searchResponse.status}): ${await searchResponse.text()}`);
  }

  const { photos = [] } = await searchResponse.json();
  if (photos.length === 0) {
    console.log(`Aucune photo trouvée pour "${query}".`);
    return;
  }

  const outDir = path.join(process.cwd(), "public", "images", "pexels", slugify(query));
  await mkdir(outDir, { recursive: true });

  let saved = 0;
  for (const photo of photos) {
    const imageUrl = photo.src.large2x;
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.warn(`Échec du téléchargement de la photo ${photo.id} (${imageResponse.status})`);
      continue;
    }
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const fileName = `${photo.id}.jpg`;
    await writeFile(path.join(outDir, fileName), buffer);
    saved += 1;
    console.log(`✓ ${fileName} — photo par ${photo.photographer} (${photo.photographer_url})`);
  }

  console.log(`\n${saved}/${photos.length} photo(s) enregistrée(s) dans ${path.relative(process.cwd(), outDir)}/`);
  console.log("Pense à créditer les photographes Pexels si les images sont publiées.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
