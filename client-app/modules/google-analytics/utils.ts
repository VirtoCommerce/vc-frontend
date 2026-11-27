import { Logger } from "@/core/utilities";
import { lineItemToAnalyticsItem, productToAnalyticsItem } from "@/core/utilities/analytics/items";
import { canUseDOM, DEBUG_PREFIX } from "./constants";
import type { CamelToSnake } from "@/core/types/utility";
import type { AnalyticsEventNameType } from "client-app/core/types/analytics";

// The item mappers live in core, where every tracker shares them; the gtag names and the `Gtag.Item` return type
// stay for `extendEvents` consumers.
export const productToGtagItem: (...args: Parameters<typeof productToAnalyticsItem>) => Gtag.Item =
  productToAnalyticsItem;
export const lineItemToGtagItem: (...args: Parameters<typeof lineItemToAnalyticsItem>) => Gtag.Item =
  lineItemToAnalyticsItem;
export type {
  ConfiguredPriceType,
  ProductToItemContextType as ProductToGtagItemContextType,
} from "@/core/utilities/analytics/items";

type CustomEventNamesType = Exclude<CamelToSnake<AnalyticsEventNameType>, Gtag.EventNames>;
type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;

export function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}
