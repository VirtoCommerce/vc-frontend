/**
 * Hand-written types for manifest.mjs. The shapes themselves live in the contract, so they are
 * versioned with the facade; this file only declares the runtime functions over them.
 */
import type {
  ComparableConditionType,
  ConditionType,
  GlobalConditionType,
  IPluginContributionsType,
  IPluginManifestConfigType,
} from "@vc-frontend/core";

export declare const CONTRIBUTIONS_FILE_NAME: "contributions.json";
export declare const CONTRIBUTIONS_FORMAT: 1;

/** A module setting of the store is truthy. */
export declare function settingEnabled(key: string): GlobalConditionType;
/** A module setting of the store: truthy as it stands, or `.eq(value)`. */
export declare function settingValue(key: string): ComparableConditionType<"global">;
/** A key of the theme's `settings_data.json`: truthy as it stands, or `.eq(value)`. */
export declare function themeSetting(key: string): ComparableConditionType<"global">;
export declare function authenticated(): GlobalConditionType;
/** The user holds every one of these permissions. */
export declare function userCan(...permissions: [string, ...string[]]): GlobalConditionType;

export declare function and<S extends "global" | "slot">(...conditions: [ConditionType<S>, ...ConditionType<S>[]]): ConditionType<S>;
export declare function or<S extends "global" | "slot">(...conditions: [ConditionType<S>, ...ConditionType<S>[]]): ConditionType<S>;
export declare function not<S extends "global" | "slot">(condition: ConditionType<S>): ConditionType<S>;

export declare function definePluginManifest(config: IPluginManifestConfigType): IPluginContributionsType;

/** Structural, so this file does not depend on Vite's types; assignable to a Vite `Plugin`. */
export interface IPluginContributionsVitePlugin {
  name: string;
  apply: "build";
  configResolved(config: { publicDir: string }): void;
  buildStart(): void;
  generateBundle(): void;
}

export declare function pluginContributions(contributions: IPluginContributionsType): IPluginContributionsVitePlugin;
