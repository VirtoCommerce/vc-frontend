# Sales Rep Hub — account left-rail widget (VCST-5469, FE — left-rail part)

**Jira:** [VCST-5469](https://virtocommerce.atlassian.net/browse/VCST-5469) — the left-rail reorganization part (the "show My customers" page shipped separately in PR #2380).
**Branch:** continue on `feat/VCST-5469-my-customers-page` (or a follow-up branch off it) → PR into `feat/VCST-5409-sales-rep-in-repo-module`.

## Goal

When the current user is a **Sales Rep**, the account left rail shows a new **"Sales Rep hub"** widget. For now it contains a single item — **My customers** — but it must be a real, extensible section (Dashboard / Orders / Lists / etc. added later).

## Decisions (confirmed with requester)

1. **Generic mechanism**, not a one-off: a reusable account-section registry any module can register into.
2. **Gate = `SalesRep.Enabled` (store setting) AND `sales-rep:access` (permission)** — both required.
3. **Desktop = priority-based positioning** (the hub slots into the rail by a numeric priority, interleaving with the built-in sections).
4. **Mobile = drill-down section** (consistent with the existing Purchasing/Corporate/… sections), rendered at the top.
5. Replace the **temporary Corporate "My customers" link** (added in PR #2380) with this widget. Keep the separate "Sales reps" contact-info link (VCST-5409 — a different feature).

## Verified facts (from the codebase)

- The storefront `me` query returns `permissions`; `useUser().checkPermissions(...)` checks them. A Sales Rep is defined by the **`sales-rep:access`** permission (backend module `VirtoCommerce.SalesRep`, granted via a role — global or per-org membership).
- Desktop rail = `client-app/shared/account/components/account-navigation.vue` (`max-md:hidden`), 4 hardcoded `VcWidget`s from `MenuType.header.desktop.{purchasing,marketing,corporate,user}`.
- Mobile account menu = `client-app/shared/layout/components/header/_internal/mobile-menu/menus/main-menu.vue`; sections are `MobileMenuLink`s that emit `selectItem`. The controller `mobile-menu.vue` keeps an opened-item stack and renders a selected item's `children` via `default-menu.vue` — **fully generic**: any `ExtendedMenuLinkType` with `children` drill-downs correctly, no submenu-machinery changes needed.
- Extension infra exists (`useExtensionRegistry`, `ExtensionPoint`) but is component-based and doesn't fit a priority-ordered, dual-rendered section — hence a small dedicated section registry instead.

## Architecture

### 1. Account-section registry (core — `client-app/core/composables/useNavigations.ts`)
- New type `AccountNavigationSectionType = { id: string; title: string; icon?: string; priority?: number; children: ExtendedMenuLinkType[]; isVisible?: ComputedRef<boolean> }` (in `client-app/core/types/menu.ts`).
- Global state (the composable is already a `createGlobalState`): `registeredAccountSections = ref<AccountNavigationSectionType[]>([])`.
- `registerAccountSection(section)` — pushes; ignores duplicate `id` (warn), mirroring `mergeMenuSchema`.
- Expose `registeredAccountSections` (readonly) from the composable.
- Visibility default: a section with no `isVisible` is always shown; otherwise it's shown when `isVisible.value` is true.

### 2. Desktop — `account-navigation.vue`
- Give the 4 built-in sections a `priority` in `client-app/config/menu.json` (`purchasing:10, marketing:20, corporate:30, user:40`), preserving current order.
- Build one unified list = the 4 built-ins (each with its existing visibility rule: marketing → has children; corporate → `isCorporateMember`; user → always, with the `addresses` child filtered when corporate) + `registeredAccountSections` (filtered by `isVisible`), **sorted by `priority` ascending**.
- Render each visible section as a `VcWidget` (title `$t(section.title)`), children via the existing `ExtensionPoint category="accountMenu"` + `LinkDefault` — unchanged per-link rendering.
- Net effect: hub with `priority < 10` leads the rail; `25` sits between marketing and corporate; etc.

### 3. Mobile — `main-menu.vue`
- Before the built-in section `<li>`s, `v-for` over `registeredAccountSections` filtered by `isVisible`, rendering a `MobileMenuLink` per section with `@select="$emit('selectItem', section)"`. The controller pushes it and `default-menu.vue` renders `section.children`. No changes to `mobile-menu.vue` / `default-menu.vue`.

### 4. Sales Rep Hub registration (module — `client-app/modules/sales-rep`)
- `index.ts` `init()`: after gating on `isSalesRepsEnabled()` (module already early-returns when the setting is off), register the section:
  ```ts
  registerAccountSection({
    id: "sales-rep-hub",
    title: "sales_rep.hub.title",
    icon: "users",
    priority: 5, // leads the rail
    children: [{
      id: MY_CUSTOMERS_NAV_LINK_ID,
      title: "sales_rep.my_customers.navigation.link",
      icon: "users",
      route: { name: MY_CUSTOMERS_ROUTE_NAME },
    }],
    isVisible: computed(() => isSalesRepsEnabled() && checkPermissions("sales-rep:access")),
  });
  ```
  `checkPermissions` from `useUser()`. (Because `init` already returns early when `SalesRep.Enabled` is off, `isVisible` effectively reduces to the permission check at runtime; keep both for clarity/robustness.)
- `menu.ts`: remove `myCustomersLink` from the Corporate `children` (keep `link` = "Sales reps"). Keep the route + all My-customers-page code from PR #2380 unchanged.
- Constants: `sales-rep-hub` id + priority as needed (reuse existing `MY_CUSTOMERS_*`).
- Locales: add `sales_rep.hub.title` ("Sales Rep hub") across all 13 files.

## Testing & verification

- **Runtime make-or-break:** confirm `sales-rep:access` appears in `me.permissions` for a rep — especially when granted via a *per-org membership* role, not a global role. Verify live in the rep session before finalizing; if per-org perms don't surface in `me.permissions`, the gate needs a different signal (flag to BE).
- Unit test the registry: `registerAccountSection` adds; duplicate `id` ignored; desktop unified list sorts by priority and honors `isVisible`.
- `yarn lint` + `vue-tsc --build --force` clean.
- Drive **both** desktop (widget in priority position, links work) and mobile (drill-down → My customers) in the rep session; confirm the widget is absent for a non-rep and when `SalesRep.Enabled` is off.

## Risks / follow-ups

- **Per-org permission surfacing** (above) is the main unknown.
- Desktop refactor touches a shared host component (`account-navigation.vue`) — keep built-in visibility rules identical to avoid regressions for ordinary buyers.
- Full unification (built-ins fully data-driven) is intentionally *not* done; built-ins keep their bespoke visibility, only gaining a `priority` for ordering.
