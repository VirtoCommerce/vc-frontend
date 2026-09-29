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
const replace = vi.fn();
const organization = ref<{ id: string } | null>(null);
const permissions = ref<string[]>([]);

const ownResult = ref<GetReturnsQuery>();
const organizationResult = ref<GetOrganizationReturnsQuery>();
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
  useGetReturnsQuery: (_: MaybeRefOrGetter<GetReturnsQueryVariables>, enabled?: MaybeRef<boolean>) => {
    ownEnabled = enabled;
    return { loading: ref(false), result: ownResult, refetch: vi.fn() };
  },
}));

vi.mock("@/modules/returns/api/graphql/queries/getOrganizationReturns", () => ({
  useGetOrganizationReturnsQuery: (
    value: MaybeRefOrGetter<GetOrganizationReturnsQueryVariables>,
    enabled?: MaybeRef<boolean>,
  ) => {
    organizationVariables = value;
    organizationEnabled = enabled;
    return { loading: ref(false), result: organizationResult, refetch: vi.fn() };
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

  it("opens on the organization's returns for a contact who may see them", () => {
    const { scope, canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(true);
    expect(scope.value).toBe(RETURN_SCOPE.ORGANIZATION);
    expect(requestedList()).toBe("organization");
  });

  it("asks for the organization the contact has selected, with the same filters as the own list", () => {
    route.query = { keyword: "RET-42", status: "Requested", page: "2" };

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

  it("keeps the contact's own returns when the link asks for them", () => {
    route.query = { scope: RETURN_SCOPE.OWN };

    const { scope } = useReturns();

    expect(scope.value).toBe(RETURN_SCOPE.OWN);
    expect(requestedList()).toBe("own");
  });

  it("never asks for the organization without the permission, whatever the link says", () => {
    permissions.value = [];
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };

    const { scope, canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(false);
    expect(scope.value).toBe(RETURN_SCOPE.OWN);
    expect(requestedList()).toBe("own");
  });

  it("never asks for the organization when the contact has none selected", () => {
    organization.value = null;

    const { canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(false);
    expect(requestedList()).toBe("own");
  });

  it("shows the list of the tab it is on", () => {
    // Both queries can hold a result from an earlier visit; only the current tab's may show.
    ownResult.value = { returns: { totalCount: 1, items: [] } };
    organizationResult.value = { organizationReturns: { totalCount: 7, items: [] } };

    const { totalCount, applyScope } = useReturns();

    expect(totalCount.value).toBe(7);

    route.query = { scope: RETURN_SCOPE.OWN };
    applyScope(RETURN_SCOPE.OWN);

    expect(totalCount.value).toBe(1);
  });

  it("writes the non-default scope to the link and starts from the first page", () => {
    route.query = { page: "3" };

    useReturns().applyScope(RETURN_SCOPE.OWN);

    expect(replace).toHaveBeenCalledWith({ query: { scope: RETURN_SCOPE.OWN } });
  });

  it("drops the scope from the link when switching back to the default", () => {
    route.query = { scope: RETURN_SCOPE.OWN, keyword: "RET-42" };

    useReturns().applyScope(RETURN_SCOPE.ORGANIZATION);

    expect(replace).toHaveBeenCalledWith({ query: { keyword: "RET-42" } });
  });
});
