import { computed, readonly, ref, Ref, shallowRef, unref } from "vue";
import { InputMemberAddressType, MemberAddressType, UserType } from "@core/api/graphql/types";
import { getMyAddresses, updateMemberAddresses, deleteMemberAddresses } from "@core/api/graphql/account";
import { isEqualAddresses, Logger, toInputAddress } from "@core/utilities";
import { getSortingExpression, ISortInfo } from "@/shared/account";
import { sortAscending } from "@core/constants";
import { MaybeRef } from "@vueuse/core";
import { AnyAddressType } from "@core/types";

export default (options: { user: MaybeRef<UserType> }) => {
  const { user } = options;

  const loading: Ref<boolean> = ref(false);
  const addresses: Ref<MemberAddressType[]> = shallowRef<MemberAddressType[]>([]);
  const defaultShippingAddress: Ref<MemberAddressType | undefined> = ref();
  const defaultBillingAddress: Ref<MemberAddressType | undefined> = ref();

  // TODO: refine the sorting logic
  const sort: Ref<ISortInfo> = ref({
    column: "lastName",
    direction: sortAscending,
  });

  function isExistAddress(address: AnyAddressType): boolean {
    return addresses.value.some((item) => isEqualAddresses(item, address));
  }

  async function loadAddresses() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    try {
      addresses.value = await getMyAddresses({ sort: sortingExpression });
    } catch (e) {
      Logger.error("useUserAddresses.loadAddresses", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function setDefaultAddress(address: MemberAddressType): Promise<void> {
    //TODO: will be implemented in the separate story
  }

  async function updateAddresses(items: MemberAddressType[], memberId = unref(user).memberId!): Promise<void> {
    loading.value = true;

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await updateMemberAddresses(memberId, inputAddresses);
    } catch (e) {
      Logger.error("useUserAddresses.updateAddresses", e);
      throw e;
    } finally {
      loading.value = false;
    }

    await loadAddresses();
  }

  async function addOrUpdateAddresses(items: MemberAddressType[], memberId?: string): Promise<void> {
    if (!items.length) return;

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

    await updateAddresses(updatedAddresses, memberId);
  }

  async function removeAddresses(items: MemberAddressType[], memberId = unref(user).memberId!): Promise<void> {
    if (!items.length) return;

    loading.value = true;

    const inputAddresses: InputMemberAddressType[] = items.map(toInputAddress);

    try {
      await deleteMemberAddresses(inputAddresses, memberId);
    } catch (e) {
      Logger.error(`useUserAddresses.${removeAddresses.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await loadAddresses();
  }

  return {
    sort,
    isExistAddress,
    loadAddresses,
    setDefaultAddress,
    updateAddresses,
    addOrUpdateAddresses,
    removeAddresses,
    loading: readonly(loading),
    addresses: computed(() => addresses.value),
    defaultShippingAddress: computed(() => defaultShippingAddress.value),
    defaultBillingAddress: computed(() => defaultBillingAddress.value),
  };
};
