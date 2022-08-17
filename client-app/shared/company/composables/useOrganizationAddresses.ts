import { computed, readonly, ref, shallowRef, unref } from "vue";
import { getSortingExpression, Logger, toInputAddress } from "@/core/utilities";
import { ISortInfo } from "@/core/types";
import { InputMemberAddressType, MemberAddressType } from "@/xapi/types";
import { getOrganizationAddresses } from "@/xapi/graphql/organization";
import { deleteMemberAddresses } from "@/xapi/graphql/account";
import { SORT_DESCENDING } from "@/core/constants";
import { MaybeRef } from "@vueuse/core";

export default function useOrganizationAddresses(organizationId: MaybeRef<string>) {
  const loading = ref(false);
  const addresses = shallowRef<MemberAddressType[]>([]);
  const sort = ref<ISortInfo>({
    column: "createdDate",
    direction: SORT_DESCENDING,
  });

  async function fetchAddresses() {
    try {
      loading.value = true;

      const sortingExpression = getSortingExpression(sort.value);

      const { items = [] } = await getOrganizationAddresses(unref(organizationId), {
        sort: sortingExpression,
      });

      addresses.value = items;
    } catch (e) {
      Logger.error(`${useOrganizationAddresses.name}.${fetchAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeAddresses(items: MemberAddressType[]): Promise<void> {
    loading.value = true;

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await deleteMemberAddresses(inputAddresses, unref(organizationId));
    } catch (e) {
      Logger.error(`${useOrganizationAddresses.name}.${removeAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchAddresses();
  }

  return {
    sort,
    fetchAddresses,
    removeAddresses,
    loading: readonly(loading),
    addresses: computed(() => addresses.value),
  };
}
