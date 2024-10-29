import { ref, readonly, computed } from "vue";
import { getProductConfiguration, useCreateConfiguredLineItemMutation } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type {
  ConfigurationSectionInput,
  CreateConfiguredLineItemMutation,
  GetProductConfigurationsQuery,
} from "@/core/api/graphql/types";
import type { Ref } from "vue";

export function useConfigurableProduct() {
  const fetching: Ref<boolean> = ref(false);
  const creating: Ref<boolean> = ref(false);
  const configuration: Ref<GetProductConfigurationsQuery["productConfiguration"] | undefined> = ref();
  const configuredLineItem: Ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"] | undefined> = ref();

  async function fetchProductConfiguration(productId: string) {
    fetching.value = true;
    try {
      configuration.value = await getProductConfiguration(productId);
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${fetchProductConfiguration.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function createConfiguredLineItem(
    configurableProductId: string,
    configurationSections: ConfigurationSectionInput[],
  ) {
    const { mutate } = useCreateConfiguredLineItemMutation(configurableProductId, configurationSections);
    creating.value = true;
    try {
      const result = await mutate();
      configuredLineItem.value = result?.data?.createConfiguredLineItem;
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${createConfiguredLineItem.name}`, e);
      throw e;
    } finally {
      creating.value = false;
    }
  }

  return {
    createConfiguredLineItem,
    fetchProductConfiguration,
    fetching: readonly(fetching),
    creating: readonly(creating),
    loading: computed(() => fetching.value || creating.value),
    configuration: readonly(configuration),
    configuredLineItem: readonly(configuredLineItem),
  };
}
