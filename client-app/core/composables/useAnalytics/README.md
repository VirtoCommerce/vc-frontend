# Analytics Composable

The `useAnalytics` composable provides a centralized way to track analytics events across the application. It supports both predefined events and custom events through a type-safe interface.

## Basic Usage

```typescript
import { useAnalytics } from "@/core/composables/useAnalytics";

const { analytics } = useAnalytics();

// Track a predefined event
analytics("viewItem", product, { currency: "USD" });
```

## Predefined Events

The following events are available out of the box:

- `viewItemList`: Track when a list of items is viewed
- `selectItem`: Track when an item is selected
- `viewItem`: Track when an item details are viewed
- `addItemToCart`: Track when an item is added to cart
- [And more](../../types/analytics.ts)...

## Extending with Custom Events

1. Create a declaration file (e.g., `custom-analytics.d.ts`):

```typescript
declare module "client-app/core/types/analytics" {
  // Key: custom event name
  // Value: tuple type representing event arguments
  interface IAnalyticsEventMap {
    myCustomEvent: [item: Product, params?: EventParamsType];
  }
}

export {};
```

2. Use your custom event:

```typescript
analytics("myCustomEvent", product, { customParam: "value" });
```

## Creating an Analytics Provider Module

To create your own analytics provider (like Google Analytics), follow these steps:

1. Create a module structure:

```
modules/my-analytics/
├── constants.ts
├── events.ts
├── index.ts
└── utils.ts
```

2. Define your initialization (`index.ts`):

```typescript
import { useAnalytics } from "@/core/composables/useAnalytics";

export async function init(): Promise<void> {
  const { addTracker } = useAnalytics();
  const { events } = await import("./events");

  addTracker({
    meta: {
      name: "my-analytics",
    },
    events,
  });
}
```

3. Implement event handlers (`events.ts`):

```typescript
import { sendEvent } from "./utils";
import type { TrackerEventsType } from "@/core/types/analytics";

export const events: TrackerEventsType = {
  viewItem: (item, params) => {
    sendEvent("view_item", {
      item_id: item.id,
      ...params,
    });
  },
  // ... other event handlers
};
```

4. Implement the interface of extending events. See an [example of implementation](/client-app/modules/google-analytics/README.md) in Google Analytics module.

5. Register your analytics provider module in the app:

```typescript
// client-app/app-runner.ts
import { init as initMyAnalytics } from "@/modules/my-analytics";

...

await initMyAnalytics();
```

### Best Practices

1. **Type Safety**: Always define types for custom events to maintain type checking.
2. **Error Handling**: Implement proper error handling in your event handlers.
3. **Development Mode**: Use the `IS_DEVELOPMENT` flag to disable tracking in development.
4. **Testing**: Write unit tests for your analytics module and event handlers.

### Example: Google Analytics Module

The Google Analytics module demonstrates a complete implementation.
For more details, refer to the [Google Analytics module implementation](/client-app/modules/google-analytics/README.md) in the codebase.
