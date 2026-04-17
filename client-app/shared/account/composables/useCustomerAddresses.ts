import { computed, ref, toValue } from "vue";
import {
  deleteMemberAddresses,
  updateMemberAddresses,
  useGetCurrentCustomerAddressesQuery,
} from "@/core/api/graphql/account";
import { SortDirection } from "@/core/enums";
import { getSortingExpression, Logger, toInputAddress } from "@/core/utilities";
import { useUser } from "./useUser";
import type { InputMemberAddressType, MemberAddressFieldsFragment } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { MaybeRefOrGetter, MaybeRef } from "vue";

export function useCustomerAddresses(itemsPerPage: MaybeRefOrGetter<number> = 6, enabled?: MaybeRef<boolean>) {
  const { user } = useUser();

  const sort = ref<ISortInfo>({
    column: "lastName",
    direction: SortDirection.Ascending,
  });

  const page = ref(1);
  const filterCountryCodes = ref<string[]>([]);
  const filterRegionIds = ref<string[]>([]);
  const filterCities = ref<string[]>([]);
  const keyword = ref("");

  const variables = computed(() => ({
    first: toValue(itemsPerPage),
    after: String((page.value - 1) * toValue(itemsPerPage)),
    sort: getSortingExpression(sort.value),
    countryCodes: filterCountryCodes.value.length ? filterCountryCodes.value : undefined,
    regionIds: filterRegionIds.value.length ? filterRegionIds.value : undefined,
    cities: filterCities.value.length ? filterCities.value : undefined,
    keyword: keyword.value,
  }));

  const { result, loading, refetch } = useGetCurrentCustomerAddressesQuery(variables, enabled);

  const addresses = computed(() => result.value?.currentCustomerAddresses?.items ?? []);
  const totalCount = computed(() => result.value?.currentCustomerAddresses?.totalCount ?? 0);
  const termFacets = computed(() => result.value?.currentCustomerAddresses?.term_facets ?? []);
  const pages = computed(() => Math.ceil(totalCount.value / toValue(itemsPerPage)));

  async function addOrUpdateAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    if (!items.length || !user.value.memberId) {
      return;
    }

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await updateMemberAddresses(user.value.memberId, inputAddresses);
      void refetch();
    } catch (e) {
      Logger.error(`${useCustomerAddresses.name}.${addOrUpdateAddresses.name}`, e);
      throw e;
    }
  }

  async function removeAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    if (!items.length || !user.value.memberId) {
      return;
    }

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await deleteMemberAddresses(inputAddresses, user.value.memberId);
      void refetch();
    } catch (e) {
      Logger.error(`${useCustomerAddresses.name}.${removeAddresses.name}`, e);
      throw e;
    }
  }

  return {
    sort,
    page,
    pages,
    loading,
    addresses,
    totalCount,
    filterCountryCodes,
    filterRegionIds,
    filterCities,
    keyword,
    termFacets,
    addOrUpdateAddresses,
    removeAddresses,
  };
}
