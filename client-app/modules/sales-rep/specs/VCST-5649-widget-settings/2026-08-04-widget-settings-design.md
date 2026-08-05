# Sales Rep Hub — per-widget settings: max rows and order status tabs (VCST-5649, FE)

**Jira:** [VCST-5649](https://virtocommerce.atlassian.net/browse/VCST-5649) — "[FE] [Sales Rep] Hub and customer profile. Widget settings: number of rows and order statuses" (epic [VCST-5142](https://virtocommerce.atlassian.net/browse/VCST-5142) Sales Rep Hub).
**Branch:** `feat/VCST-5649-srh-widget-settings` off `feat/VCST-5367-srh-layout-drag-and-drop` (PR #2400), not off `dev` — this ticket fills in the `settings` key that VCST-5367 deliberately left empty.

## Goal

In layout-edit mode a rep can cap how many rows each list widget shows, and choose which order
status tabs the Recent Orders widget offers. Both persist with the layout, through the same
Save / Cancel / Reset, on both the Dashboard and the Customer profile.

## At a glance

VCST-5367 split the feature in two: the **registry** owns structure, the **saved document** owns
arrangement. This ticket adds a third column without disturbing either:

```
REGISTRY (code)              SAVED DOC (backend)        RENDERED PAGE
which blocks exist       +   order within a region  =   the layout the rep sees
which region each lives in   hidden true/false
which settings each has      each setting's value
its default, min, max
```

The last registry line is what makes AC #5 ("missing or unknown settings fall back to the registry
defaults") mechanical rather than a per-widget convention: every value read out of the document is
validated against a descriptor that already knows what it should be.

**No API change.** `InputSalesRepLayoutBlock.settings` has been in the contract since VCST-5367 and
has been going out as `[]`. Only the two `.graphql` documents change, to *select* `settings` back.

## Decisions (confirmed with requester, 2026-08-04)

1. **Default checked tab set = every rule the backend returns.** AC #2 named "New / On hold /
   Active / Fix-it", but those come from the prototype's fictional 10-status catalog
   (`HUB_ORDER_TAB_DEFS`). What actually ships reads `salesRepOrderFilterRules` at runtime — raw
   order statuses for the store, labelled by the backend's `localizedName`, with no frontend i18n
   for them. Hardcoding four names would break on any store whose statuses differ. So the widget
   looks exactly as it does today until a rep unchecks something.
2. **`maxRows` range is per block, from the registry.** AC #1 says 1–20, but `salesRepTopSellers`
   caps `take` at 10. Recent Orders gets 1–20, Top sellers 1–10, so a rep can never ask for rows
   the backend will not return.
3. **The Activity widget is out of scope.** AC #1 names an "Activity 3" default; no Activity block
   exists in this repo. Its settings descriptor is one registry line whenever that widget ships.
4. **Stat cards get no settings.** Nothing about a KPI card is configurable.
5. **Kit components are consumed through published slots and props only** — no `.vc-*` selectors,
   no `!important`, no inline fallbacks. See §5.

## Verified facts (from the codebase and the live backend)

- `SalesRepLayoutSetting { key: String!, value: AnyValue }`, introspected anonymously against
  `https://vcptcore-dev.govirto.com/graphql/sales-rep` on 2026-08-04. Introspection needs no token,
  so `yarn generate:graphql-types` runs against that env; the *data* fields do need a rep token.
- **`settings.value` is a scalar only** — string, number or boolean, CLR types preserved. Lists and
  objects are not valid values (Kirill Iusupov, Jira comment 2026-07-25), which is why the status
  selection is flattened into sibling keys rather than stored as an array.
- `sales-rep-orders.vue` and `top-sellers.vue` are referenced only by `layout/registry.ts` — no
  caller outside the layout has to keep working.
- The orders widget's "status tabs" are `SalesRepRuleChips` over `salesRepOrderFilterRules`, plus a
  synthetic "All" baseline chip that is not one of the rules. `constants.ts` records that these
  rules are raw order statuses (`NEW_ORDERS_FILTER = "New"`), and `locales/en.json` carries a
  frontend label for exactly one rule name, `rules.customer.filter.All` — the order rules are
  entirely backend-labelled.
- `useSalesRepTopSellers` already accepts `take`; `top-sellers.vue` never passes it. `sales-rep-orders.vue`
  already has a `limit` prop wired to `first`, defaulting to `ORDERS_DEFAULT_LIMIT` (7 — not the
  design's 5).
- `VcInput` sets `inheritAttrs: false` and re-binds `useAttrsOnly()` onto its root `<div>`; that
  helper strips only `on*` handlers, so `class` and `style` passed from outside land on the root.
- `.vc-widget__title` carries `grow`, so `#append` content is right-aligned by the kit — the
  prototype's `marginLeft: "auto"` has no equivalent here and is not needed.

## Architecture

### 1. Settings descriptors live in the registry (`types/layout.ts`, `layout/registry.ts`)

```ts
export type SalesRepBlockSettingType =
  | { kind: "maxRows"; default: number; min: number; max: number }
  /** Checkbox catalog = the filter rules the widget already queries for its tabs. */
  | { kind: "ruleTabs"; domain: SalesRepRuleDomainType };
```

`ISalesRepWidgetBlock` gains `settings?: SalesRepBlockSettingType[]`. Both scopes declare the same
two blocks:

| block         | settings                                              |
| ------------- | ----------------------------------------------------- |
| `orders`      | `maxRows` (5, 1–20) · `ruleTabs` (`order`)            |
| `top_sellers` | `maxRows` (5, 1–10)                                   |

A discriminated union rather than one generic `{ key, type, default }` record: `maxRows` and
`ruleTabs` have nothing in common at read time — one clamps a number against bounds, the other
reconciles a set against a list the backend supplies at runtime.

### 2. Wire format — a scalar per setting, siblings for the tab set (`layout/settings.ts`)

New pure module, no Vue and no Apollo, alongside `layout/document.ts` for the same reason: the
reconciliation rules are the part worth testing.

```
maxRows              →  { key: "maxRows",    value: 5 }
an unchecked tab     →  { key: "tab.<rule>", value: false }
a checked tab        →  nothing written
```

Writing only the *unchecked* rules is what carries AC #5 across the tab half: a status the backend
adds later is absent from every saved document, so it shows up checked for free. Reading is
defensive in three places:

- `maxRows` is coerced to an integer and clamped to the block's own `[min, max]`; anything
  non-numeric falls back to the descriptor's default.
- `tab.*` keys naming a rule the backend no longer returns are dropped by `knownHiddenTabs`, which is
  the only place a live catalog is known. An empty catalog means the rules query has not resolved (or
  failed, which leaves it empty for the session), not that everything was retired — pruning then would
  erase the rep's whole selection.
- A name stored twice collapses on read, so it cannot go back out twice and read as a disagreeing echo
  against a backend that deduplicates.

**Hiding every rule is allowed.** `sales-rep-rule-chips.vue` renders its synthetic "All" baseline
outside the `v-for`, so the strip is never empty and the rep can always reach their unfiltered orders.
That makes AC #2's "at least one must stay checked" redundant — the constraint it protected against
cannot occur — so neither the editor guard nor an all-hidden display fallback exists. Removed from the
ticket as well (2026-08-05).

The runtime shape is deliberately not the wire shape:

```ts
export type SalesRepBlockSettingsType = {
  maxRows?: number;
  /** Rule names the rep unchecked. */
  hiddenTabs: readonly string[];
};
```

### 3. Settings fold into the existing draft (`types/layout.ts`, `layout/document.ts`, `composables/useSalesRepLayout.ts`)

`SalesRepLayoutStateType` reshapes from a bare region record into:

```ts
{
  regions: Record<SalesRepLayoutRegionIdType, { visible: string[]; hidden: string[] }>;
  /** Per block id; a block declaring no settings never appears. */
  settings: Record<string, SalesRepBlockSettingsType>;
}
```

One draft object means Save / Cancel / Reset cover settings with no second state machine — AC #3
for free. `startEdit` already clones, `reset` already rebuilds from registry defaults, `save`
already sends the whole document. The cost is a mechanical `state[regionId]` →
`state.regions[regionId]` sweep through `document.ts`, `useSalesRepLayout.ts` and their tests.

Rejected: a parallel `draftSettings` ref (smaller diff, but `startEdit` / `cancel` / `reset` /
`save` / `editable` each grow a second thing to keep in step, and the "draft exists ⟺ editing"
invariant gets stated twice); and widget-owned state pushed out at save time (no layout refactor,
but Cancel and Reset then cannot reach it, which AC #3 requires).

`serializeLayout` fills the `settings: []` it currently hardcodes. `echoMatchesSentBlocks` grows to
compare settings too: a silently dropped setting reverts the rep's choice exactly the way a wrong
`hidden` flag reverts a hide, which is the failure that guard exists to catch.

### 4. Plumbing — one provide, one inject

```
layout-surface.vue    provides { settings, updateSettings, editing }   (whole record + updater)
└── layout-region.vue   UNTOUCHED — it owns order, not configuration
    └── layout-block.vue  injects it, folds THIS block's slice into the chrome it already provides
        └── layout-widget.vue   renders the rows input from chrome
            └── sales-rep-orders.vue / top-sellers.vue   read their own values from chrome
```

`ILayoutBlockChromeType` gains `editing`, `settings` and `updateSettings`. Passing the record down
through `layout-region.vue` as props was rejected: the region would be threading a concern it has
no part in, for the same reason VCST-5367 chose provide/inject for the drag controls.

### 5. UI — every kit touchpoint is a published slot or prop

**Max rows** is generic. `layout-widget.vue` renders `layout-rows-input.vue` in `VcWidget`'s
published `#append` slot — the same slot that already holds the ✕ — whenever the block declares a
`maxRows` setting and the surface is editing. Any list widget shipped later gets the control by
adding one registry line.

- `VcInput` is driven by `type="number"`, `size="xs"`, `min`, `max`, `ariaLabel` and `v-model`. Its
  width is the one thing props do not cover, and is set honestly: a class **we** own is passed to
  the component and lands on its root through the documented attr fallthrough, and our SCSS sizes
  that class. No `.vc-input*` selector.
- Local text state, so an empty field mid-retype is not rejected; commits in-range values and
  clamps on blur. Ported from the prototype's `HubRowsInput`.
- It must be added to `WIDGET_DRAG_FILTER_SELECTOR` (SortableJS `filter` takes a comma-separated
  list) or a mousedown inside it starts a drag instead of focusing the field. The added entry is
  `.layout-widget__rows`, a class we own — this does not deepen the module's one existing
  dependency on a kit internal (`WIDGET_DRAG_HANDLE_SELECTOR = ".vc-widget__header-container"`,
  inherited from VCST-5367 and pinned by `layout-block-widget.test.ts`).

**Status checkboxes** are specific to the orders widget, which swaps its chips row for a checkbox
row while editing — as the prototype does, and because a ten-status catalog does not fit in a
header. New `sales-rep-rule-toggles.vue` renders one `VcCheckbox` per rule in catalog order, all of
them always enabled — see "Hiding every rule is allowed" in §2.

Outside edit mode the chips row renders only the checked rules. The "All" baseline chip is always
present and is not configurable — it is not one of the rules, and it is what makes hiding every rule
safe. If the active filter's rule is unchecked mid-edit, the widget falls back to the baseline.

**Consumption.** `sales-rep-orders.vue` reads `maxRows` from chrome for `first` and `:skeleton-rows`,
falling back to its `limit` prop then `ORDERS_DEFAULT_LIMIT`; `top-sellers.vue` reads it for `take`
(already supported by `useSalesRepTopSellers`) and `:skeleton-rows`.

### 6. GraphQL

`settings { key value }` added to `salesRepLayoutQuery.graphql` and
`saveSalesRepLayoutMutation.graphql`, then `APP_BACKEND_URL=https://vcptcore-dev.govirto.com yarn
generate:graphql-types` — whose diff spans every module and must be pruned to sales-rep.

## Testing

| file                            | covers                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `layout/settings.test.ts` (new) | clamping, non-numeric fallback, unknown `tab.*` keys, an unloaded catalog, round-trip |
| `layout/document.test.ts`       | the reshaped state, settings surviving reconcile, `settings` in the payload, the echo check |
| `useSalesRepLayout.test.ts`     | reset restores defaults, cancel discards, save sends what the draft holds                  |
| component tests                 | the rows input's drag-filter class and clamping; the toggles' checked state               |

## Out of scope

- The Activity widget (§Decisions 3).
- Any per-block setting beyond these two.
- The four findings VCST-5367 reviewed and consciously deferred, and its deliberate absence of
  unsaved-draft guards — both still stand.
