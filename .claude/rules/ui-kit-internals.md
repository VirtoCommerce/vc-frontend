---
paths:
  - "client-app/ui-kit/**"
---

# Changing the UI kit (`client-app/ui-kit/**`)

How the rest of the app uses the kit is in `ui-kit.md`.

1. **Every changed kit line is a merge conflict for every client fork and a visual change for every consumer.**
   A kit change needs a trigger in the PR (a consumer that needs it). Unrelated kit edits are dropped. A default
   change (`size`, padding, colour, cursor) that shifts the whole app is a global change: it ships only with the
   designer's agreement and the developer's explicit instruction recorded in the PR description, and is listed
   under Breaking changes.
2. File set per component: `<layer>/<name>/vc-<name>.vue`, `vc-<name>.types.d.ts` (global `declare global` types,
   `Vc<Name><Prop>Type`), `vc-<name>.stories.ts` (Storybook story — required for a new component), optional
   `vc-<name>.test.ts`. Registration: export in `<layer>/index.ts` **and** `GlobalComponents` entry in
   `<layer>/types.d.ts`. Missing the export → not registered; missing the `GlobalComponents` entry → untyped in templates.
3. Boundaries: the kit must not import `@/shared`, `@/modules`, `@/pages`; new imports from `@/core` are also
   avoided (the kit is being made independent — `VcTable` moved to local types/constants). Use kit-local types,
   string-literal unions instead of enums, constants in `ui-kit/constants`.
4. Kit text (labels, aria-labels) uses keys from `client-app/ui-kit/locales/*.json` (`ui_kit.*`), all 13 locales.
5. Styling inside the kit:
   - block `vc-<name>`; modifiers `vc-x--flag`, `vc-x--size--md`, `vc-x--color--primary`, `vc-x--{variant}--{color}`;
   - prop values reach CSS through `--props-<name>: v-bind(props.x)` at the top of the block;
   - private short variables (`--size`, `--bg-color`, `--radius`) resolve **prop → public → global → literal** — the
     prop always first, so an explicit prop on one instance beats the theme-wide token:
     `--radius: var(--vc-chip-radius, var(--vc-radius, 0.5rem));` (no prop),
     `--max-width: var(--props-max-width, var(--vc-badge-max-width, 100%));`. Token-first chains are legacy;
   - states captured with `$disabled: ""; &--disabled { $disabled: &; }` and reused (`&:hover:not(#{$disabled})`);
   - variant × colour matrices generated with `@each` over `$colors` / `$variants`, not copy-pasted;
   - colour tokens for variants live in `assets/styles/_ui-kit-tokens.scss` as
     `--vc-<comp>-<variant>-<color>-<part>: var(--color-vc-<part>-<variant>-<color>, <palette fallback>)`;
   - dark remaps in `assets/styles/dark/<layer>/vc-<name>.scss`, print in `assets/styles/print/<layer>/...`;
   - focus ring via the `focus-ring` mixin, small targets via `hit-area`, motion under `prefers-reduced-motion`.
6. **Public tokens are API.** A new `--vc-*` variable must be consumed (a token nothing reads is dead) and must not
   pin a related value (a font-size token next to a literal line-height desyncs). Renaming or removing one follows
   `client-app/ui-kit/DEPRECATION.md`: alias the old name in the new one's fallback, add a row to its table.
7. **Deprecations follow `DEPRECATION.md`** exactly: component → story `tags: ["deprecated"]` + `@deprecated`
   JSDoc in `index.ts` and `types.d.ts` + dev `console.warn` after `defineProps` + eslint
   `vue/no-restricted-html-elements`; prop value → keep it in the union with `/** @deprecated */`, normalise via
   `resolveVariant()` / `LEGACY_VARIANT_MAP`, `Deprecations` story. Removing a prop/value/slot/event without that
   cycle is a breaking change → `major`.
8. Unknown enum values (e.g. a `variant` string coming from theme settings) should fall back to the default
   rather than render an unstyled component.
9. Exposed API stays minimal: `defineExpose` only for imperative needs (`focus`, `blur`, `el`), typed via a
   `Vc<Name>ExposedType`.
10. **Kit components don't restyle each other either.** A kit component that needs another one (B) to look
    different uses B's prop or `--vc-<b>-*` variable; if none exists, add one in B's file, then set it from A. A layout
    mix on B's root (margin, flex, width, order) is fine. Styling B's elements, a tag B renders, or a property B owns
    (colour, background, radius, border, cursor) from A's file is bad code, accepted only when nothing else works.
    **Before writing it, rule out every alternative in writing** — one line each, why it fails here: B's existing
    props/slots/tokens (from B's source and story); a new prop or token on B; composition (pass a prop or slot
    content, use another B variant, wrap B); a layout mix on B's root; a better split of responsibilities; a design
    deviation. The list goes into the PR description; an agent shows it to the developer and waits before writing
    the exception. Then all of these must hold: no prop/token route is possible (teleport cuts variable inheritance,
    native pseudo-elements, markup we don't own); it touches B's root or a stable element; a comment names B, says
    why, and names the closest ruled-out alternative; a better split of responsibilities would not remove it.
    Otherwise B's selectors live only in B's file and its `dark/` / `print/` mirrors.

## Legacy — don't flag, don't copy

- Existing `@/core` imports inside the kit and one `@/shared` import.
- Existing cross-component selectors (`@at-root .vc-product-card`, `@at-root .vc-button` in `vc-icon`,
  `.vc-popover__body:has(...)`, `vc-line-item`'s `:has(.vc-*)`) — don't add new ones.
