import { satisfies, valid, validRange } from "semver";

/**
 * CONTRACT GATE — the first of the TWO version gates (see "The two
 * version gates" in ./README.md). Guards the FACADE API CONTRACT: "was this plugin
 * built against a compatible @vc-frontend/core surface?" Evaluated from plain manifest
 * JSON BEFORE any plugin code executes. Its counterpart, the SHARED-DEPENDENCY GATE
 * (core-api/federation.mjs, strictVersion), guards individual shared libraries
 * (vue, @apollo/client, ...) later, during loadRemote().
 *
 * `required` comes from the remote manifest (`metaData.requiredHostVersion`) and may be
 * a full semver range ("^1.2.0", ">=1.2.0 <2"). A bare version ("1.2.0") means
 * "this major, at least this version" (normalized to "^1.2.0") — additive facade
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
    // Fail closed: this gate exists to stop code built against an unknown host contract.
    // A manifest with no requiredHostVersion cannot be verified, so it is skipped rather
    // than run. createRemoteFederationOptions makes the field mandatory, so a compliant
    // plugin always carries it — only hand-rolled, legacy, or stripped manifests land here.
    return { ok: false, reason: "manifest declares no requiredHostVersion — cannot verify host compatibility" };
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
