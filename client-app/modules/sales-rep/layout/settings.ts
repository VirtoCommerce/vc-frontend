// Per-block settings: the translation between the UI's shape and the flat scalar key/value list the
// backend stores (VCST-5649). Pure, like layout/document.ts — reading is where the validation and
// fallback rules live, so it is the part worth testing. `settings.value` is a scalar only, which is
// why the status-tab selection is flattened into one sibling key per unchecked rule.
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
 * - A `tab.` key naming a rule the backend no longer returns is kept here and dropped by
 *   `knownHiddenTabs`, which is the only place a live catalog is known.
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
  // A Set, so a name stored twice cannot go back out twice and make a save that succeeded read as a
  // disagreeing echo against a backend that deduplicates.
  const hiddenTabs = new Set<string>();
  let maxRows = rows?.default;

  for (const setting of saved ?? []) {
    if (rows && setting.key === SETTING_MAX_ROWS) {
      maxRows = clampRows(setting.value, rows);
    } else if (wantsTabs && setting.key.startsWith(SETTING_HIDDEN_TAB_PREFIX) && meansHidden(setting.value)) {
      hiddenTabs.add(setting.key.slice(SETTING_HIDDEN_TAB_PREFIX.length));
    }
  }

  return { maxRows, hiddenTabs: [...hiddenTabs] };
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
 * Hiding every rule is allowed: the chips row keeps its synthetic "All" baseline either way, so the
 * strip is never empty and the rep can always see their unfiltered orders.
 */
export function visibleTabRules<T extends { name: string }>(rules: readonly T[], hiddenTabs: readonly string[]): T[] {
  return rules.filter((rule) => !hiddenTabs.includes(rule.name));
}

/**
 * The stored list with names the backend no longer returns dropped, and repeats collapsed — what the
 * editor's checkboxes read, and the only cleanup safe to apply on the rep's behalf.
 *
 * An empty catalog means the rules query has not resolved (or failed, which leaves it empty for the
 * session), not that everything was retired — pruning then would erase the rep's whole selection.
 */
export function knownHiddenTabs(rules: readonly { name: string }[], hiddenTabs: readonly string[]): string[] {
  if (!rules.length) {
    return [...hiddenTabs];
  }

  const known = new Set(rules.map((rule) => rule.name));
  return [...new Set(hiddenTabs.filter((name) => known.has(name)))];
}

/** Toggling from the edit-mode checkboxes. Any rule can be unchecked, the last one included. */
export function toggleTabRule(hiddenTabs: readonly string[], name: string): readonly string[] {
  return hiddenTabs.includes(name) ? hiddenTabs.filter((hidden) => hidden !== name) : [...hiddenTabs, name];
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
