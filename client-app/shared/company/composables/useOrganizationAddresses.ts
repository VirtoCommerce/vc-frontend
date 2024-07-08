import { computed, readonly, ref, shallowRef, unref } from "vue";
import {
  addAddressToFavorites,
  deleteMemberAddresses,
  removeAddressFromFavorites,
  updateMemberAddresses,
} from "@/core/api/graphql/account";
import { getOrganizationAddresses } from "@/core/api/graphql/organization";
import { SortDirection } from "@/core/enums";
import { getSortingExpression, Logger, toInputAddress } from "@/core/utilities";
import type { InputMemberAddressType, MemberAddressType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { MaybeRef } from "@vueuse/core";

const requestedAddressesQuantity = 9999;

const loading = ref(false);
const addresses = shallowRef<MemberAddressType[]>([]);
const sort = ref<ISortInfo>({
  column: "isFavorite",
  direction: SortDirection.Descending,
});

export function useOrganizationAddresses(organizationId: MaybeRef<string>) {
  async function fetchAddresses() {
    try {
      loading.value = true;

      const { items = [] } = await getOrganizationAddresses(unref(organizationId), {
        sort: getSortingExpression(sort.value),
        first: requestedAddressesQuantity,
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

  async function addAddressToFavorite(addressId: string): Promise<void> {
    loading.value = true;

    try {
      await addAddressToFavorites(addressId);
    } catch (e) {
      Logger.error(`${useOrganizationAddresses.name}.${addAddressToFavorite.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchAddresses();
  }

  async function removeAddressFromFavorite(addressId: string): Promise<void> {
    loading.value = true;

    try {
      await removeAddressFromFavorites(addressId);
    } catch (e) {
      Logger.error(`${useOrganizationAddresses.name}.${removeAddressFromFavorites.name}`, e);
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
    addOrUpdateAddresses,
    addAddressToFavorite,
    removeAddressFromFavorite,
    loading: readonly(loading),
    addresses: computed(() => addresses.value),
  };
}
