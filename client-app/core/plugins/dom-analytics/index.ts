import { startEngine } from "./engine";
import { vTrackItem } from "./registry";
import { rules as defaultRules } from "./rules";
import type { RuleType } from "./types";
import type { App, Plugin } from "vue";

/**
 * Sends analytics events described by markup. See `./README.md`.
 * @example
 *  app.use(domAnalyticsPlugin, { rules: [...rules, myRule] });
 */
export const domAnalyticsPlugin: Plugin<[{ rules?: RuleType[] }?]> = {
  install: (app: App, { rules = defaultRules } = {}) => {
    app.directive("track-item", vTrackItem);
    startEngine(rules);
  },
};
