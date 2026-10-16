import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref, toValue } from "vue";
import { RETURN_SCOPE, VIEW_ORGANIZATION_RETURNS_PERMISSION } from "@/modules/returns/constants";
import { useReturns } from "./useReturns";
import type {
  GetOrganizationReturnsQuery,
  GetOrganizationReturnsQueryVariables,
  GetReturnsQuery,
  GetReturnsQueryVariables,
} from "@/modules/returns/api/graphql/types";
import type { MaybeRef, MaybeRefOrGetter } from "vue";
import type { LocationQueryRaw } from "vue-router";

const route = reactive<{ query: LocationQueryRaw }>({ query: {} });
// Navigates like the real router, so a tab switch reaches the lists the way a click does.
const replace = vi.fn(({ query }: { query: LocationQueryRaw }) => {
  route.query = query;
});
const organization = ref<{ id: string } | null>(null);
const permissions = ref<string[]>([]);

const ownResult = ref<GetReturnsQuery>();
const organizationResult = ref<GetOrganizationReturnsQuery>();
let ownVariables: MaybeRefOrGetter<GetReturnsQueryVariables>;
let ownEnabled: MaybeRef<boolean> | undefined;
let organizationVariables: MaybeRefOrGetter<GetOrganizationReturnsQueryVariables>;
let organizationEnabled: MaybeRef<boolean> | undefined;

vi.mock("vue-router", () => ({
  useRoute: () => route,
  useRouter: () => ({ replace }),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store", cultureName: "en-US" },
}));

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({
    organization,
    checkPermissions: (...required: string[]) => required.every((x) => permissions.value.includes(x)),
  }),
}));

vi.mock("@/modules/returns/api/graphql/queries/getReturns", () => ({
  useGetReturnsQuery: (value: MaybeRefOrGetter<GetReturnsQueryVariables>, enabled?: MaybeRef<boolean>) => {
    ownVariables = value;
    ownEnabled = enabled;
    return { loading: ref(false), result: ownResult };
  },
}));

vi.mock("@/modules/returns/api/graphql/queries/getOrganizationReturns", () => ({
  useGetOrganizationReturnsQuery: (
    value: MaybeRefOrGetter<GetOrganizationReturnsQueryVariables>,
    enabled?: MaybeRef<boolean>,
  ) => {
    organizationVariables = value;
    organizationEnabled = enabled;
    return { loading: ref(false), result: organizationResult };
  },
}));

// Which list the page asks the server for; never both at once.
function requestedList(): string {
  const own = toValue(ownEnabled) === true;
  const organizationList = toValue(organizationEnabled) === true;

  expect(own && organizationList).toBe(false);

  if (organizationList) {
    return "organization";
  }

  return own ? "own" : "none";
}

describe("useReturns scope", () => {
  beforeEach(() => {
    route.query = {};
    replace.mockClear();
    organization.value = { id: "org-1" };
    permissions.value = [VIEW_ORGANIZATION_RETURNS_PERMISSION];
    ownResult.value = undefined;
    organizationResult.value = undefined;
  });

  it("opens on the contact's own returns, also for one who may see the organization's", () => {
    // The organization's list is one tab away; the page never lands on it by itself.
    const { scope, canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(true);
    expect(scope.value).toBe(RETURN_SCOPE.OWN);
    expect(requestedList()).toBe("own");
  });

  it("opens the organization's returns when the link asks for them", () => {
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };

    const { scope } = useReturns();

    expect(scope.value).toBe(RETURN_SCOPE.ORGANIZATION);
    expect(requestedList()).toBe("organization");
  });

  it("asks for the organization the contact has selected, with the same filters as the own list", () => {
    route.query = { scope: RETURN_SCOPE.ORGANIZATION, keyword: "RET-42", status: "Requested", page: "2" };

    useReturns();

    expect(toValue(organizationVariables)).toMatchObject({
      organizationId: "org-1",
      storeId: "store",
      keyword: "RET-42",
      statuses: ["Requested"],
      first: 10,
      after: "10",
    });
  });

  it.each(["-1", "0", "first"])("reads page %s from the link as the first page", (value) => {
    // A hand-edited link: a negative offset reached the database and the list showed "no returns yet".
    route.query = { page: value };

    const { page } = useReturns();

    expect(page.value).toBe(1);
    expect(toValue(ownVariables)).toMatchObject({ first: 10, after: "0" });
  });

  it("keeps a Draft filter on the contact's own returns, where drafts are", () => {
    route.query = { status: "Draft" };

    const { filter } = useReturns();

    expect(filter.value.statuses).toEqual(["Draft"]);
  });

  it("does not carry a Draft filter over to the organization's list, which holds no drafts", () => {
    route.query = { status: ["Draft", "Requested"] };

    const { applyScope, filter } = useReturns();
    applyScope(RETURN_SCOPE.ORGANIZATION);

    expect(filter.value.statuses).toEqual(["Requested"]);
    expect(toValue(organizationVariables)).toMatchObject({ statuses: ["Requested"] });
  });

  it("ignores a Draft filter in a link to the organization's list", () => {
    route.query = { scope: RETURN_SCOPE.ORGANIZATION, status: "Draft" };

    const { filter } = useReturns();

    expect(filter.value.statuses).toEqual([]);
    expect(toValue(organizationVariables)).toMatchObject({ statuses: undefined });
  });

  it("never asks for the organization without the permission, whatever the link says", () => {
    permissions.value = [];
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };

    const { scope, canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(false);
    expect(scope.value).toBe(RETURN_SCOPE.OWN);
    expect(requestedList()).toBe("own");
  });

  it("never asks for the organization when the contact has none selected, whatever the link says", () => {
    organization.value = null;
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };

    const { canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(false);
    expect(requestedList()).toBe("own");
  });

  it("drops an organization scope the contact may not use from the link on the next change", () => {
    // A link a colleague shared: the page shows the contact's own returns, and the link stops saying otherwise.
    permissions.value = [];
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };

    useReturns().applyKeyword("RET-42");

    expect(replace).toHaveBeenCalledWith({ query: { keyword: "RET-42" } });
  });

  it("shows the list of the tab it is on", () => {
    // Both queries can hold a result from an earlier visit; only the current tab's may show.
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };
    ownResult.value = { returns: { totalCount: 1, items: [] } };
    organizationResult.value = { organizationReturns: { totalCount: 7, items: [] } };

    const { totalCount, applyScope } = useReturns();

    expect(totalCount.value).toBe(7);

    applyScope(RETURN_SCOPE.OWN);

    expect(totalCount.value).toBe(1);
    expect(requestedList()).toBe("own");
  });

  it("writes the organization scope to the link and starts from the first page", () => {
    route.query = { page: "3" };

    useReturns().applyScope(RETURN_SCOPE.ORGANIZATION);

    expect(replace).toHaveBeenCalledWith({ query: { scope: RETURN_SCOPE.ORGANIZATION } });
  });

  it("drops the scope from the link when switching back to the own returns", () => {
    route.query = { scope: RETURN_SCOPE.ORGANIZATION, keyword: "RET-42" };

    useReturns().applyScope(RETURN_SCOPE.OWN);

    expect(replace).toHaveBeenCalledWith({ query: { keyword: "RET-42" } });
  });

  it("drops a sort by buyer when switching to the own returns, which have no buyer column", () => {
    route.query = { scope: RETURN_SCOPE.ORGANIZATION, sort: "customerName:asc" };

    useReturns().applyScope(RETURN_SCOPE.OWN);

    expect(replace).toHaveBeenCalledWith({ query: {} });
  });

  it("keeps any other sort across the tabs", () => {
    // The control for the test above.
    route.query = { scope: RETURN_SCOPE.ORGANIZATION, sort: "number:asc" };

    useReturns().applyScope(RETURN_SCOPE.OWN);

    expect(replace).toHaveBeenCalledWith({ query: { sort: "number:asc" } });
  });
});
