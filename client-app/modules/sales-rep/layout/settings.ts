// Per-block settings: the translation between the UI's shape and the flat scalar key/value list the
// backend stores (VCST-5649). Pure, like layout/document.ts — reading is where every fallback rule
// lives, so it is the part worth testing.
//
// `settings.value` is a scalar only; lists and objects are not valid, which is why the status-tab
// selection is flattened into one sibling key per unchecked rule.
import { SETTING_HIDDEN_TAB_PREFIX, SETTING_MAX_ROWS } from "../constants";
import type {
  SalesRepBlockSettingsType,
  SalesRepBlockSettingType,
  SalesRepBlockType,
  SavedLayoutBlockType,
  SavedLayoutSettingType,
} from "../types/layout";

const EMPTY_SETTINGS: SalesRepBlockSettingsType = { hiddenTabs: [] };

function declaredSettings(block: SalesRepBlockType): readonly SalesRepBlockSettingType[] {
  return ("settings" in block ? block.settings : undefined) ?? [];
}

export function blockHasSetting(block: SalesRepBlockType, kind: SalesRepBlockSettingType["kind"]): boolean {
  return declaredSettings(block).some((setting) => setting.kind === kind);
}

export function maxRowsSetting(
  block: SalesRepBlockType | undefined,
): Extract<SalesRepBlockSettingType, { kind: "maxRows" }> | undefined {
  return block && declaredSettings(block).find((setting) => setting.kind === "maxRows");
}

/** The string form counts: the echo guard compares values stringified, so reading them differently
 * would let a save look agreed and read back reverted. */
function meansHidden(value: unknown): boolean {
  return value === false || value === "false";
}

function clampRows(value: unknown, setting: Extract<SalesRepBlockSettingType, { kind: "maxRows" }>): number {
  // The type gate is load-bearing: `Number` maps `null` to 0 and `true` to 1, so without it a value
  // that means nothing here would clamp to the minimum and look deliberate. Past it, `Number` rather
  // than `parseInt`, so a string that is not entirely numeric ("5 rows") falls back instead of
  // reading as 5.
  const numeric = typeof value === "number" || (typeof value === "string" && value.trim() !== "");
  const parsed = numeric ? Math.trunc(Number(value)) : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return setting.default;
  }
  return Math.min(Math.max(parsed, setting.min), setting.max);
}

/**
 * Read one block's persisted settings.
 *
 * - A value the block does not declare is ignored, so a setting removed from the registry cannot
 *   resurrect itself, and a key from another block's vocabulary is inert.
 * - `maxRows` is coerced and clamped to the block's own bounds; anything non-numeric falls back.
 * - A `tab.` key naming a rule the backend no longer returns stays in state harmlessly — only the
 *   rules the widget actually renders are ever consulted.
 */
export function parseSettings(
  block: SalesRepBlockType,
  saved: readonly SavedLayoutSettingType[] | undefined,
): SalesRepBlockSettingsType {
  const declared = declaredSettings(block);
  if (!declared.length) {
    return EMPTY_SETTINGS;
  }

  const rows = maxRowsSetting(block);
  const wantsTabs = blockHasSetting(block, "ruleTabs");
  const hiddenTabs: string[] = [];
  let maxRows = rows?.default;

  for (const setting of saved ?? []) {
    if (rows && setting.key === SETTING_MAX_ROWS) {
      maxRows = clampRows(setting.value, rows);
    } else if (wantsTabs && setting.key.startsWith(SETTING_HIDDEN_TAB_PREFIX) && meansHidden(setting.value)) {
      hiddenTabs.push(setting.key.slice(SETTING_HIDDEN_TAB_PREFIX.length));
    }
  }

  return { maxRows, hiddenTabs };
}

/** The flat list that goes back to the backend. Values equal to the default are still written —
 * a save is a full-document replace, so anything omitted is simply gone. */
export function serializeSettings(
  block: SalesRepBlockType | undefined,
  values: SalesRepBlockSettingsType | undefined,
): SavedLayoutSettingType[] {
  if (!block || !values) {
    return [];
  }

  const settings: SavedLayoutSettingType[] = [];
  const rows = maxRowsSetting(block);

  if (rows) {
    settings.push({ key: SETTING_MAX_ROWS, value: clampRows(values.maxRows, rows) });
  }

  if (blockHasSetting(block, "ruleTabs")) {
    for (const name of values.hiddenTabs) {
      settings.push({ key: `${SETTING_HIDDEN_TAB_PREFIX}${name}`, value: false });
    }
  }

  return settings;
}

/**
 * Which of a widget's filter rules to offer as tabs, in catalog order.
 *
 * The all-hidden fallback is not paranoia: the editor keeps at least one box checked, but a document
 * saved before a status was retired can still hide every rule the backend returns today, and a tab
 * strip with no tabs cannot be recovered from the UI.
 */
export function visibleTabRules<T extends { name: string }>(rules: readonly T[], hiddenTabs: readonly string[]): T[] {
  const visible = rules.filter((rule) => !hiddenTabs.includes(rule.name));
  return visible.length ? visible : [...rules];
}

/**
 * The complement of `visibleTabRules` — what the editor's checkboxes read.
 *
 * Under the all-hidden fallback the stored list would render every box unchecked while every tab
 * renders. Names the backend no longer returns fall out here too.
 */
export function hiddenTabsInEffect(rules: readonly { name: string }[], hiddenTabs: readonly string[]): string[] {
  const shown = new Set(visibleTabRules(rules, hiddenTabs).map((rule) => rule.name));
  return rules.filter((rule) => !shown.has(rule.name)).map((rule) => rule.name);
}

/** Toggling from the edit-mode checkboxes; the last checked rule cannot be unchecked. */
export function toggleTabRule(
  rules: readonly { name: string }[],
  hiddenTabs: readonly string[],
  name: string,
): readonly string[] {
  if (!hiddenTabs.includes(name)) {
    return visibleTabRules(rules, hiddenTabs).length > 1 ? [...hiddenTabs, name] : hiddenTabs;
  }
  return hiddenTabs.filter((hidden) => hidden !== name);
}

/** Every configurable block's settings, read out of a persisted document (or its defaults). */
export function reconcileSettings(
  registry: readonly SalesRepBlockType[],
  persistedByType: ReadonlyMap<string, SavedLayoutBlockType>,
): Record<string, SalesRepBlockSettingsType> {
  const settings: Record<string, SalesRepBlockSettingsType> = {};

  for (const block of registry) {
    if (declaredSettings(block).length) {
      settings[block.id] = parseSettings(block, persistedByType.get(block.id)?.settings);
    }
  }

  return settings;
}
