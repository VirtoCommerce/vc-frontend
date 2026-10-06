# DOM Analytics

Sends analytics events described by markup instead of `analytics(...)` calls in component code. An element gets a role in `data-name`, a rule maps the role to an event, and one document-level listener calls `useAnalytics().analytics(...)` when the rule matches.

It is one more producer on the `useAnalytics` bus, registered by `domAnalyticsPlugin`. Trackers (Google Analytics or your own, see [useAnalytics](../../composables/useAnalytics/README.md#creating-an-analytics-provider-module)) receive the same events as from manual calls and cannot tell them apart.

## When to use markup and when to call `analytics()`

| Use markup | Call `analytics()` |
| --- | --- |
| The event is "a list was shown" or "a product was clicked" | The event is confirmed by a server response: add to cart, login, checkout, purchase |
| All data is on the element or in the object bound to it | The data lives in state: previous quantity, selected cart lines |
| Content is rendered outside our components (Builder.io HTML, custom themes) | The action starts from code (barcode scan) |

**An element is tracked one way, never both.** A block with markup roles and a manual call sends the event twice.

## Events tracked out of the box

Rules are in [rules.ts](./rules.ts).

| Event | Trigger | Markup |
| --- | --- | --- |
| `selectItem` | click on `product-link` | inside a `product-card`, inside a `product-list` |
| `viewItemList` | `product-list` appears | items are collected from its `product-card` descendants |
| `viewItem` | `product-details` appears | the product is bound with `v-track-item` |

`selectItem` and `viewItemList` need a `product-list` container with at least one list attribute (`data-list-id`, `data-list-name`, `data-related-id`, `data-related-type`). A card outside a list sends nothing, so a list that calls `analytics()` itself simply has no container.

## Tracking a product block

`ProductCard`, `ProductCardRelated`, `ProductCardRecommended` and `ProductCardRecentlyBrowsed` already carry the `product-card` / `product-link` roles and bind the product with `v-track-item`. A block only wraps them in a list container:

```vue
<div
  data-name="product-list"
  data-list-id="recommended_products"
  :data-list-name="title"
  :data-related-id="productId"
  data-related-type="product"
>
  <ProductCard v-for="product in products" :key="product.id" :product="product" />
</div>
```

The container attributes become the list parameters: `item_list_id`, `item_list_name`, `related_id`, `related_type`.

A card built from ui-kit atoms gets the roles by hand (see `favorite-products.vue`):

```vue
<VcProductCard v-for="item in products" :key="item.id" v-track-item="item" data-name="product-card">
  <VcProductTitle data-name="product-link" :to="routes[item.id]" :title="item.name" />
</VcProductCard>
```

## Markup without a Vue object (Builder.io HTML, custom themes)

`v-track-item` exists only in our templates. Plain HTML describes the product with attributes, and the rule falls back to them when no object is bound:

```html
<div data-name="product-list" data-list-id="spring_sale" data-list-name="Spring sale">
  <div data-name="product-card" data-product-id="123" data-product-sku="ABC-123" data-product-name="Dell XPS 13" data-product-price="999">
    <a data-name="product-link" href="/product/abc-123">Dell XPS 13</a>
  </div>
</div>
```

`data-product-price` fills both `price.actual.amount` and `price.list.amount`. The event carries only these fields. Brand, categories and discount are missing because there is no full product object.

## Adding a rule

A rule is plain data:

```ts
{
  event: "selectItem",        // key of the analytics event map
  trigger: "click",           // "click" | "appear"
  target: "product-link",     // data-name of the element the trigger fires on
  args: [                     // positional arguments of analytics(event, ...args)
    { source: "item", from: "product-card" },
    { source: "object", from: "product-list", fields: { item_list_id: { attr: "listId" } } },
  ],
}
```

Argument sources:

- `item`: the object bound with `v-track-item`. `fallback` builds it from attributes when nothing is bound.
- `attr`: one `data-*` attribute (`attr: "listId"` reads `data-list-id`), `type: "number"` casts it.
- `object`: an object assembled from several attributes; keys may be dot paths (`"price.actual.amount"`).
- `collect`: an array of `item`s from all descendants with the given `data-name`.

Every source accepts `from` (closest ancestor with this `data-name`) and `optional`. When a required argument resolves to nothing, the event is skipped.

To add rules from a theme, call `addRules` from your module's `init()`, the same way an analytics provider calls `addTracker`. Core files stay untouched:

```ts
// modules/my-module/index.ts
import { addRules } from "@/core/plugins";

export function init(): void {
  addRules([myRule]);
}
```

Added rules apply from the next click, and `appear` rules rescan the page right away.

## Triggers

- **click**: one capture-phase listener on `document`. Only a click on a link or a button counts. From it the engine walks up through `data-name` ancestors until a rule sends an event.
- **appear**: a `MutationObserver` on `body`, plus a rescan when a `v-track-item` value changes. An element sends again only with different arguments. Objects with the same `id` count as the same entity, so a refetched product does not resend `viewItem`.

`appear` means "rendered in the DOM", not "scrolled into the viewport": the event fires as soon as the list is rendered.
