# ExtensionPoint system — quick reference

### Purpose  
1. Plug extra Vue components into fixed UI slots without touching core code.  
2. Add new extension points anywhere in the app quickly.

---

## Core pieces  

| Item | Description |
|------|-------------|
| **`useExtensionRegistry()`** | Global store + API |
| **`ExtensionPoint`** | Placeholder component |
| **`$canRenderExtensionPoint`** | Global helper that evaluates `condition` |

---

## Register a component
```ts
import { useExtensionRegistry } from '@/shared/common/composables/useExtensionRegistry';
const { register } = useExtensionRegistry();

register('productCard', 'card-button', {
  component: BackInStockButton,
  condition: (product) => !product.availabilityData.isInStock, // optional render condition
  props: { isTextShown: true }, // default props (optional)
});
```

## Use in a template
```vue
<ExtensionPoint
  v-if="$canRenderExtensionPoint('productCard', 'card-button', product)"  <!-- optional -->
  category="productCard"
  name="card-button"
  :product="product"
/>
```
*Skip the `v-if` if you want the entry to render unconditionally.*

## Registry API (common subset)

| Method | Action |
|--------|--------|
| `register(cat, name, entry)` | Add a slot component |
| `unregister(cat, name)` | Remove it |
| `getComponent(cat, name)` | Get the Vue component |
| `getProps(cat, name)` | Get default props |
| `canRender(cat, name, param)` | Run `condition`; return `boolean` |

---

### Add a **new** category

1. **Extend the map**  
   *File:* `client-app/shared/common/types/extensionRegistryMap.ts`
   ```ts
   export type ExtensionCategoryMapType = {
     // existing…
     mySidebar: ExtensionEntryType<{ item: SidebarLink }>;
   };
   ```
   - **Type structure:** `ExtensionEntryType<Props, Condition>`  
      - `Props` — object with props injected into every registered component (`{ item: SidebarLink }` means each component receives a prop named `item` of type `SidebarLink`).  
      - `Condition` *(optional)* — `(param) => boolean` predicate checked by `$canRenderExtensionPoint`.

2. **Add an empty object placeholder**  
   *File:* `client-app/shared/common/constants/initialExtensionRegistry.ts`
   ```ts
   export const initialExtensionRegistry: ExtensionRegistryStateType = {
     // existing…
     mySidebar: {},
   };
   ```

3. **Register components**  
   ```ts
   register('mySidebar', 'help', { component: HelpLink });
   ```

4. **Render**  
   ```vue
   <ExtensionPoint
     v-if="$canRenderExtensionPoint('mySidebar', 'help')"
     category="mySidebar"
     name="help"
   />
   ```

**Dev tip:** In dev mode the registry is available as `window.VCExtensionRegistry`.