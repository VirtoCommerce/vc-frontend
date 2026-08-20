/** Hand-written types for contract-versioning.mjs. Keep in sync with the .mjs exports. */

export declare function extractExportNames(declarations: string): Set<string>;

export interface IVersionFacts {
  changed: boolean;
  baseVersion: string | undefined;
  currentVersion: string;
  removedExports: string[];
}

export type VersionActionType =
  | { action: "none"; reason: string }
  | { action: "bump-minor" }
  | { action: "bump-patch" }
  | { action: "require-major"; removedExports: string[] }
  | { action: "require-minor"; removedExports: string[] };

export declare function decideVersionAction(facts: IVersionFacts): VersionActionType;
