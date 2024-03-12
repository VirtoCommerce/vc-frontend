/// <reference types="vite/client" />
declare global {
  interface GlobalContext {
    gtag: (...args: unknown) => unknown;
    dataLayer: Array<unknown>;
  }
}
