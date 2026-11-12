import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { TEST_CARDS, TEST_STAT_IDS } from "../layout-test-utils";
import { statDataNeeds } from "../stat-cards";
import { useStatDataNeeds } from "./useStatDataNeeds";
import type { LayoutVisibilityType } from "../types";

/**
 * The gate a dashboard's statistics composables sit behind: `ready` false holds every query, and `needs`
 * decides which slices those queries ask for. Both are read off the page's layout controller, so each test
 * drives a stand-in for the three things it reads.
 */
function visibility(options: { settled: boolean; visible: readonly string[]; editing?: boolean }) {
  const settled = ref(options.settled);
  const visible = ref<readonly string[]>(options.visible);
  const editing = ref(Boolean(options.editing));
  const layout: LayoutVisibilityType = {
    settled,
    editing,
    visibleIn: (regionId) => (regionId === "statistics" ? visible.value : []),
  };

  return { layout, settled, visible, editing };
}

const ALL_NEEDS = statDataNeeds(TEST_CARDS, TEST_STAT_IDS);

describe("useStatDataNeeds", () => {
  it("holds every query until the layout has been read, even though registry defaults are already known", () => {
    const { layout } = visibility({ settled: false, visible: TEST_STAT_IDS });

    const { needs, ready } = useStatDataNeeds(layout, TEST_CARDS);

    // Fetching the defaults here would be the wasted round trip the whole mechanism exists to remove.
    expect(ready.value).toBe(false);
    expect(needs.value.size).toBe(0);
  });

  it("asks only for what the visible cards need once the read lands", () => {
    const { layout } = visibility({ settled: true, visible: ["alpha"] });

    const { needs, ready } = useStatDataNeeds(layout, TEST_CARDS);

    expect(ready.value).toBe(true);
    expect(needs.value).toEqual(new Set(["count"]));
  });

  it("widens back to every card in edit mode, because the parked zone renders the hidden ones", () => {
    const { layout } = visibility({ settled: true, visible: ["alpha"], editing: true });

    const { needs } = useStatDataNeeds(layout, TEST_CARDS);

    expect(needs.value).toEqual(ALL_NEEDS);
  });

  it("follows the layout rather than latching its first state", () => {
    const { layout, settled, visible, editing } = visibility({ settled: false, visible: [] });

    const { needs, ready } = useStatDataNeeds(layout, TEST_CARDS);
    expect(ready.value).toBe(false);

    settled.value = true;
    visible.value = ["gamma"];
    expect(ready.value).toBe(true);
    expect(needs.value).toEqual(new Set(["people"]));

    editing.value = true;
    expect(needs.value).toEqual(ALL_NEEDS);

    // Leaving edit mode narrows again — to the arrangement the user kept.
    editing.value = false;
    visible.value = ["alpha", "delta"];
    expect(needs.value).toEqual(new Set(["count", "total"]));
  });

  it("asks for nothing while every card is hidden, so no query runs", () => {
    const { layout } = visibility({ settled: true, visible: [] });

    const { needs, ready } = useStatDataNeeds(layout, TEST_CARDS);

    expect(ready.value).toBe(true);
    expect(needs.value.size).toBe(0);
  });
});
