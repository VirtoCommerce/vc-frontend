# vc-frontend

Vue 3 + TypeScript + Tailwind + Apollo GraphQL B2B storefront theme for VirtoCommerce.

The conventions below are the ones that recur most often in PR review on this repo. Rules that
a linter already enforces are deliberately **not** repeated here — run `yarn lint` for those.
What follows is the judgment-call knowledge that tooling cannot check.

## Commands

| Task              | Command                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Dev server        | `yarn dev`                                                                                 |
| Types             | `yarn validate:types` (`vue-tsc --build --force`; plain `--noEmit` at root checks nothing) |
| Lint              | `yarn lint` / `yarn lint:fix`                                                              |
| Unit tests        | `yarn test:unit`                                                                           |
| Full gate         | `yarn validate` (types + dependency-cruiser)                                               |
| GraphQL types     | `yarn generate:graphql-types` (needs a live backend)                                       |
| Locale gaps       | `yarn check-locales` / `yarn fix-locales`                                                  |
| Style conventions | `yarn check:style-conventions`                                                             |

## Code review

`.claude/skills/fe-code-review/SKILL.md` is a checked-in review skill: the defect classes this team
actually catches, plus which of them the bots already cover. Claude Code picks it up automatically
for anyone who clones the repo — invoke it with `/fe-code-review`, or just ask for a review.

It is a normal repo file. If review turns up a rule that keeps recurring, add it there (or here) in
the same PR, so the checklist grows with the codebase instead of living in one person's head.

## Styling

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
`.vc-table__title` from a consumer is rejected in review every time it appears. Use the component's
props and slots; if neither covers the case, it is a design-system gap to raise, not to patch.
Internal-structure overrides belong only in client projects, never in the theme.

Other recurring points: colors come from the palette (never `text-gray-500`); font sizes come from
the type scale (`text-[13px]` is not a size we have); Lato does not ship `font-medium`,
`font-semibold` or `font-extrabold`; `fill-*` does not work on the outline icon set, use `text-*`.
Check the browser console for deprecation warnings on components and props before pushing.

## Vue components

- Props via a named interface, never an inline generic — `interface IProps { ... }` +
  `defineProps<IProps>()`. This is ~315 files to 10 across the repo. Same for `IEmits`.
- Interfaces at the top of `<script setup>`, `define*` macros below them.
- Keep logic out of the template. Once a condition is non-trivial or used twice, name it as a
  `computed` — this is the single longest-running review note in the repo's history.
- Boolean props default to `false`, so they can be used as bare attributes.
- Prefer `emits` over passing functions as props — function props make the prop type describe
  behavior rather than what to render.
- Avoid non-null assertions (`item.product!.name`). Narrow with a type guard instead:
  `.filter((item): item is Product => !!item)`.
- Use `useComponentId()` for DOM ids and `useTemplateRef()` for template refs.
- Function declarations for named functions; arrow functions only for callbacks.
- Named constants instead of magic numbers, with a self-describing name.
- Reach for VueUse before hand-rolling (`useDebounceFn`, `useResizeObserver`, `useScriptTag`).
- Routes go through the `ROUTES` constants in `client-app/router/routes/constants.ts`.

## i18n

Localization is mandatory — never hardcode user-visible text. In components use
`const { t } = useI18n()`.

**A locale key is added to all 13 locales or the change is incomplete.** Shipping English strings
verbatim into the other 12 files is the same defect as omitting them; both have been caught in
review. Use `yarn check-locales` to find gaps and `yarn fix-locales` to fill them — note it only
acts on _missing_ keys, so to replace English placeholders you must delete them first.

Write messages so they stay grammatical when a count is interpolated. Either use
[vue-i18n pluralization](https://vue-i18n.intlify.dev/guide/essentials/pluralization) or restructure
the sentence so the number lands at the end (`"Current points balance: {n}"`). This has been raised
for ru, fi and en separately.

## GraphQL

- **Never hand-edit `types.ts`** — it is generated. Run `yarn generate:graphql-types`.
- Use the generated fragment types rather than hand-rolling `Pick<...>`; a hand-rolled type silently
  stays narrow when the fragment is widened later.
- Reuse existing fragments (`...organizationFields`) instead of respelling field sets.
- Do not select fields nothing renders — every field costs backend work.
- Query/mutation generics are inferred from the Document; passing them explicitly is redundant.

## Pull requests

Follow `.github/pull_request_template.md`: Description, Jira-link, Artifact URL. A correct Jira link
auto-links the PR to the work item.
