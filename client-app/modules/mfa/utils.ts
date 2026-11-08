import { compareVersions } from "@/core/utilities";
import { SCHEMA_RELEASES } from "./constants";

/** Whether a release of the MFA module serves the `mfa` xAPI schema; see SCHEMA_RELEASES. */
export function hasMfaSchema(version: string): boolean {
  const latest = SCHEMA_RELEASES.at(-1);
  if (latest && compareVersions(version, latest) >= 0) {
    return true;
  }

  // An older release line has the schema only from its first release listed there, e.g. "3.1000." from 3.1000.2
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: typed string parameter
  const releaseLine = version.slice(0, version.lastIndexOf(".") + 1);
  const firstRelease = SCHEMA_RELEASES.find((release) => release.startsWith(releaseLine));

  return !!firstRelease && compareVersions(version, firstRelease) >= 0;
}
