declare global {
  type VcEmptyViewVariantType = "empty" | "search" | "error";

  /** `auto` picks sm / md / lg from the width the view is given; `xs` and `xl` are set explicitly. */
  type VcEmptyViewSizeType = "auto" | "xs" | "sm" | "md" | "lg" | "xl";

  /** Why the place is empty. Sets the tone, the glyph and, for system reasons, the drawn icon. */
  type VcEmptyViewReasonType =
    "no-data" | "no-results" | "cleared" | "caught-up" | "error" | "no-access" | "not-found" | "done";

  type VcEmptyViewToneType = "primary" | "secondary" | "danger";

  /** What is missing. Content reasons (no-data, cleared, caught-up, done) show its glyph and drawn icon. */
  type VcEmptyViewEntityType =
    | "activity"
    | "addresses"
    | "back-in-stock"
    | "branches"
    | "cart"
    | "catalog"
    | "compare"
    | "coupons"
    | "customers"
    | "dashboard"
    | "documents"
    | "lists"
    | "members"
    | "missions"
    | "news"
    | "notifications"
    | "orders"
    | "payment-methods"
    | "points"
    | "purchase-requests"
    | "quotes"
    | "records"
    | "returns"
    | "sales-reps"
    | "saved-for-later"
    | "subscriptions"
    | "tasks"
    | "variations";
}

export {};
