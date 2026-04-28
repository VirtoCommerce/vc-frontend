import { computed, ref, toValue } from "vue";
import {
  addAddressToFavorites,
  deleteMemberAddresses,
  removeAddressFromFavorites,
  updateMemberAddresses,
} from "@/core/api/graphql/account";
import { useGetCurrentOrganizationAddressesQuery } from "@/core/api/graphql/organization";
import { SortDirection } from "@/core/enums";
import { getSortingExpression, Logger, toInputAddress } from "@/core/utilities";
import type { InputMemberAddressType, MemberAddressFieldsFragment } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { MaybeRef, MaybeRefOrGetter } from "vue";

export function useCurrentOrganizationAddresses(
  organizationId: MaybeRefOrGetter<string>,
  itemsPerPage: MaybeRefOrGetter<number> = 6,
  queryEnabled?: MaybeRef<boolean>,
) {
  const sort = ref<ISortInfo>({
    column: "isFavorite",
    direction: SortDirection.Descending,
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

  const { result, loading, refetch } = useGetCurrentOrganizationAddressesQuery(variables, queryEnabled);

  const addresses = computed(() => result.value?.currentOrganizationAddresses?.items ?? []);
  const totalCount = computed(() => result.value?.currentOrganizationAddresses?.totalCount ?? 0);
  const pages = computed(() => Math.ceil(totalCount.value / toValue(itemsPerPage)));
  const termFacets = computed(() => result.value?.currentOrganizationAddresses?.term_facets ?? []);

  async function addOrUpdateAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    if (!items.length || !toValue(organizationId)) {
      return;
    }

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await updateMemberAddresses(toValue(organizationId), inputAddresses);
      void refetch();
    } catch (e) {
      Logger.error(`${useCurrentOrganizationAddresses.name}.${addOrUpdateAddresses.name}`, e);
      throw e;
    }
  }

  async function removeAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    if (!items.length || !toValue(organizationId)) {
      return;
    }

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await deleteMemberAddresses(inputAddresses, toValue(organizationId));
      void refetch();
    } catch (e) {
      Logger.error(`${useCurrentOrganizationAddresses.name}.${removeAddresses.name}`, e);
      throw e;
    }
  }

  async function addAddressToFavorite(addressId: string): Promise<void> {
    try {
      await addAddressToFavorites(addressId);
    } catch (e) {
      Logger.error(`${useCurrentOrganizationAddresses.name}.${addAddressToFavorite.name}`, e);
      throw e;
    }

    void refetch();
  }

  async function removeAddressFromFavorite(addressId: string): Promise<void> {
    try {
      await removeAddressFromFavorites(addressId);
    } catch (e) {
      Logger.error(`${useCurrentOrganizationAddresses.name}.${removeAddressFromFavorite.name}`, e);
      throw e;
    }

    void refetch();
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
    addAddressToFavorite,
    removeAddressFromFavorite,
  };
}
