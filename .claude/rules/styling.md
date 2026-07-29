---
paths:
  - "**/*.vue"
  - "**/*.scss"
---

# Styling

**BEM is the styling system; Tailwind is how BEM rules are written.**

- The BEM block name must equal the component's file name (`sales-rep-orders.vue` -> `.sales-rep-orders`).
  If they diverge, rename the component rather than the block.
- The block class goes on the component's **root tag** — including on a UI-kit root like `<VcModal>`,
  which forwards `$attrs.class` to its root Dialog. Do not put it on a wrapper `<div>` inside the
  default slot. Reference: `client-app/shared/cart/components/add-bulk-items-to-cart-results-modal.vue`.
- Do not mix BEM classes and Tailwind utilities in markup. Either the component is fully BEM
  (utilities live in `<style>` behind `@apply`) or it is Tailwind-only. Partial BEM is not accepted.
- A BEM element may never be used outside its block, and element names are never broken up
  (`&__code-inner`, not `&__code` + `&-inner`).
- Do not duplicate rule bodies across modifiers. Use a SCSS variable capturing the parent selector:
  ```scss
  .product-card {
    $list: "";

    &--list {
      $list: &;
    }

    &__footer {
      #{$list} & {
        @apply block;
      }
    }
  }
  ```
- Responsive rules inside `<style>` belong in `@media (min-width: theme("screens.md"))` blocks,
  not `@apply md:` variants.

**Never reach into UI-kit internals.** Overriding classes like `.vc-widget__header-container` or
`.vc-table__title` from a consumer is not accepted. Use the component's props and slots; if neither
covers the case, it is a design-system gap to raise, not to patch.
Internal-structure overrides belong only in client projects, never in the theme.

**RTL-safe and themeable utilities.**

| Instead of                   | Use                                                              |
| ---------------------------- | ---------------------------------------------------------------- |
| `ml-*` / `mr-*`              | `ms-*` / `me-*`                                                  |
| `pl-*` / `pr-*`              | `ps-*` / `pe-*`                                                  |
| `text-left` / `text-right`   | `text-start` / `text-end`                                        |
| `border-l-*` / `border-r-*`  | `border-s-*` / `border-e-*`, or `border-inline-start` in raw CSS |
| `float-left` / `float-right` | `float-start` / `float-end`                                      |
| `rounded`, `rounded-lg` …    | `rounded-[--vc-radius]`, so it follows the theme's radius        |

`rounded-full` is fine — it isn't a fixed radius.

Colors come from the palette scale — `text-neutral-500`, `text-primary` — or from a semantic token
where one exists, as in `text-[--link-color]`. Never a raw Tailwind ramp: `text-gray-500`,
`text-slate-400` and friends don't follow the theme.

Font sizes come from the type scale (`text-[13px]` is not a size we have). Lato does not ship
`font-medium`, `font-semibold` or `font-extrabold`. `fill-*` does not work on the outline icon set —
use `text-*`. Check the browser console for deprecation warnings on components and props before
pushing.
