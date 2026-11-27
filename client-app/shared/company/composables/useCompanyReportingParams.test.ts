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
  loading: ref(false),
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
  members.loading.value = false;
});

describe("useCompanyReportingParams", () => {
  it("reads an unknown period as the default, and writes a picked one to the URL", () => {
    params.period.value = "decade";
    const { period } = run();

    expect(period.value).toBe("year");

    period.value = "q3";

    expect(params.period.value).toBe("q3");
  });

  it("keeps a member of the organization and narrows the report to them", async () => {
    params.member.value = "c-1";
    const { memberId, reportMemberId, isMemberPending } = run();
    await flushPromises();

    expect(memberId.value).toBe("c-1");
    expect(reportMemberId.value).toBe("c-1");
    expect(isMemberPending.value).toBe(false);
  });

  it("reports on the whole organization for All members", () => {
    const { reportMemberId, isMemberPending } = run();

    expect(reportMemberId.value).toBeUndefined();
    expect(isMemberPending.value).toBe(false);
  });

  it.each([
    ["an id the list does not have", [{ id: "c-1", name: "Alice", accountIds: ["u-1"] }]],
    ["a member list that failed", []],
  ])("falls back to All members for %s", async (_case, options) => {
    members.options.value = options;
    params.member.value = "someone-who-left";
    const { reportMemberId } = run();
    await flushPromises();

    expect(params.member.value).toBe(COMPANY_REPORTING_ALL_MEMBERS);
    expect(reportMemberId.value).toBeUndefined();
  });

  // The server refuses a contact outside the organization, so an unconfirmed id is never sent.
  it("holds the report while the list that would confirm the member loads", async () => {
    members.options.value = [];
    members.loading.value = true;
    params.member.value = "c-1";
    const { reportMemberId, isMemberPending } = run();
    await flushPromises();

    expect(params.member.value).toBe("c-1");
    expect(reportMemberId.value).toBeUndefined();
    expect(isMemberPending.value).toBe(true);

    members.options.value = [{ id: "c-1", name: "Alice", accountIds: ["u-1"] }];
    members.loading.value = false;
    await flushPromises();

    expect(reportMemberId.value).toBe("c-1");
    expect(isMemberPending.value).toBe(false);
  });
});
