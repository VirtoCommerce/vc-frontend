# Google Analytics 4 - Search Performance Overview Report

## Overview
This guide creates a comprehensive search performance dashboard using Looker Studio that displays key metrics with proper visualizations, including search volume trends, clickthrough rates, and add-to-cart conversion rates.

## What You'll Build
A complete automated search performance dashboard featuring:
- **Search Volume Trend** (Line chart over time)
- **Unified Performance Table** (Search Term | Searches | Page Views | CTR % | ATC Rate %)

## Prerequisites
- Google Analytics 4 property configured
- Search events firing with `search_term` parameter
- Enhanced e-commerce events: `view_item`, `add_to_cart`
- Administrative access to GA4

---

## Step 1: Create Looker Studio Dashboard

### Setup Instructions

1. **Access Looker Studio**:
   - Go to [lookerstudio.google.com](https://lookerstudio.google.com)
   - Sign in with your Google account
   - Click **Create** → **Report**

2. **Connect GA4 Data Source**:
   - Select **Google Analytics** connector
   - **Account**: Choose your Google account
   - **Property**: Select your GA4 property
   - Leave all other settings as default
   - Click **Add** → **Add to report**

3. **Create Search Volume Trend Chart**:
   - Click **Add a chart** → **Time series chart**
   - Position: Top of report, full width
   - **Date dimension**: Date
   - **Metric**: Event count
   - **Filter**: Add filter → Event name = "search"
   - **Title**: "Daily Search Volume"

## Step 2: Create Filtered Event Count Fields

4. **Access Data Source Editor**:
   - Click **Resource** → **Manage added data sources**
   - Click **Edit** next to your GA4 data source

5. **Create Filtered Count Fields with Conditional Formulas**:
   
   **Field 1: Search Count**
   - Click **Add a field** (+)
   - **Field name**: `Search Count`
   - **Formula**: `SUM(IF(Event name="search",Event count,0))`
   - **Description**: "Sum of event counts for search events"
   - Click **Save**

   **Field 2: Page View Count**
   - Click **Add a field**
   - **Field name**: `Page View Count`
   - **Formula**: `SUM(IF(Event name="view_item",Event count,0))`
   - **Description**: "Sum of event counts for view_item events"
   - Click **Save**

   **Field 3: Add to Cart Count**
   - Click **Add a field**
   - **Field name**: `Add to Cart Count`
   - **Formula**: `SUM(IF(Event name="add_to_cart",Event count,0))`
   - **Description**: "Sum of event counts for add_to_cart events"
   - Click **Save**
   
   - Click **Done** to finish editing data source

## Step 3: Create Performance Table

4. **Add Table Chart**:
    - Click **Add a chart** → **Table**
    - Position: Below trend chart, full width
    - **Dimension**: Search term
    - **Sort**: Event count (descending)
    - **Rows to display**: 25

6. **Add Your Custom Filtered Fields to Table**:
    
    **Add Metrics**:
    - Add **Search Count** (your custom field)
    - Add **Page View Count** (your custom field)
    - Add **Add to Cart Count** (your custom field)
    
    These fields are already filtered, so no additional filters needed!

7. **Create Percentage Fields** (optional):
    - Go back to **Resource** → **Manage added data sources** → **Edit**
    - **CTR Percentage**: `(Page View Count / Search Count) * 100`
    - **ATC Rate Percentage**: `(Add to Cart Count / Search Count) * 100`

7. **Apply Table Filters**:
    - Select the table → **Setup** tab
    - **Add filter**: Search term ≠ "(not set)"
    - **Add filter**: Search Count > 5

12. **Format Table**:
    - Select table → **Style** tab
    - **Header**: Dark background, white text, bold
    - **Body**: Alternating row colors
    - **Column headers**: 
      - "Search Count" → "Searches"
      - "Page View Count" → "Page Views"

## Step 4: Final Dashboard

### Expected Result

Your automated dashboard will display:

**Top Section**: 
- Line chart showing daily search volume trends

**Bottom Section**: 
- Unified performance table:

| Search Term | Searches | Page Views | CTR % | ATC Rate % |
|-------------|----------|------------|-------|------------|
| product name| 1,234    | 456        | 37.0% | 8.5%       |
| brand search| 987      | 345        | 35.0% | 12.3%      |
| category    | 765      | 234        | 30.6% | 6.7%       |

### Key Benefits
- ✅ **Fully automated** - updates with new GA4 data
- ✅ **Accurate calculations** - proper CTR and ATC rate formulas
- ✅ **Professional appearance** - clean, dashboard-style layout
- ✅ **Shareable** - can be shared with team members

---

## Troubleshooting

### Common Issues & Fixes

**Issue**: No data in dashboard
- **Fix**: Expand date range to last 7-90 days
- **Fix**: Verify events are firing: go to GA4 Realtime and perform a search

**Issue**: CTR showing 0%
- **Fix**: Check that `view_item` events fire after searches
- **Fix**: Verify event names match exactly: "search", "view_item", "add_to_cart"

**Issue**: Search terms showing "(not set)"
- **Fix**: Verify `search_term` parameter is being sent with search events

### Performance Benchmarks
- **Good CTR**: >20% (users finding relevant results)
- **Average CTR**: 10-20% (room for improvement)  
- **Poor CTR**: <10% (needs immediate attention)
- **Good ATC Rate**: >5% (strong purchase intent)
- **Average ATC Rate**: 2-5% (moderate conversion)
- **Poor ATC Rate**: <2% (low commercial value)

This creates a complete, automated search analytics dashboard that matches professional e-commerce analytics platforms.
