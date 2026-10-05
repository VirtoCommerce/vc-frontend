---
paths:
  - "**/*.vue"
  - "client-app/ui-kit/**"
---

# UI kit (`client-app/ui-kit`)

The UI kit is the design system of the theme **and public API for client forks**: forks override its `--vc-*`
tokens, target its BEM classes in their own `_custom.scss`, and merge every upstream change into their copy.
Two parts: how the rest of the app **uses** it, and how the kit itself **changes**.

**Moved code is new code.** Lines moved or copied into a new file or a newly extracted component are judged as added lines, even if the same text existed elsewhere before — the change chose to ship them again. Only lines left untouched in their original place count as legacy.

Before claiming a component lacks a prop, slot, event or token, open its source:
`client-app/ui-kit/components/{atoms,molecules,organisms,templates}/<name>/vc-<name>.vue` (+ `vc-<name>.types.d.ts`,
`vc-<name>.stories.ts`). `llms/ui-kit/*` is an outdated summary — the source wins.

## A. Using the kit (shared/, modules/, pages/)

### Reuse before building
1. Interactive and visual primitives come from the kit. Hand-rolled equivalents are findings — name the component:
   - button / icon button / link-looking button → `VcButton` (`variant`, `color`, `size`, `icon`, `prepend-icon`,
     `to`, `external-link`); text link → `VcLink` or `router-link`;
   - form fields → `VcInput`, `VcTextarea`, `VcSelect`, `VcDropdownMenu`, `VcCheckbox`/`VcCheckboxGroup`,
     `VcRadioButton`, `VcSwitch`, `VcDateInput`, `VcDatePicker`, `VcDateRangePicker`, `VcFilePicker`/`VcFileUploader`,
     `VcQuantityStepper`, `VcActionInput`; label/hint/error → `VcLabel`, `VcInputDetails`;
   - status dot / counter / tag → `VcBadge` (a dot is `VcBadge` without content), `VcChip`; tabs/segmented → `VcTabSwitch`;
   - card/section → `VcWidget` (+ `VcWidgetSkeleton`); dialog → `VcModal` via `useModal`, `VcConfirmationModal`;
     side panel → `VcPopupSidebar`; popover/menu → `VcPopover`, `VcDropdownMenu` + `VcMenuItem`;
   - message → `VcAlert`; empty state → `VcEmptyView` / `VcEmptyPage`; loading → `VcLoader`, `VcLoaderOverlay`,
     `VcLoaderWithText`; copy-to-clipboard → `VcCopyText`; scroll area → `VcScrollbar`; tooltip → `VcTooltip`;
   - lists/tables → `VcTable` (+ `VcTableColumn`), `VcList`/`VcListItem`, `VcLineItems`/`VcLineItem`, `VcPagination`;
   - text → `VcTypography`; image → `VcImage`; icon → `VcIcon`; markdown → `VcMarkdownRender`;
   - money → `VcPriceDisplay`, `VcProductPrice`, `VcTotalDisplay`, `VcProductTotal`; rating → `VcRating`;
     properties → `VcProperty`, `VcProductProperties`; layout → `VcContainer`, `VcLayout`.
   A raw `<button>` is acceptable only as an unstyled clickable wrapper (row card) or a text-link action; a raw
   `<input>` only with a real reason (OTP cell, payment iframe); a raw `<img>` → `VcImage`.
2. `Vc*` components are globally registered: don't import them for template use (importing for
   `InstanceType<typeof VcX>` or `h()` is fine).
3. **Deprecated in new code** *(eslint warn, CI doesn't run ESLint)*: `VcLineItemProperty`, `VcPriceDisplayCatalog`,
   `VcItemPriceCatalog`, `VcDateSelector`; variant values `solid-light` → `soft`, `no-border` → `surface`,
   `no-background` → `ghost`, `outline-dark` → `tonal`. Canonical variants `solid | outline | soft | surface | ghost | tonal`;
   colours `primary secondary neutral accent info success warning danger`. A deprecated value prints a console
   warning — a new one in the diff is a finding even when it renders.

### Props, events, attributes
4. Use the prop/event names the component declares. A misspelled prop (`max-length` for `maxlength` on `VcInput`)
   or an event the component never emits (`@item-click` on `VcTable`, which emits `rowClick`) lands silently in
   `$attrs` / is never called → `major` when behaviour depends on it. Check `IProps` / `IEmits` in the source.
5. `VcTabSwitch` with `v-model` silently does nothing — use `:model-value` + `@change`.
6. Test ids: kit components with an inner control expose a `test-id` prop (`VcInput`, `VcSelect`, `VcCheckbox`,
   `VcRadioButton`, `VcSwitch`, `VcModal`, `VcScrollbar`, `VcVariantPicker*`, `VcInfinityScrollLoader`) that lands
   on the interactive element. A bare `data-test-id` on those goes to the wrapper (or nowhere, for
   `inheritAttrs: false` components like `VcModal`, `VcInput`, `VcTextarea`, `VcMenuItem`, `VcPopupSidebar`).
7. Icon-only `VcButton` needs `aria-label` (or `title`) — it renders `aria-label="ariaLabel || title"` and has no
   name otherwise.
8. Modals open through `useModal().openModal({ component, props })`; pass `triggerElement` when the trigger isn't
   `document.activeElement`. Size via `max-width`, `is-mobile-fullscreen`, `dividers`, `scrollable` props.

### Customising appearance
9. **Never restyle kit internals from outside.** No selectors for `.vc-*` classes in a non-kit `<style>`
   (`.vc-widget__header-container`, `.vc-table__cell`, `.vc-line-item__name`, `.vc-tab-switch--checked &`,
   `:deep(.vc-*)`), and no kit-internal classes on your own markup (`<VcIcon class="vc-chip__icon">`). These break
   on every kit refactor and fight client forks. Allowed levers, in order:
   1. props and slots (`size`, `variant`, `color`, `border`, `shadow`, `#header`, …);
   2. the component's **public CSS variables**, set in your own block or element rule
      (`--vc-icon-color`, `--vc-icon-size`, `--vc-dialog-width`, `--vc-widget-bg-color`, `--vc-tab-switch-hover-color`,
      `--vc-product-title-font-size`, …) — grep `var(--vc-<component>-` in the kit source for the list;
   3. if neither exists: extend the kit (new prop or token) in its own change, or raise it with design.
   Don't patch internals "for now"; a deferred kit gap gets `TODO(VCST-NNNN)` with a ticket.
10. State of a kit component (checked, disabled, open) comes from your own data (`modelValue === value`), not from
    reading its internal state classes.
11. Don't reach into a kit component's DOM from a consumer (`querySelector(".vc-widget__header")`) unless no
    exposed API exists; then comment why.

## B. Changing the kit itself (`client-app/ui-kit/**`)

12. **Every changed kit line is a merge conflict for every client fork and a visual change for every consumer.**
    A kit change needs a trigger in the PR (a consumer that needs it). Unrelated kit edits, or a default change
    (`size`, padding, colour, cursor) that shifts the whole app, must be called out in the description or dropped.
13. File set per component: `<layer>/<name>/vc-<name>.vue`, `vc-<name>.types.d.ts` (global `declare global` types,
    `Vc<Name><Prop>Type`), `vc-<name>.stories.ts` (Storybook story — required for a new component), optional
    `vc-<name>.test.ts`. Registration: export in `<layer>/index.ts` **and** `GlobalComponents` entry in
    `<layer>/types.d.ts`. Missing either → the component isn't usable/typed globally.
14. Boundaries: the kit must not import `@/shared`, `@/modules`, `@/pages`; new imports from `@/core` are also
    avoided (the kit is being made independent — `VcTable` moved to local types/constants). Use kit-local types,
    string-literal unions instead of enums, constants in `ui-kit/constants`.
15. Kit text (labels, aria-labels) uses keys from `client-app/ui-kit/locales/*.json` (`ui_kit.*`), all 13 locales.
16. Styling inside the kit:
    - block `vc-<name>`; modifiers `vc-x--flag`, `vc-x--size--md`, `vc-x--color--primary`, `vc-x--{variant}--{color}`;
    - prop values reach CSS through `--props-<name>: v-bind(props.x)` at the top of the block;
    - private short variables (`--size`, `--bg-color`, `--radius`) resolve **public → global → literal**:
      `--radius: var(--vc-chip-radius, var(--vc-radius, 0.5rem));`
    - states captured with `$disabled: ""; &--disabled { $disabled: &; }` and reused (`&:hover:not(#{$disabled})`);
    - variant × colour matrices generated with `@each` over `$colors` / `$variants`, not copy-pasted;
    - colour tokens for variants live in `assets/styles/_ui-kit-tokens.scss` as
      `--vc-<comp>-<variant>-<color>-<part>: var(--color-vc-<part>-<variant>-<color>, <palette fallback>)`;
    - dark remaps in `assets/styles/dark/<layer>/vc-<name>.scss`, print in `assets/styles/print/<layer>/...`;
    - focus ring via the `focus-ring` mixin, small targets via `hit-area`, motion under `prefers-reduced-motion`.
17. **Public tokens are API.** A new `--vc-*` variable must be consumed (a token nothing reads is dead) and must not
    pin a related value (a font-size token next to a literal line-height desyncs). Renaming or removing one follows
    `client-app/ui-kit/DEPRECATION.md`: alias the old name in the new one's fallback, add a row to its table.
18. **Deprecations follow `DEPRECATION.md`** exactly: component → story `tags: ["deprecated"]` + `@deprecated`
    JSDoc in `index.ts` and `types.d.ts` + dev `console.warn` after `defineProps` + eslint
    `vue/no-restricted-html-elements`; prop value → keep it in the union with `/** @deprecated */`, normalise via
    `resolveVariant()` / `LEGACY_VARIANT_MAP`, `Deprecations` story. Removing a prop/value/slot/event without that
    cycle is a breaking change → `major`.
19. Unknown enum values (e.g. a `variant` string coming from theme settings) should fall back to the default
    rather than render an unstyled component.
20. Exposed API stays minimal: `defineExpose` only for imperative needs (`focus`, `blur`, `el`), typed via a
    `Vc<Name>ExposedType`.

## Legacy — don't flag, don't copy

- Existing `@/core` imports inside the kit (`@/core/utilities`, `@/core/api/graphql/types`, …) and one `@/shared/notification`.
- Existing consumer overrides of `.vc-*` listed in `styles.md` → Legacy; `:deep(.vc-widget__header-container)` in
  `order-summary.vue` and `customer-order-details.vue`.
- Legacy icon aliases (`cash` etc.) — the team decided they are not worth flagging.
