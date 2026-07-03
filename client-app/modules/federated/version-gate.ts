import { satisfies, valid, validRange } from "semver";

/**
 * CONTRACT GATE — the first of the TWO version gates (VCST-5159, #2; see "The two
 * version gates" in ./README.md). Guards the FACADE API CONTRACT: "was this plugin
 * built against a compatible @vc-frontend/core surface?" Evaluated from plain manifest
 * JSON BEFORE any plugin code executes. Its counterpart, the SHARED-DEPENDENCY GATE
 * (core-api/federation.mjs, strictVersion), guards individual shared libraries
 * (vue, @apollo/client, ...) later, during loadRemote().
 *
 * `required` comes from the remote manifest (`metaData.requiredHostVersion`) and may be
 * a full semver range ("^2.53.0", ">=2.53.0 <3"). A bare version ("2.53.0") means
 * "this major, at least this version" (normalized to "^2.53.0") — additive facade
 * changes stay compatible, a major bump does not. A value semver cannot parse NEVER
 * passes: the gate exists to stop incompatible code before it executes, so unparseable
 * input must fail closed, not fall through.
 */

export interface IHostCompatibility {
  ok: boolean;
  /** Human-readable reason when not ok — for the loader's skip log. */
  reason?: string;
}

export function checkHostCompatibility(hostVersion: string, required: string | undefined): IHostCompatibility {
  if (!required) {
    // No requirement declared — the plugin opts out of gating.
    return { ok: true };
  }
  const range = valid(required) ? `^${required}` : required;
  if (!validRange(range)) {
    return { ok: false, reason: `manifest requiredHostVersion "${required}" is not a valid semver version or range` };
  }
  if (!satisfies(hostVersion, range, { includePrerelease: true })) {
    return { ok: false, reason: `requires @vc-frontend/core ${range}, host provides ${hostVersion}` };
  }
  return { ok: true };
}
