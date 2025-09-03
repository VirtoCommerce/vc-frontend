# Analytics Beacon Setup Guide

The Analytics Beacon is now integrated into the VirtoCommerce frontend as a pure JavaScript solution to automatically track `view_search_results` and `select_item` events (search result clicks) plus other e-commerce interactions.

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

The beacon automatically sends properly formatted GA4 events (timestamps and session IDs are handled by GA4 automatically):

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

// Example select_item event (when user clicks search result)
gtag('event', 'select_item', {
  item_list_id: 'search_results',
  item_list_name: 'Search results for "laptop computers"',
  search_term: "laptop computers",
  items: [
    {
      item_id: "LAPTOP-001",
      item_name: "Gaming Laptop Pro", 
      item_category: "Electronics",
      price: 1299.99,
      index: 1,
      quantity: 1
    }
  ]
});
```

## 🎯 **VirtoCommerce Product ID Mapping**

The beacon automatically maps VirtoCommerce's product structure to GA4 events:

### **HTML Structure** 
```html
<!-- VirtoCommerce Product Card -->
<div class="product-card" data-product-sku="LAPTOP-DELL-XPS13-256" data-test-id="product-card">
  <h3 class="product-name">Dell XPS 13 Laptop</h3>
  <div class="product-price">$999.99</div>
  <div class="product-category">Electronics > Laptops</div>
</div>
```

### **Priority for Product ID Extraction**
1. **`data-product-sku`** ← **VirtoCommerce primary (SKU = Product ID)**  
2. `data-product-id` ← Alternative product ID
3. `data-item-id` ← Generic item ID  
4. `data-id` ← Generic fallback
5. URL extraction from product links

### **Priority for Product Name Extraction**
1. **`<a title="product name">`** ← **Link title attribute (highest priority)**
2. CSS selectors: `.product-name`, `.vc-product-title`, `h1-h4`, etc.
3. Data attributes: `[data-product-name]`, `[data-item-name]`

### **Resulting GA4 Event**
```javascript
gtag('event', 'select_item', {
  item_list_id: 'search_results',
  items: [{
    item_id: 'LAPTOP-DELL-XPS13-256',    // From data-product-sku (VirtoCommerce SKU)
    item_name: 'Dell XPS 13 Laptop',     // From .product-name element  
    item_category: 'Electronics',        // From .product-category element
    price: 999.99,                       // From .product-price element
    index: 1,                            // Position in search results
    quantity: 1
  }]
});
```

**Important**: VirtoCommerce's `data-product-sku` is treated as the primary product identifier and maps directly to GA4's `item_id` field.

## ⚡ **SPA Title Fix - CRITICAL**

**VirtoCommerce SPA Issue Resolved**: The beacon now correctly extracts page titles instead of showing generic "Virto Commerce" in analytics events.

### **The Problem**
VirtoCommerce SPAs often show `document.title = "Virto Commerce"` before the SPA updates the title, causing all GA4 events to report generic page titles.

### **The Solution** 
The beacon now uses intelligent title extraction with fallback priority:

```javascript
// Enhanced title extraction result
gtag('event', 'view_search_results', {
  page_title: "Search Results: Laptops - 42 Items",  // ✅ Actual page title
  search_term: "laptops",
  // ... instead of generic "Virto Commerce"
});
```

### **Debug Logs Show Title Sources**
```javascript
[DEBUG] 🔍 Extracting page title using VirtoCommerce SPA-aware priority order
[DEBUG] ✅ Found title in <title> element: "Search Results: Laptops - 42 Items"
// OR
[DEBUG] ⚠️ <title> element contains generic title: "Virto Commerce", trying alternatives
[DEBUG] ✅ Found title in h1 selector "h1": "Gaming Laptops Category"
```

## 🐛 **SPA Multiple Events Fix - CRITICAL** 

**VirtoCommerce SPA Bug Resolved**: Fixed event listener accumulation causing duplicate `select_item` events.

### **The Problem**
In VirtoCommerce SPAs, each new search was adding additional click listeners without removing old ones:

```
🔍 Search "laptops"   → 1 click listener added
🔍 Search "printers"  → 2 click listeners (old + new)  
🔍 Search "phones"    → 3 click listeners
👆 Click product     → 3 select_item events fired! 🐛
```

### **The Solution**  
The beacon now automatically cleans up existing listeners before adding new ones:

```javascript
// Before each search page navigation
[DEBUG] 🧹 Detaching search results listeners to prevent accumulation
[DEBUG]   ✅ Click handler removed (prevents duplicate select_item events)
[DEBUG] ✅ Search result click tracking initialized (single listener)
```

### **Test the Fix**
After the fix, regardless of how many searches you perform:
- ✅ **1 click = 1 select_item event** (always)
- ✅ **No event accumulation** in GA4 debugger
- ✅ **Clean listener management** in SPA navigation

## 🛒 **Add to Cart Events - NEW!**

The beacon now automatically tracks `add_to_cart` events from various VirtoCommerce interactions.

### **Supported Triggers**
- ✅ **Button Clicks**: `.add-to-cart-btn`, `.vc-add-to-cart`, `[data-add-to-cart]`
- ✅ **Form Submissions**: `.add-to-cart-form`, `.vc-product-form`
- ✅ **Dynamic Content**: SPA-loaded add-to-cart buttons
- ✅ **Quantity Detection**: Automatically extracts quantity from inputs

### **GA4 Event Structure**
```javascript
gtag('event', 'add_to_cart', {
  currency: 'USD',
  value: 999.99,  // price * quantity (required)
  items: [{
    item_id: 'LAPTOP-DELL-XPS13-256',     // From data-product-sku
    item_name: 'Dell XPS 13 Laptop',      // From .product-name
    item_category: 'Electronics',         // From .product-category
    price: 999.99,                        // From .product-price
    quantity: 1                           // From quantity input
  }]
});
```

### **VirtoCommerce Integration**
The beacon automatically detects add-to-cart actions from:

**Product Cards:**
```html
<div class="product-card" data-product-sku="LAPTOP001" data-currency="USD">
  <div class="product-name">Dell XPS 13</div>
  <div class="product-price">$999.99</div>
  <input type="number" class="quantity-input" value="1">
  <button class="add-to-cart-btn">Add to Cart</button>
</div>
```

**Product Detail Pages:**
```html
<form class="vc-product-form" data-product-sku="LAPTOP001">
  <input name="quantity" class="vc-quantity-input" value="2">
  <button type="submit" class="vc-add-to-cart">Add to Cart</button>
</form>
```

### **Debug Output**
```javascript
[INFO] 🛒 Starting add-to-cart detection
[DEBUG] ✅ Add-to-cart click tracking initialized with selectors: [".add-to-cart-btn", ...]
[DEBUG] 📊 Total add-to-cart buttons found: 5
[DEBUG] 🖱️ Global click detected on element: BUTTON add-to-cart-btn
[DEBUG] 🛒 Click detected on add-to-cart button
[DEBUG] ✅ Extracted add-to-cart data: {"productId": "LAPTOP001", ...}
[INFO] 🎯 Add to cart event sent: "Dell XPS 13" (1x$999.99)
```

## 🐛 **Critical Fixes Applied**

### **Issue 1: Add to Cart Events Not Firing** 
✅ **FIXED**: Converted to event delegation for better SPA compatibility

**Before (Problematic)**:
- Added listeners to individual buttons at page load
- Failed when buttons were dynamically loaded
- Didn't work with SPA navigation

**After (Fixed)**:
- Uses global event delegation like SearchResultsDetector
- Automatically works with dynamic content
- Compatible with SPA navigation

### **Issue 2: select_item Firing Instead of add_to_cart**
✅ **FIXED**: Added conflict resolution between detectors

**Before (Problematic)**:
```javascript
// SearchResultsDetector captured ALL clicks in product cards
Click Add to Cart Button → select_item event fired ❌
```

**After (Fixed)**:
```javascript
// SearchResultsDetector now checks for add-to-cart buttons first
Click Add to Cart Button → add_to_cart event fired ✅
Click Product Link → select_item event fired ✅
```

### **Debugging Tools Added**
- 🔧 **debug-virtocommerce-buttons.html**: Test tool to identify actual button selectors
- 📊 **Enhanced logging**: Shows exactly why events are or aren't firing
- 🎯 **Event delegation tracking**: Works with all SPA content

## 🔗 **Select Item Events - LINKS ONLY** 

**IMPORTANT CHANGE**: `select_item` events now **ONLY** fire for navigation clicks, not any click within search results.

### **What Triggers select_item Events**
- ✅ **Product name links**: `<a href="/product/...">Product Name</a>`
- ✅ **Product image links**: `<a href="/product/..."><img></a>`
- ✅ **Elements with navigation**: `data-product-url`, onclick with location
- ✅ **Product link classes**: `.product-link`, `.vc-product-link`

### **What Does NOT Trigger select_item Events**
- ❌ **Add-to-cart buttons** → `add_to_cart` event instead
- ❌ **Price text** → No event (not navigation)
- ❌ **Category text** → No event (not navigation)  
- ❌ **Empty areas** → No event

### **VirtoCommerce Integration**
```html
<!-- ✅ These WILL trigger select_item events -->
<div class="search-result-item" data-product-sku="LAPTOP001">
  <a href="/product/dell-xps-13" class="vc-product-image">
    <img src="product.jpg" alt="Dell XPS 13"> <!-- Link click = select_item -->
  </a>
  <a href="/product/dell-xps-13" class="vc-product-title">
    Dell XPS 13 Laptop <!-- Link click = select_item -->
  </a>
  <div class="product-price">$999.99</div> <!-- Text click = no event -->
  <button class="add-to-cart-btn">Add to Cart</button> <!-- Button = add_to_cart event -->
</div>
```

### **Why This Change?**
- **Accurate Analytics**: Only navigation intent should trigger `select_item`
- **Clear Separation**: Add-to-cart actions get proper `add_to_cart` events
- **GA4 Compliance**: Matches Google's intent for `select_item` events
- **Better UX Tracking**: Distinguishes between viewing vs. purchasing intent

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
[SearchResultsDetector] ✅ Search page detected! Starting search results detection
[SearchResultsDetector] 🎯 Sent view_search_results event: "laptop computers" (24 results)
[SearchResultsDetector] 🎯 Select item event sent: "Gaming Laptop Pro" (position 1)
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

### Smart Search Page Detection
The beacon intelligently detects search pages using multiple methods:

**Detection Methods**:
- ✅ **Path-based**: `/search`, `/results`, `/find`, `/query`, `/lookup`  
- ✅ **Parameter-based**: `?q=`, `?query=`, `?search=`, `?keyword=`, `?term=`
- ✅ **Pattern-based**: Regex matching for search-related URL patterns

**Performance Optimization**: The search detector only runs on actual search pages, avoiding unnecessary DOM observation on category, product, and other non-search pages.

### Smart Selector Detection
The beacon automatically detects VirtoCommerce elements (on search pages only):

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
- **Smart Detection**: Search detector only runs on search pages (major performance optimization)

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
