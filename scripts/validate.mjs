// Validates every theme in ./themes (or only the ids passed as arguments).
// Usage: node scripts/validate.mjs [theme-id ...]
// Exit code 1 if any theme is invalid. Runs in CI on every pull request.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname, sep } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const ROOT = new URL("..", import.meta.url).pathname;
const THEMES_DIR = join(ROOT, "themes");
const schema = JSON.parse(readFileSync(join(ROOT, "schema", "theme.schema.json"), "utf8"));

export const LIMITS = {
  maxFileBytes: 5 * 1024 * 1024,
  maxThemeBytes: 20 * 1024 * 1024,
  maxFiles: 50,
  maxCssBytes: 200 * 1024,
};

// Files allowed at the theme root, plus anything allowed inside assets/.
const ROOT_FILES = /^(theme\.json|styles\.css|preview\.(png|jpg|jpeg|webp)|README\.md)$/;
const ASSET_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".woff2"]);

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateManifest = ajv.compile(schema);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push({ full, size: st.size });
  }
  return out;
}

// Checks the CSS for anything that could load or run code from outside the theme.
// The app also enforces a strict Content-Security-Policy; this catches problems early in review.
export function checkCss(css, themeDir) {
  const problems = [];
  const lower = css.toLowerCase();

  if (lower.includes("@import")) problems.push("@import is not allowed; put everything in styles.css");
  for (const bad of ["expression(", "behavior:", "-moz-binding", "javascript:", "vbscript:"]) {
    if (lower.includes(bad)) problems.push(`'${bad}' is not allowed`);
  }
  if (/<\s*\/?\s*(script|style|html)/i.test(css)) problems.push("HTML tags are not allowed in CSS");

  const urlRe = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
  let m;
  while ((m = urlRe.exec(css)) !== null) {
    const ref = m[2].trim();
    if (ref === "") { problems.push("empty url()"); continue; }
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith("//")) {
      problems.push(`url(${ref}) points outside the theme; only files inside assets/ are allowed`);
      continue;
    }
    const clean = ref.replace(/^\.\//, "");
    if (!clean.startsWith("assets/") || clean.split("/").includes("..")) {
      problems.push(`url(${ref}) must point to a file inside assets/`);
      continue;
    }
    if (!existsSync(join(themeDir, clean))) problems.push(`url(${ref}) points to a file that does not exist`);
  }
  return problems;
}

export function validateTheme(id) {
  const dir = join(THEMES_DIR, id);
  const errors = [];

  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [`themes/${id} is not a folder`];

  const files = walk(dir);
  let total = 0;
  for (const f of files) {
    const rel = relative(dir, f.full).split(sep).join("/");
    total += f.size;
    if (f.size > LIMITS.maxFileBytes) errors.push(`${rel} is larger than 5 MB`);
    const isRoot = !rel.includes("/");
    if (isRoot && !ROOT_FILES.test(rel)) errors.push(`${rel} is not an allowed file at the theme root`);
    if (!isRoot) {
      if (!rel.startsWith("assets/")) errors.push(`${rel}: sub-folders other than assets/ are not allowed`);
      else if (!ASSET_EXT.has(extname(rel).toLowerCase())) errors.push(`${rel}: only png, jpg, webp and woff2 files are allowed in assets/`);
    }
  }
  if (files.length > LIMITS.maxFiles) errors.push(`too many files (${files.length}, max ${LIMITS.maxFiles})`);
  if (total > LIMITS.maxThemeBytes) errors.push(`theme is larger than 20 MB`);

  const manifestPath = join(dir, "theme.json");
  if (!existsSync(manifestPath)) return [...errors, "theme.json is missing"];

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    return [...errors, `theme.json is not valid JSON: ${e.message}`];
  }

  if (!validateManifest(manifest)) {
    for (const err of validateManifest.errors) {
      errors.push(`theme.json${err.instancePath || ""} ${err.message}${err.params?.allowedValues ? ` (${err.params.allowedValues.join(", ")})` : ""}`);
    }
  }
  if (manifest.id !== id) errors.push(`theme.json id "${manifest.id}" must match the folder name "${id}"`);
  if (manifest.preview && !existsSync(join(dir, manifest.preview))) errors.push(`preview file ${manifest.preview} is missing`);

  const cssPath = join(dir, "styles.css");
  if (!existsSync(cssPath)) {
    errors.push("styles.css is missing");
  } else {
    const css = readFileSync(cssPath, "utf8");
    if (Buffer.byteLength(css) > LIMITS.maxCssBytes) errors.push("styles.css is larger than 200 KB");
    errors.push(...checkCss(css, dir).map((p) => `styles.css: ${p}`));
  }
  return errors;
}

function main() {
  const ids = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(THEMES_DIR).filter((n) => statSync(join(THEMES_DIR, n)).isDirectory());

  let failed = 0;
  for (const id of ids) {
    const errors = validateTheme(id);
    if (errors.length) {
      failed++;
      console.log(`✗ ${id}`);
      for (const e of errors) console.log(`    - ${e}`);
    } else {
      console.log(`✓ ${id}`);
    }
  }
  console.log(`\n${ids.length - failed}/${ids.length} themes valid`);
  if (failed) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
