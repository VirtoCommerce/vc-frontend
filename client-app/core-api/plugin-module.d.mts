/** Hand-written types for plugin-module.mjs. Keep in sync with the .mjs exports. */

export declare const STOREFRONT_APP_DIR: string;
export declare const PLUGIN_APP_ID: string;
export declare const PLUGIN_OUT_DIR: string;
export declare const TARGETS_FILE: string;
export declare const TARGETS_IMPORT: string;
export declare const STOREFRONT_PLUGIN_TARGETS: string;

export interface ICheckResult {
  status: "pass" | "warn" | "fail";
  message: string;
  /** What to change, when the check did not pass. */
  fix?: string;
}

export interface IModuleManifestFacts {
  id: string | undefined;
  platformVersion: string | undefined;
  dependencies: Record<string, string | undefined>;
}

export declare function parseModuleManifest(xml: string): IModuleManifestFacts;
export declare function checkModuleFiles(webDir: string): ICheckResult[];
export declare function listZipEntries(buffer: Buffer): string[];
export declare function checkArtifact(zipPath: string): ICheckResult[];
export declare function checkEnvironment(
  storefrontUrl: string,
  /** `moduleId` (from module.manifest) adds a check that the plugin's own module is installed. */
  plugin: { pluginId: string; moduleId?: string },
  request?: (input: URL, init?: RequestInit) => Promise<Response>,
): Promise<ICheckResult[]>;
export declare function formatResults(results: ICheckResult[]): string;
