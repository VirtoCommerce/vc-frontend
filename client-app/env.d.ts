/// <reference types="vite/client" />
/// <reference types="@types/gtag.js" />
/// <reference types="@types/google.maps" />

interface Window {
  gtag: Gtag.Gtag;
  google: typeof google;
  dataLayer: Array<unknown>;
}

interface ImportMetaEnv {
  /** JSON map of remote name -> mf-manifest.json URL. Inlined at BUILD time (see modules/federated/README.md). */
  readonly APP_MODULES_FEDERATION_REMOTES?: string;
}
