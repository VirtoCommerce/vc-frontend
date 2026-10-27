# S9 · Add a widget to a dashboard

**Your case:** a plugin adds a widget or a stat card to a storefront dashboard that keeps each user's arrangement:
the account dashboard, or a dashboard of the plugin's own.

**Before you start:**

1. The plugin pins a facade with the dashboard engine (`registerBlock`, `LayoutWidget`, `useLayout`,
   `LayoutSurface`): 0.2.6 or later, with `requiredHostVersion` to match (S4).
2. The platform serves the `layout` and `saveLayout` GraphQL operations (X-Frontend). Without them, a dashboard
   shows its defaults under a "The saved layout could not be loaded" alert, with no edit button.

## How a dashboard is put together

A dashboard is a **scope**. The registry keeps its blocks under that name, and the backend keeps one saved document
per user, scope and store. The document holds only order, hidden flags and settings; which blocks exist, and in which
region, is code.

| Region       | Holds                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| `statistics` | stat cards, in one row. A stat block has no component: the page feeds it |
| `mainLeft`   | widgets in the wide column                                               |
| `mainRight`  | widgets in the rail. The surface passes them no `title`                  |

The host has one dashboard: the account dashboard, scope `accountDashboard`. The Sales Rep Hub plugin keeps two of
its own, `salesRepDashboard` and `salesRepCustomerProfile`.

## Steps

1. **Write the widget.** 📁 `StorefrontApp`

   Wrap it in `<LayoutWidget>`. In edit mode, its header carries the drag handle, the hide button and, when the block
   declares one, the rows field (step 6). Without a `title`, it shows the block's `titleKey`, translated.

   ```vue
   <template>
     <LayoutWidget :title="title" size="md">
       <template #default-container>…</template>
     </LayoutWidget>
   </template>

   <script setup lang="ts">
   import { computed } from "vue";
   import { LayoutWidget, useBlockChrome } from "@vc-frontend/core";

   defineProps<{ title?: string }>();

   // `undefined` outside a dashboard, where the widget is a plain one.
   const chrome = useBlockChrome();
   const rowLimit = computed(() => chrome?.savedSettings.value.maxRows ?? 5);
   </script>
   ```

2. **Register the block.** 📁 `StorefrontApp`, in `init()`, synchronously

   ```ts
   import { defineAsyncComponent, markRaw } from "vue";
   import { registerBlock } from "@vc-frontend/core";

   // `markRaw` keeps Vue from making the component reactive when it lands in layout state.
   const AcmeDeliveries = markRaw(defineAsyncComponent(() => import("./components/acme-deliveries.vue")));

   export function init(): void {
     registerBlock("accountDashboard", {
       id: "acmeDeliveries",
       region: "mainLeft",
       titleKey: "acme.deliveries.title",
       order: 20,
       component: AcmeDeliveries,
       settings: [{ kind: "maxRows", default: 5, min: 1, max: 20 }],
     });
   }
   ```

   `init()` runs before the app mounts, so the dashboard's first render, its skeleton included, already knows the
   block.

3. **Pick the keys.** The backend stores the document under them and validates them:

   | Key      | Format                                                                          | Example            |
   | -------- | ------------------------------------------------------------------------------- | ------------------ |
   | scope    | a letter, then letters and digits; 64 at most                                   | `accountDashboard` |
   | block id | letters, digits, `-` and `_`; 64 at most; unique in its scope, ignoring case    | `acmeDeliveries`   |
   | store id | letters, digits, `-` and `_`; 128 at most; the store module already requires it | `B2B-store`        |

   On another module's dashboard, prefix the id with your module's name, without a dot (`acmeDeliveries` or
   `acme_deliveries`): two modules with one id on one dashboard collide in every saved document. Keys are permanent:
   renaming an id or a scope strands what users saved under the old one.

4. **Pick `order`.** Use steps of 10, so a later block can slot in between. `order` places the block for a user who
   never saved the dashboard. A user who did has an arrangement without it: the block goes to the end of its region,
   in `order` among the other new blocks, and stays where the user puts it after their next save.

5. **Register a conditional block only while its feature is on:** a setting, a permission, an optional module.

   ```ts
   if (isAcmeDeliveriesEnabled()) {
     registerBlock("accountDashboard", deliveriesBlock);
   }
   ```

   While the feature is off, the dashboard has no trace of the block. A layout saved meanwhile drops the block's
   position, hidden flag and settings, so when the feature comes back, the block returns at its defaults, at the end
   of its region. The Sales Rep plugin registers its tasks, documents and customer activity widgets this way
   (`StorefrontApp/src/index.ts` in `vc-module-sales-rep`).

6. **Declare settings, if the widget has any.** `settings` takes `{ kind: "maxRows", default, min, max }` (the rows
   field in the widget's header) and `{ kind: "ruleTabs" }` (the user unchecks the filter tabs they don't want;
   filter yours with `visibleTabRules`). Read both from `useBlockChrome()?.savedSettings`.

### A dashboard of the plugin's own

7. **Register its blocks under a scope of its own,** such as `acmeDashboard`, as in steps 2–6.

8. **Render it on the plugin's page.** 📁 `StorefrontApp`

   ```vue
   <template>
     <LayoutSurface :layout="layout" :cards="cards" />
   </template>

   <script setup lang="ts">
   import { LayoutSurface, useLayout } from "@vc-frontend/core";
   import { useAcmeStatCards } from "../composables/useAcmeStatCards";

   const layout = useLayout("acmeDashboard");
   const { cards } = useAcmeStatCards(layout);
   </script>
   ```

   `cards` are the stat cards; a dashboard without any passes `[]`. They come from a card table typed
   `IStatCardDefType`: its blocks from `statBlocks(table)`, its figures from `useStatDataNeeds(layout, table)` and
   `buildStatCards()`. The account dashboard is the smallest complete example (`shared/account/dashboard-blocks.ts`
   and `shared/account/composables/useAccountDashboard.ts`); the Sales Rep plugin is a larger one.

## ✅ Done when

- A user who never saved the dashboard sees the widget where `order` puts it.
- In edit mode it drags, hides into the tray and comes back; after Save and a reload it keeps its place.
- The console has no `registerBlock` warning.
- With the feature off, the dashboard still loads and saves.

## ⚠️ Watch out

1. **A key outside the formats** (a dot in the id, a dash in the scope): `registerBlock` skips the block with a
   console warning. Registered anyway, it would make the dashboard read as never saved and fail every save.
2. **Registering late**, in a promise callback rather than in `init()`: the block still joins, since the registry is
   reactive, but the first render and its skeleton go without it, so the page shifts when it arrives.
3. **`settings` is the draft; `savedSettings` is what to fetch with.** A query keyed on `settings` refires on every
   keystroke in the rows field, and fetches for a value the user may still cancel.

---

_Source-checked against VirtoCommerce/vc-frontend#2552 (facade 0.2.6) on 2026-10-27. The plugin's own dashboard is
what the Sales Rep Hub runs on (VirtoCommerce/vc-module-sales-rep#24). **Not walked:** a plugin adding a block to
`accountDashboard`._
