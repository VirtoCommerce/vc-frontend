# Writing a custom section

A custom section is an HTML template, its CSS and its settings. The storefront renders it from data: no script runs.
Anything that needs logic comes from the kit: a kit tag or a behavior.

When a section is saved or published, the server refuses one that breaks the rules below: an element, attribute or
class they refuse, a selector that reaches outside the section, a keyframes name, an image outside the asset
library, an element with more than 64 attributes, a kit tag with `hasSideEffects` inside an element whose behavior
repeats its children, an `h1`, an image without `alt`, a link with nothing to read, or `outline: none`. A literal
color, a physical side, a skipped heading level, motion outside `prefers-reduced-motion` and text written into the
template get only a warning. The storefront leaves out whatever still reaches a page against them.

- Reach for a kit tag before hand-built markup: a button, link, badge, chip, alert, rating, specification row,
  icon shape or styled text from the kit looks and behaves as the rest of the storefront, in every theme preset.
- One root element. The storefront sets `data-sb-type` and the setting variables (`--setting-<id>`) on it and wraps
  it in a box of its own: nothing the section draws leaves that box.
- Classes are the section's own: `{type}`, `{type}__part`, `{type}--modifier`. The storefront's utility classes are
  not available, and any other class is dropped.
- CSS reaches only the section; `:scope` is the root. Keyframes are named `{type}__…`.
- A selector may not look outside the section:
  - `:scope` or `&` only as the first thing of a selector, never inside a pseudo-class;
  - no `:has()` whose selector starts with `+` or `~`;
  - no `:nth-child(… of …)` or `:nth-last-child(… of …)` on `:scope` or `&`;
  - no combinator inside `:is()`, `:where()` or `:not()`, and no unknown functional pseudo-class.
- The storefront writes each rule back as the browser parsed it, and a browser keeps a shorthand with `var()` only
  whole. When a rule sets some of its parts after it, as `background: linear-gradient(var(--a), var(--b))` and then
  `background-size` or `background-clip: text`, the shorthand is lost: set each part on its own
  (`background-image`).

## Layout: mobile first

- Write the narrow layout first, then widen it with `@container sb-section (min-width: …)`. The container is the
  place the section stands in: a full-width page or a narrow column. Take the widths from the design's breakpoints.
- Keep content within the design's content width and center it, as the built-in sections do.
- Lay out with grid and flex and `gap`; let rows wrap (`repeat(auto-fill, minmax(min(100%, 16rem), 1fr))`).
- No fixed widths or heights on anything that holds text.
- A `data-marquee` row is as wide as all it holds. In a grid, give its column `minmax(0, 1fr)`: an `auto` or `1fr`
  column grows to the row and pushes the rest of the section off the screen.

## Right to left

The page may read right to left.

- Logical properties only: `margin-inline-start`, `padding-inline`, `inset-inline-start`, `border-inline-start`,
  `text-align: start | end`, `float: inline-start`. Never assume that left is the start.
- What has no logical form (`translate`, a gradient's direction, an arrow) is mirrored under `:dir(rtl)`.
- `--pointer-inline` and `--marquee-shift` already follow the direction.

## Design tokens and colors

- Sizes, type, corners and shadows come from the design tokens, by variable name: the font family, size, weight
  and line height (`--vc-font-size-*`, `--vc-font-weight-*`, `--vc-line-height-*`), the letter spacing
  (`--vc-letter-spacing-*`), the heading role (`--vc-heading-*`), the corners (`--vc-radius-*`) and the shadows
  (`--vc-shadow-*`). A design may leave a token unset, so write it with its fallback: `var(<token>, <fallback>)`. A
  shadow comes in parts (`--vc-shadow-md-1`, `--vc-shadow-md-2`): list them all, separated by commas.
- Colors come from the palette only: `var(--color-<family>-<shade>)` (the palette tokens list them, `_` written as
  `-`), a `color-token` setting's `--setting-<id>`, `transparent` or `currentColor`. A literal color
  breaks the shop's presets and dark theme.
- Outline text keeps its `color` and hides its fill with `-webkit-text-fill-color: transparent`, so a
  `-webkit-text-stroke` in `currentColor` draws in that color. A transparent `color` hides the stroke too.

## Type and headings

- The page owns the `h1`. A section starts at `h2`; its parts use `h3`. Do not skip levels. A `vc-typography`
  with an `h2`–`h6` tag is a heading too.
- Headings read the heading role tokens (`--vc-heading-*`) on their own. Set their size from the font size tokens
  with the matching line height.
- Body text stays at the base size or larger.

## Images

- An `img` or a `vc-image` takes its `src` from the asset library: one of its URLs, or one binding of an `images`
  setting.
- `alt` comes from a setting when the image says something, and is `""` when it only decorates.
- Below the fold: `loading="lazy"`. Give `width` and `height` (or `aspect-ratio`) so nothing shifts as it loads.
- Use the asset library's images at the size shown; no huge originals.

## Links and buttons

- A call to action is a `vc-button` with `to`; a link is a `vc-link` with `to`, or an `a` with an `href`, of a
  `url` setting. Each carries visible text, and an accessible name, when given, starts with that text. A path on
  the site opens without reloading the page from `vc-button` and `vc-link`, not from `a`.
- `target` is `_self` or `_blank`; `_blank` gets `rel="noopener noreferrer"` from the storefront.
- A kit tag takes no `class` or `style`. Style a `vc-button` from an element around it: `--vc-button-radius`,
  `--vc-button-min-width`, `--vc-button-icon-size` and `--vc-button-text-transform` reach the button. Its largest
  `size` is `lg`; a bigger button is that one under a `scale` on its wrapper.

## Keyboard and focus

- Only kit tags and behaviors are interactive; a `div` that acts on a click does not reach the keyboard.
- Never remove the focus ring (`outline: none`, `outline: 0`).
- The section clips what paints past its edge: give an item flush with that edge a focus style inside its box,
  such as a negative `outline-offset`. A marquee that takes the focus itself already has its ring inside.
- Keep the reading order the visual order.

## Motion

- Move things only through behaviors (`data-inview`, `data-scroll-progress`, `data-count-up`, `data-marquee`) and
  the CSS that reads what they write. Animate `transform` and `opacity`.
- A countdown's date with no time ends at 00:00 UTC of that day, the same moment for every visitor. Write a
  date-time with an offset, such as `2026-12-24T18:00:00-05:00`, for another moment.
- A kit tag with `hasSideEffects` in the kit, such as `vc-products`, is left out inside an element whose behavior
  repeats its children: its copy would search or report a view again.
- Put transitions and animations under `@media (prefers-reduced-motion: no-preference)`. Behaviors already show
  their end state at once when motion is reduced.
- In an element with `data-count-up`, and in the `data-countdown-part` children of a countdown, the behavior writes
  the text: what the template writes there is left out, also while the behavior loads. Write the value as the text
  too, as the stats pattern does: it shows if the behavior fails to load.

## Text and languages

- Every word a customer reads comes from a translatable setting. Text written in the template is the same in every
  language.
- Leave room: German and French run about 30% longer than English. No fixed widths on text; let it wrap.

## Contrast

- Name the text and background `color-token` settings `color` and `background`. Publishing the theme checks that
  pair in its templates, header and footer against both the light and the dark palette; a page is not checked, so
  pick a pair that holds in both.
- Text over an image needs a scrim or a mask between them.

## Performance

- Few, right-sized images. No background video unless the section is about it.
- Behaviors load on their own the first time a template uses them; add only those the section needs.
- An element is written with at most 64 attributes; one with more is left out, with its content.
- A section renders at most 5,000 elements and behaviors, each counted as written (whatever `data-if` hides) and
  once per row of its list; what an element with a repeating behavior (`data-marquee`) holds counts twice, a text
  right inside it as an element too, a kit tag counts its `cost` from the kit (`vc-products` counts as many as its
  products may render), and rich text counts its elements. It also renders at most 262,144 characters of settings: every bound value in its text and
  attributes, and its rich text, counted the same way. A section over either renders nothing.

## Patterns

### Hero with an image mask

```html
<section class="custom-hero">
  <img class="custom-hero__image" src="{{ settings.image }}" alt="{{ settings.image_alt }}" width="1600" height="900" />
  <div class="custom-hero__body">
    <h2 class="custom-hero__title">{{ settings.title }}</h2>
    <vc-button data-if="settings.link" label="{{ settings.link_label }}" to="{{ settings.link }}"></vc-button>
  </div>
</section>
```

```css
:scope {
  display: grid;
  color: var(--setting-color);
  background: var(--setting-background);
}
.custom-hero__image,
.custom-hero__body {
  grid-area: 1 / 1;
}
.custom-hero__image {
  inline-size: 100%;
  block-size: auto;
  mask-image: linear-gradient(to bottom, currentColor 55%, transparent);
}
.custom-hero__body {
  align-self: end;
  padding-inline: 1.5rem;
  padding-block-end: 1.5rem;
}
```

### Stats band with count-up

```html
<section class="custom-stats">
  <h2 class="custom-stats__title">{{ settings.title }}</h2>
  <ul class="custom-stats__list">
    <li class="custom-stats__item" data-each="settings.stats" data-inview data-inview-once>
      <span class="custom-stats__value" data-count-up="{{ item.value }}">{{ item.value }}</span>
      <span class="custom-stats__label">{{ item.label }}</span>
    </li>
  </ul>
</section>
```

```css
.custom-stats__list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
}
@media (prefers-reduced-motion: no-preference) {
  .custom-stats__item {
    opacity: 0;
    transition: opacity 0.4s calc(var(--i) * 0.08s);
  }
  .custom-stats__item[data-visible] {
    opacity: 1;
  }
}
```

### Card grid

```html
<section class="custom-cards">
  <h2 class="custom-cards__title">{{ settings.title }}</h2>
  <div class="custom-cards__grid">
    <a class="custom-cards__card" data-each="settings.cards" href="{{ item.link }}">
      <img class="custom-cards__image" src="{{ item.image }}" alt="" loading="lazy" width="400" height="300" />
      <h3 class="custom-cards__name">{{ item.title }}</h3>
      <p data-if="item.text">{{ item.text }}</p>
    </a>
  </div>
</section>
```

```css
.custom-cards__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
}
.custom-cards__card {
  display: grid;
  gap: 0.5rem;
  border-radius: var(--vc-radius, 0.5rem);
  color: inherit;
}
```
