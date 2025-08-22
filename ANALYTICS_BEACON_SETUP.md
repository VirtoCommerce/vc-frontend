# Analytics Beacon Setup Guide

The Analytics Beacon is now integrated into the VirtoCommerce frontend as a pure JavaScript solution to automatically track `view_search_results` events and other e-commerce interactions.

## ✨ **Pure JavaScript Integration**

The beacon is now loaded as a standalone JavaScript file (similar to Google Analytics), not as a TypeScript module dependency. This provides:

- ✅ **Easy deployment**: Just include the script files
- ✅ **No build dependencies**: Works independently of your build process  
- ✅ **CDN ready**: Can be served from any CDN
- ✅ **Framework agnostic**: Pure JavaScript, no Vue/React dependencies

## 📁 **File Structure**

```
vc-frontend/
├── client-app/public/static/
│   ├── analytics-beacon.js        # Development version (with source maps)
│   └── analytics-beacon.min.js    # Production version (minified)
└── client-app/modules/google-analytics/
    └── index.ts                   # Updated to load beacon script
```

## ⚙️ **Configuration**

### 1. Google Analytics 4 Setup

Ensure your theme settings include a valid GA4 measurement ID:

```json
{
  "google_analytics_id": "G-XXXXXXXXXX"
}
```

### 2. Automatic Initialization  

The beacon automatically initializes when:
- Google Analytics module loads
- Valid GA4 measurement ID is found in theme settings
- Script loads successfully from `/static/analytics-beacon.min.js`

### 3. Global API Access

Once loaded, the beacon exposes a global `window.AnalyticsBeacon` API:

```javascript
// Check if beacon is loaded
if (window.AnalyticsBeacon) {
  console.log('Beacon version:', window.AnalyticsBeacon.version);
  console.log('Status:', window.AnalyticsBeacon.getStatus());
}
```

## 🔄 **How It Works**

### 1. Script Loading Flow
```
Google Analytics Module Initialize
    ↓
Load /static/analytics-beacon.min.js
    ↓
window.AnalyticsBeacon becomes available
    ↓
Initialize with GA4 measurement ID
    ↓
Start automatic event detection
```

### 2. Search Results Detection
```
User searches for "laptop computers"
    ↓
Page loads or SPA navigation occurs
    ↓
Beacon detects search results container
    ↓
Extracts search data automatically
    ↓
Sends view_search_results to GA4
```

## 📊 **Event Data**

The beacon automatically sends properly formatted GA4 events:

```javascript
// Example view_search_results event
gtag('event', 'view_search_results', {
  search_term: "laptop computers",
  search_results_count: 24,
  results_page: 1,
  zero_results: false,
  visible_items_count: 12,
  currency: "USD",
  items: [
    {
      item_id: "LAPTOP-001", 
      item_name: "Gaming Laptop Pro",
      item_category: "Electronics",
      price: 1299.99,
      index: 1
    }
    // ... more items
  ]
});
```

## 🛠️ **Development & Debugging**

### Development Server Setup
For live development with hot reloading:

```bash
# In the analytics-beacon directory, start the development server
cd ../analytics-beacon
npm run dev

# This will:
# - Build the beacon automatically on file changes  
# - Start a server at http://localhost:8080
# - Serve analytics-beacon.js with CORS headers
# - Watch for source code changes and rebuild
```

The development server serves the beacon at `http://localhost:8080/analytics-beacon.js` and the frontend automatically loads from this URL when in development mode.

### Development Mode
- Loads from `http://localhost:8080/analytics-beacon.js` (live development server)
- Detailed console logging enabled
- Status information displayed
- Hot reloading on source changes

### Production Mode  
- Loads `analytics-beacon.min.js` from `/static/` (minified, optimized)
- Minimal logging
- Optimized performance

### Console Output Example
```
[GA] Loading Analytics Beacon script...
[GA] Analytics Beacon script loaded successfully
[GA] Initializing Analytics Beacon version: 1.0.0
[SearchResultsDetector] Sent view_search_results event: "laptop computers" (24 results)
[GA] Analytics Beacon initialized successfully
```

## 🚀 **Deployment**

### Development Deployment
For local development with live reloading:

1. Start the beacon development server:
   ```bash
   cd analytics-beacon
   npm run dev
   ```
2. Start your frontend development server
3. The frontend will automatically load the beacon from `http://localhost:8080/analytics-beacon.js`

### Production Deployment
For production builds:

1. Build the beacon: `npm run build` in `analytics-beacon/`
2. Copy files to frontend: 
   - `dist/analytics-beacon.js` → `vc-frontend/client-app/public/static/`
   - `dist/analytics-beacon.min.js` → `vc-frontend/client-app/public/static/`
3. Deploy your frontend normally

### CDN Deployment (Optional)
You can also serve the beacon from a CDN by updating the script URL in the Google Analytics module.

## 🔧 **VirtoCommerce-Specific Features**

### Smart Selector Detection
The beacon automatically detects VirtoCommerce elements:

- ✅ **Results Container**: `.category-products`, `.category__products`
- ✅ **Product Cards**: `[data-product-sku]`, `[data-test-id="product-card"]`
- ✅ **Search Terms**: `.category__title strong`
- ✅ **Result Counts**: `.category__products-count b`

### SPA Navigation Support
- ✅ **Vue Router**: Automatic detection of client-side navigation
- ✅ **URL Changes**: Monitors history API changes
- ✅ **Dynamic Content**: Uses MutationObserver for dynamic results
- ✅ **Attribution**: Maintains context across navigation

## 🔒 **Privacy & Compliance**

- ✅ **No Cookies**: Uses sessionStorage only
- ✅ **Anonymous Sessions**: No personal data collected
- ✅ **DNT Respect**: Honors Do Not Track headers
- ✅ **IP Anonymization**: Enabled by default
- ✅ **GDPR Ready**: Privacy-compliant by design

## 📈 **Performance Impact**

- **Script Size**: ~15KB gzipped (analytics-beacon.min.js)
- **Load Time**: Loads asynchronously, non-blocking
- **CPU Usage**: Minimal, uses efficient event delegation
- **Memory Usage**: Automatic cleanup of expired data
- **Network**: Batched GA4 events, minimal requests

## 🐛 **Troubleshooting**

### Common Issues

1. **No events tracked**: 
   - Check GA4 measurement ID in theme settings
   - Verify script files are accessible at `/static/analytics-beacon.min.js`
   - Check browser console for error messages

2. **SPA navigation not detected**:
   - Ensure Vue Router is properly configured
   - Check console for navigation detection logs

3. **Search results not found**:
   - Verify page structure matches VirtoCommerce selectors
   - Check console for detection attempts

### Debug Commands

```javascript
// Check beacon status
window.AnalyticsBeacon?.getStatus()

// Check if GA4 is loaded  
window.gtag && window.dataLayer

// Manual beacon control (for testing)
window.AnalyticsBeacon?.stop()
window.AnalyticsBeacon?.start()
```

The Analytics Beacon now works as a pure JavaScript solution, just like Google Analytics, making it easy to deploy and maintain while providing comprehensive automatic event tracking! 🎉
