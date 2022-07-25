import { computed, readonly, Ref, ref } from "vue";
import { getFulfillmentCenter } from "@/xapi/graphql/fulfillmentCenters";
import { Logger } from "@/core/utilities";
import { IFulfillmentCenter } from "../types";

export default () => {
  const loading = ref(true);
  const fulfillmentCenter: Ref<IFulfillmentCenter | null> = ref(null);

  async function loadFulfillmentCenter(branchId: string) {
    loading.value = true;

    try {
      const {
        id = "",
        name = "",
        description = "",
        shortDescription = "",
        address,
      } = (await getFulfillmentCenter(branchId)) || {};

      fulfillmentCenter.value = {
        id: id,
        name: name,
        description: description,
        shortDescription: shortDescription,
        address: `${address?.line1}, ${address?.city}, ${address?.countryName} ${
          address?.postalCode ? address?.postalCode : ""
        }`,
      };
    } catch (e) {
      Logger.error(`useFulfillmentCenters.${getFulfillmentCenter.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    loadFulfillmentCenter,
    fulfillmentCenter: computed(() => fulfillmentCenter.value),
  };
};
