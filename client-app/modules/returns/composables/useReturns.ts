import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DEFAULT_SORT } from "@/core/constants";
import { globals } from "@/core/globals";
import { Sort } from "@/core/types";
import { toEndDateFilterValue, toStartDateFilterValue } from "@/core/utilities/date";
import { useGetOrganizationReturnsQuery } from "@/modules/returns/api/graphql/queries/getOrganizationReturns";
import { useGetReturnsQuery } from "@/modules/returns/api/graphql/queries/getReturns";
import { DRAFT_STATUS, RETURN_SCOPE, VIEW_ORGANIZATION_RETURNS_PERMISSION } from "@/modules/returns/constants";
import { useUser } from "@/shared/account/composables/useUser";
import type { ISortInfo } from "@/core/types";
import type { ReturnScopeType, ReturnsFilterDataType } from "@/modules/returns/types";
import type { LocationQueryRaw, LocationQueryValue } from "vue-router";

const DEFAULT_ITEMS_PER_PAGE = 10;
const BUYER_COLUMN = "customerName";

type ListStateType = {
  scope: ReturnScopeType;
  keyword: string;
  statuses: string[];
  startDate?: string;
  endDate?: string;
  sort: string;
  page: number;
};

export function useReturns() {
  const route = useRoute();
  const router = useRouter();

  const { organization, checkPermissions } = useUser();

  const itemsPerPage = ref(DEFAULT_ITEMS_PER_PAGE);

  // organizationReturns refuses rather than narrows, so only a permission holder gets the tab.
  const canViewOrganizationReturns = computed(
    () => !!organization.value && checkPermissions(VIEW_ORGANIZATION_RETURNS_PERMISSION),
  );

  // Own returns unless the link asks for the organization's.
  const scope = computed<ReturnScopeType>(() =>
    canViewOrganizationReturns.value && asString(route.query.scope) === RETURN_SCOPE.ORGANIZATION
      ? RETURN_SCOPE.ORGANIZATION
      : RETURN_SCOPE.OWN,
  );
  const isOrganizationScope = computed(() => scope.value === RETURN_SCOPE.ORGANIZATION);

  // The organization's list holds no drafts, so it has no Draft filter.
  function isStatusInScope(code: string): boolean {
    return !isOrganizationScope.value || code !== DRAFT_STATUS;
  }

  const state = computed<ListStateType>(() => ({
    scope: scope.value,
    keyword: asString(route.query.keyword),
    statuses: asArray(route.query.status).filter(isStatusInScope),
    startDate: asString(route.query.startDate) || undefined,
    endDate: asString(route.query.endDate) || undefined,
    sort: asString(route.query.sort) || DEFAULT_SORT.toString(),
    page: Math.max(Number.parseInt(asString(route.query.page), 10) || 1, 1),
  }));

  const keyword = computed(() => state.value.keyword);
  const page = computed(() => state.value.page);
  const sort = computed(() => Sort.fromString(state.value.sort));

  const filter = computed<ReturnsFilterDataType>(() => ({
    statuses: state.value.statuses,
    startDate: state.value.startDate,
    endDate: state.value.endDate,
  }));

  const isFilterEmpty = computed(
    () => !filter.value.statuses.length && !filter.value.startDate && !filter.value.endDate,
  );

  const listVariables = computed(() => ({
    storeId: globals.storeId,
    cultureName: globals.cultureName,
    first: itemsPerPage.value,
    after: String((page.value - 1) * itemsPerPage.value),
    sort: state.value.sort,
    keyword: state.value.keyword || undefined,
    statuses: state.value.statuses.length ? state.value.statuses : undefined,
    startDate: toStartDateFilterValue(state.value.startDate),
    endDate: toEndDateFilterValue(state.value.endDate),
  }));

  const ownReturnsQuery = useGetReturnsQuery(
    listVariables,
    computed(() => !isOrganizationScope.value),
  );

  const organizationReturnsQuery = useGetOrganizationReturnsQuery(
    computed(() => ({ ...listVariables.value, organizationId: organization.value?.id ?? "" })),
    isOrganizationScope,
  );

  const loading = computed(() =>
    isOrganizationScope.value ? organizationReturnsQuery.loading.value : ownReturnsQuery.loading.value,
  );

  const connection = computed(() =>
    isOrganizationScope.value
      ? organizationReturnsQuery.result.value?.organizationReturns
      : ownReturnsQuery.result.value?.returns,
  );

  const returns = computed(() => connection.value?.items ?? []);
  const totalCount = computed(() => connection.value?.totalCount ?? 0);
  const pages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value));

  // Narrowing a filter can leave the URL pointing past the end of the shorter list.
  watch(pages, (value) => {
    if (value > 0 && page.value > value) {
      write({ page: value });
    }
  });

  function applyScope(value: ReturnScopeType): void {
    // The own list has no buyer column to sort by.
    const nextSort =
      value === RETURN_SCOPE.OWN && sort.value.column === BUYER_COLUMN ? DEFAULT_SORT.toString() : state.value.sort;

    write({ scope: value, sort: nextSort, page: 1 });
  }

  function applyKeyword(value?: string): void {
    write({ keyword: value?.trim() ?? "", page: 1 });
  }

  function applyFilter(value: ReturnsFilterDataType): void {
    write({ ...value, page: 1 });
  }

  function applySorting(sortInfo: ISortInfo): void {
    write({ sort: new Sort(sortInfo.column, sortInfo.direction).toString(), page: 1 });
  }

  function changePage(value: number): void {
    write({ page: value });
  }

  function resetFilters(): void {
    write({ keyword: "", statuses: [], startDate: undefined, endDate: undefined, page: 1 });
  }

  // One replace for the whole query: the setter of useRouteQueryParam reads the current route,
  // so two params written in the same tick would overwrite each other.
  function write(patch: Partial<ListStateType>): void {
    const next = { ...state.value, ...patch };
    const query: LocationQueryRaw = { ...route.query };

    put(query, "scope", next.scope === RETURN_SCOPE.OWN ? "" : next.scope);
    put(query, "keyword", next.keyword);
    put(query, "status", next.statuses);
    put(query, "startDate", next.startDate);
    put(query, "endDate", next.endDate);
    put(query, "sort", next.sort === DEFAULT_SORT.toString() ? "" : next.sort);
    put(query, "page", next.page > 1 ? String(next.page) : "");

    void router.replace({ query });
  }

  return {
    loading,
    returns,
    totalCount,
    itemsPerPage,
    canViewOrganizationReturns,
    scope,
    isOrganizationScope,
    isStatusInScope,
    page,
    pages,
    sort,
    keyword,
    filter,
    isFilterEmpty,
    applyScope,
    applyKeyword,
    applyFilter,
    applySorting,
    changePage,
    resetFilters,
  };
}

function asString(value: LocationQueryValue | LocationQueryValue[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function asArray(value: LocationQueryValue | LocationQueryValue[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => Boolean(item));
  }

  return value ? [value] : [];
}

function put(query: LocationQueryRaw, key: string, value: string | string[] | undefined): void {
  if (!value?.length) {
    delete query[key];
  } else {
    query[key] = value;
  }
}
