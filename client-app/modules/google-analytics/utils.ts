import { Logger } from "@/core/utilities";
import { canUseDOM, DEBUG_PREFIX } from "./constants";
import type { CamelToSnake } from "@/core/types/utility";
import type { AnalyticsEventNameType } from "client-app/core/types/analytics";

// The item mappers live in core, where every tracker shares them; the gtag names stay for `extendEvents` consumers.
export {
  productToAnalyticsItem as productToGtagItem,
  lineItemToAnalyticsItem as lineItemToGtagItem,
} from "@/core/utilities/analytics/items";
export type { ProductToItemContextType as ProductToGtagItemContextType } from "@/core/utilities/analytics/items";

type CustomEventNamesType = Exclude<CamelToSnake<AnalyticsEventNameType>, Gtag.EventNames>;
type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;

export function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}
