/// <reference types="vite/client" />
/// <reference types="@types/gtag.js" />
/// <reference types="@types/google.maps" />

interface Window {
  gtag: Gtag.Gtag;
  google: typeof google;
  dataLayer: Array<unknown>;
}

interface ImportMetaEnv {
  /** Enables the Module Federation host, build + runtime (VCST-5159). Values "", "false" and "0" mean off. */
  readonly APP_MF_HOST?: string;
  /** JSON map of remote name -> mf-manifest.json URL. Inlined at BUILD time (see modules/federated/README.md). */
  readonly APP_MF_REMOTES?: string;
}
