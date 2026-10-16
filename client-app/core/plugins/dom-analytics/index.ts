import { rescan, startEngine } from "./engine";
import { vTrackItem } from "./registry";
import { rules as defaultRules } from "./rules";
import type { RuleType } from "./types";
import type { App, Plugin } from "vue";

const activeRules: RuleType[] = [...defaultRules];

/**
 * Adds rules on top of the default ones. Safe to call before or after the plugin is installed.
 * @example
 *  // modules/my-module/index.ts
 *  export function init(): void {
 *    addRules([myRule]);
 *  }
 */
export function addRules(rules: RuleType[]): void {
  activeRules.push(...rules);
  rescan();
}

/** Sends analytics events described by markup. See `./README.md`. */
export const domAnalyticsPlugin: Plugin = {
  install: (app: App) => {
    app.directive("track-item", vTrackItem);
    startEngine(activeRules);
  },
};
