import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref, toValue } from "vue";
import { ReturnScopeEnum } from "@/modules/returns/api/graphql/types";
import { RETURN_SCOPE, VIEW_ORGANIZATION_RETURNS_PERMISSION } from "@/modules/returns/constants";
import { useReturns } from "./useReturns";
import type { GetReturnsQueryVariables } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";
import type { LocationQueryRaw } from "vue-router";

const route = reactive<{ query: LocationQueryRaw }>({ query: {} });
const replace = vi.fn();
const organization = ref<{ id: string } | null>(null);
const permissions = ref<string[]>([]);
let variables: MaybeRefOrGetter<GetReturnsQueryVariables>;

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
  useGetReturnsQuery: (value: MaybeRefOrGetter<GetReturnsQueryVariables>) => {
    variables = value;
    return { loading: ref(false), result: ref(undefined), refetch: vi.fn() };
  },
}));

function requestedScope() {
  return toValue(variables).scope;
}

describe("useReturns scope", () => {
  beforeEach(() => {
    route.query = {};
    replace.mockClear();
    organization.value = { id: "org-1" };
    permissions.value = [VIEW_ORGANIZATION_RETURNS_PERMISSION];
  });

  it("opens on the organization's returns for a contact who may see them", () => {
    const { scope, canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(true);
    expect(scope.value).toBe(RETURN_SCOPE.ORGANIZATION);
    expect(requestedScope()).toBe(ReturnScopeEnum.Organization);
  });

  it("keeps the contact's own returns when the link asks for them", () => {
    route.query = { scope: RETURN_SCOPE.OWN };

    const { scope } = useReturns();

    expect(scope.value).toBe(RETURN_SCOPE.OWN);
    expect(requestedScope()).toBe(ReturnScopeEnum.Own);
  });

  it("never asks for the organization without the permission, whatever the link says", () => {
    permissions.value = [];
    route.query = { scope: RETURN_SCOPE.ORGANIZATION };

    const { scope, canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(false);
    expect(scope.value).toBe(RETURN_SCOPE.OWN);
    expect(requestedScope()).toBe(ReturnScopeEnum.Own);
  });

  it("never asks for the organization when the contact has none selected", () => {
    organization.value = null;

    const { canViewOrganizationReturns } = useReturns();

    expect(canViewOrganizationReturns.value).toBe(false);
    expect(requestedScope()).toBe(ReturnScopeEnum.Own);
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
