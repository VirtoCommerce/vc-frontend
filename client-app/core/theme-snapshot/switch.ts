/**
 * The predicate behind `new_page_builder_enabled`, shared by the build (vite.page-builder.ts) and the runtime
 * (./enabled) so the two cannot disagree. Only a literal `true` turns it on. Import-free, because the Vite config
 * loads it under Node.
 */
export function isNewPageBuilderSwitchOn(settings: { new_page_builder_enabled?: unknown } | undefined): boolean {
  return settings?.new_page_builder_enabled === true;
}
