/**
 * The predicate behind `module_federation_enabled`, shared by the build (vite.federation.ts) and the
 * runtime (./enabled) so the two cannot disagree. Only a literal `true` turns remote code loading on:
 * a missing key, `"true"`, `1` and every other value mean off. Import-free, because the Vite config
 * loads it under Node.
 */
export function isFederationSwitchOn(settings: { module_federation_enabled?: unknown } | undefined): boolean {
  return settings?.module_federation_enabled === true;
}
