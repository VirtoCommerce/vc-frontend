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
| `theme` | `_colors.scss`, `_ui-kit-tokens.scss`, `--vc-radius` (all from `main.scss`); soft hook tokens (`soft/_tokens.scss` on both sides), soft scale and role tokens (app side). No soft colour tokens |
| `base.tw` | all of `preflight.scss`: `@tailwind base`, its `@layer base {}` rules (incl. the typography roles and the focus ring), the number-input and `::-ms-reveal` rules |
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
`.scss`/`.css` entry. **Never hand-wrap an SFC style in `@layer`.** Each SFC module carries one
copy of the order statements; an identical re-declaration changes nothing.

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
  `dark/`. Add each file to its side's `index.scss` with `@include meta.load-css(…)` inside
  `@media screen { @layer vc.design.kit { … } }` (`vc.design.app` on the app side).
- **BEM SCSS as in any component:** nest under the soft prefix and capture states with `$x: &`,
  as rule 13 of `.claude/rules/styles.md` describes; the check reads the compiled selectors. A
  capture holds the soft prefix, so compound it on the block (`&--disabled:not(#{$loading})`); read
  as an ancestor (`#{$x} &`) it repeats the prefix and never matches. For an element under a block
  state, nest the element in the state: `&--disabled { .vc-button__icon { … } }`. Typing the block
  name again here is the one exception to rule 13: its `#{$x} &__icon` form repeats the soft prefix.
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
- **A soft file restyles only its own block.** The element each rule styles is its block or one of
  its elements, and it names no other block of either side outside `:not()`.
- **BEM, not utilities.** A soft rule can never beat a Tailwind utility in a template. Every element
  a soft file overrides must be BEM with no utility for that property, including utilities passed
  onto kit components. Convert such an element in that component's design task.

---

## Shape and typography tokens

A design changes radii, shadows and type through tokens, never through templates. Three tiers,
each falling back to the one below and ending at today's value:

```
component  --vc-button-radius            (per component, added in its own task)
   ↓ var(…, role or scale)
role       --vc-base-font-family, --vc-heading-font-style …
   ↓ var(…, scale)                       (only where a role maps to a step)
scale      --vc-radius-md, --vc-font-size-sm …   ← read by the Tailwind utilities
   ↓ var(…, literal)
literal    today's value: the fallback in tailwind.config.ts (typed there or taken from
           Tailwind's defaultTheme) or in a role rule
```

**Classic sets no scale or role token**, except `--vc-radius`. Their values exist only as `var()`
fallbacks, so classic output does not change and a design sets only what differs.

`--vc-radius` (the default control radius) predates the tiers. Classic sets it to a literal on
`:root` in `main.scss`, components read it directly, and it is not chained to a scale step:
setting `--vc-radius-*` does not move it. A design that changes control radii sets `--vc-radius`
itself.

### Naming

- **Scale: `--vc-<property>-<tailwind key>`**, the key spelled as in Tailwind, lower case,
  `DEFAULT` → `default`: `--vc-radius-<k>`, `--vc-shadow-<k>-<n>` (one token per shadow part, from
  1), `--vc-font-size-<k>`, `--vc-line-height-<k>`, `--vc-font-weight-<k>`,
  `--vc-letter-spacing-<k>`. `--vc-line-height-<k>` holds both the line height bundled with a font
  size (`xxs`…`8xl`) and the `leading-*` keys (`3`…`10`, `none`, `tight`…); never add a t-shirt key
  to `lineHeight`.
- To drop a shadow part a design does not need, set it to `0 0 #0000`, never `none`: `none` is
  invalid inside a shadow list and voids the whole `box-shadow`, rings included.
- `shadow-<colour>` utilities keep classic geometry in every design: Tailwind builds
  `--tw-shadow-colored` from each part's fallback, not from the token.
- **Role and component: `--vc-<owner>-<property>`**: `--vc-base-font-family`,
  `--vc-heading-font-family`, `--vc-heading-text-transform`, `--vc-button-radius`. The only
  exception is the older `--vc-radius`, a bare property name.
- **Font family** has roles only (`base`, `heading`, also the utilities `font-base` and
  `font-heading`), no primitive tokens named after a font. `font-lato` stays a literal Lato for
  places that must stay classic (print).

### Roles

`_typography-roles.scss` is shared by the app and Storybook preflights:

- **base**: `html` uses `font-base` (`--vc-base-font-family`, falling back to Lato).
- **heading**: bare `h1`–`h6` use `font-heading` and read `--vc-heading-font-weight`,
  `--vc-heading-font-style`, `--vc-heading-text-transform` and `--vc-heading-letter-spacing`.
  Every heading token, `--vc-heading-font-family` included, falls back to `inherit`, so
  `font-heading` and a bare heading resolve to the same font family; weight, style, case and
  spacing come only from the h1–h6 rule. Utilities and component styles still win over
  the heading rule. A component with a heading face (a price, a title) uses `font-heading` or a
  component token that ends at the role.
- Italic and text case have no Tailwind scale, so they exist only as role tokens.

### Where a design's value goes

- **Soft:** scale and role tokens on `html[data-design="soft"]` in
  `client-app/assets/styles/soft/_tokens.scss`; dark shadows under
  `html.dark[data-design="soft"]` in the same file. A shadow keeps its step's colour: black
  `rgb(0 0 0 / …)` for the default `shadow` step (from Tailwind's defaultTheme),
  `rgb(from var(--color-additional-950) …)` for the others. Soft changes geometry and alpha,
  never colour.
- **Fonts:** a design's families load from `DESIGN_FONTS` (`core/constants/design.ts`), only for
  that design. The stylesheet link is not awaited, so fonts never hold back the mount. Classic
  requests nothing new.
- **Fork:** set any token on `:root` in `_custom.scss`; it is unlayered, so it beats our `theme`
  layer in every design. A fork loads its own fonts in its `index.html`. Presets stay colour-only.

### Adding a token

- **A role:** a rule or token `--vc-<role>-<property>` whose fallback is a scale token or today's
  value, so classic computes the same; add it to `_typography-roles.scss` when bare elements use it.
  A family role is also a `fontFamily` key in `tailwind.config.ts`: run `yarn build:core-types`
  and commit everything it changes; `yarn validate:core-types` checks the result.
- **A component token:** `--vc-<component>-<property>: var(<role or scale token>, <value>)` in
  the component, in that component's task.
- **A scale:** wrap the Tailwind key in `tailwind.config.ts` with `vcToken` (or `tokenizeScale`),
  keeping today's value as the fallback, then run `yarn build:core-types` and commit everything it
  changes; `yarn validate:core-types` checks the result. Existing tokens do not change.
- Arbitrary values (`rounded-[3px]`, `text-[--x]`) bypass the scale and stay literal.

---

## Checks

```bash
yarn check:soft-styles   # soft files, compiled with Sass: block naming, side, no colour tokens (no build needed)
yarn build && yarn check:css-layers   # built CSS: layer names and order (dist/, lazy chunks too)
```

- `scripts/check-soft-styles.ts` compiles every `.scss` file in each side's `soft/`, hidden ones
  too, with Sass and checks the CSS it emits, so nesting, `$x: &` captures, interpolation,
  `@extend` and mixins are read as Sass resolves them. A problem is reported at the source line
  that wrote it. Each rule below is covered by tests.

  | Rule | Rejected | Why |
  |---|---|---|
  | `soft/**/<name>.scss`: `<name>` is a block of that side (a component file of that name, or the leading class of a rule outside any other rule), `_tokens`, `index` or another `_partial` | any other name; an app file named after a kit block | blocks are per side |
  | each side's `soft/index.scss` exists | a missing entry | otherwise a moved folder passes with nothing checked |
  | a soft file loads only `.scss` files of its side's `soft/`, `sass:` modules and `client-app/assets/styles/_layers.scss` (`@use`, `@forward`, `@import`, `meta.load-css`) | any other stylesheet, or a path that matches several files | the check reads only the files it compiles |
  | every rule a block file emits starts with `html[data-design="soft"]` (`.dark` allowed), and names `html` nowhere else outside a pseudo-class | any other start; `html` in a later compound, as a capture read as an ancestor (`#{$x} &`) writes it | soft rules apply only under the switch; `html` below the root never matches |
  | its last compound, the element it styles, has a class `.<block>`, `.<block>__*` or `.<block>--*` | `.<block> button`, `.<block> > *`, `.x:has(.<block>)` | a soft file restyles its own block |
  | it names no other block of either side outside `:not()`; `[class="…"]` and `[class~="…"]` count as classes, also with the `i` flag | another block, also as an ancestor or in `:has()`; `[class]` by presence, `^=`, `*=`, `$=` or `\|=` | components never restyle each other |
  | `_tokens.scss` rules target `html[data-design="soft"]` itself | anything below `<html>` | tokens are hooks on `<html>` |
  | `index.scss` and other partials emit only rules a block file or `_tokens.scss` emits, as that file emits them (`meta.load-css` of the file) | a rule of their own, a mixin's rules, a loaded file nested under a selector | rules live in block files, where they are checked |
  | the side's `soft/index.scss` ships each block file's rules inside `@media screen > @layer vc.design.kit` (`vc.design.app`) and the `_tokens.scss` rules inside `@media screen > @layer theme`, and loads every block file and `_tokens.scss` that emits rules; below these two wrappers a block keeps its own `@media`, `@supports` and `@container` (only the outer two are checked, so one the entry adds inside the layer passes too) | another outer wrapper or none (`@use` of a block file emits it unlayered), the other side's layer, `@media print`, an `@layer` below the side's layer; a file whose rules it does not ship | soft is screen only and sits in its layer; an unloaded file never ships |
  | no custom property whose name contains `color` or `bg` or ends in `-text`, `-border` or `-icon`, read with escapes resolved | such a property | colour belongs to presets; the kit names its public colour tokens so (its private `--loader-border-r` and `--row-hover-shade` are not caught) |
  | at-rules in the emitted CSS: `@media`, `@supports`, `@container`, `@layer`, `@starting-style` | any other, e.g. `@apply`, `@keyframes`, `@import`, `@scope`, `@property` | they ship CSS the check does not read; `@apply` variants add selectors |

  Vue transition classes (`*-enter-from`, `*-enter-active`, `*-enter-to`, the same for `leave`,
  and `*-move`) and state classes (`is-*`, `has-*`) are never blocks, so a block file may use them
  on its own elements: `html[data-design="soft"] .vc-popover.is-visible`.

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
  `vc.vendor`. Never add `!important` to our layered styles.
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
