import { AnyAddressType, getSortingExpression, isEqualAddresses, Logger, SortDirection, toInputAddress } from "@/core";
import { deleteMemberAddresses, getMyAddresses, updateMemberAddresses } from "@/xapi/graphql/account";
import { InputMemberAddressType, MemberAddressType } from "@/xapi/types";
import { computed, readonly, ref, shallowRef } from "vue";
import { useUser } from "@/shared/account";

const loading = ref(false);
const addresses = shallowRef<MemberAddressType[]>([]);
const sort = ref({
  fieldName: "lastName",
  direction: SortDirection.Ascending,
});

export default function useUserAddresses() {
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

  async function updateAddresses(items: MemberAddressType[]): Promise<void> {
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

  async function addOrUpdateAddresses(items: MemberAddressType[]): Promise<void> {
    if (!items.length) {
      return;
    }

    loading.value = true;

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

  async function removeAddresses(items: MemberAddressType[]): Promise<void> {
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
