// Pure load/save transforms for the saved layout document (VCST-5367). No Vue, no Apollo — the
// reconciliation rules are the part most worth testing, so they live apart from the composable.
import { LAYOUT_REGION_IDS, LAYOUT_SCHEMA_VERSION } from "../constants";
import { reconcileSettings, serializeSettings } from "./settings";
import type { InputSalesRepLayout } from "../api/graphql/types";
import type {
  SalesRepBlockType,
  SalesRepLayoutRegionIdType,
  SalesRepLayoutScopeType,
  SalesRepLayoutStateType,
  SavedLayoutBlockType,
  SavedLayoutType,
} from "../types/layout";

function emptyRegions(): SalesRepLayoutStateType["regions"] {
  return {
    statistics: { visible: [], hidden: [] },
    mainLeft: { visible: [], hidden: [] },
    mainRight: { visible: [], hidden: [] },
  };
}

/** Index by block type, flattened — only relative order is authoritative. Repeats collapse to the first. */
function indexPersistedBlocks(saved: SavedLayoutType | null | undefined) {
  const byType = new Map<string, { index: number; block: SavedLayoutBlockType }>();
  let index = 0;

  for (const region of saved?.regions ?? []) {
    for (const block of region.blocks) {
      if (!byType.has(block.type)) {
        byType.set(block.type, { index: index++, block });
      }
    }
  }

  return byType;
}

/**
 * Merge a persisted document with the current registry.
 *
 * - A persisted type absent from the registry is dropped (the widget left the app).
 * - A registry block absent from the document is appended, so a newly shipped widget cannot shuffle
 *   an arrangement the rep already chose; newcomers sort among themselves by `order`.
 * - Region always comes from the registry, so a widget moved rail-to-main follows the code.
 * - Duplicate types collapse to the first occurrence.
 * - Per-block settings are read through `layout/settings.ts`, which validates every value against
 *   the registry descriptor that declared it.
 *
 * `null`/`undefined` is the never-saved case and yields registry defaults.
 */
export function reconcileLayout(
  saved: SavedLayoutType | null | undefined,
  registry: readonly SalesRepBlockType[],
): SalesRepLayoutStateType {
  const persistedByType = indexPersistedBlocks(saved);
  const regions = emptyRegions();

  for (const regionId of LAYOUT_REGION_IDS) {
    const arranged: { id: string; index: number; hidden: boolean }[] = [];
    const newcomers: SalesRepBlockType[] = [];

    for (const block of registry.filter((candidate) => candidate.region === regionId)) {
      const record = persistedByType.get(block.id);
      if (record) {
        arranged.push({ id: block.id, index: record.index, hidden: record.block.hidden });
      } else {
        newcomers.push(block);
      }
    }

    arranged.sort((a, b) => a.index - b.index);
    newcomers.sort((a, b) => a.order - b.order);

    const entries = [
      ...arranged.map(({ id, hidden }) => ({ id, hidden })),
      ...newcomers.map((block) => ({ id: block.id, hidden: Boolean(block.defaultHidden) })),
    ];

    regions[regionId] = {
      visible: entries.filter((entry) => !entry.hidden).map((entry) => entry.id),
      hidden: entries.filter((entry) => entry.hidden).map((entry) => entry.id),
    };
  }

  const settingsByType = new Map([...persistedByType].map(([type, record]) => [type, record.block]));

  return { regions, settings: reconcileSettings(registry, settingsByType) };
}

/** A block's settings as a comparable string, so two lists match regardless of order. */
function settingsFingerprint(settings: readonly { key: string; value?: unknown }[] | undefined): string {
  return [...(settings ?? [])]
    .map((setting) => `${setting.key}=${String(setting.value)}`)
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}

/**
 * Whether a save's echo agrees with what was sent: every block present, every `hidden` flag and every
 * setting matching.
 *
 * A missing block reconciles to a registry default, reading as "the rep arranged nothing". A wrong
 * `hidden` reverts a hide, and a dropped setting reverts a row cap or a tab choice the same way —
 * these are the fields reconciliation reads back out of the echo. Region grouping is ignored, as
 * everywhere else.
 *
 * A type echoed twice is rejected: reconciliation keeps the first copy, so agreeing with one could
 * leave the rep looking at another.
 */
export function echoMatchesSentBlocks(saved: SavedLayoutType | null | undefined, sent: InputSalesRepLayout): boolean {
  const echoed = new Map<string, SavedLayoutBlockType>();

  for (const region of saved?.regions ?? []) {
    for (const block of region.blocks) {
      if (echoed.has(block.type)) {
        return false;
      }
      echoed.set(block.type, block);
    }
  }

  return sent.regions.every((region) =>
    region.blocks.every((block) => {
      const match = echoed.get(block.type);
      return (
        match?.hidden === block.hidden && settingsFingerprint(match.settings) === settingsFingerprint(block.settings)
      );
    }),
  );
}

/**
 * Build the mutation payload. A save is a full-document replace, so every region, block and setting
 * goes out, hidden ones included — anything omitted is gone.
 */
export function serializeLayout(
  state: SalesRepLayoutStateType,
  scope: SalesRepLayoutScopeType,
  registry: readonly SalesRepBlockType[],
  storeId?: string,
): InputSalesRepLayout {
  const blockOf = (id: string) => registry.find((block) => block.id === id);
  const serialize = (id: string, hidden: boolean) => ({
    id,
    type: id,
    hidden,
    settings: serializeSettings(blockOf(id), state.settings[id]),
  });

  return {
    scope,
    storeId,
    schemaVersion: LAYOUT_SCHEMA_VERSION,
    regions: LAYOUT_REGION_IDS.map((regionId: SalesRepLayoutRegionIdType) => ({
      id: regionId,
      blocks: [
        ...state.regions[regionId].visible.map((id) => serialize(id, false)),
        ...state.regions[regionId].hidden.map((id) => serialize(id, true)),
      ],
    })),
  };
}
