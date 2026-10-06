// Run: node --test .claude/hooks/guard-styles.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { check } from "./guard-styles.mjs";

const dir = "/repo";
const edit = (file, new_string, old_string = "") => check({ file_path: `${dir}/${file}`, old_string, new_string }, dir);

test("blocks any edit to _custom.scss", () => {
  assert.ok(check({ file_path: `${dir}/client-app/assets/styles/_custom.scss`, content: "" }, dir));
});

test("blocks !important in every form, kit included", () => {
  assert.ok(edit("client-app/shared/a.vue", "  color: red !important;"));
  assert.ok(edit("client-app/ui-kit/b.vue", "  @apply min-w-full #{!important};"));
  assert.ok(edit("client-app/shared/a.vue", "  @apply flex !mt-4;"));
  assert.ok(edit("client-app/shared/a.vue", '<div class="!mt-4 flex">'));
});

test("blocks .vc-* selectors outside the kit, allows them inside", () => {
  assert.ok(edit("client-app/shared/a.vue", "  .vc-widget__header { color: red; }"));
  assert.ok(edit("client-app/pages/p.vue", "    :deep(.vc-table__cell) {"));
  assert.equal(edit("client-app/ui-kit/c/vc-x.vue", "  .vc-button & {"), null);
  assert.equal(edit("client-app/assets/styles/dark/x.scss", "html.dark .vc-x {"), null);
});

test("passes legacy lines, JS strings and non-style files", () => {
  const legacy = "  .vc-widget__header { color: red; }";
  assert.equal(edit("client-app/shared/a.vue", `${legacy}\n  gap: 1rem;`, legacy), null);
  assert.equal(edit("client-app/shared/a.vue", 'el.querySelector(".vc-widget")'), null);
  assert.equal(edit("client-app/shared/a.test.ts", "color: red !important;"), null);
  assert.equal(edit("client-app/shared/a.vue", "  --vc-icon-color: var(--color-primary-500);"), null);
});
