import { describe, expect, it, vi, beforeEach } from "vitest";
import { effectScope, ref } from "vue";
import { ORGANIZATION_MEMBER_OPTIONS_LIMIT, useOrganizationMemberOptions } from "./useOrganizationMemberOptions";
import type { Ref } from "vue";

const query = vi.hoisted(
  () => ({}) as { result: Ref<unknown>; loading: Ref<boolean>; error: Ref<unknown>; variables: unknown[] },
);

vi.mock("@/core/api/graphql/organization", () => ({
  useGetOrganizationMemberOptionsQuery: (variables: Ref<unknown>) => {
    query.variables.push(variables.value);
    return { result: query.result, loading: query.loading, error: query.error, onError: vi.fn() };
  },
}));
vi.mock("@/core/globals", () => ({ globals: { userId: "user-1" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

function run(organizationId = "org-1") {
  const scope = effectScope();
  const options = scope.run(() => useOrganizationMemberOptions(() => organizationId));
  if (!options) {
    throw new Error("the scope did not run");
  }
  return options;
}

beforeEach(() => {
  query.result = ref(undefined);
  query.loading = ref(false);
  query.error = ref(null);
  query.variables = [];
});

describe("useOrganizationMemberOptions", () => {
  it("asks for the organization's members by name, as many as the picker can hold", () => {
    run();

    expect(query.variables).toEqual([
      { id: "org-1", userId: "user-1", first: ORGANIZATION_MEMBER_OPTIONS_LIMIT, sort: "name:asc" },
    ]);
  });

  it("offers each member by contact id and full name, falling back to the name", () => {
    query.result.value = {
      organization: {
        contacts: {
          totalCount: 2,
          items: [
            { id: "c-1", name: "alice", fullName: "Alice Adams" },
            { id: "c-2", name: "bob", fullName: "" },
          ],
        },
      },
    };

    const { options, totalCount } = run();

    expect(options.value).toEqual([
      { id: "c-1", name: "Alice Adams" },
      { id: "c-2", name: "bob" },
    ]);
    expect(totalCount.value).toBe(2);
  });

  it("reports a failed read instead of an empty list", () => {
    query.error.value = new Error("down");

    const { options, failed } = run();

    expect(failed.value).toBe(true);
    expect(options.value).toEqual([]);
  });
});
