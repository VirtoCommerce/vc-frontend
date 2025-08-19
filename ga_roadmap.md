# Google Analytics 4 Standard Events Roadmap

## Overview
This roadmap outlines the migration strategy from custom analytics events to Google Analytics 4 standard events, improving data consistency, compatibility, and reducing maintenance overhead.

## Current State Analysis (Updated - Migration Complete)

### Migrated Events Status
- `search` - ✅ Standard GA4 event with enhanced parameters
- `view_search_results` - ✅ Migrated to GA4 standard with items array
- `select_item` - ✅ Enhanced with search context parameters  
- `selectSearchResult` - ✅ Removed (consolidated into `select_item`)
- `add_to_cart` - ✅ Enhanced with GA4 standard parameters
- `view_item` - ✅ Standard GA4 event
- `view_cart` - ✅ Enhanced with GA4 standard parameters
- `purchase` - ✅ Enhanced with GA4 standard parameters

### GA4 Standard Events We Should Use
Reference: [GA4 Recommended Events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

## Migration Strategy

### Phase 1: Immediate Wins (Week 1-2)
**Goal**: Align existing events with GA4 standards

#### 1.1 Standardize Event Parameters
**Current**: `search_term` ✅ (already correct)
**Current**: `items_count` → **Standard**: `number_of_items`
**Current**: `results_count` → **Standard**: `search_results_count`

#### 1.2 Remove Redundant Events
- **Remove**: `selectSearchResult` 
- **Use instead**: `select_item` with proper parameters
- **Benefits**: Reduces code complexity, uses standard GA4 event

#### 1.3 Enhance Standard Events
```typescript
// Enhanced search event with standard parameters
search(searchTerm, visibleItems = [], itemsCount = 0) {
  sendEvent("search", {
    search_term: searchTerm,              // GA4 standard
    number_of_items: itemsCount,          // GA4 standard  
    search_results_count: itemsCount,     // Custom but clear
    search_type: "site_search",           // Custom categorization
  });
}
```

### Phase 2: Replace Custom Events (Week 3-4)
**Goal**: Replace custom events with GA4 standard alternatives

#### 2.1 Replace `view_search_results`
**Current**: Custom `view_search_results` event
**Replace with**: `view_search_results` (GA4 standard)
**Benefits**: Better GA4 integration, automatic reporting features

```typescript
// Standard GA4 approach
viewSearchResults(searchTerm, params) {
  sendEvent("view_search_results", {
    search_term: searchTerm,
    search_results_count: params?.results_count,
    items: params?.visible_items?.map(item => ({
      item_id: item.code,
      item_name: item.name
    }))
  });
}
```

#### 2.2 Enhance E-commerce Events
**Current**: Basic e-commerce events
**Enhance with**: GA4 enhanced e-commerce parameters

```typescript
// Enhanced add_to_cart with standard parameters
addItemToCart(item, quantity, params) {
  sendEvent("add_to_cart", {
    currency: "USD",                    // GA4 standard
    value: item.price?.actual?.amount,  // GA4 standard
    items: [{
      item_id: item.code,               // GA4 standard
      item_name: item.name,             // GA4 standard
      item_category: item.category,     // GA4 standard
      quantity: quantity,               // GA4 standard
      price: item.price?.actual?.amount // GA4 standard
    }]
  });
}
```

### Phase 3: Advanced GA4 Features (Week 5-6)
**Goal**: Leverage advanced GA4 capabilities

#### 3.1 Implement Enhanced E-commerce
**Add standard e-commerce events**:
- `begin_checkout` ✅ (already implemented)
- `add_payment_info` ✅ (already implemented)
- `add_shipping_info` ✅ (already implemented)
- `purchase` ✅ (already implemented)

#### 3.2 Add User Engagement Events
**New standard events to implement**:
```typescript
// Page engagement
page_view: "page_view",               // GA4 automatic
scroll: "scroll",                     // GA4 automatic  
user_engagement: "user_engagement",   // GA4 automatic

// Content engagement  
video_start: "video_start",
video_progress: "video_progress", 
video_complete: "video_complete",
file_download: "file_download",
```

#### 3.3 Implement Advanced Search Events
```typescript
// GA4 standard search events
search_suggestions: {
  event: "search",
  parameters: {
    search_term: "partial_query",
    engagement_type: "suggestion"
  }
},

search_refinement: {
  event: "search", 
  parameters: {
    search_term: "refined_query",
    previous_search_term: "original_query"
  }
}
```

### Phase 4: Advanced Analytics (Week 7-8)
**Goal**: Implement advanced tracking for business insights

#### 4.1 User Journey Tracking
```typescript
// Standard user journey events
login: "login",
sign_up: "sign_up", 
generate_lead: "generate_lead",
```

#### 4.2 Custom Business Events (when standard events don't fit)
```typescript
// Product-specific events
product_view_360: "product_view_360",
size_guide_view: "size_guide_view", 
wishlist_share: "wishlist_share",
```

## Implementation Plan

### Phase 1: Core Migration ✅ COMPLETED
- [x] Audit all current analytics events
- [x] Map to GA4 standard events  
- [x] Update search events to use standard parameters (`number_of_items`, `search_results_count`)
- [x] Remove redundant `selectSearchResult` event
- [x] Enhance e-commerce events with standard parameters
- [x] Consolidate search result clicks into enhanced `select_item` event
- [x] Update TypeScript type definitions

### Phase 2: Enhanced Implementation ✅ COMPLETED
- [x] Migrate `view_search_results` to use GA4 items array format
- [x] Add enhanced e-commerce parameters across all cart events
- [x] Standardize parameter naming (`items_count` → `number_of_items`)
- [x] Update all components to use enhanced events

### Phase 3: Testing and Validation (Next Steps)
- [ ] Validate all events in GA4 DebugView
- [ ] Test custom dimensions and reports
- [ ] Verify data consistency with new parameters
- [ ] Performance testing with enhanced tracking

### Phase 4: Advanced Features (Recommended)
- [ ] Implement user engagement events (`scroll`, `file_download`)
- [ ] Add video engagement tracking (`video_start`, `video_complete`)
- [ ] Implement advanced user journey events
- [ ] Set up conversion tracking with enhanced parameters

### Phase 5: Optimization and Monitoring
- [ ] Set up automated alerts for data quality
- [ ] Create custom audiences based on enhanced events
- [ ] Optimize based on real usage data
- [ ] Train team on new GA4 capabilities

## Benefits of Standard Events

### 1. Better GA4 Integration
- Automatic reports and insights
- Enhanced measurement capabilities  
- Better cross-platform tracking

### 2. Reduced Maintenance
- Less custom code to maintain
- Automatic updates from Google
- Better long-term compatibility

### 3. Improved Data Quality
- Consistent parameter naming
- Standard data types
- Better data validation

### 4. Enhanced Reporting
- Pre-built GA4 reports
- Better integration with other Google tools
- Improved data export capabilities

## Migration Checklist

### Technical Tasks
- [ ] Update event parameter names to GA4 standards
- [ ] Remove redundant custom events
- [ ] Enhance e-commerce event parameters  
- [ ] Add missing standard events
- [ ] Update TypeScript types
- [ ] Update tests

### Analytics Setup
- [ ] Create custom dimensions for business-specific parameters
- [ ] Set up enhanced e-commerce in GA4
- [ ] Configure standard reports
- [ ] Set up conversion tracking
- [ ] Configure audiences

### Documentation
- [ ] Update analytics documentation
- [ ] Create GA4 event reference
- [ ] Document custom dimensions
- [ ] Create troubleshooting guide

### Training
- [ ] Train development team on GA4 standards
- [ ] Train marketing team on new reports
- [ ] Create GA4 best practices guide

## Success Metrics

### Technical Metrics
- 100% of events use GA4 standard names where applicable
- 90% reduction in custom event code
- 0 data quality issues post-migration

### Business Metrics
- Improved report accuracy
- Faster report creation time
- Better cross-platform data consistency
- Enhanced user journey insights

## Risk Mitigation

### Data Continuity
- Maintain historical data mapping
- Run parallel tracking during transition
- Create data migration scripts if needed

### Performance Impact
- Monitor page load times
- Optimize event firing frequency
- Test with high-traffic scenarios

### Team Training
- Provide comprehensive GA4 training
- Create detailed documentation
- Establish support processes

## Migration Summary - COMPLETED ✅

### What Was Accomplished

#### ✅ Parameter Standardization
- **Before**: `items_count` → **After**: `number_of_items` (GA4 standard)
- **Before**: `results_count` → **After**: `search_results_count` (clearer naming)
- Added GA4 standard `items` array format for `view_search_results`

#### ✅ Event Consolidation  
- **Removed**: `selectSearchResult` custom event
- **Enhanced**: `select_item` with search context parameters
- **Result**: Simplified codebase, better GA4 compatibility

#### ✅ E-commerce Enhancement
All cart and checkout events now use GA4 standard parameters:
- `add_to_cart`, `remove_from_cart`, `view_cart`, `clear_cart`
- `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`

#### ✅ Search Tracking Improvements
- Enhanced search result tracking with position and context
- Zero-results tracking with proper parameters
- Search refinement detection

### Timeline - Accelerated Completion

| Phase | Status | Key Deliverables |
|-------|--------|------------------|
| Phase 1-2 | ✅ COMPLETED | Standard parameter alignment & event migration |
| Phase 3 | 📋 NEXT | Testing and validation |  
| Phase 4-5 | 📋 FUTURE | Advanced features & optimization |

## Next Steps

1. **Review and approve** this roadmap with stakeholders
2. **Assign team members** to each phase
3. **Set up tracking** for migration progress
4. **Begin Phase 1** implementation
5. **Schedule regular reviews** to ensure timeline adherence
