import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DEFAULT_SORT } from "@/core/constants";
import { globals } from "@/core/globals";
import { Sort } from "@/core/types";
import { toEndDateFilterValue, toStartDateFilterValue } from "@/core/utilities/date";
import { useGetReturnsQuery } from "@/modules/returns/api/graphql/queries/getReturns";
import { ReturnScopeEnum } from "@/modules/returns/api/graphql/types";
import { RETURN_SCOPE, VIEW_ORGANIZATION_RETURNS_PERMISSION } from "@/modules/returns/constants";
import { useUser } from "@/shared/account/composables/useUser";
import type { ISortInfo } from "@/core/types";
import type { ReturnScopeType, ReturnsFilterDataType } from "@/modules/returns/types";
import type { LocationQueryRaw, LocationQueryValue } from "vue-router";

const DEFAULT_ITEMS_PER_PAGE = 10;

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

  // The server refuses the organization scope outright rather than narrowing it, so it is only
  // offered to a contact it would be granted to.
  const canViewOrganizationReturns = computed(
    () => !!organization.value && checkPermissions(VIEW_ORGANIZATION_RETURNS_PERMISSION),
  );

  // Whoever may see the organization's returns lands on them, as on the orders page.
  const defaultScope = computed<ReturnScopeType>(() =>
    canViewOrganizationReturns.value ? RETURN_SCOPE.ORGANIZATION : RETURN_SCOPE.OWN,
  );

  const state = computed<ListStateType>(() => ({
    scope: asScope(asString(route.query.scope)) ?? defaultScope.value,
    keyword: asString(route.query.keyword),
    statuses: asArray(route.query.status),
    startDate: asString(route.query.startDate) || undefined,
    endDate: asString(route.query.endDate) || undefined,
    sort: asString(route.query.sort) || DEFAULT_SORT.toString(),
    page: Number.parseInt(asString(route.query.page), 10) || 1,
  }));

  const scope = computed<ReturnScopeType>(() =>
    canViewOrganizationReturns.value ? state.value.scope : RETURN_SCOPE.OWN,
  );
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

  const { loading, result, refetch } = useGetReturnsQuery(
    computed(() => ({
      storeId: globals.storeId,
      scope: scope.value === RETURN_SCOPE.ORGANIZATION ? ReturnScopeEnum.Organization : ReturnScopeEnum.Own,
      cultureName: globals.cultureName,
      first: itemsPerPage.value,
      after: String((page.value - 1) * itemsPerPage.value),
      sort: state.value.sort,
      keyword: state.value.keyword || undefined,
      statuses: state.value.statuses.length ? state.value.statuses : undefined,
      startDate: toStartDateFilterValue(state.value.startDate),
      endDate: toEndDateFilterValue(state.value.endDate),
    })),
  );

  const returns = computed(() => result.value?.returns?.items ?? []);
  const totalCount = computed(() => result.value?.returns?.totalCount ?? 0);
  const pages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value));

  // Narrowing a filter can leave the URL pointing past the end of the shorter list.
  watch(pages, (value) => {
    if (value > 0 && page.value > value) {
      write({ page: value });
    }
  });

  function applyScope(value: ReturnScopeType): void {
    write({ scope: value, page: 1 });
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

    put(query, "scope", next.scope === defaultScope.value ? "" : next.scope);
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
    refetch,
  };
}

function asString(value: LocationQueryValue | LocationQueryValue[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function asScope(value: string): ReturnScopeType | undefined {
  return Object.values(RETURN_SCOPE).find((scope) => scope === value);
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
