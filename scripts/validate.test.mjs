import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkCss } from "./validate.mjs";

const dir = mkdtempSync(join(tmpdir(), "df-theme-"));
mkdirSync(join(dir, "assets"));
writeFileSync(join(dir, "assets", "bg.png"), "x");

test("plain variables pass", () => {
  assert.deepEqual(checkCss(".df-dock { --df-radius: 12px; }", dir), []);
});

test("local asset passes", () => {
  assert.deepEqual(checkCss(".df-dock { background: url('assets/bg.png'); }", dir), []);
});

test("remote url is rejected", () => {
  assert.equal(checkCss(".df-dock { background: url(https://evil.example/t.png); }", dir).length, 1);
  assert.equal(checkCss(".df-dock { background: url(//evil.example/t.png); }", dir).length, 1);
});

test("data: and javascript: urls are rejected", () => {
  assert.ok(checkCss(".a { background: url(data:image/png;base64,AAAA); }", dir).length >= 1);
  assert.ok(checkCss(".a { background: url(javascript:alert(1)); }", dir).length >= 1);
});

test("path traversal is rejected", () => {
  assert.equal(checkCss(".a { background: url(assets/../../secret.png); }", dir).length, 1);
});

test("@import and legacy script hooks are rejected", () => {
  assert.ok(checkCss("@import 'x.css';", dir).length >= 1);
  assert.ok(checkCss(".a { width: expression(alert(1)); }", dir).length >= 1);
  assert.ok(checkCss(".a { behavior: url(x.htc); }", dir).length >= 1);
});

test("missing asset is reported", () => {
  assert.equal(checkCss(".a { background: url(assets/nope.png); }", dir).length, 1);
});
