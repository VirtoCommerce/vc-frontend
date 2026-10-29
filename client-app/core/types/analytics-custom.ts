import type { EventParamsType } from "@/core/types/analytics";

export type FormSubmitParamsAdditionalType = { success?: boolean; errors?: string };

export interface ICustomAnalyticsEventMap {
  // NOTE: Add custom event maps here to either extend or override the basic event map
  /** A form the visitor started on (a page or a modal), named by the feature: `quote_request`, `sign_up`. */
  formOpen: [formName: string, params?: EventParamsType];
  formSubmit: [formName: string, params?: EventParamsType & FormSubmitParamsAdditionalType];
}
