import { initialize as initializeCustomerReviews } from "./customer-reviews";
import { initialize as initializePurchaseRequests } from "./purchase-requests";
import { initialize as initializeQuotes } from "./quotes";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

export function initializeModules(router: Router, i18n: I18n) {
  initializeCustomerReviews(i18n);
  initializeQuotes(router, i18n);
  initializePurchaseRequests(router, i18n);
}
