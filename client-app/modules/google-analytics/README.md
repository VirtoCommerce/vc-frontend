# Google Analytics Module

A module that implements Google Analytics 4 tracking and Google Tag Manager integration for the application.

## Basic Usage

```typescript
// client-app/app-runner.ts
import { init as initGoogleAnalytics } from "@/modules/google-analytics";

...

await initGoogleAnalytics();
```

## Google Tag Manager Integration

The module supports Google Tag Manager (GTM) integration alongside Google Analytics 4. When both GTM Container ID and GA4 Measurement ID are configured, GTM will be loaded first to ensure proper event sequencing.

### Configuration

Configure the following settings in the Virto Commerce backend:

- **EnableTracking**: Enable/disable tracking (applies to both GTM and GA4)
- **GTMContainerId**: Your Google Tag Manager Container ID (e.g., `GTM-XXXXXXX`)
- **MeasurementId**: Your Google Analytics 4 Measurement ID (e.g., `G-XXXXXXXXXX`)

### Load Order

1. If `GTMContainerId` is configured, GTM scripts are loaded first
2. If `MeasurementId` is configured, GA4 scripts are loaded after GTM
3. Both can work independently or together

The GTM implementation follows Google's best practices:
- GTM script is injected in the `<head>` section
- GTM noscript fallback is injected at the beginning of the `<body>` section
- `dataLayer` is properly initialized before GTM loads

### Event Handling

The module automatically sends ecommerce events regardless of whether you use:
- **GTM Only**: Events are pushed directly to `dataLayer` for GTM to capture
- **GA4 Only**: Events are sent via `gtag()` API
- **Both GTM + GA4**: Events are sent via `gtag()` which pushes to `dataLayer`, allowing both systems to track

This ensures your ecommerce events are always captured when tracking is enabled.

## Extending Events

1. Define your custom events interface to extend the core analytics composable. For more details, refer to the [documentation](/client-app/core/composables//useAnalytics/README.md#extending-with-custom-events):

```ts
// client-app/core/types/analytics-custom.ts

export interface ICustomAnalyticsEventMap {
  // NOTE: Add custom event maps here to either extend or override the basic event map
  myCustomEvent: [item: Product, params?: EventParamsType];
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
