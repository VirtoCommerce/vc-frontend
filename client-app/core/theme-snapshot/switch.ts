/** Shared with the Vite config, which loads it under Node, so this file stays import-free. */
export function isNewPageBuilderSwitchOn(settings: { new_page_builder_enabled?: unknown } | undefined): boolean {
  return settings?.new_page_builder_enabled === true;
}
