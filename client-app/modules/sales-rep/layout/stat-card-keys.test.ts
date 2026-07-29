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

const statIds = (scope: SalesRepLayoutScopeType) =>
  getBlockRegistry(scope)
    .filter((block) => block.region === "statistics")
    .map((block) => block.id);

const sorted = (ids: readonly string[]) => [...ids].sort((a, b) => a.localeCompare(b));

/**
 * A registry stat id with no matching card still renders its `LayoutBlock`: an empty focusable column
 * that round-trips through saves. Nothing else fails, so this is all that catches a rename. Order is
 * not asserted — the saved layout owns it.
 */
describe("stat cards and layout registry ids", () => {
  it("dashboard: every registry stat id has a card and every card has an id", () => {
    const { cards } = useSalesRepDashboardWidgets();

    expect(sorted(cards.value.map((card) => card.key))).toEqual(sorted(statIds("dashboard")));
  });

  it("customer profile: every registry stat id has a card and every card has an id", () => {
    const { cards } = useSalesRepCustomerWidgets(() => "org-1");

    expect(sorted(cards.value.map((card) => card.key))).toEqual(sorted(statIds("customerProfile")));
  });

  // Values are placeholders until the queries resolve, but the card set must not shrink — a card
  // missing while loading would blank its column instead of showing an empty one.
  it("emits every card before any statistics have arrived", () => {
    apolloMock.result.value = undefined;

    expect(useSalesRepDashboardWidgets().cards.value).toHaveLength(statIds("dashboard").length);
    expect(useSalesRepCustomerWidgets(() => "org-1").cards.value).toHaveLength(statIds("customerProfile").length);
  });
});
