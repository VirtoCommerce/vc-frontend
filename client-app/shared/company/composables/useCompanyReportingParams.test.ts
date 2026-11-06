import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { COMPANY_REPORTING_ALL_MEMBERS, useCompanyReportingParams } from "./useCompanyReportingParams";
import type { OrganizationMemberOptionType } from "./useOrganizationMemberOptions";
import type { Ref } from "vue";

// The URL, one ref per query parameter.
const params = vi.hoisted(() => {
  const byKey: Record<string, Ref<string>> = {};
  return byKey;
});

vi.mock("@/core/composables/useRouteQueryParam", () => ({
  useRouteQueryParam: (key: string) => params[key],
}));

const members = {
  options: ref<OrganizationMemberOptionType[]>([]),
  totalCount: ref(0),
  loading: ref(false),
  failed: ref(false),
};

function run() {
  const scope = effectScope();
  const result = scope.run(() => useCompanyReportingParams(members));
  if (!result) {
    throw new Error("the scope did not run");
  }
  return result;
}

beforeEach(() => {
  params.period = ref("year");
  params.member = ref(COMPANY_REPORTING_ALL_MEMBERS);
  members.options.value = [{ id: "c-1", name: "Alice", accountIds: ["u-1"] }];
  members.totalCount.value = 1;
  members.loading.value = false;
  members.failed.value = false;
});

describe("useCompanyReportingParams", () => {
  it("reads an unknown period as the default, and writes a picked one to the URL", () => {
    params.period.value = "decade";
    const { period } = run();

    expect(period.value).toBe("year");

    period.value = "q3";

    expect(params.period.value).toBe("q3");
  });

  it("keeps a member of the organization", async () => {
    params.member.value = "c-1";
    const { memberId } = run();
    await flushPromises();

    expect(memberId.value).toBe("c-1");
  });

  it("falls back to All members for an id the complete list does not have", async () => {
    params.member.value = "someone-who-left";
    run();
    await flushPromises();

    expect(params.member.value).toBe(COMPANY_REPORTING_ALL_MEMBERS);
  });

  // Past the picker's limit the id may still be a member's, and while loading or after a failure nothing is known.
  it.each([
    ["the list is longer than what was loaded", () => (members.totalCount.value = 500)],
    ["the list is still loading", () => (members.loading.value = true)],
    ["the list failed", () => (members.failed.value = true)],
  ])("keeps an id it cannot check when %s", async (_case, arrange) => {
    arrange();
    params.member.value = "maybe-a-member";
    run();
    await flushPromises();

    expect(params.member.value).toBe("maybe-a-member");
  });
});
