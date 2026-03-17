import { computed, ref } from "vue";
import { useGetCurrentCustomerAddressesQuery } from "@/core/api/graphql/account";
import { SortDirection } from "@/core/enums";
import { getSortingExpression } from "@/core/utilities";
import type { ISortInfo } from "@/core/types";

export function useCustomerAddresses() {
  const sort = ref<ISortInfo>({
    column: "lastName",
    direction: SortDirection.Ascending,
  });

  const filterCountryCodes = ref<string[]>([]);
  const filterRegionIds = ref<string[]>([]);
  const filterCities = ref<string[]>([]);

  const variables = computed(() => ({
    sort: getSortingExpression(sort.value),
    countryCodes: filterCountryCodes.value.length ? filterCountryCodes.value : undefined,
    regionIds: filterRegionIds.value.length ? filterRegionIds.value : undefined,
    cities: filterCities.value.length ? filterCities.value : undefined,
  }));

  const { result, loading } = useGetCurrentCustomerAddressesQuery(variables);

  const addresses = computed(() => result.value?.currentCustomerAddresses?.items ?? []);
  const totalCount = computed(() => result.value?.currentCustomerAddresses?.totalCount ?? 0);

  return {
    sort,
    loading,
    addresses,
    totalCount,
    filterCountryCodes,
    filterRegionIds,
    filterCities,
  };
}
