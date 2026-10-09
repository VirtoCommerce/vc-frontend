// Saved layout (VCST-5367). Backends type `scope` and `region.id` as free-form strings, not enums — an
// unrecognized value does not error, it silently addresses a different (empty) document. So these literals are
// load-bearing: changing one strands every layout already saved under the old value. `registry.test.ts` pins them.
export const LAYOUT_SCHEMA_VERSION = 1;
// The dashboards that keep a saved layout, one document per user, dashboard and store. A scope is also the
// registry's name for a dashboard's blocks. Load-bearing like the rest: a renamed scope reads a new, empty document.
export const LAYOUT_SCOPES = {
  accountDashboard: "accountDashboard",
  salesRepDashboard: "salesRepDashboard",
  salesRepCustomerProfile: "salesRepCustomerProfile",
} as const;
// Ordered so serialization always emits regions in a stable sequence.
export const LAYOUT_REGION_IDS = ["statistics", "mainLeft", "mainRight"] as const;

// What a widget can be dragged by: its whole header. `.vc-widget__header-container` is a VcWidget
// internal, not a published contract, so a rename there silently kills header drags —
// `layout-block-widget.test.ts` mounts a real widget against this to catch it.
export const WIDGET_DRAG_HANDLE_SELECTOR = ".vc-widget__header-container";
// Controls that sit inside that header, so without this a mousedown on ✕ or in the rows field starts
// a drag instead. SortableJS `filter` takes a comma-separated selector list.
export const WIDGET_DRAG_FILTER_SELECTOR = ".layout-widget__hide, .layout-widget__rows";

// Per-widget settings (VCST-5649), persisted as scalars in each block's `settings` list. Like the
// scope and region ids above these strings are load-bearing: renaming one strands every saved value.
export const SETTING_MAX_ROWS = "maxRows";
// One sibling key per rule the user unchecked; a checked rule writes nothing, so a status the backend
// adds later shows up checked without a migration.
export const SETTING_HIDDEN_TAB_PREFIX = "tab.";
// The smallest row cap a list widget may declare.
export const MIN_ROWS = 1;
