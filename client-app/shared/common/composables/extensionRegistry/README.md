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
| **`ExtensionPointMulti`** | Placeholder component to render multiple registered extensions; accepts optional `names` array; renders default slot for each unregistered entry |
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

## Use `ExtensionPoint` in a template

### Props
- `category` (ExtensionCategoryType): Category key whose extension will be rendered.
- `name?` (string): Name of the extension entry to render.

### Render a registered extension
```vue
<ExtensionPoint
  category="productCard"
  name="card-button"
  :product="product"
/> 
```

### Conditional rendering
To render only when the extension is registered and meets its condition, use `$canRenderExtensionPoint`:
```vue
<ExtensionPoint
  v-if="$canRenderExtensionPoint('productCard', 'card-button', product)"
  category="productCard"
  name="card-button"
  :product="product"
/> 
```

### Fallback for unregistered entries
Provide default slot content to render when the named extension is not registered:
```vue
<ExtensionPoint
  category="productCard"
  name="card-button"
>
  <div>Fallback content when no extension is registered</div>
</ExtensionPoint>
```

## Use `ExtensionPointMulti` in a template

### Props
- `category` (ExtensionCategoryType): Category key whose extensions will be rendered.
- `names?` (string[]): Optional array of extension names to render; if omitted, all registered entries in the category are rendered.

### Render registered extensions
```vue
<ExtensionPointMulti
  category="productCard"
  :names="['card-button', 'badge']"
/>  
```

### Fallback for unregistered entries
To display fallback content when a specified extension name is not registered, provide a default slot. This slot will render once for each unregistered name.
```vue
<ExtensionPointMulti
  category="productCard"
  :names="['card-button', 'badge']"
>
  <!-- renders for each unregistered name -->
  <div>No extension available</div>
</ExtensionPointMulti>
```

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
