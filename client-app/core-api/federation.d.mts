/**
 * Hand-written types for federation.mjs (which stays plain JS so plugin vite configs
 * can import it natively in node). Keep in sync with the .mjs exports.
 */

export interface ISharedDepConfig {
  singleton: boolean;
  requiredVersion: string;
  /** Present (false) only in REMOTE_SHARED - remotes must not bundle fallback copies. */
  import?: false;
}

export declare const MF_SHARED_RANGES: Record<string, string>;
export declare const HOST_SHARED: Record<string, ISharedDepConfig>;
export declare const REMOTE_SHARED: Record<string, ISharedDepConfig>;
export declare function isMfFlagEnabled(value: string | boolean | undefined): boolean;
