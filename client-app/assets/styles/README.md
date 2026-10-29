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
| `base.tw` | all of `preflight.scss`: `@tailwind base`, its `@layer base {}` rules (incl. the typography roles and the focus ring), the number-input and `::-ms-reveal` rules |
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
   `designs/soft/` as a start and replace `soft` with your name in its `index.scss` and
   `_tokens.scss`).
2. In `design.ts`, list your font stylesheet URLs (or leave the list empty).
3. Add `_tokens.scss` with the tokens from the [token table](#token-table) that differ from
   classic, and load it in `index.scss` ([Wiring](#wiring)):
   ```scss
   html[data-design="mybrand"] {
     --vc-radius: 0;
     --vc-button-radius: 2rem;
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
   `html[data-design="soft"] .footer-links__title { text-transform: none; }`. It wins over the
   component in every state, so add each state you need.
4. Other fonts for a design: set them in `client-app/designs/custom-fonts.ts`.
5. Never edit our components or the folders of our designs: your change would conflict with every
   update.

For the core team, customising our own design = editing its folder; prefer adding a token to the
component (in that component's task) over a block file when several designs will need the same knob.

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
colours come from the preset. `scripts/design-token-table.test.ts` fails when the code reads a token
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
| `--vc-button-text-transform` | VcButton letter case | `none` |
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
| `--vc-shape-radius` | VcShape corners; they show once `--vc-shape-mask-image` is `none` | `0` |
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
  changes geometry and alpha, never colour.
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
| Block and dark files set no colour. In `color`, `fill`, `stroke` and every `…-color` property the only values are `transparent`, `currentColor`, `inherit`, `initial`, `unset`, `revert`, `revert-layer`, `none`, `auto` and `#0000`. The shorthands `background`, `border` and its sides, `outline`, `column-rule`, `text-decoration`, `text-emphasis`, `box-shadow`, `text-shadow` and `-webkit-text-stroke` hold no named, hex (except `#0000`) or functional colour (`rgb()`, `oklch()`, `color-mix()`, …) and no `var()` of a colour token. No property but a custom one holds a gradient with a colour in it (a direction-only `@apply bg-gradient-to-r` is not one). Tailwind's gradient stops and colour opacities (`--tw-gradient-from`, `--tw-gradient-to`, `--tw-{bg,text,border,divide,placeholder,ring}-opacity`) count as colours; its shadow and ring geometry (`@apply shadow-md`, `@apply ring-2`) does not | `color: red`, `border-top-color: red`, `background: red`, `border: 1px solid red`, `box-shadow: 0 0 1px red`, `background: var(--color-primary-500)`, `background-image: linear-gradient(red, blue)`, `@apply text-primary-500`, `@apply bg-opacity-50`, `@apply from-primary-500` |
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
