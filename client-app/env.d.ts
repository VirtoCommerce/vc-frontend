/// <reference types="vite/client" />
/// <reference types="@types/gtag.js" />
/// <reference types="@types/google.maps" />

interface Window {
  gtag: Gtag.Gtag;
  google: typeof google;
  dataLayer: Array<unknown>;
}

/** Whether this build is an MF host (`module_federation_enabled`); see vite.federation.ts. */
declare const __MF_HOST__: boolean;

/** The breakpoints and design tokens a custom section's CSS can use; built by vite.site-builder-design.ts. */
declare const __SB_DESIGN_FACTS__: import("./shared/static-content/custom-sections/design-facts").IDesignFacts;

/** Every icon name `VcIcon` draws; built by vite.site-builder-design.ts, read only by the preview's catalog. */
declare const __SB_ICON_NAMES__: string[];
/** Every icon name `VcShape` takes as its mask; built by vite.site-builder-design.ts. */
declare const __SB_MASK_NAMES__: string[];
/** The most elements an icon of `VcIcon`'s set draws, its own `svg` included. */
declare const __SB_ICON_ELEMENTS__: number;

interface ImportMetaEnv {
  /** JSON map of remote name -> mf-manifest.json URL. Inlined at BUILD time (see core/federation/README.md). */
  readonly APP_MODULES_FEDERATION_REMOTES?: string;
}
