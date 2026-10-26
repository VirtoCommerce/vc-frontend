# Styles: cascade layers and designs

This folder holds the storefront's global stylesheets and the **cascade-layer order** every
stylesheet in the app is sorted into. Layers decide who wins *before* specificity does: our
component styles sit in low layers, design and print rules in higher ones, and anything a fork
writes outside a layer beats all of them.

The storefront ships two designs from one markup: `classic` (default) and `soft`. The `design`
setting in `client-app/config/settings_data.json` picks one; `app-runner.ts` writes it to
`<html data-design="…">` before the app mounts. The design switches styles only: markup and `Vc*`
props never change, and the design never changes the preset.

---

## The order

`_layers.scss` is the single source of the order:

```css
@layer theme, base, plugins-vendor, vc, components, plugins, utilities;
@layer base.tw, components.tw;
@layer vc.vendor, vc.kit, vc.app, vc.design, vc.print;
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
| `theme` | `_colors.scss`, `_ui-kit-tokens.scss`, `--vc-radius` (all from `main.scss`); each design's `_tokens.scss` (`client-app/designs/<name>/`). No colour tokens in a design |
| `base.tw` | all of `preflight.scss`: `@tailwind base`, its `@layer base {}` rules (incl. the focus ring), the number-input and `::-ms-reveal` rules |
| `plugins-vendor` | reserved, empty: third-party CSS bundled by a plugin |
| `vc.vendor` | swiper (`vendors/_swiper.scss`), nouislider (`ui-kit/.../slider/nouislider.layer.css`) |
| `vc.kit` | ui-kit SFC styles (automatic, see below), `_dark-kit.scss` |
| `vc.app` | app SFC styles (automatic), `_helpers.scss`, `_deprecated.scss`, `vendors/_builder-io.scss`, `html { scroll-padding-top }`, `#popover-host` (`App.vue`), `_dark-app.scss` |
| `vc.design` | a design's block files: `client-app/designs/<name>/blocks/` and `dark/`, wired by its `index.scss` |
| `vc.print` | `_print.scss`; every component's top-level print-only `@media`, moved there automatically |
| `components.tw` | `@tailwind components` |
| `plugins` | reserved, empty |
| `utilities` | declared, empty on Tailwind 3 |

Element-level dark token remaps stay with their dark files (`vc.kit` / `vc.app`), never in `theme`.

### Unlayered, on purpose

- `_custom.scss`, loaded just before `@tailwind utilities` at the end of `main.scss`;
- the Tailwind utilities;
- the runtime preset `<style id="vc-theme-variables">` from `core/plugins/config.plugin.ts`: its
  `--color-*` names overlap with none of our declarations;
- third-party runtime CSS (Builder SDK, Google Maps, tw-elements);
- plugin stylesheets, until they move into `plugins`.

Unlayered CSS beats every layer, whatever its specificity. So one class in `_custom.scss` overrides
any component, design, dark or print rule; a Tailwind utility in a template always wins over BEM, and
fork CSS keeps working against utilities as before; plugin stylesheets beat our layered components.

`!important` inverts across layers: a layered `!important` beats an unlayered one, so a fork's
`!important` cannot override one inside a layer (swiper's and nouislider's in `vc.vendor`). Never add
`!important` to our styles.

### Component styles are layered for you

`postcss.sfc-layers.cjs` (registered in `postcss.config.cjs`, after `tailwindcss`) wraps every
Vue SFC `<style>` module: `client-app/ui-kit/**` → `vc.kit`, every other component → `vc.app`.
A top-level `@media` whose every comma-separated query starts with `print` or `only print` goes to
`vc.print` instead, so it beats every design rule in print; `@media screen, print` stays put. The
plugin hoists `@charset`/`@import`, restates the `_layers.scss` order in front of each module (a
component chunk can load before the entry CSS, as in the federation build), and skips `App.vue` and
every `.scss`/`.css` entry. **Never hand-wrap an SFC style in `@layer`.** Each SFC module carries one
copy of the order statements; an identical re-declaration changes nothing.

### Entry stylesheets

Each is layered by hand and starts with `@use "layers"`: `preflight.scss`, `vendors.scss`,
`main.scss` (loaded by `App.vue`), and in Storybook
`storybook-styles/preflight.scss`, `main.scss` and `swiper.scss` (`utilities.scss` stays
unlayered). A new entry follows the same pattern: `@use "layers"` first, then each part with
`@include meta.load-css(…)` inside its `@layer` block. Swiper is loaded with a plain
`@import … layer(vc.vendor)` (`vendors/_swiper.scss`).

A design's `index.scss` (`client-app/designs/<name>/`) does not restate the order: the preflight
`<link>` in `index.html` (`.storybook/preview-head.html` in Storybook) declares it before any design
CSS runs, so `index.scss` only puts its files in `@layer theme` and `@layer vc.design`.

---

## Designs

A design is a folder in `client-app/designs/`:

```text
client-app/designs/
  <name>/             # one folder per design; ours is soft
    _tokens.scss      # html[data-design="<name>"] { token values }
    index.scss        # the wiring, the same in every design (below)
    blocks/           # one file per BEM block, named after it
      vc-button.scss
      footer-links.scss
    dark/             # the same blocks' dark values, same file names
      footer-links.scss
```

- The folder name is the design name: the value of `design` in `client-app/config/settings_data.json`,
  read at build time.
- Classic has no folder: it is the components' own styles and the token defaults. A design sets only
  what differs from classic.
- The app finds designs by folder (`client-app/core/utilities/design/index.ts`); nothing lists their
  names. An unknown `design` logs a warning in development and falls back to classic. The storefront
  downloads only the active design's styles; classic downloads none.
- `blocks/` and `dark/` hold files directly; the file name is the block's class (`vc-button.scss` for
  `.vc-button`).

### Wiring

Every design's `index.scss` is this file with its own name and one line per file the design has; a
`@layer` or `html` block with no line is left out:

```scss
@use "sass:meta";

@layer theme {
  @include meta.load-css("tokens");
}

@layer vc.design {
  html[data-design="soft"] {
    @include meta.load-css("blocks/footer-links");
  }

  html.dark[data-design="soft"] {
    @include meta.load-css("dark/footer-links");
  }
}
```

The design name appears in `_tokens.scss` and `index.scss` only.

### Two ways a design changes the look

1. **Tokens** (`_tokens.scss`): the custom properties the components read, such as `--vc-radius` and
   `--vc-button-radius`. First choice: if the component already reads a token for the value, set the
   token.
2. **Block files** (`blocks/`, `dark/`): when no token covers it, the design restyles the block's BEM
   elements and modifiers directly.

A token an element sets on itself (`--vc-button-radius` on `.vc-input` and `.vc-date-range-input`) is
overridden on that element's block, not on `html`: in the design's `blocks/vc-input.scss`, or on
`.vc-input` in `_custom.scss`.

A block file is written exactly like the component's own `<style>`: the same BEM nesting and `$x: &`
captures (rule 13 of `.claude/rules/styles.md`), `@apply` allowed, no prefix. One difference: it loads
nothing outside its own design folder (a component may `@use "@/ui-kit/styles/focus-ring"`, a design
file may not). `index.scss` puts `html[data-design="…"]` (`html.dark[data-design="…"]` for `dark/`) in
front of every selector.

The rules for block files:

- A block file restyles only its own block (its block and its elements and modifiers).
- Its rules win over the component in every state, so write each state that should look different
  too (hover, disabled, active, modifiers).
- Dark values go in `dark/<block>.scss`; they win over the component's dark styles.
- An element a design restyles must be styled with BEM in the template, not utilities: a utility in
  the template always wins.
- No colours: colours come from the preset.
- Don't set `opacity`, `transform` or `transition` on elements that carry a Vue `<Transition>` class.

Print rules sit in `vc.print` and win in print, so a block file needs no screen-only `@media` and
never restates print. Token values apply in print too.

### Make your own design

1. Pick a name, e.g. `mybrand`, and create the folder `client-app/designs/mybrand/` (copy
   `designs/soft/` as a start: an `index.scss` that loads no file).
2. Add `_tokens.scss` with the tokens that differ from classic, and load it in `index.scss`
   ([Wiring](#wiring)):
   ```scss
   html[data-design="mybrand"] {
     --vc-radius: 0;
     --vc-button-radius: 2rem;
   }
   ```
3. When no token covers what you need, add `blocks/<block>.scss` and write the block's styles as in
   the component, loading nothing outside the design's folder; dark values go in `dark/<block>.scss`.
   Add each file to `index.scss` ([Wiring](#wiring)).
4. Turn it on: `"design": "mybrand"` in `client-app/config/settings_data.json`.
5. Check: `yarn check:designs`, then pick it in Storybook's Design toolbar (`yarn storybook:dev`).

### Customise a design

1. Find the token for what you want to change: a `--vc-*` custom property the component reads in its
   `<style>`, such as `var(--vc-button-radius, …)` in `vc-button.vue`.
2. Set it in `client-app/assets/styles/_custom.scss`:
   - every design: `:root { --vc-button-radius: 4px; }`
   - one design: `html[data-design="soft"] { --vc-button-radius: 4px; }`
   - one design in dark: `html.dark[data-design="soft"] { … }`
3. No token for it? Write the rule in `_custom.scss` under the design:
   `html[data-design="soft"] .footer-links__title { text-transform: none; }`. It wins over the
   component in every state, so add each state you need.
4. Never edit our components or the folders of our designs: your change would conflict with every
   update.

For the core team, customising our own design = editing its folder; prefer adding a token to the
component (in that component's task) over a block file when several designs will need the same knob.

---

## Checks

```bash
yarn check:designs                    # every folder in client-app/designs/, a fork's too (no build needed)
yarn build && yarn check:css-layers   # built CSS: layer names and order (dist/, lazy chunks too)
```

`scripts/check-designs.ts` compiles every `.scss` file of each design with Sass and Tailwind, as the
build does, and checks the CSS it emits, so nesting, `$x: &` captures and `@apply` are read as they
ship. A problem is reported at the source line that wrote it, except a file `index.scss` loads out
of its place: that is reported once, at the file's `meta.load-css` line in `index.scss`. The tests
are in `scripts/check-designs.test.ts`.

| Rule | Rejected |
| --- | --- |
| The folder name is lower case (`a-z`, `0-9`, `-`), starts with a letter and is not `classic` | `My-Brand`, `2brand`, `classic` |
| The folder holds only what the [tree](#designs) shows; dotfiles (`.DS_Store`, `.gitkeep`) are ignored | `extra.scss`, a `notes/` folder |
| `blocks/` and `dark/` hold `.scss` files directly, each named after a block of a component | `blocks/layout/footer-links.scss`, `blocks/notes.md`, `blocks/nothing.scss` |
| `index.scss` and `_tokens.scss` write the folder's name in `data-design` | `data-design="soft"` in `mybrand/` |
| `_tokens.scss` sets only custom properties, only on `html[data-design="<name>"]` or `html.dark[data-design="<name>"]` | `:root { … }`, `html[data-design="<name>"] .x { … }`, `margin: 0` |
| No colour tokens: no custom property whose name contains `color` or `bg` or ends in `-text`, `-border` or `-icon` (Tailwind's `--tw-shadow-colored` excepted) | `--vc-x-bg`, `--vc-button-solid-primary-text`, `@apply ring-primary-500` |
| Block and dark files set no colour. In `color`, `fill`, `stroke` and every `…-color` property the only values are `transparent`, `currentColor`, `inherit`, `initial`, `unset`, `revert`, `revert-layer`, `none`, `auto` and `#0000`. The shorthands `background`, `border` and its sides, `outline`, `column-rule`, `text-decoration`, `text-emphasis`, `box-shadow`, `text-shadow` and `-webkit-text-stroke` hold no named, hex or functional colour (`rgb()`, `oklch()`, `color-mix()`, …) and no `var()` of a colour token. No property but a custom one holds a gradient with a colour in it (a direction-only `@apply bg-gradient-to-r` is not one). Tailwind's gradient stops and colour opacities (`--tw-gradient-from`, `--tw-gradient-to`, `--tw-{bg,text,border,divide,placeholder,ring}-opacity`) count as colours; its shadow and ring geometry (`@apply shadow-md`, `@apply ring-2`) does not | `color: red`, `border-top-color: red`, `background: red`, `border: 1px solid red`, `box-shadow: 0 0 1px red`, `background: var(--color-primary-500)`, `background-image: linear-gradient(red, blue)`, `@apply text-primary-500`, `@apply bg-opacity-50`, `@apply from-primary-500` |
| A block or dark file names no `html` and no `[data-design]` | `html .footer-links` |
| A block or dark file names no `.dark`: it is on `<html>`, so below the design's `html` it never matches; dark rules go in `dark/<block>.scss`, where `index.scss` adds `.dark` | `.dark .footer-links`, `.dark &` |
| No `@apply` variant that styles an ancestor or sibling (`group-*`, `peer-*`): it puts a selector before `html[data-design]` and never matches; write the rule out | `@apply group-hover:underline`, `@apply peer-checked:underline` |
| Every rule of a block or dark file styles its block: its last compound has `.<block>`, `.<block>__*` or `.<block>--*` | `.footer-links a`, `.footer-links > *` |
| It names no other block outside `:not()`; `[class="…"]` and `[class~="…"]` count as classes | `.footer-links:has(.vc-button)` in `footer-links.scss` |
| It matches no `[class]` by presence, prefix or substring | `[class]`, `[class^="x"]`, `[class*="x"]` |
| A design file loads only `.scss` files of its own folder and `sass:` modules | `@use "@/ui-kit/styles/focus-ring"`, `@use "../../x"`, a path that matches several files |
| Its CSS holds no at-rule but `@media`, `@supports`, `@container` and `@starting-style` (and, in `index.scss`, the top-level `@layer` blocks) | `@keyframes`, `@layer`, `@import`, `@scope`, `@property` |
| `index.scss` exists, holds no rules of its own, and loads every file that emits rules, each in its place ([Wiring](#wiring)); a file loaded out of its place is reported once, at its `meta.load-css` line | a missing `index.scss`, a rule written in it, a file it does not load, a dark file under the light prefix |

Vue transition classes (`*-enter-from`, `*-enter-active`, `*-enter-to`, the same for `leave`, and
`*-move`) and state classes (`is-*`, `has-*`) are not blocks, so a block file may use them on its own
elements: `.mobile-menu.is-visible` in `mobile-menu.scss`.

`scripts/check-css-layers.ts` (built CSS in `dist/`): every layer name is declared in
`_layers.scss`; the first linked stylesheet that declares layers starts with `theme`, places every
declared layer, and its names follow the declared order per parent.

Both run in CI (`.github/workflows/theme-ci.yml`). `yarn lint` does not parse SCSS.

---

## Files that moved

A fork that edited one of these merges its change into the new place, in the new layer:

| Before | Now |
| --- | --- |
| `_dark.scss` | `_dark-kit.scss` (`html.dark` rules, kit dark files; `vc.kit`) and `_dark-app.scss` (`dark/shared/**`; `vc.app`) |
| `@import … layer(nouislider)` in `nouislider.layer.css` | `layer(vc.vendor)` |
| `@use "swiper/css…"` in `vendors/_swiper.scss` | `@import "swiper/css…" layer(vc.vendor);` |
| `.storybook/preview.ts` importing `_ui-kit-tokens.scss` and `_dark.scss` | one import of `storybook-styles/main.scss` |

Every entry stylesheet now starts with `@use "layers"`.
