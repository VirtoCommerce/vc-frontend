import { computed, reactive } from "vue";
import { allStatDataNeeds, statDataNeeds } from "../layout/stat-data-needs";
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { StatDataNeedType } from "../types/widgets";

/** What a surface's layout publishes about its stat row. */
type StatVisibilityType = {
  /** False until the saved document has been read (or the read has failed). Before that `visible` is
   * registry defaults, and fetching those would mean asking for the full set and narrowing after —
   * a wasted round trip, which is the thing this whole mechanism removes. */
  settled: boolean;
  visible: readonly string[];
  editing: boolean;
};

// Module-local and scope-keyed, in the manner of layout/registry.ts. Not provide/inject: the layout is
// resolved inside <LayoutSurface>, a CHILD of the page that owns the statistics composables, so it
// cannot be injected upwards. One-way — the layout writes, the statistics read.
const visibilityByScope = reactive(new Map<SalesRepLayoutScopeType, StatVisibilityType>());

/** Called by useSalesRepLayout for the surface it drives. */
export function publishStatVisibility(scope: SalesRepLayoutScopeType, visibility: StatVisibilityType): void {
  visibilityByScope.set(scope, visibility);
}

/** Called when a layout surface goes away, so the next mount waits for its own read rather than
 * shaping queries from the last one's arrangement. */
export function clearStatVisibility(scope: SalesRepLayoutScopeType): void {
  visibilityByScope.delete(scope);
}

/**
 * What the statistics queries on `scope` should fetch.
 *
 * `ready` is false until the surface's layout has been read, and the statistics composables hold their
 * queries until then. This is not a new wait: <LayoutSurface> already renders nothing but a skeleton
 * until the same read lands, so figures fetched earlier could not have been painted anyway.
 *
 * A scope must therefore have a <LayoutSurface> mounted for it, which both hub pages do — the stat row
 * is what LayoutSurface renders.
 */
export function useStatDataNeeds(scope: SalesRepLayoutScopeType) {
  const visibility = computed(() => visibilityByScope.get(scope));
  const ready = computed(() => Boolean(visibility.value?.settled));

  const needs = computed<ReadonlySet<StatDataNeedType>>(() => {
    const current = visibility.value;
    if (!current?.settled) {
      return new Set<StatDataNeedType>();
    }

    // Edit mode also renders the hidden cards, in the parked zone, so their figures are needed back.
    return current.editing ? allStatDataNeeds(scope) : statDataNeeds(scope, current.visible);
  });

  return { needs, ready };
}
