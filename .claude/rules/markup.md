---
paths:
  - "**/*.vue"
---

# Markup (Vue templates)

Which components to use and how to customise them is in `ui-kit.md`; classes and styling in `styles.md`.

## Template structure
1. `v-for` always has a stable `:key` from the entity's real identity (`id`, `sku`, `file.url` — not a display
   name that can repeat). `:key="index"` only for static/positional lists (skeleton rows, OTP cells); flag it on
   lists that can reorder, filter or be edited.
2. Never `v-if` and `v-for` on the same element; filter in a `computed`.
3. Keep logic out of the template: a condition that is non-trivial or used twice becomes a named `computed`.
   No `.filter()/.map()/.find()` over arrays inside `v-for` / `v-if` expressions.
4. Slots use `<template #name>`, not `v-slot:name`.
5. Blank line between sibling tags *(eslint error `vue/padding-line-between-tags`)*.
6. Component tags in PascalCase (`router-link`, `i18n-t`, `component`, `transition` exempt).
7. No static inline `style="..."`. Dynamic `:style` only for truly runtime values (see `styles.md` §9).
8. Prefer `v-if` for conditional content; `v-show` only for cheap, frequently toggled nodes.
9. Dead UI is not shipped: `v-if="false"`, commented-out markup, listeners for events the child never emits,
   props passed that the child doesn't declare.

## Accessibility
10. An icon-only control (`VcButton icon`, a raw clickable icon) has a translated `aria-label` (or `title`).
11. `VcIcon` is `aria-hidden` by default; pass `label` only when the icon carries meaning on its own.
12. Decorative images `alt=""`; content images a translated `alt`.
13. A clickable non-button element needs keyboard support (`tabindex="0"` + Enter/Space) — prefer a real
    `button`/`a` or `VcTable`'s clickable rows. Don't put `role="button"` on a `<tr>`. Sonar fails the gate here.
14. Inputs are labelled: `VcInput label`, or `<label for>` + `id`. Errors use `aria-invalid` + `aria-describedby`;
    async status messages `role="alert"` / `aria-live="polite"` (or `<output>`). A live region whose text doesn't
    change isn't re-announced — clear it before setting the same message again.
15. Ids in components that can render more than once come from `useComponentId("prefix")`
    (`@/ui-kit/composables`), not a hardcoded `id="..."` and not `uniqueId`/`useId` in new code.
16. When a control has both visible text and `aria-label`, the accessible name starts with the visible text (WCAG 2.5.3).
17. No focus removal (`outline-none`, `outline: 0`) — the global `*:focus-visible` ring must stay.
18. A form that submits is a `<form @submit.prevent>` so Enter works; focus moves into a step/dialog that appears.

## Links
19. Internal navigation: `router-link`, `VcLink :to` or `VcButton :to`, with route names from `ROUTES`
    (`client-app/router/routes/constants.ts`) or module route constants — not string paths. External:
    `VcLink external-link` / `VcButton external-link`. Raw `<a href>` only for full-page or external targets.
20. `target="_blank"` requires `rel="noopener noreferrer"`.

## Test ids
21. `data-test-id="kebab-case"` (never `data-testid`/`data-qa`), unique on the page and specific enough to be an
    E2E selector, ending with the element kind: `-button`, `-link`, `-input`, `-label`, `-option`, `-section`.
    It goes on the interactive element: for kit components with an inner control use their `testId*` prop
    (`ui-kit.md` §6). Dynamic: `` :data-test-id="`filter-${facet.paramName}`" ``. Renaming an existing test id
    breaks E2E flows — call it out.

## Legacy — don't flag, don't copy
- Utility-only templates with no `<style>`.
- Raw `<a :href>` styled with `text-[--link-color]` classes.
- `:key="index"` on existing lists; `uniqueId(...)` ids in the UI kit.
