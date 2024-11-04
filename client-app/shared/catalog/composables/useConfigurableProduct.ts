import isEqual from "lodash/isEqual";
import { ref, readonly, computed, watch } from "vue";
import { getProductConfiguration, useCreateConfiguredLineItemMutation } from "@/core/api/graphql/catalog";
import { getMergeStrategyUniqueBy, useMutationBatcher } from "@/core/composables";
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

  const selectedConfigurationInput: Ref<ConfigurationSectionInput[] | []> = ref([]);

  const selectedConfiguration = computed(() => {
    return selectedConfigurationInput.value
      ?.filter(({ value }) => value !== undefined)
      ?.reduce(
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

  async function fetchProductConfiguration() {
    fetching.value = true;
    try {
      configuration.value = await getProductConfiguration(configurableProductId);
      selectedConfigurationInput.value =
        configuration.value?.configurationSections?.map((section) => ({
          sectionId: section.id || "",
          value: section.isRequired
            ? {
                productId: section.products?.[0]?.id ?? "",
                quantity: section.quantity ?? 1,
              }
            : undefined,
        })) ?? [];
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${fetchProductConfiguration.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  const { mutate } = useCreateConfiguredLineItemMutation();
  const { add: batchedCreateConfiguredLineItem } = useMutationBatcher(mutate, {
    mergeStrategy: getMergeStrategyUniqueBy("sectionId"),
  });
  async function createConfiguredLineItem() {
    creating.value = true;
    try {
      const result = await batchedCreateConfiguredLineItem({
        command: {
          configurableProductId,
          configurationSections: selectedConfigurationInput.value,
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

  function selectSectionValue(payload: ConfigurationSectionInput) {
    const sectionIndex = selectedConfigurationInput.value?.findIndex(
      (section) => section.sectionId === payload.sectionId,
    );
    if (sectionIndex !== -1) {
      const newValue = [...selectedConfigurationInput.value];
      newValue?.splice(sectionIndex, 1, payload);
      selectedConfigurationInput.value = newValue;
    } else {
      selectedConfigurationInput.value = [...selectedConfigurationInput.value, payload];
    }
  }

  watch(
    selectedConfigurationInput,
    (newValue, oldValue) => {
      if (!isEqual(newValue, oldValue)) {
        void createConfiguredLineItem();
      }
    },
    {
      deep: true,
    },
  );

  return {
    fetchProductConfiguration,
    selectSectionValue,
    loading: computed(() => fetching.value || creating.value),
    configuration: readonly(configuration),
    selectedConfiguration: readonly(selectedConfiguration),
    configuredLineItem: readonly(configuredLineItem),
  };
}
