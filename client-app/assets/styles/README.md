# Styles: cascade layers and designs

This folder holds the storefront's global stylesheets and the **cascade-layer order** every
stylesheet in the app is sorted into. Layers decide who wins *before* specificity does: our
component styles sit in low layers, design and print rules in higher ones, and anything a fork
writes outside a layer beats all of them.

The storefront ships two designs from one markup: `classic` (default) and `soft`. The `design`
setting in `client-app/config/settings_data.json` picks one; `app-runner.ts` writes it to
`<html data-design="…">` before the app mounts, and `addPresetToThemeContext`
(`core/composables/useThemeContext.ts`) writes the active colour preset's file name to
`<html data-preset="…">`. The design switches styles only: markup and `Vc*` props never change,
and the design never changes the preset.

## Where does my change go?

Find your change, then read its section below. Paths are under `client-app/`, except `tailwind.config.ts` at the
repo root.

| Change | For | File | Layer | Token / selector | Check |
| --- | --- | --- | --- | --- | --- |
| Shape, spacing, type | one design | `designs/<design>/_tokens.scss` | `theme` | an existing `--vc-*` token on `html[data-design="<design>"]`; dark: `html.dark[data-design="<design>"]` | `check:designs`; Storybook Design |
| The same, no token yet | every design | the component; a scale: `tailwind.config.ts` | `vc.kit` / `vc.app`; a scale: unlayered (utilities) | a new token, today's value as its fallback, its name agreed first | token-table test (shape, type); `build:core-types` after `tailwind.config.ts` |
| One part, no token | one design | `designs/<design>/blocks/<block>.scss`; dark: `dark/<block>.scss` | `vc.design` | the block's own BEM classes, every state | `check:designs` |
| Colour, whole palette | one preset, light and dark | `assets/presets/<preset>.json`, `<preset>.dark.json` | unlayered | palette (`color_primary_500`), app (`color_link`) and kit (`color_vc_*`) keys | Storybook Theme preset + dark |
| Colour, one block | one preset | `assets/presets/<preset>.scss` | `vc.preset` | the public colour token on `html[data-preset="<preset>"]`, dark: `html.dark[data-preset="<preset>"]`, same file; a block or BEM part below it only for a part with no token | `check:designs` |
| Colour, one block | one design | `designs/<design>/_tokens.scss` or `blocks/` | `theme` / `vc.design` | the public colour token first; preset variables only | `check:designs` |
| Colour, one block | every preset and design | the component; dark: `assets/styles/dark/**` | `vc.kit` / `vc.app` | palette or semantic tokens, never a literal | two presets, light and dark |
| An in-tree module or app block | one design / one preset | `blocks/` / `assets/presets/<preset>.scss` | `vc.design` / `vc.preset` | as above; the file leaves with the module | `check:designs` |
| A Module Federation remote | anything | the remote's own repository (the pilot, sales-rep: `VirtoCommerce/vc-module-sales-rep`) | — | host kit components, `--vc-*` tokens and preset variables (`--color-*`) only | the remote's docs |
| Anything | a fork | `assets/styles/_custom.scss` | unlayered | `:root`, `html[data-design]`, `html[data-preset]`, `html.dark` | — |

A colour that belongs to one preset goes in that preset, not in a design: `vc.preset` beats `vc.design`.
A preset sets a component's colour token on its `html`, where it is inherited, so a block that sets the same token on
its own element keeps its choice.
Sections: [Designs](#designs), [Recolour with a preset stylesheet](#recolour-with-a-preset-stylesheet),
[Modules and remote plugins](#modules-and-remote-plugins), [Shape and typography tokens](#shape-and-typography-tokens).
A fork never edits our components or our designs' folders: [Customise a design](#customise-a-design),
[Make your own design](#make-your-own-design).

How to verify:

- Storybook (`yarn storybook:dev`): the Design, Theme preset and dark (sun/moon) toolbar switches, or
  `&globals=design:<design>;themePreset:<preset>;darkMode:dark` appended to a story or Docs URL.
- `yarn check:designs`: every design folder and preset stylesheet ([Checks](#checks)).
- `yarn test:unit run scripts/design-token-table.test.ts`: the [token table](#token-table) lists every shape and type
  token the styles read.
- A change for one design or one preset leaves classic computing exactly as before: compare computed styles
  (`getComputedStyle`), not screenshots.
- One story set per component: the toolbars show it in every design and preset; no per-design story, none pins a design.
- `yarn build && yarn check:css-layers` after a change to the layer order or an entry stylesheet.

---

## The order

`_layers.scss` is the single source of the order:

```css
@layer theme, base, plugins-vendor, vc, components, plugins, utilities;
@layer base.tw, components.tw;
@layer vc.vendor, vc.kit, vc.app, vc.design, vc.preset, vc.print;
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
- **The order is public API for forks: a layer is never reordered or renamed**, and a new one keeps the
  order of every existing pair (`vc.preset` went in between `vc.design` and `vc.print`).

> **Tailwind 3 trap.** A block named exactly `@layer base`, `components` or `utilities` is a
> Tailwind 3 directive, not a native layer: Tailwind moves its contents to the matching
> `@tailwind` rule. Never write one expecting a native layer; use the dotted names above.

## What goes where

| Layer | Contents |
| --- | --- |
| `theme` | `_colors.scss`, `_ui-kit-tokens.scss`, `--vc-radius` (all from `main.scss`); each design's `_tokens.scss` (`client-app/designs/<name>/`). A design's colour tokens take colour only from preset variables |
| `base.tw` | all of `preflight.scss`: `@tailwind base`, its `@layer base {}` rules (incl. the typography roles and the focus ring), the number-input and `::-ms-reveal` rules |
| `plugins-vendor` | reserved, empty: third-party CSS bundled by a plugin |
| `vc.vendor` | swiper (`vendors/_swiper.scss`), nouislider (`ui-kit/.../slider/nouislider.layer.css`) |
| `vc.kit` | ui-kit SFC styles (automatic, see below), `_dark-kit.scss` |
| `vc.app` | app SFC styles (automatic), `_helpers.scss`, `_deprecated.scss`, `vendors/_builder-io.scss`, `html { scroll-padding-top }`, `#popover-host` (`App.vue`), `_dark-app.scss` |
| `vc.design` | a design's block files: `client-app/designs/<name>/blocks/` and `dark/`, wired by its `index.scss` |
| `vc.preset` | a preset's stylesheet, `client-app/assets/presets/<name>.scss` ([Recolour with a preset stylesheet](#recolour-with-a-preset-stylesheet)) |
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
unlayered `!important` (`_custom.scss`) cannot override one inside a layer (swiper's and
nouislider's in `vc.vendor`). Never add `!important` to our styles.

### Component styles are layered for you

`postcss.sfc-layers.cjs` (registered in `postcss.config.cjs`, after `tailwindcss`) wraps every
Vue SFC `<style>` module: `client-app/ui-kit/**` → `vc.kit`, every other component → `vc.app`.
A top-level `@media` whose every comma-separated query starts with `print` or `only print` goes to
`vc.print` instead, so it beats every design rule in print; `@media screen, print` stays put. The
plugin hoists `@charset`/`@import`, restates the `_layers.scss` order in front of each module (a
component chunk can load before the entry CSS, as in the federation build), and skips `App.vue` and
every `.scss`/`.css` entry. **Never hand-wrap an SFC style in `@layer`.** Each SFC module carries one
copy of the order statements; an identical re-declaration changes nothing.

Inside `vc.kit`, load order differs between the storefront and Storybook, so VcButton's base rules sit
in `:where()` (zero specificity), and `vc-button.test.ts` pins which rules. A kit parent lays it out
with its plain BEM class in any load order, never `&__x.vc-button`. Other kit roots get no blanket
`:where()`: a parent's single class on them still depends on load order, so a root moves to `:where()`
only when that changes nothing on screen.

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
    design.ts         # export const design = { fonts: ["https://…"] }: its font stylesheet URLs
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

Inside each `html` block, kit component blocks (`vc-*`) load first, then app blocks, the same order as
`vc.kit` before `vc.app`: at equal specificity the later rule wins, so an app block on a kit
component's root (`footer-links` on a VcWidget) beats that component's block.

The design name appears in `_tokens.scss` and `index.scss` only. A design that loads no file yet
keeps one comment line in `index.scss` instead.

### Two ways a design changes the look

1. **Tokens** (`_tokens.scss`): the custom properties the components read, such as `--vc-radius` and
   `--vc-button-radius`. First choice: if the component already reads a token for the value, set the
   token.
2. **Block files** (`blocks/`, `dark/`): when no token covers it, the design restyles the block's BEM
   elements and modifiers directly.

A token an element sets on itself (`--vc-button-radius` on `.vc-input` and `.vc-date-range-input`) is
overridden on that element's block, not on `html`: in the design's `blocks/<block>.scss`
(`vc-input.scss`, `vc-date-range-input.scss`), or on that block in `_custom.scss`. Tooltips and
dropdown menus set `--vc-popover-radius` on their popover the same way; set `--vc-tooltip-radius`
and `--vc-dropdown-menu-radius` instead, on `html` as usual.
Soft's widget block sets three tokens on `.vc-widget` the same way: `--vc-widget-radius` on small,
collapsed, header-only and footer-only widgets, `--vc-widget-border-width` on `:shadow="false"`
widgets and `--vc-widget-padding-x` on xs and sm widgets. A widget nested in another takes all three
back from `html` (`_tokens.scss` copies them to `--design-widget-*`), not from its parent, so your
override on `html[data-design="soft"]` reaches it too. Override them on
`html[data-design="soft"] .vc-widget` in `_custom.scss`: your value then applies to every widget, the
short ones too.

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
- Colour only from preset variables (the [value rule](#recolour-with-a-preset-stylesheet)); a
  recolour that belongs to one preset goes in that preset's stylesheet.
- Don't set `opacity`, `transform` or `transition` on elements that carry a Vue `<Transition>` class.

Print rules sit in `vc.print` and win in print, so a block file needs no screen-only `@media` and
never restates print. Token values apply in print too.

### Make your own design

1. Pick a name, e.g. `mybrand`, copy `client-app/designs/soft/` to `client-app/designs/mybrand/`
   and replace `soft` with your name in the copy's `_tokens.scss` and `index.scss`. In the copy,
   delete the `blocks/` and `dark/` files and the lines that load them in `index.scss`, but keep
   `blocks/vc-widget.scss`, and the `--design-widget-*` lines of `_tokens.scss` it reads, while you
   keep soft's `--vc-widget-*` tokens: it keeps small widgets at classic's inset, gives short widgets
   the smaller radius (`--vc-radius`) and shadowless ones an edge, gives a nested widget the plate's
   tokens instead of its parent's, and sets lg widget titles to `fontSize.base`.
2. In `design.ts`, replace soft's font URL with your font stylesheet URLs (or leave the list empty).
3. Edit `_tokens.scss` (already loaded in `index.scss`, see [Wiring](#wiring)): replace soft's
   values with yours and set only the tokens that differ from classic: those from the
   [token table](#token-table) or, like soft's `--vc-widget-padding-x`, another `--vc-*` property a
   component reads in its `<style>`. Point the font-family tokens at your fonts, or delete both to
   keep classic's Lato:
   ```scss
   html[data-design="mybrand"] {
     --vc-radius: 0px;
     --vc-button-radius: 2rem;
     --vc-base-font-family: "Brand Sans", sans-serif;
   }
   ```
4. When no token covers what you need, add `blocks/<block>.scss` and write the block's styles as in
   the component, loading nothing outside the design's folder; dark values go in `dark/<block>.scss`.
   Add each file to `index.scss` ([Wiring](#wiring)).
5. Turn it on: `"design": "mybrand"` in `client-app/config/settings_data.json`.
6. Check: `yarn check:designs`, then pick it in Storybook's Design toolbar (`yarn storybook:dev`); any story or Docs page opens in a design when you append `&globals=design:<name>` to its URL, for example `?path=/docs/components-organisms-vcwidget--docs&globals=design:soft`.
   A component has one story set: the Design toolbar or the URL global shows it in any design, so no
   story is written per design and none pins a design.

### Customise a design

1. Find the token for what you want to change in the [token table](#token-table). Not there? Look
   for a `--vc-*` custom property the component reads in its `<style>`, such as
   `var(--vc-button-icon-size, …)` in `vc-button.vue`.
2. Set it in `client-app/assets/styles/_custom.scss`:
   - every design: `:root { --vc-button-radius: 4px; }`
   - one design: `html[data-design="soft"] { --vc-button-radius: 4px; }`
   - one design in dark: `html.dark[data-design="soft"] { … }`
3. No token for it? Write the rule in `_custom.scss` under the design:
   `html[data-design="soft"] .account-navigation-item__title { text-transform: uppercase; }`.
   It wins over the component in every state, so add each state you need.
4. Other fonts for a design: set them in `client-app/designs/custom-fonts.ts`.
5. Never edit our components or the folders of our designs: your change would conflict with every
   update.

For the core team, customising our own design = editing its folder; prefer adding a token to the
component (in that component's task) over a block file when several designs will need the same knob.

---

## Recolour with a preset stylesheet

A preset's JSON recolours the whole palette. When one preset needs a block in another colour, it
gets a stylesheet next to its JSON: `client-app/assets/presets/<name>.scss` (no underscore: it is an
entry, not a partial). The app downloads it only while that preset is on and mounts after it;
Storybook loads it on the Theme preset switch. A preset without one loads nothing.
Only a preset bundled in `client-app/assets/presets/` (with its `<name>.json`) can have a stylesheet;
a preset fetched at runtime from the platform cannot.

The dark JSON already flips the `--color-*` values (neutral included), so the same `var(--color-*)`
in the light block is right in dark too. Add an `html.dark[data-preset]` rule only for a
deliberately different choice, like the title colour below; the light rules match in dark too, and
the dark rule overrides them. Dark rules live in the same `<name>.scss`, never in a `<name>.dark.scss`.

```scss
@layer vc.preset {
  html[data-preset="mercury"] {
    --vc-widget-bg-color: var(--color-neutral-50);
  }

  html.dark[data-preset="mercury"] {
    .vc-widget__title {
      color: var(--color-primary-200);
    }
  }
}
```

- **Token first, on the preset's `html`:** set the component's public `--vc-*` colour token on
  `html[data-preset="<name>"]` (dark: `html.dark[data-preset="<name>"]`). It is inherited as the
  preset's default, so a block that sets the same token on its own element (an app block, a design's
  block) wins: the footer keeps its transparent `VcWidget` plate. Never set a component's private variable
  (`--bg-color`, `--text-color`, …).
- Target a block or BEM part only for a part with no token, and set the property itself there: the
  rule sits below the preset's `html` and styles a BEM block, element or modifier, kit (`.vc-*`) or
  app, like `.vc-widget__title` above.
- `vc.preset` sits above `vc.design` and below `vc.print`: a preset's token on `html` beats a
  design's token there (`_tokens.scss`), a preset's block rule beats every design's block, and print
  still wins.
- Every rule sits in `@layer vc.preset` and sets colours only: a colour property (`border-color`,
  not the `border` shorthand, which sets a width too) or a colour token.
- **The value rule**, for a preset stylesheet and a design alike: a colour comes only from preset
  variables: `var(--color-*)`, a `_colors.scss` semantic (`--link-color`, …), a public `--vc-*`
  token, and `color-mix()` or `rgb(from …)` of these; `transparent` (also as a colour function
  or hex with alpha 0, `rgb(0 0 0 / 0)` as Tailwind writes it or `#fff0`, but not as the origin
  of `rgb(from …)`), `currentColor` and `inherit` are allowed. No hex, no numeric `rgb()` /
  `hsl()`, no named colours.

`yarn check:designs` checks every preset stylesheet ([Checks](#checks)).

---

## Modules and remote plugins

- **An in-tree module or app block** (`modules/`, `shared/`, `pages/`) is restyled like any block: in a design's
  `blocks/<block>.scss` or a preset's `<preset>.scss`. The cost: that file names a block that leaves with the
  module, so delete it with the module and search both places for the module's block names
  ([what `check:designs` catches](#checks)).
- **A Module Federation remote** (a plugin such as sales-rep) styles itself only with host kit components, host
  `--vc-*` tokens and preset variables (`--color-*`), and it styles only its own blocks. The kit components and the
  utilities of `@vc-frontend/core/tailwind-preset` read those tokens, so every design and preset reaches the remote.
  Its CSS belongs in the `plugins` layer; until VCST-5760 moves it there, it is unlayered and beats every layered host
  rule it matches.
- Host designs and presets never target a remote's blocks: the remote ships on its own schedule. This is a
  review rule: `check:designs` knows host blocks only, so a remote's block next to or above a host class passes.
  The remote's design documentation lives in its own repository; for the pilot remote, sales-rep, that is
  `VirtoCommerce/vc-module-sales-rep`.

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

`--vc-radius` (the default control radius) predates the tiers. Classic sets it to `0.5rem` on
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
- **App block: `--<block>-<property>`**, without `vc-`, which marks the ui-kit:
  `--badges-wrapper-radius`.
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

### Token table

This table lists every shape and typography token the styles read. Colour tokens are not here:
colours come from the preset. `scripts/design-token-table.test.ts` fails when `tailwind.config.ts`
or a `.vue` or `.scss` file under `client-app/` (outside `designs/`, tests and stories) reads a token
this table does not list, or the table lists one the code does not read.

| Token | What it changes | Classic value |
| --- | --- | --- |
| `--vc-radius` | The default control radius; most component radius tokens below fall back to it | `0.5rem`, on `:root` in `main.scss` |
| `--vc-radius-<key>` | The `rounded-<key>` utilities (`rounded` for `default`); `rounded-none` and `rounded-full` have no token | `sm` 0.125rem · `default` 0.25rem · `md` 0.375rem · `lg` 0.5rem · `xl` 0.75rem · `2xl` 1rem · `3xl` 1.5rem |
| `--vc-shadow-<key>-<n>` | Part `<n>` (from 1) of the `shadow-<key>` utility (`shadow` for `default`). Parts: `default` 2 · `0` 2 · `sm` 1 · `md` 2 · `lg` 2 · `xl` 2 · `2xl` 1 · `inner` 1 | That part of `boxShadow.<key>` in `tailwind.config.ts`; `default` is Tailwind's own `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `--vc-font-size-<key>` | The font size of `text-<key>` | `xxs` 0.625rem · `xs` 0.75rem · `sm` 0.875rem · `base` 1rem · `lg` 1.125rem · `xl` 1.25rem · `2xl` 1.5rem · `3xl` 1.875rem · `4xl` 2.25rem · `5xl` 3rem · `6xl` 3.75rem · `7xl` 4.5rem · `8xl` 6rem |
| `--vc-line-height-<key>` | The line height `text-<key>` sets (`xxs`…`8xl`), and the `leading-<key>` utilities | `xxs` 0.75rem · `xs` 0.875rem · `sm` 1.125rem · `base` 1.25rem · `lg` 1.375rem · `xl` 1.75rem · `2xl` 2rem · `3xl` 2.25rem · `4xl` 2.5rem · `5xl` 3rem · `6xl` 3.75rem · `7xl` 4.5rem · `8xl` 6rem; `3` 0.75rem to `10` 2.5rem in 0.25rem steps · `none` 1 · `tight` 1.25 · `snug` 1.375 · `normal` 1.5 · `relaxed` 1.625 · `loose` 2 |
| `--vc-font-weight-<key>` | The `font-<key>` weight utilities | `thin` 100 · `extralight` 200 · `light` 300 · `normal` 400 · `medium` 500 · `semibold` 600 · `bold` 700 · `extrabold` 800 · `black` 900 |
| `--vc-letter-spacing-<key>` | The `tracking-<key>` utilities | `tighter` -0.05em · `tight` -0.025em · `normal` 0em · `wide` 0.025em · `wider` 0.05em · `widest` 0.1em |
| `--vc-base-font-family` | The page font: `html` and the `font-base` utility | `Lato, sans-serif` |
| `--vc-heading-font-family` | The font of bare `h1`–`h6` and the `font-heading` utility | `inherit` |
| `--vc-heading-font-weight` | The weight of bare `h1`–`h6` | `inherit` |
| `--vc-heading-font-style` | Italic or upright bare `h1`–`h6` | `inherit` |
| `--vc-heading-text-transform` | The letter case of bare `h1`–`h6` | `inherit` |
| `--vc-heading-letter-spacing` | The letter spacing of bare `h1`–`h6` | `inherit` |
| `--vc-alert-radius` | VcAlert corners | `var(--vc-radius)` |
| `--vc-badge-radius` | VcBadge corners | `var(--vc-radius)` |
| `--vc-button-radius` | VcButton corners. VcInput and VcDateRangeInput set it on themselves for their buttons (see [Two ways a design changes the look](#two-ways-a-design-changes-the-look)) | `var(--vc-radius)` |
| `--vc-button-text-transform` | VcButton letter case (sizes `sm`, `md`, `lg`; `xxs` and `xs` ignore it) | `none` |
| `--vc-calendar-radius` | VcCalendar corners | `var(--vc-radius)` |
| `--vc-calendar-day-radius` | VcCalendar day cell corners | `var(--vc-radius)` |
| `--vc-chip-radius` | VcChip corners | `var(--vc-radius)` |
| `--vc-dialog-radius` | VcDialog corners | `var(--vc-radius)` |
| `--vc-dropdown-menu-radius` | VcDropdownMenu corners | `var(--vc-radius)` |
| `--vc-file-picker-radius` | VcFilePicker corners | `var(--vc-radius)` |
| `--vc-file-uploader-radius` | VcFileUploader corners | `var(--vc-radius)` |
| `--vc-input-radius` | VcInput and VcDateRangeInput corners | `var(--vc-radius)` |
| `--vc-markdown-render-radius` | VcMarkdownRender corners | `var(--vc-radius)` |
| `--vc-popover-radius` | VcPopover corners. VcTooltip and VcDropdownMenu set it on their popover | `var(--vc-radius)` |
| `--vc-product-card-radius` | VcProductCard corners | `var(--vc-radius)` |
| `--vc-product-image-radius` | VcProductImage corners | `var(--vc-radius)` |
| `--vc-product-price-font-size` | VcProductPrice font size | `var(--vc-font-size-base)`; its size modifiers set their own |
| `--vc-product-price-line-height` | VcProductPrice line height | `1.335` |
| `--vc-product-title-font-size` | VcProductTitle font size | Not set: the inherited size; `var(--vc-font-size-sm)` inside VcProductCard |
| `--vc-property-font-size` | VcProperty font size | `0.75rem` |
| `--vc-range-calendar-radius` | VcRangeCalendar corners | `var(--vc-calendar-radius)` |
| `--vc-range-calendar-day-radius` | VcRangeCalendar day cell corners | `var(--vc-calendar-day-radius)` |
| `--vc-select-radius` | VcSelect corners | `var(--vc-radius)` |
| `--vc-stat-widget-radius` | VcStatWidget corners | `var(--vc-radius)` |
| `--vc-tab-switch-radius` | VcTabSwitch corners | `var(--vc-radius)` |
| `--vc-table-radius` | VcTable corners | `var(--vc-radius)` |
| `--vc-textarea-radius` | VcTextarea corners | `var(--vc-radius)` |
| `--vc-tile-button-radius` | VcTileButton corners | `var(--vc-radius)` |
| `--vc-tooltip-radius` | VcTooltip corners | `var(--vc-radius)` |
| `--vc-typography-font-size` | VcTypography font size | Not set: each `variant` sets its own |
| `--vc-typography-font-weight` | VcTypography weight | Not set: 700 for `h1`–`h6`, 400 for `base` |
| `--vc-typography-text-transform` | VcTypography letter case | Not set: `uppercase` for `h1`–`h6`, `none` for `base` |
| `--vc-variant-picker-radius` | VcVariantPicker corners | `var(--vc-radius)` |
| `--vc-widget-radius` | VcWidget corners | `var(--vc-radius)` |
| `--vc-widget-shadow` | VcWidget shadow | The `shadow-md` parts: `var(--vc-shadow-md-1), var(--vc-shadow-md-2)` |
| `--vc-widget-title-font-weight` | VcWidget title weight | `var(--vc-heading-font-weight, var(--vc-font-weight-bold))`, 700 |
| `--vc-widget-title-letter-spacing` | VcWidget title letter spacing | `var(--vc-heading-letter-spacing)`, else inherited |
| `--vc-widget-title-text-transform` | VcWidget title letter case | `var(--vc-heading-text-transform, uppercase)` |
| `--vc-image-gallery-radius` | Product image gallery: the corners of the images and thumbnails (`shared/catalog/components/image-gallery.vue`) | `var(--vc-radius)` |
| `--badges-wrapper-radius` | Product badges: the bottom-right corner of their wrapper (`shared/catalog/components/badges-wrapper.vue`) | `calc(var(--vc-radius) + 2px)` |

### Where a design's value goes

- **Token values:** in the design's `client-app/designs/<name>/_tokens.scss`, on
  `html[data-design="<name>"]`; dark values (shadows) on `html.dark[data-design="<name>"]` in the
  same file. Which token changes what: the [token table](#token-table). A value that changes with
  the viewport goes in `@media (width >= theme("screens.<name>"))` inside the same rule.
- **Shadows** keep their step's colour: black `rgb(0 0 0 / …)` for the default `shadow` step (from
  Tailwind's defaultTheme), `rgb(from var(--color-additional-950) …)` for the others. A design
  changes geometry and alpha; a colour it sets comes only from preset variables.
- **Fonts:** a design lists its font stylesheet URLs in its `client-app/designs/<name>/design.ts`;
  they load only while that design is on. The link is not awaited, so fonts never hold back the
  mount. Classic's Lato is linked in `index.html`.
- **Fork:** set token values in `_custom.scss` ([Customise a design](#customise-a-design)); it is
  unlayered, so it beats our `theme` layer in every design. To load other fonts for a design, list
  them in `client-app/designs/custom-fonts.ts`. Presets stay colour-only.

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
- Every new shape or typography token gets its row in the [token table](#token-table):
  `scripts/design-token-table.test.ts` fails until it has one.

---

## Checks

```bash
yarn check:designs                    # every folder in client-app/designs/, a fork's too, and every preset stylesheet (no build needed)
yarn build && yarn check:css-layers   # built CSS: layer names and order (dist/, lazy chunks too)
```

`scripts/check-designs.ts` compiles every `.scss` file of each design with Sass and Tailwind, as the
build does, and checks the CSS it emits, so nesting, `$x: &` captures and `@apply` are read as they
ship. A problem is reported at the source line that wrote it, except a file `index.scss` loads out
of its place: that is reported once, at the file's `meta.load-css` line in `index.scss`. A missing
`client-app/designs/` or `client-app/assets/presets/` folder fails the check. The tests are in
`scripts/check-designs.test.ts`.

| Rule | Rejected |
| --- | --- |
| The folder name is lower case (`a-z`, `0-9`, `-`), starts with a letter and is not `classic` | `My-Brand`, `2brand`, `classic` |
| The folder holds only what the [tree](#designs) shows; dotfiles (`.DS_Store`, `.gitkeep`) are ignored | `extra.scss`, a `notes/` folder |
| `blocks/` and `dark/` hold `.scss` files directly, each named after a block of a component | `blocks/layout/footer-links.scss`, `blocks/notes.md`, `blocks/nothing.scss` |
| `index.scss` and `_tokens.scss` write the folder's name in `data-design` | `data-design="soft"` in `mybrand/` |
| `_tokens.scss` sets only custom properties, only on `html[data-design="<name>"]` or `html.dark[data-design="<name>"]` | `:root { … }`, `html[data-design="<name>"] .x { … }`, `margin: 0` |
| A colour comes only from preset variables, in every design file. A colour is `color`, `fill`, `stroke` and every `…-color` property; the shorthands `background`, `border` and its sides, `outline`, `column-rule`, `text-decoration`, `text-emphasis`, `box-shadow`, `text-shadow`, `-webkit-text-stroke`, `filter` and `backdrop-filter`, also with a `-webkit-` or `-moz-` prefix (`-webkit-box-shadow`, `-webkit-border-before`), when they hold one; a gradient with a colour in it; Tailwind's gradient stops and colour opacities; a custom property named as a colour token (its name contains `color` or `bg` or ends in `-text`, `-border` or `-icon`; Tailwind's `--tw-shadow-colored` excepted); a `--vc-*` or `--tw-*` custom property whose value holds a colour, whatever its name (`--vc-brand`, the `--tw-shadow` of `@apply shadow-[…]`); and a shadow token (`--vc-widget-shadow`, `--vc-shadow-<key>-<n>`), where the default step's parts may keep Tailwind's black `rgb(0 0 0 / …)`, also in a `var(--vc-shadow-default-<n>, …)` fallback (`@apply shadow`, `theme("boxShadow.DEFAULT")`), and so may the theme's `drop-shadow-*` steps (`--tw-drop-shadow`; an arbitrary `drop-shadow-[…]` may not). Its value reads only `--color-*`, the `_colors.scss` semantics and `--vc-*` (Tailwind's `--tw-*` too), mixed by `color-mix()` or `rgb(from …)`, besides the keywords and a colour with alpha 0 (`transparent`, `rgb(0 0 0 / 0)`, `#fff0`, `#ffffff00`, Tailwind's `#0000`), except as a relative colour's origin, also through a `var()` fallback, as the relative colour sets its own alpha. A custom property named as a colour token whose value holds no colour (`--title-text: 1rem`) is not one, and a function named like a colour (`tan()`) holds none | `color: red`, `border-top-color: red`, `background: #fff`, `border: 1px solid red`, `box-shadow: 0 0 1px red`, `text-shadow: 0 0 2px rgb(0 0 0)`, `fill: var(--x)`, `color: color-mix(in srgb, var(--color-primary-500), white)`, `--vc-x-bg: red`, `--vc-widget-shadow: 0 6px 20px red`, `--vc-brand: #e30613`, `@apply shadow-[0_2px_10px_rgba(0,0,0,0.1)]`, `filter: drop-shadow(0 0 4px red)`, `-webkit-box-shadow: 0 0 4px red`, `-webkit-border-before: 1px solid red`, `@apply drop-shadow-[0_0_40px_rgb(0_0_0/1)]`, `color: rgb(from rgb(227 6 19 / 0) r g b / 1)`, `color: rgb(from transparent r g b / 1)` |
| No private variable carries a colour, whatever its name: a custom property other than `--vc-*` and `--tw-*` | `--text-color: var(--color-primary-500)`, `--shadow: 0 0 4px #f00` |
| A block or dark file names no `html` and no `[data-design]` | `html .footer-links` |
| A block or dark file names no `.dark`: it is on `<html>`, so below the design's `html` it never matches; dark rules go in `dark/<block>.scss`, where `index.scss` adds `.dark` | `.dark .footer-links`, `.dark &` |
| No `@apply` variant that styles an ancestor or sibling (`group-*`, `peer-*`): it puts a selector before `html[data-design]` and never matches; write the rule out | `@apply group-hover:underline`, `@apply peer-checked:underline` |
| Every rule of a block or dark file styles its block: its last compound has `.<block>`, `.<block>__*` or `.<block>--*` | `.footer-links a`, `.footer-links > *` |
| It names no other block outside `:not()`; `[class="…"]` and `[class~="…"]` count as classes | `.footer-links:has(.vc-button)` in `footer-links.scss` |
| It matches no `[class]` by presence, prefix or substring | `[class]`, `[class^="x"]`, `[class*="x"]` |
| A design file loads only `.scss` files of its own folder and `sass:` modules | `@use "@/ui-kit/styles/focus-ring"`, `@use "../../x"`, a path that matches several files |
| Its CSS holds no at-rule but `@media`, `@supports`, `@container` and `@starting-style` (and, in `index.scss`, the top-level `@layer` blocks) | `@keyframes`, `@layer`, `@import`, `@scope`, `@property` |
| No `@media` on `prefers-color-scheme`: it follows the OS theme, not the storefront's dark mode (`html.dark`); dark rules go in `dark/<block>.scss`, dark tokens on `html.dark[data-design="<name>"]` | `@apply dark:underline`, `@media (prefers-color-scheme: dark) { … }` |
| No print-only `@media` (one whose every comma-separated query starts with `print` or `only print`, as the build reads it): print rules live in `vc.print` (`print/`), which wins in print over every design; `@media screen, print` stays allowed (the check misses `@media not screen`, which applies only in print) | `@media print { … }`, `@apply print:hidden`, `@media only print and (min-width: 1px)` |
| `index.scss` exists, holds no rules of its own, and loads every file that emits rules, each in its place ([Wiring](#wiring)); a file loaded out of its place is reported once, at its `meta.load-css` line | a missing `index.scss`, a rule written in it, a file it does not load, a dark file under the light prefix |

Preset stylesheets (`client-app/assets/presets/<name>.scss`), compiled the same way:

| Rule | Rejected |
| --- | --- |
| It sits next to its preset's `<name>.json` | `ghost.scss` without `ghost.json`, `_partial.scss` |
| Every rule is inside a top-level `@layer vc.preset { … }` block; no other at-rule but `@media`, `@supports`, `@container` and `@starting-style` | a rule outside the layer, `@layer vc.design { … }`, the layer inside `@media`, a bare `@layer vc.preset;`, `@keyframes` |
| No separate dark stylesheet: dark rules go in `<name>.scss` under `html.dark[data-preset="<name>"]` | `mercury.dark.scss` |
| No `@media` on `prefers-color-scheme`, which follows the OS theme: dark rules go under `html.dark[data-preset="<name>"]` | `@apply dark:text-primary`, `@media (prefers-color-scheme: dark) { … }` |
| No print-only `@media` (every comma-separated query starts with `print` or `only print`): print rules live in `vc.print` (`print/`); `@media screen, print` stays allowed (the check misses `@media not screen`, which applies only in print) | `@media print { … }`, `@apply print:text-primary` |
| Every selector is the preset's `html`, `html[data-preset="<name>"]` or `html.dark[data-preset="<name>"]`, alone or followed by a block: then it names `html`, `.dark`, `[data-preset]` and `[data-design]` nowhere else, and its last compound has a class of a component's block | `.vc-button`, `html[data-preset="red"]` and `html[data-preset="red"] .vc-button` in `mercury.scss`, `html[data-preset="mercury"]:hover`, `… .dark .vc-button`, `… .vc-button svg` |
| On the preset's `html` alone, only public `--vc-*` tokens | `color: var(--color-primary-500)`, `--color-primary-500: …` on `html[data-preset="mercury"]` |
| Colours only, by the value rule above: a colour property (`border-color`) or a colour token; a shorthand (`border`, `outline`, `background`, `box-shadow`) and a shadow token set geometry too, so a preset sets none; set the shorthand's colour longhand instead (`border-color` for `border`; a shadow or filter has none) | `margin: 0`, `--vc-button-radius: 0`, `--vc-widget-shadow: …`, `border: 2px dashed var(--color-neutral-300)`, `color: #fff` |
| No private variable | `--bg-color: var(--color-primary-500)` |

`check:designs` knows only host components' blocks, in designs and presets alike. A removed, renamed or
remote block fails as a block file's name, and when a selector's last compound is left with no class of a
host block (in a design, of the file's own block); next to or above such a class it passes.

Vue transition classes (`*-enter-from`, `*-enter-active`, `*-enter-to`, the same for `leave`, and
`*-move`) and state classes (`is-*`, `has-*`) are not blocks, so a block file may use them on its own
elements: `.mobile-menu.is-visible` in `mobile-menu.scss`.

`scripts/check-css-layers.ts` (built CSS in `dist/`): every layer has a name, declared in
`_layers.scss`; at least one stylesheet that `index.html` links declares layers, and the first one
that does starts with `theme`, places every declared layer, and its names follow the declared order
per parent. The tests are in `scripts/check-css-layers.test.ts`.

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
