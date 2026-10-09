import { afterEach, describe, expect, it } from "vitest";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";
import { STAT_CARDS } from "../layout/stat-cards";
import { allStatDataNeeds, statDataNeeds } from "../layout/stat-data-needs";
import { clearStatVisibility, publishStatVisibility, useStatDataNeeds } from "./useStatDataNeeds";
import type { SalesRepLayoutScopeType } from "../types/layout";

/**
 * The gate the statistics composables sit behind: `ready` false holds every query, and `needs` decides
 * which slices those queries ask for. The visibility it reads is module state written by
 * <LayoutSurface>'s useSalesRepLayout, so each test publishes it explicitly and clears it after.
 */
const scope: SalesRepLayoutScopeType = DASHBOARD_LAYOUT_SCOPE;

const everyCardKey = STAT_CARDS[scope].map((card) => card.key);

afterEach(() => {
  clearStatVisibility(scope);
});

describe("useStatDataNeeds", () => {
  it("holds every query until the layout has been read", () => {
    // Nothing published yet — the surface has not resolved its document.
    const { needs, ready } = useStatDataNeeds(scope);

    expect(ready.value).toBe(false);
    expect(needs.value.size).toBe(0);
  });

  it("still holds them while the read is in flight, even though registry defaults are already known", () => {
    publishStatVisibility(scope, { settled: false, visible: everyCardKey, editing: false });

    const { needs, ready } = useStatDataNeeds(scope);

    // Fetching the defaults here would be the wasted round trip the whole mechanism exists to remove.
    expect(ready.value).toBe(false);
    expect(needs.value.size).toBe(0);
  });

  it("asks only for what the visible cards need once the read lands", () => {
    const visible = [everyCardKey[0]];
    publishStatVisibility(scope, { settled: true, visible, editing: false });

    const { needs, ready } = useStatDataNeeds(scope);

    expect(ready.value).toBe(true);
    expect(needs.value).toEqual(statDataNeeds(scope, visible));
    expect(needs.value.size).toBeLessThan(allStatDataNeeds(scope).size);
  });

  it("widens back to every card in edit mode, because the parked zone renders the hidden ones", () => {
    publishStatVisibility(scope, { settled: true, visible: [everyCardKey[0]], editing: true });

    const { needs } = useStatDataNeeds(scope);

    expect(needs.value).toEqual(allStatDataNeeds(scope));
  });

  it("reacts to a later publish rather than latching the first one", () => {
    publishStatVisibility(scope, { settled: false, visible: [], editing: false });

    const { needs, ready } = useStatDataNeeds(scope);
    expect(ready.value).toBe(false);

    publishStatVisibility(scope, { settled: true, visible: everyCardKey, editing: false });

    expect(ready.value).toBe(true);
    expect(needs.value).toEqual(allStatDataNeeds(scope));
  });

  it("keeps the cards fed when the read FAILED — a failed read still settles", () => {
    // What useSalesRepLayout publishes on error: settled true over the registry defaults, so the figures
    // still load behind the alert instead of the row sitting empty forever.
    publishStatVisibility(scope, { settled: true, visible: everyCardKey, editing: false });

    const { needs, ready } = useStatDataNeeds(scope);

    expect(ready.value).toBe(true);
    expect(needs.value).toEqual(allStatDataNeeds(scope));
  });

  it("makes the next mount wait for its own read after the surface goes away", () => {
    publishStatVisibility(scope, { settled: true, visible: everyCardKey, editing: false });
    const first = useStatDataNeeds(scope);
    expect(first.ready.value).toBe(true);

    // onScopeDispose in useSalesRepLayout — without it the next mount would shape queries from the
    // previous surface's arrangement.
    clearStatVisibility(scope);

    const next = useStatDataNeeds(scope);
    expect(next.ready.value).toBe(false);
    expect(next.needs.value.size).toBe(0);
  });

  it("keeps scopes independent", () => {
    publishStatVisibility(scope, { settled: true, visible: everyCardKey, editing: false });

    const other = useStatDataNeeds("customerProfile");

    expect(other.ready.value).toBe(false);
    expect(useStatDataNeeds(scope).ready.value).toBe(true);
  });
});
