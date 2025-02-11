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

1. Create custom events in your declaration file to extend the core analytics composable ([see documentation](/client-app/core/composables//useAnalytics/README.md#extending-with-custom-events)):

```typescript
declare module "client-app/core/types/analytics" {
  interface IAnalyticsEventMap {
    // Will be sent as 'add_to_wishlist'
    addToWishlist: [product: Product, quantity: number];
  }
}
```

> [!TIP]
>
> [TypeScript Documentation - Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

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

# Extending parameters

You can extend the GA4 implementation in several ways:

### Configuration Parameters

Use `extendConfig` to set additional [configuration parameters](https://developers.google.com/analytics/devguides/collection/ga4/reference/config):

```typescript
// client-app/app-runner.ts
await initGoogleAnalytics({
  extendConfig: {
    send_page_view: false,
    allow_google_signals: false,
    // ... other GA4 config parameters
  },
});
```

> [!TIP]
>
> [Google tag API reference - Config](https://developers.google.com/tag-platform/gtagjs/reference#config)

### Global Parameters

Use `extendSet` to define global parameters and custom dimensions that will be included with all subsequent events:

```typescript
// client-app/app-runner.ts
await initGoogleAnalytics({
  extendSet: {
    country: "US",
    language: "en",
    // ... other global parameters
  },
});
```

> [!TIP]
>
> [Google tag API reference - Set](https://developers.google.com/tag-platform/gtagjs/reference#set)

## Utility Functions

The module provides helper functions through `extendEvents`:

- `sendEvent`: Sends event to GA4 with proper formatting
- `productToGtagItem`: Converts product to GA4 item format
- `lineItemToGtagItem`: Converts line item to GA4 item format
