/** Shared with the Vite config, which loads it under Node, so this file stays import-free. */
export function isSiteBuilderSwitchOn(settings: { site_builder_enabled?: unknown } | undefined): boolean {
  return settings?.site_builder_enabled === true;
}
