# Declarations reference (`plugin.config.ts`)

**For:** plugin authors writing `plugin.config.ts`. Why declarations exist and what they buy:
[the guide, section 4](./README.md#4-declare-then-implement).

> **TL;DR**
>
> - `plugin.config.ts` tells the storefront what a plugin adds **before its code loads**.
> - The build writes it into `plugin.json` as `contributions`; the platform serves it with the plugin list.
> - It **announces**, it does not register: `init()` still adds every route and component itself. Menu entries are
>   the exception: a declared one stays once the plugin loads, so `init()` adds one only to change it.

_Source-checked against `dev` @ `4b7a22d23` plus the plugin tooling (VCST-6320), facade 0.2.3,
on 2026-10-14. Section 5 was walked on 2026-10-13: each build and `type-check` error named there was
reproduced, and so were the console lines of a plugin skipped at runtime._

## 1. Example

```ts
// plugin.config.ts
import { definePluginManifest, settingEnabled, userCan } from "@vc-frontend/core/manifest";

export default definePluginManifest({
  when: settingEnabled("VirtoCommerce.SalesRep", "SalesRep.Enabled"),
  routes: [{ path: "documents", parent: "Company", name: "SalesRepDocuments", when: userCan("sales-rep-documents:read") }],
  menu: [
    {
      surface: "header",
      group: "corporate",
      id: "sales-rep-documents",
      title: "sales_rep.navigation.documents",
      routeName: "SalesRepDocuments",
    },
  ],
  slots: [{ at: "sharedList/provenance-note", policy: "reserve", when: (field) => field("scope").eq("Customer") }],
});
```

The build turns it into plain JSON:

```json
{
  "format": 1,
  "when": { "setting": "SalesRep.Enabled", "module": "VirtoCommerce.SalesRep" },
  "routes": [{ "path": "documents", "name": "SalesRepDocuments", "parent": "Company", "when": { "can": "sales-rep-documents:read" } }],
  "menu": [{ "surface": "header", "group": "corporate", "id": "sales-rep-documents", "title": "sales_rep.navigation.documents", "routeName": "SalesRepDocuments" }],
  "slots": [{ "at": "sharedList/provenance-note", "policy": "reserve", "when": { "field": "scope", "eq": "Customer" } }]
}
```

Every field is optional. `definePluginManifest({})` declares nothing.

## 2. Entries

| Entry        | What the storefront does with it                                     | Notes                                                                                                                      |
| ------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `when`       | false ⇒ the plugin is skipped: nothing of it is fetched              | Global conditions only                                                                                                     |
| `blocksBoot` | the first render waits for this plugin's `init()`                    | Off by default. Every page pays the wait                                                                                   |
| `routes[]`   | a placeholder route under `parent`, until `init()` adds the real one | `parent` is a host route name; none = a root route, and its `path` starts with `/`                                         |
| `menu[]`     | a menu entry, shown before the code loads                            | `surface: "header"` takes a `group` (`main`, `purchasing`, `marketing`, `user`, `corporate`); `"account"` takes `children` |
| `slots[]`    | holds the place in a host page while the plugin loads                | `at` is `"<category>/<name>"`; `policy` below                                                                              |

**Slot policies:**

| `policy`  | While the plugin loads                                    | Use for                                           |
| --------- | --------------------------------------------------------- | ------------------------------------------------- |
| `reserve` | holds the slot's box; reveals your component once settled | a component that must not make the page jump      |
| `block`   | holds a whole region, with a loader                       | a region that must not show without you (payment) |
| `none`    | holds nothing                                             | data you contribute to host markup                |

Not declarable, because nothing about them shows before the code runs: locales, Apollo cache policies, wishlist
sharing scopes, anything the plugin keeps to itself.

## 3. Conditions

| Builder                           | True when                                           | Where                    |
| --------------------------------- | --------------------------------------------------- | ------------------------ |
| `settingEnabled(module, key)`     | the store module's setting `key` is `true`          | anywhere                 |
| `settingValue(module, key).eq(v)` | that setting equals `v`                             | anywhere                 |
| `themeSetting(key)` / `.eq(v)`    | the `settings_data.json` key is `true` / equals `v` | anywhere                 |
| `authenticated()`                 | the user is signed in                               | anywhere                 |
| `userCan(p, …)`                   | the user holds every permission listed              | anywhere                 |
| `field(path)` / `.eq(v)`          | `path` in the slot's data is truthy / equals `v`    | **slots only**           |
| `and(…)`, `or(…)`, `not(c)`       | as named                                            | wherever their parts are |

1. **Global conditions are read once, at startup**, after the user is known. Signing in or out reloads the page, so
   they follow; a role or setting changed while the tab stays open applies on the next page load.
2. **Slot conditions are read on every render, per item**: true for one product card, false for the next. So they
   never stop a download. They only hold the place while the plugin loads; after that, the `condition` the
   component was registered with decides where it shows. Give both the same rule.
3. **`field` is the argument of a slot's `when` callback**, typed against that slot's data. A path that does not
   exist, or `field` outside a slot, does not compile.
4. **These are loading rules, not security.** Settings are public and so is the plugin's code; the backend
   authorizes every query.

**What `field` sees, per slot:**

| Slots                                                                                  | Data                            |
| -------------------------------------------------------------------------------------- | ------------------------------- |
| `productCard/*`, `productPage/*`                                                       | the `Product`                   |
| `paymentPage/*`, `orderPaymentPage/*`                                                  | `{ order, paymentTypeName }`    |
| `cartPayment/*`                                                                        | `{ paymentTypeName }`           |
| `orderDetails/*`                                                                       | the `CustomerOrderType`         |
| `sharedList/*`                                                                         | the list's `SharingSettingType` |
| `headerMenu/*`, `mobileMenu/*`, `accountMenu/*`, `mobileHeader/*`, `topHeaderStatus/*` | nothing: global conditions only |

Paths go four levels deep and do not enter arrays. The exact types: `SlotContextMapType` in the contract.

## 4. Rules

1. **Add a declared route in `init()` before the first `await`.** Only then can the storefront tell the call is
   yours; a later one is refused.
2. **Write host names as text** (`parent: "Company"`, `at: "sharedList/provenance-note"`). `plugin.config.ts` runs
   in node during your build, where `@vc-frontend/core` has no runtime: importing `ROUTES` from it fails the build.
   The names are still type-checked against the host's, so a host rename fails your `type-check`.
3. **Give menu ids a plugin-specific name.** An id the menu already has is refused.
4. **A declared title is a locale key**, shown with `t(key)` before your locales load. Until they do, it shows
   the raw key.
5. **A permission check in a route's `beforeEnter` belongs in its `when` too**, so no placeholder exists for a user
   who cannot pass it.

## 5. When a declaration is wrong

1. **Your build catches most of it.** `yarn type-check`: an unknown parent route, slot, menu group or field path.
   `yarn build`: a name declared twice, a root route whose `path` lacks a leading `/`.
2. **What still reaches the storefront broken costs that plugin alone.** It is skipped, everything it declared is
   withdrawn, and the reason is in `usePluginsStatus()`.

```ts
import { usePluginsStatus } from "@vc-frontend/core";

const { plugins } = usePluginsStatus();
// [{ name: "sales-rep", state: "skipped", reason: "its declared `when` is false (…)" }]
```

3. **An entry this storefront cannot place costs that entry alone**: a route whose `parent` does not exist here or
   whose name is taken, a menu link to a route that does not exist, a slot another plugin holds. The console warns
   `[MF] "<plugin>" declares … - skipped`, and the plugin still loads, so `usePluginsStatus()` shows it `loaded`
   ([S7](./scenarios/s7-missing-or-broken.md)).

## 6. Locally

A plugin loaded through `APP_MODULES_FEDERATION_REMOTES` is read the same way, from the `plugin.json` beside its
`mf-manifest.json`. `yarn build` writes that file; `yarn dev` does not, so with `yarn dev` the storefront sees no
declarations.
