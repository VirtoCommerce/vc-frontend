import type { capture as captureFunction } from "./client";
import type { TrackerEventsType } from "@/core/types/analytics";
import type {
  lineItemToAnalyticsItem as lineItemToAnalyticsItemFunction,
  productToAnalyticsItem as productToAnalyticsItemFunction,
} from "@/core/utilities/analytics/items";

export type ExtendEventsType = ({
  capture,
  productToAnalyticsItem,
  lineItemToAnalyticsItem,
}: {
  capture: typeof captureFunction;
  productToAnalyticsItem: typeof productToAnalyticsItemFunction;
  lineItemToAnalyticsItem: typeof lineItemToAnalyticsItemFunction;
}) => TrackerEventsType;

export type InitOptionsType = {
  extendEvents?: ExtendEventsType;
};
