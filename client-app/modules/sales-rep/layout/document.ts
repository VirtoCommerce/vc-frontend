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

/**
 * Index the document by block type. Flattened across regions on purpose: the document's own region
 * grouping is not authoritative, only the relative order of the blocks the rep arranged. A repeated
 * type collapses to its first occurrence.
 */
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
 * Merge a persisted document with the current block registry.
 *
 * - A persisted block whose `type` is not in the registry is DROPPED (the widget left the app).
 * - A registry block missing from the document is APPENDED to its region, after everything the rep
 *   arranged, ordered among its fellow newcomers by `order`. Appending rather than inserting keeps
 *   a newly shipped widget from shuffling an arrangement the rep already chose.
 * - Region always comes from the registry, never from the document — so when a widget moves
 *   rail-to-main in a later release, saved layouts follow the code instead of pinning a stale spot.
 * - Duplicate types in the document collapse to their first occurrence.
 *
 * `saved` of `null`/`undefined` is the normal never-saved case and yields pure registry defaults.
 *
 * The assembled order is split into the region's two halves last, so the flat document index still
 * decides relative order — within a half, which is the only place it shows.
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
 * Whether a save's echoed document accounts for every block that was sent. Presence alone is not
 * enough to trust it: `reconcileLayout` fills anything absent from registry defaults, so a partial
 * echo reads as "the rep arranged nothing". Region grouping is ignored, as everywhere else.
 */
export function echoCoversSentBlocks(saved: SavedLayoutType | null | undefined, sent: InputSalesRepLayout): boolean {
  const echoed = new Set((saved?.regions ?? []).flatMap((region) => region.blocks.map((block) => block.type)));

  return sent.regions.every((region) => region.blocks.every((block) => echoed.has(block.type)));
}

/**
 * Build the mutation payload. Saves are a full-document replace, so every region and every block —
 * hidden ones included — must be present. `settings` is a required list; v1 persists order and
 * visibility only, so it always goes out empty.
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
