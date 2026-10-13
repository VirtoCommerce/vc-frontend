# S8 · Add a new extension point to the host

**Your case:** a plugin needs a place in the storefront it cannot reach today: a spot on a page, a hook into some
host behaviour, or something the host must know before the plugin loads.

## What plugins can extend today

| Kind                    | How a plugin uses it                                           | Known before the plugin loads? |
| ----------------------- | -------------------------------------------------------------- | ------------------------------ |
| Pages                   | `plugin.config.ts` `routes` + `addRoute()` in `init()`         | yes                            |
| Menus (header, account) | `plugin.config.ts` `menu`                                      | yes                            |
| Places in host pages    | `useExtensionRegistry().register()` / `registerContribution()` | yes, when declared as a slot   |
| Host-wide registries    | `registerLocaleLoader()`, `registerCacheTypePolicies()`        | no                             |

The places in host pages are the extension registry's categories: the header and menus, product card and page,
the payment steps, order details, the shared list. The full list is `ExtensionCategoryMapType` in
`shared/common/types/extensionRegistryMap.ts`.

## Pick the kind of change

```
 Does the facade already let the plugin do it? ── yes ──▶ no host change (S2)
        │ no
        ▼
 Is it a PLACE on a page? ───── yes ──▶ A. a new extension registry category or name
        │ no
        ▼
 Is it host BEHAVIOUR (a hook, a policy, a registry)? ── yes ──▶ B. a new register…() in the host
        │
        ▼
 Must the host know BEFORE the plugin code loads (hold space, wait, show a placeholder)?
                                 yes ──▶ C. a new declaration kind (heaviest)

 A, B and C each end with a facade release: S3.
```

## A. A new place on a page

📁 `vc-frontend`:

1. **Type it:** a new category in `ExtensionCategoryMapType` (`shared/common/types/extensionRegistryMap.ts`), with
   the props the host passes and, when entries are conditional, the `condition` parameter.
2. **Register it:** an empty entry for the category in `shared/common/constants/initialExtensionRegistry.ts`.
3. **Name it:** a fixed name goes in `CUSTOM_EXTENSION_NAMES` (`shared/common/constants/extensionPointsNames.ts`).
4. **Render it:** `<ExtensionPoint category="…" name="…">` in the host page, with the host's own markup as its
   default slot. Several entries: `<ExtensionPointList>`.

The category then becomes a slot id (`"<category>/<name>"`) that `plugin.config.ts` can declare, with no further
work. For data the host renders itself (a counter, a label), the category also declares a contributed shape; give
the host a fallback slot first. Details: [`extensionRegistry/README.md`](../../../shared/common/composables/extensionRegistry/README.md).

## B. A new hook into host behaviour

Add a `register…()` function to the host and export it from the facade (S3). Make it:

1. **Work when called late.** A plugin's `init()` often runs after the app has mounted, so apply the registration
   at once, not only at the next host event. `registerLocaleLoader` does not do this: a plugin loads its messages
   for the current locale itself.
2. **Safe to call twice:** keyed, so a second call replaces the first, as `registerLocaleLoader` does.
3. **Re-run when the host re-runs the thing.** `registerLocaleLoader`'s loaders run again on every locale switch.

## C. Something the host must know before the plugin loads

A new kind of declaration in `plugin.config.ts` touches the format that host and plugin builds share
(`contributions/types.ts`, `core-api/manifest.mjs`, `manifest-format.mjs`). A host refuses a format it does not
know. Plan it as its own change, with whoever owns the federation loader.

## Rules for any new extension point

1. **The host owns the place; the plugin only fills it.**
2. **The host works without the plugin:** a fallback, or simply nothing.
3. **The plugin gets typed data**, never a guess at the host's internals.
4. **There is a way to say "not here":** a `condition` or a `when`.
5. **Late registration works.** The plugin may arrive after the page has rendered.
6. **Adding is safe; renaming or removing is breaking**, for every plugin (S3).

## ✅ Done when

A plugin can use the new extension point through the released facade, and the host renders the same without it.

## ⚠️ Watch out

1. **A data contribution needs a host fallback slot first.** Otherwise the host renders nothing for it, without an
   error.
2. **Don't export a component from an `_internal/` folder** to make a place reachable. That freezes host markup; use
   a data contribution instead.
3. **`registerCacheTypePolicies` arrives late:** a policy on a **host** type does not apply to data already cached.
   Use it for the plugin's own types only.

---

_Walked on 2026-10-13 for A: a new category rendered in the footer, a plugin declaring and filling it through a
yalc-linked facade, and the host fallback without the plugin. **Not verified:** B and C._
