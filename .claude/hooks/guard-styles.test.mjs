// Run: yarn test:hooks
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { check } from "./guard-styles.mjs";

const dir = "/repo";
const edit = (file, new_string, old_string = "", current = old_string) =>
  check({ file_path: `${dir}/${file}`, old_string, new_string }, () => current);
const write = (file, content, current = "") => check({ file_path: `${dir}/${file}`, content }, () => current);

test("blocks any edit to _custom.scss unless VC_THEME_FORK=1", () => {
  const custom = "client-app/assets/styles/_custom.scss";
  assert.ok(write(custom, ""));
  process.env.VC_THEME_FORK = "1";
  assert.equal(write(custom, ".x { color: red; }"), null);
  delete process.env.VC_THEME_FORK;
});

test("blocks !important in every form, kit included", () => {
  assert.ok(edit("client-app/shared/a.vue", "  color: red !important;"));
  assert.ok(edit("client-app/ui-kit/b.vue", "  @apply min-w-full #{!important};"));
  assert.ok(edit("client-app/shared/a.scss", "  @apply flex !mt-4;"));
  assert.ok(edit("client-app/shared/a.scss", "  @apply flex lg:!mt-4;"));
  assert.ok(edit("client-app/shared/a.vue", '<div class="!mt-4 flex">'));
  assert.ok(edit("client-app/shared/a.vue", '<div class="!-mt-4">'));
  assert.ok(edit("client-app/shared/a.vue", '<div class="lg:!hidden">'));
  assert.ok(edit("client-app/shared/a.vue", "<div :class=\"['!mt-4']\">"));
});

test("passes JS negation in :class", () => {
  assert.equal(edit("client-app/shared/a.vue", "<div :class=\"{ 'text-neutral-400': !item.isReturnable }\">"), null);
});

test("blocks a partial-line edit that adds an important utility", () => {
  assert.ok(edit("client-app/shared/a.vue", "!mt-4", "mt-4", '<div class="flex mt-4">'));
});

test("blocks .vc-* selectors in styles outside the kit, allows them inside", () => {
  const style = (css) => `<style lang="scss">\n${css}\n</style>`;
  assert.ok(write("client-app/shared/a.vue", style("  .vc-widget__header { color: red; }")));
  assert.ok(write("client-app/pages/p.vue", style("    :deep(.vc-table__cell) {")));
  assert.ok(write("client-app/pages/p.vue", style("  button.vc-button {")));
  assert.ok(edit("client-app/shared/a.scss", ".vc-x {"));
  assert.equal(edit("client-app/ui-kit/c/vc-x.vue", "  .vc-button & {"), null);
  assert.equal(edit("client-app/assets/styles/dark/x.scss", "html.dark .vc-x {"), null);
  assert.equal(edit(".claude/worktrees/w/client-app/ui-kit/x.scss", ".vc-x {"), null);
  assert.equal(
    check({ file_path: "C:\\repo\\client-app\\ui-kit\\x.scss", old_string: "", new_string: ".vc-x {" }, () => ""),
    null,
  );
});

test("passes .vc-* outside <style>", () => {
  assert.equal(edit("client-app/shared/a.vue", 'el.querySelector(".a .vc-widget")'), null);
  assert.equal(edit("client-app/shared/a.vue", "<!-- see .vc-widget -->"), null);
});

test("passes legacy code, blocks copying it", () => {
  const legacy = '<template><div class="!mt-4" /></template>\n<style>\n  .vc-widget__header { color: red; }\n</style>';
  assert.equal(write("client-app/shared/a.vue", `${legacy}\n<!-- edited -->`, legacy), null);
  assert.equal(edit("client-app/shared/a.vue", "  gap: 1rem;\n</style>", "</style>", legacy), null);
  assert.ok(
    edit(
      "client-app/shared/a.vue",
      "  .vc-widget__header { color: red; }\n  .vc-widget__header { color: red; }",
      "  .vc-widget__header { color: red; }",
      legacy,
    ),
  );
});

test("passes non-style files and tokens", () => {
  assert.equal(edit("client-app/shared/a.test.ts", "color: red !important;"), null);
  assert.equal(edit("client-app/shared/a.scss", "  --vc-icon-color: var(--color-primary-500);"), null);
});

test("runs as a hook from a path with a space", () => {
  const hookDir = mkdtempSync(join(tmpdir(), "a b "));
  const hook = join(hookDir, "guard-styles.mjs");
  copyFileSync(new URL("./guard-styles.mjs", import.meta.url), hook);
  const file = join(hookDir, "x.scss");
  writeFileSync(file, "");

  const result = spawnSync("node", [hook], {
    input: JSON.stringify({
      tool_input: { file_path: file, old_string: "", new_string: "a { color: red !important; }" },
    }),
  });

  assert.equal(result.status, 2);
});
