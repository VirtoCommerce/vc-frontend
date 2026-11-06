import { describe, expect, it, vi, beforeEach } from "vitest";
import { effectScope, ref } from "vue";
import { useOrganizationBuyerOptions } from "./useOrganizationBuyerOptions";
import type { OrganizationMemberOptionType } from "./useOrganizationMemberOptions";

const h = vi.hoisted(() => {
  const state = {} as {
    members: {
      options: { value: OrganizationMemberOptionType[] };
      totalCount: { value: number };
      loading: { value: boolean };
      failed: { value: boolean };
    };
    orders: { customerIds: { value: ReadonlySet<string> | undefined }; loading: { value: boolean } };
  };
  return state;
});

vi.mock("./useOrganizationMemberOptions", () => ({ useOrganizationMemberOptions: () => h.members }));
vi.mock("./useOrganizationOrderCustomers", () => ({ useOrganizationOrderCustomers: () => h.orders }));

const ALICE = { id: "c-1", name: "Alice", accountIds: ["U-1"] };
const BOB = { id: "c-2", name: "Bob", accountIds: ["u-2", "u-3"] };
const CAROL = { id: "c-3", name: "Carol", accountIds: [] };

function run() {
  const scope = effectScope();
  const result = scope.run(() => useOrganizationBuyerOptions("org-1"));
  if (!result) {
    throw new Error("the scope did not run");
  }
  return result;
}

beforeEach(() => {
  h.members = {
    options: ref([ALICE, BOB, CAROL]),
    totalCount: ref(3),
    loading: ref(false),
    failed: ref(false),
  };
  h.orders = { customerIds: ref(new Set(["u-1", "u-3"])), loading: ref(false) };
});

describe("useOrganizationBuyerOptions", () => {
  it("offers only the members one of whose accounts has ordered, ignoring the id's case", () => {
    expect(run().options.value).toEqual([ALICE, BOB]);
  });

  it("counts the buyers when the member list is complete", () => {
    expect(run().totalCount.value).toBe(2);
  });

  // Past the limit some members are not loaded: the organization's count keeps a caller from taking the list as whole.
  it("keeps the organization's count when the member list is cut off", () => {
    h.members.totalCount.value = 500;

    expect(run().totalCount.value).toBe(500);
  });

  it("offers every member until the orders are known, and when they cannot be read", () => {
    h.orders.customerIds.value = undefined;

    expect(run().options.value).toEqual([ALICE, BOB, CAROL]);
  });

  it("keeps loading while the orders are on their way", () => {
    h.orders.customerIds.value = undefined;
    h.orders.loading.value = true;

    expect(run().loading.value).toBe(true);
  });
});
