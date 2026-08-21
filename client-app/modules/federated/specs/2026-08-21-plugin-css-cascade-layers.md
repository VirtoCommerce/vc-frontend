# Containing plugin CSS with native cascade layers

**Status:** decided, not implemented — VCST-5760 (sprint 26-17).
**Supersedes:** the "wrap plugin CSS in `@layer plugin`" idea prototyped and reverted in PR #2445,
and the `<style scoped>` + `@apply` convention prototyped on `feat/VCST-5409-sales-reps` (PR #2372,
not landing).

## The two problems

A federated plugin's CSS is linked into `document.head` as a plain stylesheet, subject to nothing
but specificity and load order. That leaves two independent problems, and they need different fixes.

### 1. A plugin can silently reskin the host

Tailwind runs inside the plugin's own build against the host's preset
(`@vc-frontend/core/tailwind-preset`), scanning only the plugin's sources. So the plugin ships its
own copy of host-owned utility class names — `.p-6`, `.text-primary-700` — and those selectors match
host markup.

The copies are identical as long as the presets agree. They are not guaranteed to:

- `build-types.mjs` auto-bumps `CORE_VERSION` **minor** on any change to
  `contract/tailwind-preset.cjs` ("a design-token change must bump CORE_VERSION exactly like a
  contract change");
- `checkHostCompatibility` normalizes a plugin's `requiredHostVersion` from `1.2.0` to `^1.2.0`.

So a plugin built against core 1.2.0 legally loads on a host running 1.4.0 with a different preset,
and its stale `.p-6` silently redefines padding across the whole storefront. The version contract
bounds the damage; it does not prevent it.

### 2. A plugin cannot deliberately override the host

When a plugin's widget renders inside host DOM at an extension point, host rules reach it. 236 of
262 host SFC style blocks are global — only 26 are `scoped`, and `:deep()` appears 3 times — and
host chunk CSS loads lazily, so which stylesheet comes last depends on the route the user arrived
through. Whether a plugin's rule wins is a specificity-plus-order lottery, and the only reliable
escape is `!important`.

## Decision

Native cascade layers, order declared once by the host:

```css
@layer host-base, host-components, plugin, host-utilities, plugin-overrides;
```

| layer | contents |
| --- | --- |
| `host-base` | `preflight.scss` (`@tailwind base`) |
| `host-components` | host SCSS partials and SFC style blocks |
| `plugin` | all of a plugin's CSS — its utilities and its component styles |
| `host-utilities` | the host's `@tailwind utilities` |
| `plugin-overrides` | a plugin's deliberate overrides of host rules |

Each position earns its place:

- `plugin` **below** `host-utilities` — a plugin's copy of a host utility can never win on host
  markup. Problem 1 is gone by construction, without prefixes.
- `plugin` **above** `host-components` and `host-base` — `class="p-6"` in a plugin template beats
  preflight and beats the global host rules that reach into the plugin's own DOM. No silent no-ops,
  which is the failure mode that makes the reverse order unacceptable.
- `plugin-overrides` on top — overriding the host is deterministic, needs no `!important` and no
  specificity games, and is opt-in by the act of putting the rule in that layer. That is the
  "deliberate" half of the requirement.

A plugin author does nothing: plain `p-6` in templates, `@apply p-6` in styles, no prefixes, no
wrapper markup. `@apply` never leaked in the first place — it inlines declarations into the
plugin's own selector rather than shipping a copy of the class, so only template usage was ever the
problem.

## Measured regression surface: one place

Moving `@tailwind utilities` into a top layer means utilities start beating host component CSS.
Scans over `client-app`, every hit hand-verified in the file:

| check | raw hits | real |
| --- | --- | --- |
| host rule whose selector **is** a bare utility name (`.pt-5 { }`) | 7 | **0** |
| host rule overriding a utility via **specificity** | 5 | **1** |
| utility passed from a parent onto a component root setting the same property | 7 | **3** |

- The 7 "bare utility" matches are component names that merely start like utilities:
  `.my-customers`, `.order-card`, `.order-status`, `.text-block`, `.top-header-link`,
  `.top-header-organizations`, `.top-sellers`.
- The one real specificity override is
  `shared/static-content/components/call-to-action.vue:3` —
  `.call-to-action-block.bg-neutral-800 .text-50 { color: white }`. It must move to a layer above
  `host-utilities` (or keep its win another way). The other four candidates
  (`products-block`, `products-carousel`, `slider`, `features`) use `&.bg-neutral-800` as a state
  hook and set `color`, not `background` — no conflict.
- All three real parent-utility collisions flip in the direction that **restores the caller's
  intent**: `<VcMarkdownRender class="text-sm">` vs `.vc-markdown-render { font-size: 1rem }` (x2),
  and `<ChangePasswordForm class="lg:w-1/2">` vs `.change-password-form { @apply w-full }` (x1).
  The two false positives were `card-labels` (`ml-6` vs `mt-5` — different sides) and
  `currency-selector` (`h-full` vs `h-full` — same value).

Scan blind spot: only static `class="..."` attributes were parsed. `:class` bindings carrying a
literal utility token are 27 of 3007 class-bearing attributes — 0.9%.

`!important` is unaffected: important beats normal regardless of layer, so all 27 existing
`!important` declarations keep working — including the ones that exist precisely to beat a utility.

## Alternatives rejected

- **Tailwind `prefix`** (`.myplugin-p-6`) — the usual Module Federation answer, and it does solve
  problem 1. Rejected: it taxes plugin DX permanently, and in Tailwind v4 the prefix becomes a
  variant (`class="tw:flex"`, `@apply tw:flex`), which is worse.
- **`@scope`** — Baseline as of 2026 (Chrome 118+, Safari 17.4+, Firefox 146+, Samsung 25+), and it
  would give identity isolation by DOM subtree instead of by name. Rejected: any `<Teleport>` — the
  ui-kit modals — moves content out of the scope root, where every plugin style silently dies.
  Worth revisiting only if plugins ever come from third parties, where name-based trust is not
  enough.
- **`<style scoped>` + `@apply`, no global layer** — full isolation, but a plugin that is three
  widgets rather than a page has nowhere to put shared styles, and utility classes in templates
  become impossible.
- **Shadow DOM** — breaks host design tokens, teleports and overlays.
- **A layer for the plugin with the host left unlayered** — the shape prototyped and reverted in
  PR #2445. Unlayered beats layered, so the host would win everything and a plugin could not style
  its own markup without `!important`.

## Implementation notes

- **Browser support is not a gate.** `@layer` ships from Chrome 99 / Safari 15.4 / Firefox 97; the
  repo's oldest browserslist targets are Chrome 118, Safari 26.3, iOS 18.5, Samsung 29.
- **Tailwind 3's `@layer` is not a native layer.** It is a preprocessor directive and the output is
  unlayered, so wrapping is a PostCSS step at the end of the chain (`postcss.config.cjs`), choosing
  the layer name per file. The plugin scaffold's own `postcss.config.cjs` needs the same step for
  `plugin`.
- **Tailwind v4 emits native layers itself** (`theme, base, components, utilities`), at which point
  the host side reduces to one order statement declared before the import:
  `@layer theme, base, components, plugin, utilities, plugin-overrides;`. The layer names in this
  spec are the only thing that changes, so shipping on v3 does not lock plugins in.
- **`postcss-cascade-layers`** (pulled in by `postcss-preset-env`) rewrites `@layer` to `:not(#\#)`
  and would defeat all of this. It is not in the pipeline today and must not be added.
- **The runtime `<style id="vc-theme-variables">`** injected by `config.plugin.ts` would stay
  unlayered and start winning. Wrap it in `host-components` to preserve today's ordering. Checked:
  no name overlap either way — the SCSS `:root` blocks declare derived vars
  (`--body-bg-color: var(--color-body-bg, …)`) while the preset injects the source vars
  (`--color-body-bg`).
- **Nothing else escapes the pipeline.** No remote `@import url()` remains after `postcss-import`,
  vendor CSS from `node_modules` goes through the same PostCSS, and the two `<link>` tags in
  `index.html` point at `.scss` files that Vite processes. The Google Fonts `<link>` carries only
  `@font-face`, which layers do not affect.
