/**
 * Hand-written types for federation.mjs (which stays plain JS so plugin vite configs
 * can import it natively in node). Keep in sync with the .mjs exports.
 */

export interface ISharedDepConfig {
  singleton: boolean;
  /** MF throws (instead of warning) when the provided version misses requiredVersion. */
  strictVersion: boolean;
  requiredVersion?: string;
  /** Concrete version to announce to the MF runtime (host side, source-linked packages). */
  version?: string;
  /**
   * `false` in remote configs (remotes must not bundle fallback copies); a module
   * path string on the host side for source-linked packages that Node resolution
   * cannot find (the MF build resolves shared providers without Vite aliases).
   */
  import?: false | string;
}

/** Per-package overrides: partial config to merge, or `false` to drop the package. */
export type SharedOverridesType = Record<string, Partial<ISharedDepConfig> | false>;

export declare const MF_SHARED_RANGES: Record<string, string>;
export declare function createHostShared(overrides?: SharedOverridesType): Record<string, ISharedDepConfig>;
export declare function createRemoteShared(overrides?: SharedOverridesType): Record<string, ISharedDepConfig>;
export declare const HOST_SHARED: Record<string, ISharedDepConfig>;
export declare const REMOTE_SHARED: Record<string, ISharedDepConfig>;

export interface IRemoteFederationOptions {
  name: string;
  filename: string;
  exposes: Record<string, string>;
  shared: Record<string, ISharedDepConfig>;
  manifest: {
    // Param/return must stay assignable to @module-federation/vite's PluginManifestOptions
    // (stats is a bare Record there, and it expects the modified stats back), so a plugin's
    // `federation(createRemoteFederationOptions(...))` type-checks. The .mjs impl narrows
    // stats.metaData itself at runtime.
    additionalData: (data: { stats: Record<string, unknown> }) => Record<string, unknown>;
  };
  dts: false;
}

export declare function createRemoteFederationOptions(options: {
  name: string;
  requiredHostVersion: string;
  exposes?: Record<string, string>;
  sharedOverrides?: SharedOverridesType;
}): IRemoteFederationOptions;

export declare function isMfFlagEnabled(value: string | boolean | undefined): boolean;
