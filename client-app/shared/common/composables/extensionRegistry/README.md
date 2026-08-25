# ExtensionPoint system — quick reference

### Purpose

1. Plug extra Vue components into fixed UI slots without touching core code.
2. Add new extension points anywhere in the app quickly.

---

## Core pieces

| Item                           | Description                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`useExtensionRegistry()`**   | Global store + API                                                                                                                               |
| **`ExtensionPoint`**           | Placeholder component to render registered extension; renders default slot for each unregistered entry                                           |
| **`ExtensionPointList`**       | Placeholder component to render multiple registered extensions; accepts optional `names` array; renders default slot for each unregistered entry |
| **`$canRenderExtensionPoint`** | Global helper that evaluates `condition`                                                                                                         |

---

## Main Scenarios

### 1. Defining extension points in the core app

1. Extend the category map:
   - In `client-app/shared/common/types/extensionRegistryMap.ts`, add your new category key to `ExtensionCategoryMapType` with the appropriate `ExtensionEntryType<Props, Condition>`.
2. Initialize the registry placeholder:
   - In `client-app/shared/common/constants/initialExtensionRegistry.ts`, add an empty object for the new category.
3. Update `EXTENSION_NAMES` (for static extension identifiers):
   - In `client-app/shared/common/constants/extensionPointsNames.ts`, add entries under your category for each extension name:
     ```ts
     export const EXTENSION_NAMES = merge({}, INITIAL_EXTENSION_NAMES, {
       myCategory: {
         myExtension: "my-extension",
       },
     });
     ```
4. Declare extension points in templates:
   - Insert `<ExtensionPoint>` or `<ExtensionPointList>` in your Vue components, specifying `category` and `name` (`names` for multi).
5. (Optional) Provide fallback slot content for unregistered names:
   ```vue
   <ExtensionPoint category="myCategory" name="myName">
     <div>Fallback content when no extension is registered</div>
   </ExtensionPoint>
   ```

### 2. Enriching the app from modules

1. Import and register your extension:
   ```ts
   import { useExtensionRegistry } from "@/shared/common/composables/useExtensionRegistry";
   import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
   const { register } = useExtensionRegistry();
   register("productCard", EXTENSION_NAMES.productCard.cardButton, { component: MyComponent });
   ```
2. (Optional) Unregister on cleanup:
   ```ts
   import { onUnmounted } from "vue";
   const { unregister } = useExtensionRegistry();
   onUnmounted(() => {
     unregister("myCategory", "myExtension");
   });
   ```
3. Your registered components will then be automatically rendered at the corresponding extension points in the core app.

### 3. Contributing data instead of markup

Some extension points are host chrome: the host wants to keep its own markup and take only a value
from you (the mobile menu's "My customers" link takes a count badge). Register a `use()` instead of
a component:

```ts
// The id belongs to the plugin, so the plugin owns the constant — as `sales-rep` does with
// MY_CUSTOMERS_NAV_LINK_ID, which it also reuses for its `accountMenu` entry and its menu link.
// `EXTENSION_NAMES` carries the HOST's own ids; asking it for a name it does not declare is a
// compile error, not an `undefined` you find out about when the badge never appears.
const { registerContribution } = useExtensionRegistry();
registerContribution("mobileMenu", MY_COUNT_ID, { use: useMyCount });
```

The rules, because they are not obvious:

- **Only categories that declare a contributed shape accept one.** A category declares it as the
  second parameter of `ExtensionEntryType<Props, Contributed, Condition>` in
  `extensionRegistryMap.ts`, and it may only do so once its host consumer renders a **scoped**
  fallback slot (`<template #default="{ extensionProps }">`). Without that slot nothing reads the
  contribution — which is why `registerContribution()` refuses every other category.
- **`use()` runs in the extension point's setup**, inside a scope stopped when the entry unmounts
  or its name changes, so it may start a query. Keep it synchronous, and do not let it throw:
  wrap global state in `createSharedComposable` and catch inside, or a failed first call leaves
  every later surface reading `undefined`.
- **A late registration still gets a component context.** If the entry lands after the point
  mounted (an asynchronously loaded plugin), the invalidated computed mounts a fresh
  `ExtensionContribution`, so `use()` runs in a real setup: `inject()` resolves, and an
  injection-dependent composable — which is every Apollo one, i.e. the whole reason `use()` is a
  function — works there. `extension-point-late-registration.test.ts` pins it.
- **`$canRenderExtensionPoint` is false for a contribution** (it answers "has a component"). Never
  gate a decorate-capable point on it.

> **Recommendation**
>
> For consistent extension identifiers and to avoid typos, import the `EXTENSION_NAMES` constant from `@/shared/common/constants/extensionPointsNames.ts` and use its properties:
>
> ```ts
> import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
> const { register } = useExtensionRegistry();
> register("productCard", EXTENSION_NAMES.productCard.cardButton, { component: MyComponent });
> ```

> [!TIP]
>
> **Dev tip:** In dev mode the registry is available as `window.VCExtensionRegistry`, and the
> ownership of Apollo type policies registered through `registerCacheTypePolicies` as
> `window.modulesCacheDebug`.
