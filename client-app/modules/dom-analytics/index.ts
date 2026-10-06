import { startEngine } from "./core";
import { vTrackItem } from "./registry";
import type { RuleType } from "./types";
import type { App } from "vue";

export type { RuleType } from "./types";

export function init(app: App, rules: RuleType[]): () => void {
  app.directive("track-item", vTrackItem);
  return startEngine(rules);
}
