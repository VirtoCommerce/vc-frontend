import { computed, readonly, ref } from "vue";
import { getFulfillmentCenter, getFulfillmentCenters } from "@/core/api/graphql/fulfillmentCenters";
import { Logger } from "@/core/utilities";
import type { IFulfillmentCenter } from "../types";

export function useFulfillmentCenters() {
  const loading = ref(true);
  const fulfillmentCenter = ref<IFulfillmentCenter | null>(null);
  const fulfillmentCenters = ref<IFulfillmentCenter[]>([]);

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
        }`.trim(),
        phone: address?.phone,
      };
    } catch (e) {
      Logger.error(`useFulfillmentCenters.${loadFulfillmentCenter.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadFulfillmentCenters() {
    loading.value = true;

    try {
      const { items = [] } = await getFulfillmentCenters();

      fulfillmentCenters.value = items.map((item) => {
        const { postalCode, countryName, city, line1, phone } = item.address || {};
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          shortDescription: item.shortDescription,
          address: `${line1}, ${city}, ${countryName} ${postalCode ?? ""}`,
          phone: phone,
        };
      });
    } catch (e) {
      Logger.error(`useFulfillmentCenters.${loadFulfillmentCenters.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    loadFulfillmentCenter,
    loadFulfillmentCenters,
    fulfillmentCenter: computed(() => fulfillmentCenter.value),
    fulfillmentCenters: computed(() => fulfillmentCenters.value),
  };
}
