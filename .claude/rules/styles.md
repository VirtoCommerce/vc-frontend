---
paths:
  - "**/*.vue"
  - "**/*.scss"
---

# Styles (BEM, SCSS, Tailwind, theming)

vc-frontend is a white-label theme. Client projects fork it and restyle it through presets (palette JSON),
public `--vc-*` tokens, `_custom.scss` and their own BEM overrides. So every style is judged by four questions:
does it survive **a preset switch**, **dark mode**, **RTL**, and **a client override**? A style that only looks
right in the default light preset is a bug.

Nothing lints SCSS (no stylelint). Only the Sass/Tailwind compile in `yarn build`
catches anything, so everything below is review-only. Severity guide: breaks the build or renders visibly wrong
(in any preset, dark, RTL, print) → `major`; convention violation → `minor`; polish → `nit`.

## 1. Where styles live

1. New and migrated components use **BEM classes only** in the template. Tailwind utilities go inside `@apply`
   in `<style lang="scss">`. Utility-only templates are legacy: leave untouched ones alone.
2. **All-or-nothing per component.** Never add a partial BEM block to a component still styled with inline
   utilities, and never add utility classes to the template of a BEM component, including on child components
   (`<VcButton class="mt-4">` inside a BEM file → give it an element class `&__submit`). In a legacy
   utility-only file a small edit may stay in utilities; new markup there must not start a second system.
3. `<style lang="scss">` without `scoped` (isolation comes from the block name), no `:deep()` / `::v-deep`.
   Block order: `<template>` → `<script setup>` → `<style>`.
4. Global files:
   - `_colors.scss` and `preflight.scss`: their "DO NOT EDIT" header is for client forks; the theme edits them rarely and deliberately.
   - `_custom.scss` is reserved for client forks; the theme itself never adds rules there.
   - New global tokens go to `:root` in `assets/styles/_ui-kit-tokens.scss` (UI-kit tokens) or `main.scss`.
   - Dark-mode fixes for a component: `assets/styles/dark/<atoms|molecules|organisms|shared/...>/<name>.scss`,
     registered in `_dark.scss`. Print fixes: `assets/styles/print/...`, registered in `_print.scss`.
     A new file that is not registered there is dead.
   - Never `html.dark` / `.dark` selectors inside an SFC (there are none today).
5. Shared transitions come from `assets/styles/helpers/_transitions.scss`: `fade`, `slide-fade-{left,right,top,bottom}`,
   `scale`, `shake`, `list` (tunable via `--transition-duration`, `--list-transform`). Don't redefine them per component.

## 2. BEM naming and structure

6. **One block per component, named after the file**: `points-balance.vue` → `.points-balance`. A page in
   `modules/<m>/pages/` may prefix the module (`calendar.vue` → `.sales-rep-calendar`). If block and file
   diverge, rename the file, not the block. A second top-level block in one `<style>` means the second part is
   its own component. Vue `<transition>` classes (`.x-enter-from`) are fine.
7. **The root element carries the bare block class**, even if all rules are on elements: it is the hook client
   projects restyle. When the root is a component (`<VcModal>`, `<VcWidget>`), put the block class on it via
   `class` (falls through to its root DOM node). Reference: `shared/cart/components/add-bulk-items-to-cart-results-modal.vue`.
   On a `VcModal` root, keep layout `@apply` off the block (it styles the dialog shell) and put content spacing
   on an element such as `&__body`.
8. `vc-` prefix is **UI-kit only**. Components in `shared/`, `modules/`, `pages/` never use a `vc-` block or file name.
9. Elements `&__el`, modifiers `&--mod`. **No element of an element** (`.a__b__c`, including the accidental
   `&__b { &__c {} }`): flatten to `&__b-c`. **Never split an element name across nesting**
   (`&__code { &-inner {} }` → write `&__code-inner`): split names can't be found by search.
10. **An element belongs to its block.** No `other-block__el` classes in this component's markup, and no rules
    in this file for another component's block or elements. A parent restyles a child only through the class on
    the child's root (a BEM mix, `class="parent__child"`) or the child's public CSS variables.
11. Modifiers: boolean `&--active`; enum-like `&--{value}` (`stat-widget--success`). A modifier bound in the
    template but styled nowhere is dead (`nit`); an element class with no rule is fine (it's a hook).
12. Class binding: static block/element class + object for modifiers —
    `class="x__item" :class="{ 'x__item--active': isActive }"`. A template literal (`` :class="`x--${tone}`" ``)
    only for enum-like modifiers. Never build Tailwind classes dynamically (`` `bg-${color}-500` ``): Tailwind
    can't see them and they silently do nothing.
13. **Modifier that restyles elements: capture, don't repeat.** Declare `$name: "";` at the top of the block,
    assign `&--name { $name: &; }`, then use `#{$name} & { ... }` inside the element. `$self: &;` +
    `#{$self}--mod &` is also accepted. Flag: the block name typed out again inside its own `<style>`
    (`.product-card--list .product-card__footer`), the same declarations copied into several modifiers, or a
    modifier that exists only to be compounded with another (fold it into the class binding instead).
14. Nest `&:hover`, `&:focus-visible`, `&:disabled`, `&:nth-child()`, `&::before` and `@media` / `@container` inside
    the rule they modify. Keep elements flat at block level (one level of `&__x`, then pseudo/media inside).

## 3. Tailwind inside `@apply`

15. Anything a Tailwind utility expresses goes through `@apply` (arbitrary values like `rounded-[--vc-radius]`,
    `text-[--link-color]`, `size-[--icon-size]` included). Raw CSS only where no utility exists
    (`border-inline-start`, `color-mix()`, `container-type`, `appearance`, custom properties).
16. Variants inside `@apply`:
    - breakpoint variants (`sm:` `md:` `lg:` `xl:` `2xl:` `max-*:` `min-[...]:`) are **banned** → `@media` (§4);
    - `dark:` is banned (§5);
    - `group-hover:` / `peer-*:` → `#{$self}:hover &` / sibling selector;
    - `hover:` / `focus-visible:` → nested `&:hover` is the house form; a single-property colour change
      (`@apply text-[--link-color] hover:text-[--link-hover-color];`) is tolerated, don't flag it.
17. **Build traps** (lint can't see them, `yarn build` fails):
    - leading-`!` utility in `@apply` (`@apply !min-w-full;`) breaks Sass → `@apply min-w-full #{!important};`
      or raw `min-width: 100% !important;`;
    - a class that doesn't exist (`border-grey-100`, `bg-white`, `text-gray-500`) → "class does not exist".
      When migrating a no-op typo from a template, drop it, don't "fix" it into a visual change.
18. `!important` (in any form) needs a reason; if the reason is beating a UI-kit internal rule, the real fix is a
    UI-kit prop or token (see `ui-kit.md`).

## 4. Responsive

19. Responsive rules are `@media` blocks **inside** the rule they change, using theme breakpoints:
    `@media (width >= theme("screens.lg"))` or `@media (min-width: theme("screens.lg"))` (both accepted).
    No breakpoint-prefixed classes in BEM templates.
20. Mobile-first. An upper bound is `(width < theme("screens.lg"))`. **`max-width: theme("screens.lg")` is a
    bug**: it also matches exactly 1024px and overlaps the `min-width: lg` rule.
21. Breakpoints (`ui-kit/constants/tailwind.ts`): xs 480, sm 640, md 768, lg 1024, xl 1280, **2xl 1500**.
    No px literals in media queries; JS uses `BREAKPOINTS` with VueUse `useBreakpoints`, not hardcoded numbers.
22. **Container queries** when the layout depends on the space the component is given rather than the viewport
    (cards, line items, widgets reused in sidebars, modals, grids): `@container (width > theme("containers.2xl"))`.
    The nearest ancestor must declare `@apply @container;` or `container-type: inline-size;`, otherwise the query
    never matches — verify it. Sizes: `xxs` 14rem (custom), `xs` 20 · `sm` 24 · `md` 28 · `lg` 32 · `xl` 36 ·
    `2xl` 42 · `3xl` 48 · `4xl` 56 · `5xl` 64rem. Viewport `@media` is for page-level layout. Don't drive the same
    switch with both.
23. On narrow screens prefer dropping the grid (`display: block`) over resetting `grid-template-areas` / `grid-area`
    per element.
24. A change to one layout path (mobile vs desktop markup, `#mobile-item` vs `#desktop-body` table slots, mobile vs
    desktop header) must be mirrored in the other.

## 5. Colours, theme, dark mode

25. The Tailwind palette is **replaced**, not extended: `primary secondary accent neutral info success warning danger`
    (50–950, plus bare = 500) and `additional-50` / `additional-950`, plus `transparent current inherit`.
    `white`, `black`, `gray-*`, `slate-*`, `red-*`, `blue-*` don't exist: in a template they silently do nothing,
    in `@apply` they break the build. "White" = `additional-50`, "black / shadow" = `additional-950`.
26. **No raw colour values** in new styles: no hex, `rgb()/rgba()/hsl()` literals, named colours (`white`,
    `black`, `red`), including inside `box-shadow` and gradients. Use `theme("colors.neutral.200")` or
    `var(--color-neutral-200)`; alpha via `rgb(from var(--color-additional-950) r g b / 0.1)`; tints via
    `color-mix(in srgb, var(--color-primary-500), transparent 80%)`.
27. **Semantic tokens for their roles**, never a palette shade that happens to match today:
    links `--link-color` / `--link-hover-color`, prices `--price-color`, page `--body-bg-color` / `--body-text-color`,
    header/footer/mobile-menu `--header-*` / `--footer-*` / `--mobile-menu-*`, empty-state icon `--empty-list-icon`.
    A link styled `text-accent-600` instead of `text-[--link-color]` ignores the client's link colour.
28. **Dark mode is a palette swap** under `html.dark` (shade numbers invert: 50↔950, 100↔900…). Consequences:
    - no `dark:` utilities and no dark branches in components;
    - `additional-50` surfaces and `neutral-*` text flip correctly; a hardcoded literal colour does not;
    - when a component genuinely needs a dark-specific remap, it goes to `assets/styles/dark/**` (§1.4);
    - dark overrides there usually win by specificity (`html.dark .x` 0,2,1) — check they don't clobber the
      disabled / selected state (re-assert or guard with `:not(.x--disabled)`).
29. Text colour on light surfaces: body text `neutral-950/900`, secondary `neutral-600/700`. `neutral-500` and
    lighter on `additional-50` / `neutral-50` is suspect for informative text (fails 4.5:1 in some presets);
    `neutral-400` and lighter only for disabled / decorative.
30. **Radius**: `rounded-[--vc-radius]` / `var(--vc-radius)` (buttons `--vc-button-radius`), `rounded-full` for
    pills and circles, `rounded-[inherit]` for clipped children. Plain `rounded`, `rounded-sm/md/lg/xl/2xl`
    ignore the theme radius → finding. Logical corners only (`rounded-s-*`, `rounded-e-*`, `rounded-ss-*`).
31. **Shadows**: theme `shadow-sm|md|lg|xl|2xl|inner` only (built on `additional-950`, flip in dark).
    No arbitrary `shadow-[0px_2px_10px_rgba(...)]` or raw `box-shadow` with literal colours.
32. Don't restate what the component already provides (a white background on `VcWidget`, a border it already
    draws): duplicated styling hides intent and breaks when the token changes.

## 6. Typography

33. Font is Lato only, loaded with weights **400, 700, 900** (+ italic 400). Use `font-normal`, `font-bold`,
    `font-black`. `font-thin|extralight|light|medium|semibold|extrabold` fall back to a synthesized or neighbouring
    weight → finding (the 12 existing `font-medium` are legacy).
34. Sizes from the theme scale only: `xxs` 10 · `xs` 12 · `sm` 14 · `base` 16 · `lg` 18 · `xl` 20 · `2xl` 24 ·
    `3xl` 30 · `4xl` 36 · `5xl` 48 … Each size carries its line-height; override with `text-sm/[1rem]` or
    `leading-*` when needed. `text-[13px]`, `text-[0.8rem]` and other off-scale sizes are findings.
35. Page and section headings use `VcTypography` (`tag`, `variant`), not raw `<h1>`–`<h3>` with ad-hoc sizes.
    Customise it through `--vc-typography-*`, never by targeting `.vc-typography--variant--h1` from a component
    (existing ones in static-content/error pages are legacy).
36. Long text: `truncate` / `line-clamp-*` need a width constraint; inside flex/grid add `min-w-0` to the shrinking
    item. `word-break: break-word` for user-generated strings in narrow cells.

## 7. Spacing, sizing, layout

37. Tailwind spacing scale (custom steps `4.5` 18px, `17`, `18`, `19`). Arbitrary values in `rem`; px only for
    hairlines and border/ring widths (1–2px). No magic numbers repeated across rules: hoist to a local custom
    property or SCSS variable.
38. Flex/grid spacing with `gap-*`. **`space-x-*` is not RTL-safe** in Tailwind 3.4 (it writes `margin-left/right`)
    → `gap-x-*`. `space-y-*` is tolerated in existing code; prefer `gap-y` with `flex-col` in new code.
39. **RTL — logical directions in new lines**: `ms/me`, `ps/pe`, `start-*/end-*`, `text-start/text-end`,
    `border-s/e`, `rounded-s/e`, `float-start/end`, `scroll-ms/me`; raw CSS `margin-inline-*`, `padding-inline-*`,
    `inset-inline-*`, `border-inline-*`, `text-align: start|end`. Physical sides only when the value must not flip
    (non-flipping icon, transform/shadow offset) — with a short reason.
40. z-index: Tailwind steps (`z-10`…`z-50`) or local `z-[1]`/`z-[2]` for stacking inside a component. New values
    above 50 (`z-[9999]`) need a reason — overlays use the UI kit's modal/popover layers.
41. Sizes via `size-*` when width = height. Scroll areas that should show a styled scrollbar use `VcScrollbar`,
    not a bare `overflow-y-auto` with custom scrollbar CSS.

## 8. Icons, focus, motion, print

42. Icon size via `VcIcon :size` or `--vc-icon-size`; colour via `color` prop or `--vc-icon-color` set in your own
    element rule. Not `w-*/h-*` on the icon, not a `.vc-icon` selector. `fill-*` does nothing on the outline set
    (icons use `currentColor`) → use `--vc-icon-color` / `text-*`.
43. Focus: the global `*:focus-visible` ring (`--vc-focus-ring-*`) must stay. No `outline-none` / `outline: 0` /
    `ring-*` focus styles. A custom ring: `@use "@/ui-kit/styles/focus-ring" as *;` + `@include focus-ring;`
    (`focus-ring(true)` for inset when an ancestor clips). Small targets get `@include hit-area(1.5rem)` from
    `@/ui-kit/styles/hit-area` in `::before`, host `position: relative`.
44. New animations and transitions run only under `@media (prefers-reduced-motion: no-preference)` unless they are
    the shared named transitions. Animate `transform`/`opacity`, not layout properties.
45. Print: pages users print (orders, quotes, invoices, cart) hide chrome with `@media print` inside the block
    (`print:hidden` in utility templates is legacy-accepted). UI-kit print fixes live in `assets/styles/print/**`.

## 9. CSS custom properties and `v-bind`

46. Component-local custom properties are short and private (`--size`, `--bg-color`, `--accent`) and set on the
    block or a modifier; prefix them with the block name only if a child component reads them.
47. `v-bind()` in CSS and `:style` only for truly runtime values (a progress %, a measured height); state that
    has a finite set of values is a modifier class. No static `style="..."`.
48. Reading a CSS variable from JS: `readCssVar()` (`ui-kit/utilities/css.ts`), not `useCssVar` (it writes the
    value back inline and freezes it across a theme switch).

## 10. Comments in styles

49. Comment the non-obvious *why* (a containing block for `absolute`, `min-w-0` for truncation, a specificity
    fight with a TODO ticket). One or two lines. No narration of the edit, no QA/ticket histories, no essays —
    `// TODO(VCST-NNNN)` when deferring.

## Legacy — don't flag, don't copy

- Utility-only templates, `print:hidden` and `max-lg:` in them, template `!mt-*` utilities.
- `<style scoped>` blocks; plain CSS with px sizes.
- `vc-`-prefixed blocks outside the UI kit.
- `.vc-typography--variant--h1` overrides outside the kit.
- `@apply` with breakpoint variants, `max-width: theme(...)` queries, `font-medium` / `font-semibold`, plain
  `rounded*`, arbitrary `shadow-[...]`.
