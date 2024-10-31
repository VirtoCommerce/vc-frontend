import { ref, readonly, computed, watch } from "vue";
import { getProductConfiguration, useCreateConfiguredLineItemMutation } from "@/core/api/graphql/catalog";
import { useMutationBatcher } from "@/core/composables";
import { Logger } from "@/core/utilities";
import type {
  ConfigurationSectionInput,
  CreateConfiguredLineItemMutation,
  GetProductConfigurationsQuery,
} from "@/core/api/graphql/types";
import type { Ref } from "vue";

type SelectedConfigurationType = {
  productId: string | undefined;
  quantity: number | undefined;
  selectedProductTitle: string | undefined;
};

export function useConfigurableProduct(configurableProductId: string) {
  const fetching: Ref<boolean> = ref(false);
  const creating: Ref<boolean> = ref(false);

  const configuration: Ref<GetProductConfigurationsQuery["productConfiguration"] | undefined> = ref();
  const configuredLineItem: Ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"] | undefined> = ref();

  const selectedConfigurationInput: Ref<ConfigurationSectionInput[] | undefined> = ref();
  const selectedConfiguration = computed(() => {
    return selectedConfigurationInput.value?.reduce(
      (acc, section) => {
        const rawSection = configuration.value?.configurationSections?.find((s) => s.name === section.sectionId);
        acc[section.sectionId] = {
          productId: section.value?.productId,
          quantity: section.value?.quantity,
          selectedProductTitle: rawSection?.products?.find(({ id }) => id === section.value?.productId)?.name,
        };
        return acc;
      },
      {} as Record<string, SelectedConfigurationType | undefined>,
    );
  });

  async function fetchProductConfiguration(productId: string) {
    fetching.value = true;
    try {
      configuration.value = await getProductConfiguration(productId);
      selectedConfigurationInput.value = configuration.value?.configurationSections?.map((section) => ({
        sectionId: section.name!, // TODO: change with sectionId
        value: section.isRequired
          ? {
              productId: section.products?.[0]?.id ?? "",
              quantity: section.quantity ?? 1,
            }
          : undefined, // TODO: change with null ?
      }));
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${fetchProductConfiguration.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function createConfiguredLineItem(configurationSections: ConfigurationSectionInput[]) {
    const { mutate } = useCreateConfiguredLineItemMutation();
    const { add: batchedCreateConfiguredLineItem } = useMutationBatcher(mutate);
    creating.value = true;
    try {
      const result = await batchedCreateConfiguredLineItem({
        command: {
          configurableProductId,
          configurationSections,
        },
      });
      configuredLineItem.value = result?.data?.createConfiguredLineItem;
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${createConfiguredLineItem.name}`, e);
      throw e;
    } finally {
      creating.value = false;
    }
  }

  watch(selectedConfigurationInput, (value) => {
    void createConfiguredLineItem(value ?? []);
  });

  return {
    createConfiguredLineItem,
    fetchProductConfiguration,
    fetching: readonly(fetching),
    creating: readonly(creating),
    loading: computed(() => fetching.value || creating.value),
    configuration: readonly(configuration),
    configuredLineItem: readonly(configuredLineItem),
    selectedConfiguration: readonly(selectedConfiguration),
  };
}
