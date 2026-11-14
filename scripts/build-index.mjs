// Builds index.json, the catalog the DockForge app downloads to show the theme gallery.
// Runs in CI after every merge to main. Usage: node scripts/build-index.mjs
// Each file gets a SHA-256 so the app can verify what it downloads.

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";
import { validateTheme } from "./validate.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const THEMES_DIR = join(ROOT, "themes");
const REPO = process.env.GITHUB_REPOSITORY || "dockforge/dockforge-themes";
const BRANCH = process.env.INDEX_BRANCH || "main";
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const themes = [];
for (const id of readdirSync(THEMES_DIR).sort()) {
  const dir = join(THEMES_DIR, id);
  if (!statSync(dir).isDirectory()) continue;
  const errors = validateTheme(id);
  if (errors.length) {
    console.error(`Skipping invalid theme ${id}:\n  ${errors.join("\n  ")}`);
    process.exitCode = 1;
    continue;
  }
  const manifest = JSON.parse(readFileSync(join(dir, "theme.json"), "utf8"));
  const files = walk(dir).sort().map((full) => {
    const bytes = readFileSync(full);
    return {
      path: relative(dir, full).split(sep).join("/"),
      size: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  });
  themes.push({
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    author: manifest.author,
    description: manifest.description,
    license: manifest.license,
    type: manifest.type,
    tags: manifest.tags ?? [],
    minAppVersion: manifest.minAppVersion ?? "0.1.0",
    baseUrl: `${RAW}/themes/${id}/`,
    preview: `${RAW}/themes/${id}/${manifest.preview}`,
    files,
  });
}

const index = { schemaVersion: 1, themes };
writeFileSync(join(ROOT, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`index.json written with ${themes.length} themes`);
