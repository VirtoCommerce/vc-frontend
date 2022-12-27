import { computed, readonly, Ref, ref, shallowRef, unref } from "vue";
import { getSortingExpression, Logger, toInputAddress } from "@/core/utilities";
import { ISortInfo } from "@/core/types";
import { InputMemberAddressType, MemberAddressType } from "@/xapi/types";
import { getOrganizationAddresses } from "@/xapi/graphql/organization";
import { deleteMemberAddresses, updateMemberAddresses } from "@/xapi/graphql/account";
import { SORT_DESCENDING } from "@/core/constants";
import { MaybeRef } from "@vueuse/core";

const DEFAULT_ITEMS_PER_PAGE = 10;

export default function useOrganizationAddresses(organizationId: MaybeRef<string>) {
  const loading = ref(false);
  const addresses = shallowRef<MemberAddressType[]>([]);
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const page: Ref<number> = ref(1);
  const pages: Ref<number> = ref(0);
  const sort = ref<ISortInfo>({
    column: "createdDate",
    direction: SORT_DESCENDING,
  });

  async function fetchAddresses() {
    try {
      loading.value = true;

      const sortingExpression = getSortingExpression(sort.value);

      const response = await getOrganizationAddresses(unref(organizationId), {
        sort: sortingExpression,
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
      });

      addresses.value = response.items ?? [];
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
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

  async function updateAddresses(items: MemberAddressType[]): Promise<void> {
    loading.value = true;

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await updateMemberAddresses(unref(organizationId), inputAddresses);
    } catch (e) {
      Logger.error("useUserAddresses.updateAddresses", e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchAddresses();
  }

  async function addOrUpdateAddresses(items: MemberAddressType[]): Promise<void> {
    if (!items.length) {
      return;
    }

    const updatedAddresses: MemberAddressType[] = addresses.value.slice();

    items.forEach((newAddress: MemberAddressType) => {
      const index = updatedAddresses.findIndex((oldAddress) => oldAddress.id === newAddress.id);

      if (index === -1) {
        updatedAddresses.push(newAddress);
      } else {
        updatedAddresses.splice(index, 1, newAddress);
      }
    });

    await updateAddresses(updatedAddresses);
  }

  return {
    sort,
    itemsPerPage,
    page,
    pages,
    fetchAddresses,
    removeAddresses,
    addOrUpdateAddresses,
    loading: readonly(loading),
    addresses: computed(() => addresses.value),
  };
}
