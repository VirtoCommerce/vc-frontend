// Empty-state system (VCDZ-934): what each reason and entity shows. Figma "Empty-state system", cards 04 and 05.

export interface IEmptyViewReasonConfig {
  tone: VcEmptyViewToneType;
  /** Lucide glyph in the S / M circle and at XS. */
  glyph: string;
  /** Drawn icon at L / XL; `null` = the entity's own icon. */
  icon: VcEmptyIconNameType | null;
  /** Content reasons show what is missing (the entity); system reasons show the reason itself. */
  showsEntity: boolean;
}

export const EMPTY_VIEW_REASONS: Record<VcEmptyViewReasonType, IEmptyViewReasonConfig> = {
  "no-data": { tone: "primary", glyph: "file-text", icon: null, showsEntity: true },
  "no-results": { tone: "secondary", glyph: "search-x", icon: "no-results", showsEntity: false },
  cleared: { tone: "primary", glyph: "shopping-cart", icon: "cart", showsEntity: true },
  "caught-up": { tone: "secondary", glyph: "check-check", icon: null, showsEntity: true },
  error: { tone: "danger", glyph: "cloud-off", icon: "error", showsEntity: false },
  "no-access": { tone: "danger", glyph: "lock", icon: "access-denied", showsEntity: false },
  "not-found": { tone: "secondary", glyph: "file-question-mark", icon: "not-found", showsEntity: false },
  done: { tone: "primary", glyph: "circle-check", icon: null, showsEntity: true },
};

export interface IEmptyViewEntityConfig {
  glyph: string;
  /** Its own drawn icon, or the closest one when it has none (branches → addresses). */
  icon: VcEmptyIconNameType;
}

export const EMPTY_VIEW_ENTITIES: Record<VcEmptyViewEntityType, IEmptyViewEntityConfig> = {
  activity: { glyph: "activity", icon: "nothing-found" },
  addresses: { glyph: "map-pin", icon: "addresses" },
  "back-in-stock": { glyph: "package-plus", icon: "back-in-stock" },
  branches: { glyph: "store", icon: "addresses" },
  cart: { glyph: "shopping-cart", icon: "cart" },
  catalog: { glyph: "layers", icon: "catalog" },
  compare: { glyph: "scale", icon: "compare" },
  coupons: { glyph: "ticket-percent", icon: "coupons" },
  customers: { glyph: "user-round", icon: "customers" },
  dashboard: { glyph: "layout-dashboard", icon: "dashboard-hidden" },
  documents: { glyph: "file-text", icon: "documents" },
  lists: { glyph: "heart", icon: "lists" },
  members: { glyph: "users", icon: "members" },
  missions: { glyph: "flag", icon: "missions" },
  news: { glyph: "file-text", icon: "documents" },
  notifications: { glyph: "bell", icon: "notifications" },
  orders: { glyph: "receipt-text", icon: "orders" },
  "payment-methods": { glyph: "credit-card", icon: "payment-methods" },
  points: { glyph: "coins", icon: "points" },
  "purchase-requests": { glyph: "clipboard-list", icon: "purchase-requests" },
  quotes: { glyph: "message-square-quote", icon: "quotes" },
  records: { glyph: "file-text", icon: "documents" },
  returns: { glyph: "undo-2", icon: "returns" },
  "sales-reps": { glyph: "user-star", icon: "sales-reps" },
  "saved-for-later": { glyph: "bookmark", icon: "saved-for-later" },
  subscriptions: { glyph: "repeat", icon: "subscriptions" },
  tasks: { glyph: "calendar-check", icon: "tasks" },
  variations: { glyph: "layers-2", icon: "catalog" },
};

/** A content reason with no known entity. */
export const EMPTY_VIEW_GENERIC = { glyph: "zoom-out", icon: "nothing-found" } as const;

/** Legacy `icon` names passed to VcEmptyView before the entity prop existed. */
export const EMPTY_VIEW_LEGACY_ICONS: Record<string, VcEmptyViewEntityType> = {
  "outline-order": "orders",
  "outline-stock": "catalog",
  "outline-lists": "lists",
  "outline-quotes": "quotes",
  "outline-address": "addresses",
  "outline-notifications": "notifications",
  "outline-document": "documents",
  "file-text": "documents",
  "credit-card": "payment-methods",
  calendar: "tasks",
  truck: "subscriptions",
  refresh: "subscriptions",
  tag: "coupons",
  user: "customers",
  activity: "activity",
  "list-v2": "saved-for-later",
};

export const EMPTY_VIEW_LEGACY_VARIANTS: Record<VcEmptyViewVariantType, VcEmptyViewReasonType> = {
  empty: "no-data",
  search: "no-results",
  error: "error",
};
