import { computed, readonly, ref, shallowRef } from "vue";
import { deleteMemberAddresses, getMyAddresses, updateMemberAddresses } from "@/core/api/graphql/account";
import { SortDirection } from "@/core/enums";
import { getSortingExpression, isEqualAddresses, Logger, toInputAddress } from "@/core/utilities";
import { useUser } from "./useUser";
import type { InputMemberAddressType, MemberAddressFieldsFragment } from "@/core/api/graphql/types";
import type { AnyAddressType, ISortInfo } from "@/core/types";

const loading = ref(false);
const addresses = shallowRef<MemberAddressFieldsFragment[]>([]);
const sort = ref<ISortInfo>({
  column: "lastName",
  direction: SortDirection.Ascending,
});

export function useUserAddresses() {
  const { user } = useUser();

  function isExistAddress(address: AnyAddressType): boolean {
    return addresses.value.some((item) => isEqualAddresses(item, address));
  }

  async function fetchAddresses() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    try {
      addresses.value = await getMyAddresses({ sort: sortingExpression });
    } catch (e) {
      Logger.error(`${useUserAddresses.name}.${fetchAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    loading.value = true;

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await updateMemberAddresses(user.value.memberId!, inputAddresses);
    } catch (e) {
      Logger.error(`${useUserAddresses.name}.${updateAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchAddresses();
  }

  async function addOrUpdateAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    if (!items.length) {
      return;
    }

    loading.value = true;

    const updatedAddresses: MemberAddressFieldsFragment[] = addresses.value.slice();

    items.forEach((newAddress: MemberAddressFieldsFragment) => {
      const index = updatedAddresses.findIndex((oldAddress) => oldAddress.id === newAddress.id);

      if (index === -1) {
        updatedAddresses.push(newAddress);
      } else {
        updatedAddresses.splice(index, 1, newAddress);
      }
    });

    await updateAddresses(updatedAddresses);
  }

  async function removeAddresses(items: MemberAddressFieldsFragment[]): Promise<void> {
    if (!items.length) {
      return;
    }

    loading.value = true;

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await deleteMemberAddresses(inputAddresses, user.value.memberId!);
    } catch (e) {
      Logger.error(`${useUserAddresses.name}.${removeAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchAddresses();
  }

  return {
    sort,
    isExistAddress,
    fetchAddresses,
    updateAddresses,
    addOrUpdateAddresses,
    removeAddresses,
    loading: readonly(loading),
    addresses: computed(() => addresses.value),
  };
}
