# ExtensionPoint system — quick reference

### Purpose  
1. Plug extra Vue components into fixed UI slots without touching core code.  
2. Add new extension points anywhere in the app quickly.

---

## Core pieces  

| Item | Description |
|------|-------------|
| **`useExtensionRegistry()`** | Global store + API |
| **`ExtensionPoint`** | Placeholder component  to render registered extension; renders default slot for each unregistered entry  |
| **`ExtensionPointMulti`** | Placeholder component to render multiple registered extensions; accepts optional `names` array; renders default slot for each unregistered entry |
| **`$canRenderExtensionPoint`** | Global helper that evaluates `condition` |

---

## Main Scenarios

### 1. Defining extension points in the core app

1. Extend the category map:
   - In `client-app/shared/common/types/extensionRegistryMap.ts`, add your new category key to `ExtensionCategoryMapType` with the appropriate `ExtensionEntryType<Props, Condition>`.
2. Initialize the registry placeholder:
   - In `client-app/shared/common/constants/initialExtensionRegistry.ts`, add an empty object for the new category.
3. Declare extension points in templates:
   - Insert `<ExtensionPoint>` or `<ExtensionPointMulti>` in your Vue components, specifying `category` and `name` (`names` for multi).
4. (Optional) Provide fallback slot content for unregistered names:
   ```vue
   <ExtensionPoint category="myCategory" name="myName">
     <div>Fallback content when no extension is registered</div>
   </ExtensionPoint>
   ```

### 2. Enriching the app from modules

1. Import and register your extension:
   ```ts
   import { useExtensionRegistry } from '@/shared/common/composables/useExtensionRegistry';
   const { register } = useExtensionRegistry();
   register('myCategory', 'myExtension', {
     component: MyComponent,
     props: { /* default props */ },
     condition: (param) => /* boolean condition */
   });
   ```
2. (Optional) Unregister on cleanup:
   ```ts
   import { onUnmounted } from 'vue';
   const { unregister } = useExtensionRegistry();
   onUnmounted(() => {
     unregister('myCategory', 'myExtension');
   });
   ```
3. Your registered components will then be automatically rendered at the corresponding extension points in the core app.


> [!TIP]
>
> **Dev tip:** In dev mode the registry is available as `window.VCExtensionRegistry`.

