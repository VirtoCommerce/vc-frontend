export type CustomEventNamesType = "place_order" | "clear_cart";
export type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    dataLayer: Array<unknown>;
  }
}
