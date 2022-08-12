import { computed, readonly, ref, shallowRef } from "vue";
import { getSortingExpression, Logger } from "@/core/utilities";
import { ISortInfo } from "@/core/types";
import { MemberAddressType } from "@/xapi/types";
import { getOrganizationAddresses } from "@/xapi/graphql/organization";
import { SORT_DESCENDING } from "@/core/constants";

const DEFAULT_ITEMS_PER_PAGE = 10;

export default function useOrganizationAddresses() {
  const loading = ref(false);
  const addresses = shallowRef<MemberAddressType[]>([]);
  const itemsPerPage = ref(DEFAULT_ITEMS_PER_PAGE);
  const pages = ref(0);
  const page = ref(1);
  const sort = ref<ISortInfo>({
    column: "createdDate",
    direction: SORT_DESCENDING,
  });

  async function fetchAddresses(organizationId: string) {
    try {
      loading.value = true;

      const sortingExpression = getSortingExpression(sort.value);

      const { items = [], totalCount = 0 } = await getOrganizationAddresses(organizationId, {
        sort: sortingExpression,
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
      });

      addresses.value = items;
      pages.value = Math.ceil(totalCount / itemsPerPage.value);
    } catch (e) {
      Logger.error(`${useOrganizationAddresses.name}.${fetchAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchAddresses,
    itemsPerPage,
    page,
    sort,
    loading: readonly(loading),
    addresses: computed(() => addresses.value),
    pages: readonly(pages),
  };
}
