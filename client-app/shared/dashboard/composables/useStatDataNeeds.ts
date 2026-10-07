import { computed } from "vue";
import { statDataNeeds } from "../stat-cards";
import type { IStatCardDefType } from "../stat-cards";
import type { LayoutVisibilityType, StatDataNeedsType } from "../types";

/**
 * What the statistics queries behind `cards` should fetch, read off the page's layout controller — the same
 * object the page hands `<LayoutSurface>`, so the queries and the stat row can never disagree on what is shown.
 *
 * `ready` is false until the saved layout has been read (or the read has failed, which makes the registry
 * defaults final), and a dashboard's statistics composables hold their queries until then. That is not a new
 * wait: the surface renders nothing but a skeleton until the same read lands, so figures fetched earlier could
 * not have been painted — and fetching for the defaults first would ask for the full set and narrow after.
 *
 * `needs` is the union over the visible cards, so a hidden card costs nothing (VCST-5647) — or over every card
 * while editing, because the parked zone renders the hidden cards too and they would otherwise sit at zero.
 */
export function useStatDataNeeds<TNeed extends string>(
  layout: LayoutVisibilityType,
  cards: readonly IStatCardDefType<TNeed>[],
): StatDataNeedsType<TNeed> {
  const needs = computed<ReadonlySet<TNeed>>(() => {
    if (!layout.settled.value) {
      return new Set<TNeed>();
    }

    const shown = layout.editing.value ? cards.map((card) => card.key) : layout.visibleIn("statistics");
    return statDataNeeds(cards, shown);
  });

  return { needs, ready: layout.settled };
}
