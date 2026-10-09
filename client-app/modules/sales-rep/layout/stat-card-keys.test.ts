import { describe, expect, it, vi } from "vitest";
import { useSalesRepCustomerWidgets } from "../composables/useSalesRepCustomerWidgets";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import { getBlockRegistry } from "./registry";
import type { SalesRepLayoutScopeType } from "../types/layout";

const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  return { result: shallowRef<unknown>(undefined), loading: ref(false), error: ref<Error | undefined>() };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: apolloMock.result,
    loading: apolloMock.loading,
    error: apolloMock.error,
    onError: vi.fn(),
  }),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const statBlocks = (scope: SalesRepLayoutScopeType) =>
  getBlockRegistry(scope).filter((block) => block.region === "statistics");

const byKey = (entries: readonly { key: string; label: string }[]) =>
  [...entries].sort((a, b) => a.key.localeCompare(b.key));

/**
 * `layout/stat-cards.ts` is the single source for both sides, so these now guard the derivation rather
 * than two hand-kept lists: a card with no block is an id the layout cannot save, and a caption that
 * disagrees leaves one wording on the card and another in the parked zone and the announcements. Order
 * is not asserted — the saved layout owns it.
 */
describe("stat cards and layout registry", () => {
  it.each([
    ["dashboard", () => useSalesRepDashboardWidgets().cards.value],
    ["customerProfile", () => useSalesRepCustomerWidgets(() => "org-1").cards.value],
  ] as const)("%s: cards and blocks agree on every id and caption", (scope, getCards) => {
    const cards = byKey(getCards().map((card) => ({ key: card.key, label: card.labelKey })));
    const blocks = byKey(statBlocks(scope).map((block) => ({ key: block.id, label: block.titleKey })));

    expect(cards).toEqual(blocks);
  });

  // Values are placeholders until the queries resolve, but the card set must not shrink — a card
  // missing while loading would blank its column instead of showing an empty one.
  it("emits every card before any statistics have arrived", () => {
    apolloMock.result.value = undefined;

    expect(useSalesRepDashboardWidgets().cards.value).toHaveLength(statBlocks("dashboard").length);
    expect(useSalesRepCustomerWidgets(() => "org-1").cards.value).toHaveLength(statBlocks("customerProfile").length);
  });
});
