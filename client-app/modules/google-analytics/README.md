# Google Analytics Module

A module that implements Google Analytics 4 tracking for the application.

## Basic Usage

```typescript
// client-app/app-runner.ts
import { init as initGoogleAnalytics } from "@/modules/google-analytics";

...

await initGoogleAnalytics();
```

## Extending Events

1. Create custom events in your declaration file to extend the core analytics composable ([see documentation](/client-app/core/composables//useAnalytics/README.md)):

```typescript
declare module "client-app/core/types/analytics" {
  interface IAnalyticsEventMap {
    // Will be sent as 'add_to_wishlist'
    addToWishlist: [product: Product, quantity: number];
  }
}
```

2. Extend the module with custom event handlers:

```typescript
// client-app/app-runner.ts

import { extendGoogleAnalyticsEvents } from '../path-to/google-analytics-events-extension'
// to keep app-runner.ts file clear and concise, extension function should be defined in a separate file
...
await initGoogleAnalytics({
  extendEvents: extendGoogleAnalyticsEvents,
});

// google-analytics-events-extension.ts
import type { ExtendEventsType } from "./types";
import type { Product } from "@/core/api/graphql/types";

// function takes module utility functions
export const extendGoogleAnalyticsEvents: ExtendEventsType = ({ sendEvent, productToGtagItem, lineItemToGtagItem }) => {
    addToWishlist: (product, quantity) => {
      sendEvent("add_to_wishlist", {
        items: [productToGtagItem(product)],
        quantity,
      });
    },
  })
```

## Utility Functions

The module provides helper functions through `extendEvents`:

- `sendEvent`: Sends event to GA4 with proper formatting
- `productToGtagItem`: Converts product to GA4 item format
- `lineItemToGtagItem`: Converts line item to GA4 item format
