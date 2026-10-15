# Styles: cascade layers and designs

This folder holds the storefront's global stylesheets and the **cascade-layer order** every
stylesheet in the app is sorted into. Layers decide who wins *before* specificity does: our
component styles sit in low layers, design and preset rules in higher ones, and anything a fork
writes outside a layer beats all of them.

The storefront ships two designs from one markup: `classic` (default) and `soft`. The `design`
setting in `client-app/config/settings_data.json` picks one; `app-runner.ts` writes it to
`<html data-design="…">` before the app mounts, and the active colour preset to
`<html data-preset="…">`. The design switches styles only: markup and `Vc*` props never change,
and the design never changes the preset.

---

## The order

`_layers.scss` is the single source of the order:

```css
@layer theme, base, plugins-vendor, vc, components, plugins, utilities;
@layer base.tw, components.tw;
@layer vc.vendor, vc.kit, vc.app, vc.design, vc.preset;
@layer vc.design.kit, vc.design.app;
```

- The first declaration a page sees fixes the order; an identical re-declaration is a no-op. So
  **every entry stylesheet starts with `@use "layers"`** (by relative path where `@/` does not
  resolve, as in `storybook-styles/`), and the entries can never disagree.
- Every layer name used anywhere is in this statement. `yarn check:css-layers` fails otherwise
  (it reads the app build; Storybook is not checked).
- Top-level names other than `vc`, `plugins-vendor` and `plugins` are Tailwind v4's own, in its
  own relative order, so moving to v4 does not move our layers. `plugins` is reserved for Module
  Federation plugin CSS: above every host component layer, below the host utilities.
  `plugins-vendor` is reserved for third-party CSS a plugin bundles: above host preflight, below
  every host component layer and below the plugin's own `plugins` rules.
- **The order is public API for forks: layers are only ever appended**, never reordered or renamed.

> **Tailwind 3 trap.** A block named exactly `@layer base`, `components` or `utilities` is a
> Tailwind 3 directive, not a native layer: Tailwind moves its contents to the matching
> `@tailwind` rule. Never write one expecting a native layer; use the dotted names above.

## What goes where

| Layer | Contents |
| --- | --- |
| `theme` | `_colors.scss`, `_ui-kit-tokens.scss`, `--vc-radius` (all from `main.scss`); soft hook tokens (`soft/_tokens.scss` on both sides). No soft colour tokens |
| `base.tw` | all of `preflight.scss`: `@tailwind base`, its `@layer base {}` rules (incl. the focus ring), the number-input and `::-ms-reveal` rules |
| `plugins-vendor` | reserved, empty: third-party CSS bundled by a plugin |
| `vc.vendor` | swiper (`vendors/_swiper.scss`), nouislider (`ui-kit/.../slider/nouislider.layer.css`) |
| `vc.kit` | ui-kit SFC styles (automatic, see below), `_dark-kit.scss`, `_print-kit.scss` |
| `vc.app` | app SFC styles (automatic), `_helpers.scss`, `_deprecated.scss`, `vendors/_builder-io.scss`, `html { scroll-padding-top }`, `#popover-host` (`App.vue`), `_dark-app.scss`, `_print-app.scss` |
| `vc.design.kit` | soft files of ui-kit blocks: `client-app/ui-kit/styles/soft/` |
| `vc.design.app` | soft files of app blocks: `client-app/assets/styles/soft/` |
| `vc.preset` | reserved for small per-preset fixes on `html[data-preset="…"]`; empty so far |
| `components.tw` | `@tailwind components` |
| `plugins` | reserved, empty |
| `utilities` | declared, empty on Tailwind 3 |

Element-level dark token remaps stay with their dark files (`vc.kit` / `vc.app`), never in `theme`.

### Unlayered, on purpose

- `_custom.scss`, loaded just before `@tailwind utilities` at the end of `main.scss`;
- the Tailwind utilities;
- the runtime preset `<style id="vc-theme-variables">` from `core/plugins/config.plugin.ts`: its
  `--color-*` names overlap with none of our declarations;
- third-party runtime CSS (Builder SDK, Google Maps, tw-elements).

Unlayered CSS beats every layer, so a Tailwind utility in a template always wins over BEM, and fork
CSS keeps working against utilities as before.

### Component styles are layered for you

`postcss.sfc-layers.cjs` (registered in `postcss.config.cjs`, after `tailwindcss`) wraps every
Vue SFC `<style>` module: `client-app/ui-kit/**` → `vc.kit`, every other component → `vc.app`. It
hoists `@charset`/`@import`, restates the `_layers.scss` order in front of each module (a component
chunk can load before the entry CSS, as in the federation build), and skips `App.vue` and every
`.scss`/`.css` entry. **Never hand-wrap an SFC style in `@layer`.** The repeated statement is a
known cost (about 0.6 KB gzip on the CSS every page loads, about 75 B per lazy chunk); an identical
re-declaration changes nothing.

### Entry stylesheets

Each is layered by hand and starts with `@use "layers"`: `preflight.scss`, `vendors.scss`,
`main.scss` (loaded by `App.vue`), both `soft/index.scss`, and in Storybook
`storybook-styles/preflight.scss`, `main.scss` and `swiper.scss` (`utilities.scss` stays
unlayered). A new entry follows the same pattern: `@use "layers"` first, then each part with
`@include meta.load-css(…)` inside its `@layer` block. Swiper is loaded with a plain
`@import … layer(vc.vendor)` (`vendors/_swiper.scss`).

---

## The soft design

Two directories, each with an `index.scss` entry loaded only when `design` is `soft` (classic
never downloads them). Everything sits inside `@media screen`, so print keeps the classic rules.

| Directory | Blocks | Layer |
| --- | --- | --- |
| `client-app/ui-kit/styles/soft/` | ui-kit blocks | `vc.design.kit` |
| `client-app/assets/styles/soft/` | app blocks | `vc.design.app` |

- **One BEM block per file, file name = block name**; folders mirror the component structure, like
  `dark/`. Add each file to its side's `index.scss`.
- **Selector:** `html[data-design="soft"] .block__el`. Dark soft goes in the same file under
  `html.dark[data-design="soft"]`: a soft rule beats the base block's dark rules too, so each soft
  file restates its own dark values.
- **Restate every state.** A soft rule sits above the component's layer and beats every state of
  the base rule (hover, disabled, active, modifiers, dark), so a soft file that changes a property
  also declares it for every state of the block that changes it. Print is untouched: soft is
  screen only.
- **Tokens:** a soft value goes where the base resolves it.
  - The base reads a hook token that no element sets (`--vc-tooltip-radius`,
    `--vc-dropdown-menu-radius`): set it on `html[data-design="soft"]` in that side's
    `_tokens.scss`.
  - An element sets the token itself (`--vc-button-radius` on `.vc-input` and
    `.vc-date-range-input`): override it on the same selector, in the soft file of the block whose
    stylesheet sets it. Elsewhere the same token can still be a hook in `_tokens.scss`.
- **No colour tokens.** Colour belongs to presets.
- No `opacity` / `transform` / `transition` on elements that carry a Vue `<Transition>` class, such
  as the `.fade-*` helpers used by VcLoaderOverlay and VcPopupSidebar.
- **App soft files never target a kit block.**
- **BEM, not utilities.** A soft rule can never beat a Tailwind utility in a template. Every element
  a soft file overrides must be BEM with no utility for that property, including utilities passed
  onto kit components. Convert such an element in that component's design task.

---

## Checks

```bash
yarn check:soft-styles   # soft files: block naming, side, no colour tokens (source, any time)
yarn build && yarn check:css-layers   # built CSS: layer names and order (dist/, lazy chunks too)
```

- `scripts/check-soft-styles.ts`: in `soft/**/<block>.scss` every rule that styles its selector
  (declarations, `@apply`/`@include`/`@extend`, directly or inside a conditional or Sass
  control-flow at-rule) starts with the
  `html[data-design="soft"]` prefix and names `<block>`, either in its subject (`.x`, `.x__*`,
  `.x--*`), in an ancestor compound (not a `~`/`+` sibling), or inside a `:has()` of the subject;
  `<block>` is defined in a stylesheet on that directory's side, comments excluded (keyed on block
  + directory, not on the `vc-` prefix). `_tokens.scss` rules target `html[data-design="soft"]`
  itself; `index.scss` and other partials hold no rules. No custom property whose name contains
  `color` or `bg`, in any soft file. `check-soft-styles` catches the common ways a soft rule
  can reach outside its block; unusual `:has` forms (selector lists, nesting inside `:is`/`:where`)
  are not covered and are a review matter.
- `scripts/check-css-layers.ts` (built CSS in `dist/`): every layer name is declared in
  `_layers.scss`; the first linked stylesheet that declares layers starts with `theme`, places every
  declared layer, and its names follow the declared order per parent.

Both run in CI (`.github/workflows/theme-ci.yml`). `yarn lint` does not parse SCSS.

---

## Overriding in a fork

- **`_custom.scss` and your own unlayered CSS beat every layer**, whatever its specificity. One
  class is enough to override any component, dark or print rule.
- To compete by specificity with our app styles instead, put your rule in their layer:
  `@layer vc.app { … }`.
- **Tailwind utilities** in templates are unlayered and still beat our layers.
- **`!important` inverts across layers**: a layered `!important` beats an unlayered one. A fork's
  `!important` cannot override an `!important` inside a layer: swiper's and nouislider's in
  `vc.vendor`, and any still left in our own layers. Never add `!important` to our layered styles.
- **Plugin stylesheets** stay unlayered until they move into `plugins`, so for now they beat our
  layered components.

### Files that moved

A fork that edited one of these merges its change into the new place, in the new layer:

| Before | Now |
| --- | --- |
| `_dark.scss` | `_dark-kit.scss` (`html.dark` rules, kit dark files; `vc.kit`) and `_dark-app.scss` (`dark/shared/**`; `vc.app`) |
| `_print.scss` | `_print-kit.scss` (kit print files; `vc.kit`) and `_print-app.scss` (`html`/`body`/`#app` rules; `vc.app`) |
| `@import … layer(nouislider)` in `nouislider.layer.css` | `layer(vc.vendor)` |
| `@use "swiper/css…"` in `vendors/_swiper.scss` | `@import "swiper/css…" layer(vc.vendor);` |
| `.storybook/preview.ts` importing `_ui-kit-tokens.scss` and `_dark.scss` | one import of `storybook-styles/main.scss` |

Every entry stylesheet now starts with `@use "layers"`.
