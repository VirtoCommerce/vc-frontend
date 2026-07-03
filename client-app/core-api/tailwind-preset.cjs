/**
 * The host's Tailwind design system, exposed for PLUGIN builds as
 * `@vc-frontend/core/tailwind-preset` (VCST-5159). Plugins inherit every token -
 * colors resolve through the host's CSS custom properties at runtime - and override
 * only `content` to scan their own sources. Tailwind loads configs through jiti,
 * which handles the host's TypeScript config; requires an installed host checkout
 * (which the portal: dependency implies).
 */
module.exports = require("../../tailwind.config");
