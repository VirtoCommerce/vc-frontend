import { computed, readonly, ref, Ref, shallowRef } from "vue";
import { InputMemberAddressType, MemberAddressType } from "@core/api/graphql/types";
import { getMyAddresses, updateMemberAddresses } from "@core/api/graphql/account";
import { Logger, toInputAddress } from "@core/utilities";
import { getSortingExpression, ISortInfo } from "@/shared/account";
import { sortAscending } from "@core/constants";

export default () => {
  const loading: Ref<boolean> = ref(false);
  const contactId: Ref<string> = ref("");
  const addresses: Ref<MemberAddressType[]> = shallowRef<MemberAddressType[]>([]);
  const defaultShippingAddress: Ref<MemberAddressType | undefined> = ref();
  const defaultBillingAddress: Ref<MemberAddressType | undefined> = ref();

  // TODO: refine the sorting logic
  const sort: Ref<ISortInfo> = ref({
    column: "lastName",
    direction: sortAscending,
  });

  async function loadAddresses() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    try {
      const result = await getMyAddresses(sortingExpression);

      addresses.value = result.addresses?.items ?? [];
      contactId.value = result.id;
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

  async function updateAddresses(items: MemberAddressType[], memberId = contactId.value): Promise<void> {
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

    // TODO: Remove. Return addresses from mutation
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

  async function removeAddresses(idsOrAddress: Array<string | MemberAddressType>, memberId?: string): Promise<void> {
    if (!idsOrAddress.length) return;

    loading.value = true;

    const addressIdsToRemove: string[] =
      typeof idsOrAddress[0] === "string"
        ? (idsOrAddress as string[])
        : (idsOrAddress as MemberAddressType[]).map((item) => item.id!);

    const updatedAddresses: MemberAddressType[] = addresses.value.filter(
      (address) => !addressIdsToRemove.includes(address.id!)
    );

    await updateAddresses(updatedAddresses, memberId);
  }

  return {
    sort,
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
