/** Types for manifest.mjs; the shapes live in the contract. */
import type {
  ComparableConditionType,
  ConditionType,
  GlobalConditionType,
  IPluginContributionsType,
  IPluginManifestConfigType,
} from "@vc-frontend/core";

export declare const CONTRIBUTIONS_FORMAT: 1;

/** A store module setting is `true`. */
export declare function settingEnabled(key: string): GlobalConditionType;
/** A store module setting is `true`, or `.eq(value)`. */
export declare function settingValue(key: string): ComparableConditionType<"global">;
/** A `settings_data.json` key is `true`, or `.eq(value)`. */
export declare function themeSetting(key: string): ComparableConditionType<"global">;
export declare function authenticated(): GlobalConditionType;
/** The user holds all of these permissions. */
export declare function userCan(...permissions: [string, ...string[]]): GlobalConditionType;

export declare function and<S extends "global" | "slot">(...conditions: [ConditionType<S>, ...ConditionType<S>[]]): ConditionType<S>;
export declare function or<S extends "global" | "slot">(...conditions: [ConditionType<S>, ...ConditionType<S>[]]): ConditionType<S>;
export declare function not<S extends "global" | "slot">(condition: ConditionType<S>): ConditionType<S>;

export declare function definePluginManifest(config: IPluginManifestConfigType): IPluginContributionsType;

/** Structural, to avoid depending on Vite's types. */
export interface IPluginContributionsVitePlugin {
  name: string;
  apply: "build";
  configResolved(config: { publicDir: string; root: string; build: { outDir: string } }): void;
  buildStart(): void;
  closeBundle(): void;
}

export declare function pluginContributions(contributions: IPluginContributionsType): IPluginContributionsVitePlugin;
