// Pure load/save transforms for the saved layout document (VCST-5367). No Vue, no Apollo — the
// reconciliation rules are the part most worth testing, so they live apart from the composable.
import { LAYOUT_REGION_IDS, LAYOUT_SCHEMA_VERSION } from "../constants";
import type { InputSalesRepLayout } from "../api/graphql/types";
import type {
  SalesRepBlockType,
  SalesRepLayoutRegionIdType,
  SalesRepLayoutScopeType,
  SalesRepLayoutStateType,
  SavedLayoutType,
} from "../types/layout";

function emptyState(): SalesRepLayoutStateType {
  return {
    statistics: { visible: [], hidden: [] },
    mainLeft: { visible: [], hidden: [] },
    mainRight: { visible: [], hidden: [] },
  };
}

/** Index by block type, flattened — only relative order is authoritative. Repeats collapse to the first. */
function indexPersistedBlocks(saved: SavedLayoutType | null | undefined) {
  const byType = new Map<string, { index: number; hidden: boolean }>();
  let index = 0;

  for (const region of saved?.regions ?? []) {
    for (const block of region.blocks) {
      if (!byType.has(block.type)) {
        byType.set(block.type, { index: index++, hidden: block.hidden });
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
 *
 * `null`/`undefined` is the never-saved case and yields registry defaults.
 */
export function reconcileLayout(
  saved: SavedLayoutType | null | undefined,
  registry: readonly SalesRepBlockType[],
): SalesRepLayoutStateType {
  const persistedByType = indexPersistedBlocks(saved);
  const state = emptyState();

  for (const regionId of LAYOUT_REGION_IDS) {
    const arranged: { id: string; index: number; hidden: boolean }[] = [];
    const newcomers: SalesRepBlockType[] = [];

    for (const block of registry.filter((candidate) => candidate.region === regionId)) {
      const record = persistedByType.get(block.id);
      if (record) {
        arranged.push({ id: block.id, index: record.index, hidden: record.hidden });
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

    state[regionId] = {
      visible: entries.filter((entry) => !entry.hidden).map((entry) => entry.id),
      hidden: entries.filter((entry) => entry.hidden).map((entry) => entry.id),
    };
  }

  return state;
}

/**
 * Whether a save's echo agrees with what was sent: every block present, every `hidden` flag matching.
 *
 * A missing block reconciles to a registry default, reading as "the rep arranged nothing". A wrong
 * `hidden` reverts a hide, since that is the field reconciliation reads back out of the echo. Region
 * grouping is ignored, as everywhere else.
 */
export function echoMatchesSentBlocks(saved: SavedLayoutType | null | undefined, sent: InputSalesRepLayout): boolean {
  const echoed = new Map(
    (saved?.regions ?? []).flatMap((region) => region.blocks.map((block) => [block.type, block.hidden] as const)),
  );

  return sent.regions.every((region) =>
    region.blocks.every((block) => echoed.has(block.type) && echoed.get(block.type) === block.hidden),
  );
}

/**
 * Build the mutation payload. A save is a full-document replace, so every region and block goes out,
 * hidden included. `settings` is required but v1 persists order and visibility only, so it is empty.
 */
export function serializeLayout(
  state: SalesRepLayoutStateType,
  scope: SalesRepLayoutScopeType,
  storeId?: string,
): InputSalesRepLayout {
  return {
    scope,
    storeId,
    schemaVersion: LAYOUT_SCHEMA_VERSION,
    regions: LAYOUT_REGION_IDS.map((regionId: SalesRepLayoutRegionIdType) => ({
      id: regionId,
      blocks: [
        ...state[regionId].visible.map((id) => ({ id, type: id, hidden: false, settings: [] })),
        ...state[regionId].hidden.map((id) => ({ id, type: id, hidden: true, settings: [] })),
      ],
    })),
  };
}
