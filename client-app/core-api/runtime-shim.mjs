/**
 * Runtime target of the `@vc-frontend/core` root export. There is deliberately no
 * standalone runtime implementation: the LIVE facade is injected by the storefront
 * host through the Module Federation shared scope. If this module executes, some
 * tool resolved the package outside that flow - fail with an explanation instead of
 * letting node/bundlers chase raw host TypeScript source.
 */
throw new Error(
  "@vc-frontend/core has no standalone runtime. The host provides the live implementation " +
    "via Module Federation shared scope: mark it as shared in your MF config " +
    '(import { REMOTE_SHARED } from "@vc-frontend/core/federation") so it is never bundled or ' +
    "resolved locally. For type checking, use the bundled contract (dist/index.d.ts).",
);
