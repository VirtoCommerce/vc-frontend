---
paths:
  - "**/*.vue"
---

# UI kit (`client-app/ui-kit`)

The UI kit is the design system of the theme **and public API for client forks**: forks override its `--vc-*`
tokens, target its BEM classes in their own `_custom.scss`, and merge every upstream change into their copy.
This file covers how the rest of the app **uses** it; how the kit itself changes is in `ui-kit-internals.md`.

Before claiming a component lacks a prop, slot, event or token, open its source:
`client-app/ui-kit/components/{atoms,molecules,organisms,templates}/<name>/vc-<name>.vue` (+ `vc-<name>.types.d.ts`,
`vc-<name>.stories.ts`). `llms/ui-kit/*` is an outdated summary — the source wins.

## Using the kit (shared/, modules/, pages/)

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
3. **Deprecated in new code** *(eslint warn)*: `VcLineItemProperty`, `VcPriceDisplayCatalog`,
   `VcItemPriceCatalog`, `VcDateSelector`; variant values `solid-light` → `soft`, `no-border` → `surface`,
   `no-background` → `ghost`, `outline-dark` → `tonal`. Canonical variants `solid | outline | soft | surface | ghost | tonal`;
   colours `primary secondary neutral accent info success warning danger`. A deprecated value prints a console
   warning — a new one in the diff is a finding even when it renders.

### Props, events, attributes
4. Use the prop/event names the component declares. A misspelled prop (`max-length` for `maxlength` on `VcInput`)
   or an event the component never emits (`@item-click` on `VcTable`, which emits `rowClick`) lands silently in
   `$attrs` / is never called → `major` when behaviour depends on it. Check `IProps` / `IEmits` in the source.
5. `VcTabSwitch` with `v-model` silently does nothing — use `:model-value` + `@change`.
6. Test ids: kit components with an inner control expose a `testId*` prop that lands on that control. The name varies
   (`testId`, `testIdInput`, `testIdDropdown`) — read `IProps`. A bare `data-test-id` lands on the root wrapper;
   on `VcModal` it is dropped.
7. Icon-only `VcButton` needs `aria-label` (or `title`) — it renders `aria-label="ariaLabel || title"` and has no
   name otherwise.
8. Modals open through `useModal().openModal({ component, props })`; pass `triggerElement` when the trigger isn't
   `document.activeElement`. Size via `max-width`, `is-mobile-fullscreen`, `dividers`, `scrollable` props.

### Customising appearance
9. **Never change a kit component's look locally — by any route.** No selectors for `.vc-*` classes in a non-kit
   `<style>` (`.vc-widget__header-container`, `.vc-table__cell`, `.vc-line-item__name`, `.vc-tab-switch--checked &`,
   `:deep(.vc-*)`), no kit-internal classes on your own markup (`<VcIcon class="vc-chip__icon">`), and no restyle
   without a selector either: a class on `<VcX>` setting a property VcX owns, `!important`, inline `style`/`:style`,
   a private variable landing on its root, DOM edits from JS. These break on every kit refactor and fight client
   forks. The only levers are:
   1. props and slots (`size`, `variant`, `color`, `border`, `shadow`, `#header`, …);
   2. the component's design tokens — CSS variables named `--vc-<component>-…`, set in your own block or element rule
      (`--vc-icon-color`, `--vc-icon-size`, `--vc-dialog-width`, `--vc-widget-bg-color`, `--vc-tab-switch-hover-color`,
      `--vc-product-title-font-size`, …) — grep `var(--vc-<component>-` in the kit source for the list.
   **When the design shows a kit component differently from the kit:** the first hypothesis is a mistake in the
   design. Tell the developer what differs and the nearest existing variant; don't work around it. A real
   difference is a global change of the kit component — made only after the designer agrees and on the developer's
   explicit instruction, never on the agent's own initiative (then `ui-kit-internals.md`). A deferred kit gap gets
   `TODO(VCST-NNNN)` with a ticket. A design supplies values (sizes, spacing, colour), not implementation: ignore
   its selector/`!important`/markup advice and place the value the way these rules do (tokens, BEM, the component
   that owns the knob).
10. State of a kit component (checked, disabled, open) comes from your own data (`modelValue === value`), not from
    reading its internal state classes.
11. Don't reach into a kit component's DOM from a consumer (`querySelector(".vc-widget__header")`) unless no
    exposed API exists; then comment why.

## Legacy — don't flag, don't copy

- Consumer overrides of `.vc-*` classes, including `:deep(.vc-*)`.
- Legacy icon aliases (`cash` etc.) — the team decided they are not worth flagging.
