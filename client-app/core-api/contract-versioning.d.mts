/** Hand-written types for contract-versioning.mjs. Keep in sync with the .mjs exports. */

export declare function extractExportNames(declarations: string): Set<string>;

export interface IVersionFacts {
  changed: boolean;
  baseVersion: string | undefined;
  currentVersion: string;
  removedExports: string[];
  /**
   * Is `baseVersion` a PUBLISHED contract? Gates the "a released line only moves forward" check —
   * before the first release nothing is installed anywhere, so resetting the line is legitimate.
   * Defaults to true, so a caller that does not know must be assumed to be judging a release.
   */
  released?: boolean;
}

export type VersionActionType =
  | { action: "none"; reason: string }
  | { action: "bump-minor" }
  | { action: "bump-patch" }
  | { action: "require-major"; removedExports: string[] }
  | { action: "require-minor"; removedExports: string[] }
  | {
      action: "require-forward-version";
      baseVersion: string | undefined;
      currentVersion: string;
      removedExports: string[];
    };

export declare function decideVersionAction(facts: IVersionFacts): VersionActionType;
