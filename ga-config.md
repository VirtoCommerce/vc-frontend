# Google Analytics Configuration & Analytics Beacon Integration

This document describes how Google Analytics 4 (GA4) is configured in the VirtoCommerce storefront and how the Analytics Beacon is integrated for automatic event tracking.

## Overview

The VirtoCommerce storefront uses a dual analytics approach:
1. **Traditional GA4 Integration**: Manual event tracking via the existing Google Analytics module
2. **Analytics Beacon**: Automatic event detection and tracking without code changes

## Configuration

### Google Analytics Module Settings

The GA module is configured through the VirtoCommerce backend settings:

```json
{
  "GoogleAnalytics4.MeasurementId": "G-XXXXXXXXXX",
  "GoogleAnalytics4.EnableTracking": true
}
```

### Analytics Beacon Integration

The Analytics Beacon is automatically initialized alongside the traditional GA tracking in `client-app/modules/google-analytics/index.ts`.

#### Beacon Configuration

```javascript
window.AnalyticsBeacon.init({
  trackingId: trackingId, // Uses same GA4 Measurement ID
  debug: DEBUG_MODE,      // Follows existing debug setting
  confidenceThreshold: 0.7,
  
  // VirtoCommerce-specific selectors
  selectors: {
    search: {
      forms: ['.search-form', 'form[action*="search"]'],
      inputs: ['input[type="search"]', 'input[name="q"]', '.search-input'],
      results: ['.search-results', '.product-list'],
      resultItems: ['.product-card', '.product-item']
    },
    products: {
      cards: ['.product-card', '.product-item', '.product-tile'],
      details: ['.product-details', '.product-info'],
      names: ['.product-name', '.product-title', 'h1'],
      prices: ['.price', '.product-price', '.price-current'],
      links: ['a[href*="/product"]', '.product-link']
    },
    cart: {
      addButtons: ['.add-to-cart', '.btn-add-cart', 'button:contains("Add to Cart")'],
      removeButtons: ['.remove-item', '.cart-remove'],
      clearButtons: ['.clear-cart'],
      cartPage: ['.cart-page', '.shopping-cart']
    },
    checkout: {
      beginButtons: ['.checkout-btn', 'button:contains("Checkout")'],
      steps: ['.checkout-step'],
      forms: ['.checkout-form']
    }
  },
  
  // Privacy settings
  respectDoNotTrack: true,
  anonymizeIp: true,
  cookieConsent: false,
  
  // Rate limiting
  maxEventsPerMinute: 100
});
```

## Automatic Event Detection

The Analytics Beacon automatically detects and tracks the following events:

### Search Events

| Event | Trigger | Data Collected |
|-------|---------|----------------|
| `search` | Form submission | Search term, results count, session ID |
| `view_search_results` | Search results page load | Search term, results count, page number |

### Product Events

| Event | Trigger | Data Collected |
|-------|---------|----------------|
| `view_item` | Product card in viewport | Product ID, name, price, category, attribution |
| `select_item` | Product link click | Product ID, name, price, list context |

### Cart Events

| Event | Trigger | Data Collected |
|-------|---------|----------------|
| `add_to_cart` | Add to cart button click | Product details, quantity, attribution |
| `remove_from_cart` | Remove button click | Product details, quantity |
| `view_cart` | Cart page load | Cart value, items count |

### Checkout Events

| Event | Trigger | Data Collected |
|-------|---------|----------------|
| `begin_checkout` | Checkout button click | Cart details, attribution |
| `add_shipping_info` | Shipping form submission | Shipping tier, order value |
| `add_payment_info` | Payment form submission | Payment type, order value |
| `purchase` | Order confirmation page | Transaction ID, value, tax, shipping, items |

## Search Attribution

The beacon implements session storage-based attribution to track whether user actions originated from search or browse:

### Attribution Data

All e-commerce events include attribution parameters:

- `source_type`: "search" or "browse"
- `search_term`: Original search query (if from search)
- `item_list_id`: "search_results" or product list identifier
- `item_list_name`: Descriptive list name
- `search_session_id`: Unique session identifier for search
- `time_since_search`: Seconds elapsed since search (if applicable)
- `attribution_method`: "session", "referrer", or "default"

### Attribution Window

- **Duration**: 30 minutes
- **Storage**: Browser sessionStorage
- **Fallback**: Document referrer analysis

## Development & Testing

### Debug Mode

When `DEBUG_MODE = true` in the GA module:
- Console logging is enabled for both GA and beacon events
- Detailed event data is logged
- Confidence scores are displayed

### Testing the Integration

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Open Browser Console** and look for:
   ```
   [GA] Analytics Beacon initialized successfully
   [AnalyticsBeacon] Initialized 4 detectors
   [AnalyticsBeacon] Initialized successfully
   ```

3. **Test Event Detection**:
   - Search for products
   - Scroll through product listings
   - Click product links
   - Add items to cart
   - Navigate through checkout

4. **Verify in GA4 DebugView**:
   - Go to GA4 → Configure → DebugView
   - Events should appear in real-time with enhanced data

### Console Output Examples

```javascript
// Successful initialization
[GA] Analytics Beacon initialized successfully
[AnalyticsBeacon] Initialized 4 detectors

// Event detection
[AnalyticsBeacon] Detected search { searchTerm: "laptop", confidence: 0.9 }
[AnalyticsBeacon] Detected view item { productId: "123", confidence: 0.8 }
[AnalyticsBeacon] Detected add to cart { productId: "123", confidence: 0.95 }
```

## Customization

### Adjusting Selectors

To customize element detection, modify the selectors in `client-app/modules/google-analytics/index.ts`:

```javascript
selectors: {
  products: {
    cards: ['.your-product-card', '.custom-product-item'],
    // Add your specific selectors
  }
}
```

### Confidence Threshold

Adjust the confidence threshold to be more or less strict:

```javascript
confidenceThreshold: 0.8, // Higher = more strict (fewer false positives)
confidenceThreshold: 0.6, // Lower = more permissive (more events detected)
```

### Privacy Settings

Configure privacy options based on your requirements:

```javascript
respectDoNotTrack: true,    // Honor browser DoNotTrack setting
anonymizeIp: true,          // Anonymize IP addresses
cookieConsent: false,       // Require cookie consent (if using consent management)
```

## File Structure

```
client-app/modules/google-analytics/
├── index.ts              # Main GA module with beacon integration
├── constants.ts          # Settings mapping and constants
├── events.ts            # Manual event definitions
├── types.ts             # TypeScript type definitions
└── utils.ts             # Utility functions

client-app/public/static/
└── analytics-beacon.min.js  # Beacon script (29KB minified)
```

## Performance Considerations

- **Bundle Size**: The beacon adds ~29KB (minified) to your static assets
- **Runtime Impact**: Minimal - uses efficient event delegation and intersection observers
- **Rate Limiting**: Built-in protection against event spam (100 events/minute default)
- **Memory Usage**: Automatic cleanup of observers and event listeners

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Beacon Not Loading

Check console for errors:
```javascript
// If you see this, the beacon failed to load
[GA] Analytics Beacon not available
```

**Solutions**:
1. Verify `analytics-beacon.min.js` exists in `/client-app/public/static/`
2. Check network tab for 404 errors
3. Ensure script loading completes before initialization

### Events Not Firing

1. **Check Debug Mode**: Enable `DEBUG_MODE = true`
2. **Verify Selectors**: Ensure CSS selectors match your HTML structure
3. **Check Confidence**: Lower `confidenceThreshold` if events are being filtered out
4. **Inspect Elements**: Use browser DevTools to verify element detection

### GA4 DebugView Issues

1. **Verify Measurement ID**: Ensure correct GA4 tracking ID
2. **Check Debug Mode**: Must be enabled for DebugView
3. **Browser Extensions**: Disable ad blockers that might block GA

## Advanced Configuration

### Server-Side Configuration

For enterprise deployments, beacon configuration can be managed server-side:

```javascript
AnalyticsBeacon.init({
  trackingId: 'G-XXXXXXXXXX',
  clientId: 'virto-storefront',
  apiEndpoint: 'https://api.your-domain.com'
});
```

The beacon will fetch configuration from:
`GET /beacon-config/virto-storefront`

### Custom Events

Add custom event detection:

```javascript
customEvents: [
  {
    name: 'addToWishlist',
    trigger: 'click',
    selector: '.wishlist-btn'
  }
]
```

### Event Mappings

Map custom events to standard GA4 events:

```javascript
eventMappings: {
  'addItemToCart': 'add_to_bag',
  'viewProduct': 'view_item'
}
```

## Security & Privacy

- **DoNotTrack Compliance**: Automatically respects browser DoNotTrack settings
- **IP Anonymization**: Enabled by default
- **GDPR Compliance**: Can be configured to require cookie consent
- **Data Minimization**: Only collects necessary e-commerce data
- **No PII**: Does not collect personally identifiable information

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The beacon is automatically included in the production build and will be served from your static assets directory.

---

**For more information about the Analytics Beacon project, see the [Analytics Beacon Repository](../analytics-beacon/README.md).**



