# Sales Rep — "My Customers" page (VCST-5469, FE)

**Jira:** [VCST-5469](https://virtocommerce.atlassian.net/browse/VCST-5469) — *[FE] [Sales Rep] Reorganize left rail and show My customers information*
**Blocking BE:** [VCST-5304](https://virtocommerce.atlassian.net/browse/VCST-5304) (schema/query owner: Kirill Iusupov)
**Base branch:** `feat/VCST-5409-sales-rep-in-repo-module`
**Target of PR:** `feat/VCST-5409-sales-rep-in-repo-module` (not `dev`)

> **Status update (superseded in part):** this doc captures the *first* slice of VCST-5469 — the
> My customers page — when the left-rail reorganization was still a separate, later task. That
> follow-up was subsequently designed and **shipped on this same branch**
> (see [`2026-07-13-sales-rep-hub-left-rail-design.md`](./2026-07-13-sales-rep-hub-left-rail-design.md)).
> As a result, two statements below no longer match the shipped code: the "Sales Rep Hub" is **no
> longer out of scope** (it is implemented via `registerAccountSection` in `index.ts`), and the
> **temporary Corporate "My customers" link was never left in place** — the hub widget is the entry
> point, and `menu.ts` keeps only the separate "Sales reps" contact-info link. Inline notes below
> mark the affected spots.

## Scope

Implement **only the "show My customers information" part** of VCST-5469, inside the
existing in-repo `client-app/modules/sales-rep` module. The **left-rail reorganization**
(the standalone "Sales Rep Hub" widget with Dashboard / My customers / All orders / Lists
items) is explicitly **out of scope** — a separate task.

### Out of scope (do NOT build)
- ~~The "Sales Rep Hub" left-rail widget and its Dashboard / Orders / Lists menu items.~~
  **Superseded:** the hub widget (single "My customers" item) was designed and shipped on this
  branch — see the left-rail design spec. The Dashboard / Orders / Lists items remain future work.
- The customer profile / sales-data page (separate stories VCST-5308 / VCST-5309, in progress).
- Rich mockup fields with **no backend support**: tier tabs (All/Diamond/Platinum/Gold/At risk),
  YTD purchases, LYTD, region/account-id/account-type subtitles, per-row action icons.

## Backend contract (confirmed on VCST-5304)

Query `salesRepCustomers` returns the customer organizations the current sales rep is
responsible for (locked memberships excluded, resolved from caller claims). Available fields:

```graphql
query SalesRepCustomers($storeId: String, $first: Int, $after: String, $keyword: String, $sort: String) {
  salesRepCustomers(storeId: $storeId, first: $first, after: $after, keyword: $keyword, sort: $sort) {
    totalCount
    items {
      organizationId
      organizationName
      lastOrder { id number createdDate }   # lastOrder may be null; also exposes status/total/currency (unused here)
    }
  }
}
```

The full `SalesRepCustomer` / `SalesRepOrder` schema types are **already committed** to
`client-app/modules/sales-rep/api/graphql/types.ts` (synced in commit `344958ff2` on the base
branch). Only the **operation** (`SalesRepCustomersQuery` + `SalesRepCustomersDocument`) is missing.

## Decisions (confirmed with requester)

1. **Columns:** *Name + Last order* only — exactly the story text. No total column.
2. **Order link:** the last order number is a link to the existing `OrderDetails` route
   (`{ name: "OrderDetails", params: { orderId: lastOrder.id } }`). **Confirmed BE gap:** the
   sales-rep schema Query root exposes only `customerSalesReps`, `salesRepCustomer(id)`,
   `salesRepCustomers`, and `salesRepOrders(customerId)` (a *list*) — there is **no singular
   rep order-detail query**, and `OrderDetails` runs the customer-facing, current-user-scoped
   `order` query, so a rep opening another org's order will likely **403**. Requester's call:
   **keep the link anyway** (matches the story literally); flag the 403/BE dependency in the PR.
   The link **opens in a new tab** (`target="_blank" rel="noopener noreferrer"`) so a rep doesn't
   lose the customer list when inspecting an order.
3. **Entry point:** register the route **and** add a *temporary* Corporate menu link so the page
   is reachable/testable; to be superseded by the Sales Rep Hub widget in the left-rail task.
   **Superseded by shipped code:** the hub widget landed on the same branch, so the temporary
   Corporate link was replaced (not left behind). Final state: the page is reached via the "Sales
   Rep hub" section registered in `index.ts`; `menu.ts` keeps only the "Sales reps" contact-info
   link (`sales_rep.navigation.link`). See §4 and the left-rail design spec.

## Approach

Mirror the existing `customerSalesReps` slice of the `sales-rep` module 1:1
(query → composable → page → route → menu). It is the established, reviewed pattern in this
same module, so "My Customers" sits beside "Sales Reps" with no new architecture.

*Rejected:* a shared generic table composable (premature abstraction for two tables);
placing the page in `core/pages` (violates the keep-it-in-the-module instruction).

## Components

### 1. Data layer
- **New file** `api/graphql/queries/salesRepCustomers/salesRepCustomersQuery.graphql` — the query above.
- **Regenerate** `api/graphql/types.ts` via `yarn generate:graphql-types` when the sales-rep
  backend (`APP_BACKEND_URL/graphql/sales-rep`) is reachable. If it is not, hand-author
  `SalesRepCustomersQuery` + `SalesRepCustomersDocument` mirroring the committed
  `CustomerSalesReps*` output, then verify with `vue-tsc --build --force`.

### 2. Composable — `composables/useSalesRepCustomers.ts` (+ `.test.ts`)
Near-copy of `useSalesReps.ts`:
- Store-scoped (`globals.storeId`), offset cursor (`after = String((page-1)*PAGE_SIZE)`), `PAGE_SIZE = 10`.
- Applied `keyword` (committed on enter/click, not live), `sort` = `name:asc|desc`.
- `keepPreviousResult: true`; on error → `Logger.error`, keep page functional (no toasts).
- Page-clamp watcher (clamp `page` down when `pages` shrinks).
- Maps to view-model `SalesRepCustomerType`:
  `{ organizationId: string; organizationName: string; lastOrder?: { id: string; number: string; createdDate: string } }`.
- Returns `{ loading, keyword, sort, page, pages, items }`.

### 3. Page — `pages/my-customers.vue`
Structured like `sales-reps.vue`: `<h1>` title, search row (`VcInput` + search `VcButton`,
apply on Enter/click, clearable/reset), `VcEmptyView` (distinguishes empty vs no-results with
reset), `VcWidget` + `VcTable` with `mobile-breakpoint="lg"`, pagination + smooth-scroll on page change.

Columns:
- **Customer** — `organizationName` as plain text (profile click-through is VCST-5308/5309).
  **Sortable — Name only.** The backend sort is member-field-backed and only Name maps to a sortable
  field (mirrors the Company members / Sales reps tables, where the same was verified against
  `vcptcore-dev`); Last order is not a sort key.
- **Last order** — formatted `createdDate` + a link showing `#{number}` →
  `{ name: "OrderDetails", params: { orderId: lastOrder.id } }`. Renders `—` when `lastOrder` is null.
  Date formatting via the app's existing date helper/`$d` (match how order dates are rendered elsewhere).

Mobile item mirrors the desktop content stacked, like `sales-reps.vue`.

**Styling constraint (MF-remote readiness):** page SCSS uses `@apply` rather than global utility
classes so the module stays self-contained if later extracted as a Module Federation remote (no
dependency on the host's global utility layer). See `client-app/modules/sales-rep/PORT_TO_MF.md`.
This is why the pages carry local `@apply`-based styles instead of inline Tailwind utilities.

### 4. Wiring
- `constants.ts`: `MY_CUSTOMERS_ROUTE_NAME = "SalesRepMyCustomers"`,
  `MY_CUSTOMERS_ROUTE_SEGMENT = "my-customers"`, `MY_CUSTOMERS_NAV_LINK_ID`, nav priority.
- `routes.ts`: `myCustomersRoute` (relative path → mounts under `Company` → `/company/my-customers`).
- `menu.ts`: ~~add a **temporary** Corporate link (title `sales_rep.my_customers.navigation.link`,
  icon e.g. `users`), commented as a placeholder for the future Sales Rep Hub widget.~~
  **Superseded:** no My-customers link lives in `menu.ts`. The page is reached via the "Sales Rep
  hub" section (`registerAccountSection` in `index.ts`); `menu.ts` holds only the "Sales reps"
  contact-info link. See the left-rail design spec.
- `index.ts`: `router.addRoute("Company", myCustomersRoute)` alongside the existing route.
  **As shipped:** `index.ts` also registers the hub section and registers custom badge-bearing link
  components (see the left-rail spec's count-badge note); the "Sales reps" contact link is still
  merged via `mergeMenuSchema(salesRepMenuSchema)`.

### 5. Types & locales
- `types/index.ts`: add `SalesRepCustomerType`, `SalesRepCustomerSortColumnType` (`"name"`),
  `SalesRepCustomerSortType`.
- `locales/en.json`: add `sales_rep.my_customers.*` — `page.title`, `table.search_placeholder`,
  `table.search_aria`, `table.customer`, `table.last_order`, `table.empty`, `table.no_results`,
  `table.reset_search`, `navigation.link`. Mirror the keys across the other 12 locale files with
  English fallback values (key-parity), matching how the Sales Reps feature was landed.

## Testing & verification
- Unit test `useSalesRepCustomers.test.ts`: variable shaping (store/cursor/keyword/sort),
  result→view-model mapping (incl. null `lastOrder`), page-clamp on shrink — mirroring `useSalesReps.test.ts`.
- `yarn lint` clean; `vue-tsc --build --force` clean.
- Drive the page in the running app (search, sort, paginate, order-link navigation) before opening the PR.

## Risks / follow-ups
- **Order link permissions:** confirmed there is no rep-scoped order-detail query; `OrderDetails`
  is current-user-scoped and a rep will likely 403 opening a customer's order. Link kept per the
  requester's decision — call out the 403/BE dependency in the PR as a known follow-up.
- **Codegen offline:** if backend unreachable, generated types are hand-authored; guard with `vue-tsc`.
