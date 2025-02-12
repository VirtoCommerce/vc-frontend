import type {
  sendEvent as sendEventFunction,
  productToGtagItem as productToGtagItemFunction,
  lineItemToGtagItem as lineItemToGtagItemFunction,
} from "./utils";
import type { TrackerEventsType } from "client-app/core/types/analytics";

export type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    dataLayer: Array<unknown>;
  }
}

export type ExtendEventsType = ({
  sendEvent,
  productToGtagItem,
  lineItemToGtagItem,
}: {
  sendEvent: typeof sendEventFunction;
  productToGtagItem: typeof productToGtagItemFunction;
  lineItemToGtagItem: typeof lineItemToGtagItemFunction;
}) => TrackerEventsType;

export type InitOptionsType = {
  extendEvents?: ExtendEventsType;
  extendConfig?: Record<string, unknown>;
  extendSet?: Record<string, unknown>;
};
