# Sales Rep Hub — drag-and-drop saved layout (VCST-5367, FE)

**Jira:** [VCST-5367](https://virtocommerce.atlassian.net/browse/VCST-5367) — "[Sales Rep] Hub and customer profile. Drag and drop and save layout" (epic [VCST-5142](https://virtocommerce.atlassian.net/browse/VCST-5142) Sales Rep Hub).
**Branch:** `feat/VCST-5367-srh-layout-drag-and-drop` off `dev`.

## Goal

A Sales Rep can reorder and hide the blocks on their **Dashboard** and their **Customer profile**
pages, and that arrangement survives reload, a new session and another device. One layout per rep
per page — the customer-profile layout applies to *every* customer, not per-customer.

## At a glance (as built)

The sections below were written *before* implementation and a few names drifted (the registry landed
at `layout/registry.ts`, and the composable exposes `reorder` / `setHidden` rather than `moveBlock` /
`toggleHidden`). This section is the map of what actually shipped; read it first.

**The whole feature in one equation.** The registry owns *structure*, the saved document owns only
*arrangement*:

```
REGISTRY (code)                 SAVED DOC (backend)          RENDERED PAGE
which blocks exist          +   order within a region    =   the layout the rep sees
which region each lives in      hidden true/false
```

**Three fixed regions.** `mainLeft` and `mainRight` are not interchangeable — they hold widgets built
for their width — so cross-column drags are impossible by construction (distinct Sortable groups),
not by a runtime guard:

```
┌───────────────────────────────────────────────────┐
│ statistics   [KPI][KPI][KPI][KPI]   horizontal, whole card is the handle
├──────────────────────────────────┬────────────────┤
│ mainLeft  (wide content)         │ mainRight      │  both vertical,
│  [ Recent orders ]               │ [Quick actions]│  dragged by the
│                                  │ [Customer info]│  widget header
└──────────────────────────────────┴────────────────┘
   dashboard      = statistics + mainLeft  (no rail registered yet)
   customerProfile = all three
```

**Component tree.** `layout-region.vue` is the single reusable sortable list; everything else is
chrome around it:

```
pages/dashboard.vue  |  pages/customer-profile.vue
│   own useSalesRepLayout(scope) + useLayoutAnnouncer(scope)
├── LayoutSkeleton         while the query is in flight — see §"nothing block-shaped renders"
├── LayoutEditBar          Reset / Cancel / Save + the failed-save alert
├── LayoutStats            the KPI row
│   ├── LayoutRegion  visible zone  (drop-hidden=false)
│   └── LayoutRegion  hidden zone   (drop-hidden=true, v-if editing)
│         └── both share ONE Sortable group name → cards cross between them
├── LayoutRegion  mainLeft   ─┐ distinct group names →
├── LayoutRegion  mainRight  ─┘ a rail widget can never land in the wide column
├── LayoutHiddenTray       hidden *widgets* return via a button, not a drag
└── <p aria-live>          keyboard-sort announcements
```

Each item inside a region is wrapped in `layout-block.vue`, which overlays the edit chrome (drag
handle + ✕) on the widget's own header, because those headers belong to components the layout does
not own and cannot be slotted into from outside.

|                | Stat card                        | Widget                      |
| -------------- | -------------------------------- | --------------------------- |
| drag by        | the whole card (`dragWhole`)     | its header / handle button   |
| hide by        | dragging into the hidden zone    | ✕ button                     |
| restore by     | dragging back out (or ↑ grabbed) | button in `LayoutHiddenTray` |

**Data flow.**

```
LOAD    salesRepLayout(scope, storeId) ──null when never saved──┐
                        │                                       ▼
                        └──▶ reconcileLayout(saved, registry) ◀── registry defaults
                                        │
                                        ▼
                        state = { statistics: [{id,hidden}], mainLeft: […], mainRight: […] }

EDIT    startEdit()  draft = clone(persisted)          every change targets the DRAFT only
        drag / arrows / ✕ / tray  →  reorder() | setHidden()
        cancel() discards the draft      reset() refills it from registry defaults

SAVE    serializeLayout(draft) ─▶ saveSalesRepLayout   (FULL-DOCUMENT REPLACE: every region,
                                        │               every block, hidden ones included)
                                        ▼
                        mutation echoes the stored document → reconcile from it, no refetch
                        on failure: keep edit mode AND the draft, show the alert
```

Two asymmetries worth remembering: a failed **write** keeps the draft, whereas a failed **read**
disables editing entirely (§4) — because a full-replace save over a document we could not fetch is
how an arrangement gets destroyed.

## Decisions (confirmed with requester)

1. **Engine against existing blocks.** Build the layout mechanism over what the repo has today; the
   prototype's missing widgets (News, Tasks, Documents, Quick Actions, Top Sellers, Activity) are
   *not* built here. Future widgets plug into the registry for free.
2. **The KPI stat row participates — reorder *and* hide.** Three regions total.
3. **Explicit edit mode with Save / Cancel / Reset.** Changes go to a local draft; Save fires one
   mutation. Not autosave-per-drop.
4. **Keyboard: grab-and-move on the handle** (Space to grab, arrows to move, Space to drop, Escape
   to cancel) with `aria-live` announcements.
5. **DnD library: `sortablejs` via `useSortable`.**
6. **Customer profile is in scope** for this ticket.
7. **Per-block `settings` is out of scope** — v1 persists order + hidden only.
8. **Reset is in v1** — it needs no API.

## Verified facts (from the codebase and the live backend)

- **The API is live** on `https://vcptcore-dev.govirto.com/graphql/sales-rep` (introspected
  2026-07-27; `.env` already points there). The module's committed
  `client-app/modules/sales-rep/api/graphql/types.ts` predates it and contains zero `layout`
  references — that file is only as fresh as the last codegen run and must not be taken as evidence
  an operation doesn't exist.
- Live schema:
  ```graphql
  salesRepLayout(scope: String!, storeId: String): SalesRepLayout
  saveSalesRepLayout(command: InputSalesRepLayout!): SalesRepLayout

  SalesRepLayout        { schemaVersion: Int!, regions: [SalesRepLayoutRegion!]!, modifiedDate: DateTime }
  SalesRepLayoutRegion  { id: String!, blocks: [SalesRepLayoutBlock!]! }
  SalesRepLayoutBlock   { id: String!, type: String!, hidden: Boolean!, settings: [SalesRepLayoutSetting!]! }
  SalesRepLayoutSetting { key: String!, value: AnyValue }
  ```
  `settings` is a required list but an empty array is valid. `hidden` is required with no server
  default. `saveSalesRepLayout` returns the saved document, so no refetch after save.
  **`scope` and `region.id` are free-form `String`, not enums** — a typo silently creates a new
  empty layout document instead of erroring, which makes the constants file load-bearing.
- Saves are a **full-document replace**, not a merge (Kirill Iusupov, Jira comment 2026-07-25).
- **The repo is far behind the design prototype.** Dashboard = title + 4 mock stat cards +
  `SalesRepOrders` (one movable widget). Customer profile = hero + 4 mock stat cards +
  `SalesRepOrders` in main, `CustomerProfileActions` + `CustomerProfileInfo` in the aside.
- Stat cards already carry stable keys — `StatWidgetCardType.key` in `types/widgets.ts`
  (`orders_on_hold`, `active_projects`, …), deliberately shared by both pages.
- `components/stat-widgets.vue` is a fixed `grid-cols-1 / sm:2 / xl:4` grid.
- `useExtensionRegistry` exists (`category → name → { component, condition }`) and the module
  already registers into it, but entries carry no region, order or title, and its type map lives in
  `@/shared/common/types` — a host dependency `PORT_TO_MF.md` works to avoid.
- The module is MF-portable: every component uses `@apply` so it carries its own styles rather than
  relying on a global utility layer.
- `tailwind.config.ts` maps `--color-*` custom properties to Tailwind classes, and the prototype CSS
  is written against those same tokens — so the visual port is a syntax translation, not a redesign.
- Dark mode is **not** automatic: `_dark.scss` swaps palette shades (50↔950, 100↔900) while semantic
  variables keep light-mode shade numbers, and per-component files under `assets/styles/dark/` remap
  them.
- `yarn generate:graphql-types` (`scripts/graphql-codegen/generator.ts`) regenerates **every**
  module's `types.ts` against `APP_BACKEND_URL`, so its diff must be pruned to sales-rep only.

## Architecture

### 1. Block registry — module-local (`blocks/registry.ts`)

```ts
type SalesRepRegionType = "statistics" | "mainLeft" | "mainRight";

interface ISalesRepBlock {
  id: string;                  // stable; persisted as BOTH block.id and block.type
  region: SalesRepRegionType;  // fixed by the registry, never by the user
  titleKey: string;            // i18n — hidden-tray labels and a11y announcements
  order: number;               // default position within its region
  defaultHidden?: boolean;
  component: Component;        // async
}
```

Module-local rather than `useExtensionRegistry`, for the reasons in Verified facts. It exports
`registerBlock()` so future widgets — including ones from other modules — get the same plug-in seam
without coupling the layout engine to host types.

**`id === type`.** The backend separates an instance id from a type discriminator, which only
matters if a rep can hold two instances of the same block. They can't. Both fields get the same
string.

### 2. `reconcileLayout` — pure, the load path (`layout/document.ts`)

```ts
reconcileLayout(saved: SalesRepLayout | null, registry: ISalesRepBlock[]): LayoutState
```

- Persisted block whose `type` is not in the registry → **dropped** (widget removed from the app).
- Registry block absent from the saved document → **appended** to its registry region at its
  registry `order`, honouring `defaultHidden`.
- **Region always comes from the registry, never from the saved document.** We write `regions[]`
  because the schema requires that container, but on read we ignore which region a block was saved
  in. Since left/right are not user-changeable, region is code, not user data — so when a widget
  moves rail-to-main in a future release, existing saved layouts follow the code instead of pinning
  a stale position.
- Order within a region and the `hidden` flag are preserved. Blocks are deduped by type.

Net effect: the persisted document is only ever *order + hidden*.

### 3. `useSalesRepLayout(scope)` — state machine (`composables/useSalesRepLayout.ts`)

Loads via the query, reconciles, exposes `regions`, `hiddenBlocks`, `editing`, and
`startEdit / save / cancel / reset` plus `moveBlock(id, region, index)` and `toggleHidden(id)`.

- `startEdit` deep-copies current state into a draft; every mutation targets the draft.
- `save` serializes all three regions — including hidden blocks — into one
  `saveSalesRepLayout` call with `schemaVersion: 1` and `settings: []`, then reconciles from the
  mutation's return value.
- `reset` refills the draft from registry defaults (`reconcileLayout(null, registry)`); it is a
  draft-local operation and still requires Save to persist. No API involvement.
- `storeId` is passed, so layouts scope per store — a different store can ship a different block set.

### 4. Failure handling

- **Mutation fails:** stay in edit mode, surface the error, keep the draft. The rep's work is never
  silently discarded.
- **Query errors** (as distinct from returning `null`): render registry defaults but **disable Edit
  layout**. Saving is a full-document replace; offering to overwrite a document we failed to read is
  how a layout gets destroyed. `null` is the normal never-saved case and does *not* disable editing.

### 5. Drag and drop

`sortablejs` driven by `useSortable` from `@vueuse/integrations/useSortable`, initialised in
`onMounted` (SSR-unsafe otherwise). `@vueuse/integrations` is already a direct dependency and
declares `sortablejs: "^1"` as an optional peer, so only `sortablejs` is added.

- One sortable per region container, plus one for the stats hidden zone.
- **`mainLeft` and `mainRight` get different `group` names**, making cross-column drags impossible
  by construction rather than by the prototype's runtime guard.
- The two stats zones share a group, so visible↔hidden is a real drag.
- Widgets hide via a button and restore from the tray via a button — no drag into the widget tray.
  This is what the prototype does too, and it keeps the tray out of the DnD graph.
- `handle` targets the block's drag handle.

**`useSortable` does not cover cross-list drags.** It wires only `onUpdate`, which fires for a
reorder *within* one list; moving a card between the paired stat zones leaves vueuse with nothing.
Left alone, SortableJS's DOM edit survives while the backing arrays stay unchanged and Vue's next
patch fights it.

*As built:* `layout-region.vue` handles this in a single `onEnd` rather than the `onAdd`/`onRemove`
pair this section originally proposed — those fire on two different instances for one gesture and
double-applied the change. `onEnd` fires once, on the source, and early-returns when
`event.from === event.to` (that case is already `onUpdate`'s). Both handlers put SortableJS's DOM edit
back with `insertNodeAt` and let state drive the re-render. The dragged node is identified from
`data-block-id`, which avoids keeping a parallel element-to-id map.

### 6. Keyboard grab-and-move (`composables/useKeyboardSort.ts`)

One shared composable so every region behaves identically. The handle is a real `<button>`.

- **Space/Enter** grabs; **Space/Enter** drops; **Escape** cancels and restores; tab-out cancels.
- **Stats row is horizontal:** ←/→ reorder within the row, ↑/↓ move between visible and hidden.
  **Widget columns are vertical:** ↑/↓ reorder.
- An `aria-live="assertive"` region announces grab / move / drop / cancel with position
  ("Recent Orders grabbed, position 1 of 3"). Without the announcements the mechanism is unusable,
  so the strings are part of the feature and are localized into all 13 locale files.

### 7. Stat cards — the one real refactor

`dashboard-widgets.vue` and `customer-profile-widgets.vue` each owned a hardcoded
`cards: StatWidgetCardType[]` and rendered it through `stat-widgets.vue`'s fixed
`grid-cols-1 / sm:2 / xl:4` grid. Cards do **not** become per-card components — the layout decides
order and visibility, so the cards are data looked up by id.

As built: the arrays moved to `layout/stat-cards.ts` (`getStatCard(scope, key)`), the grid and the
drag behaviour moved into `layout-region.vue` (whose horizontal variant drives its xl column count
from the number of visible cards), and `layout-stats.vue` composes the visible and hidden zones.
All three of `dashboard-widgets.vue`, `customer-profile-widgets.vue` and `stat-widgets.vue` were
deleted — only the two pages referenced them. `stat-widget.vue` itself is untouched.

### 8. Visual treatment — ported from the design prototype

The prototype is authoritative for visuals and interaction feel, and is written against the real VC
tokens, so this is a translation into `@apply` + BEM, not a redesign.

| | treatment |
|---|---|
| Edit bar | `bg-primary-50` · `border-primary-200` · `text-primary-700` |
| Editable block | `outline: 1px dashed neutral-300`, `outline-offset: 2px` |
| Dragging | `opacity: .45` · `shadow 0 12px 28px -8px` · outline → `primary-500` |
| Drop zone | dashed `neutral-300` · `bg-neutral-50` · 12px padding |
| Hidden stats zone | `opacity: .7` · 45° stripes, `neutral-50`/`neutral-100` at 9px |
| Empty zone | centred muted text, 96px min-height |
| Handle / hide | `cursor: grab`, `secondary-500` / hover `danger-500` |
| Hidden tray | dashed box, uppercase label, pill restore buttons |
| Edit layout button | xs outline-primary, `adjustments` icon, bottom of the left column |

Three states the prototype could not specify, decided here:

- **The SortableJS placeholder.** The prototype fades the *source* element to `.45` because native
  HTML5 DnD gave it no placeholder — that opacity is a workaround, not a design. SortableJS adds
  `.sortable-ghost` (the gap), `.sortable-drag` (the floating clone) and `.sortable-chosen`. The
  ghost gets a dashed `primary-500` outline over `bg-primary-50` — the mock's own vocabulary applied
  to a state it never drew.
- **Dark mode — verified, no override needed.** The presets invert every token this feature uses:
  `neutral-50` #fafafa → #141415 and `neutral-100` #f5f5f5 → #2b2b2c (so the hatch keeps the same
  subtle step), `additional-50` #ffffff → #0a090b (cards do not glow white on the striped zone), and
  `primary-50`/`primary-700` swap ends so the edit bar stays legible. Confirmed by reading
  `assets/presets/default{,.dark}.json`, not by inspecting rendered pixels — worth one visual pass
  during QA.
- **The keyboard-grabbed state**, which the prototype has no concept of: reuse the dragging
  treatment plus a visible focus ring.

The prototype's `--dense` stat variant (≥5 cards) is **not** ported: with 4 cards it would never
render, so the flex basis rules in `layout-region.vue` cover every case on their own.

## Explicitly out of scope

Per-block `settings` (sent as `[]`) · new widgets · cross-column moves · per-customer layouts ·
the prototype's AI "add stat widget" flow · the prototype's `orderTabs` and max-rows controls, which
are content settings rather than layout.

## Testing

Following the module's existing `*.test.ts`-beside-source convention:

- `reconcileLayout` carries the heavy coverage: unknown type dropped, new registry block appended,
  `defaultHidden` honoured, region taken from registry and not from the document, order preserved,
  duplicates collapsed, `null` document produces defaults.
- `useSalesRepLayout` with a mocked API: `null` → defaults; save emits a complete document including
  hidden blocks; mutation failure keeps the draft and stays in edit mode; query error disables editing.
- `useKeyboardSort`: grab/move/drop/cancel transitions, the end-of-list clamps, blur-cancels, and
  the horizontal region's park/restore on ↑/↓.
- A test pinning the literal `scope` and region id strings, since the backend accepts any string and
  a typo would silently strand every saved layout.

## Notes for implementation

- `api/graphql/types.ts` must be regenerated, never hand-authored. Codegen needs
  `APP_BACKEND_URL=https://vcptcore-dev.govirto.com` and prunes to sales-rep only.
- New components must keep the module MF-portable: `@apply`, no reliance on a global utility layer.
- Vue props/emits use named `IProps` / `IEmits` interfaces, not inline generics.
