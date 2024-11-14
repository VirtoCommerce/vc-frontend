import { useMemoize } from "@vueuse/core";
import isEqual from "lodash/isEqual";
import { ref, readonly, computed, watch, shallowReadonly } from "vue";
import { getProductConfiguration, useCreateConfiguredLineItemMutation } from "@/core/api/graphql/catalog";
import { getMergeStrategyUniqueBy, useMutationBatcher } from "@/core/composables";
import { Logger } from "@/core/utilities";
import type {
  ConfigurationSectionInput,
  ConfigurationSectionType,
  CreateConfiguredLineItemMutation,
} from "@/core/api/graphql/types";
import type { Ref } from "vue";

type SelectedConfigurationType = {
  productId: string | undefined;
  quantity: number | undefined;
  selectedProductTitle: string | undefined;
};

/**
 * Composable function to handle configurable products.
 *
 * @param {string} configurableProductId - The ID of the configurable product.
 * @returns {Object} - The composable functions and properties.
 * @returns {Function} fetchProductConfiguration - Function to fetch the product configuration.
 * @returns {Function} selectSectionValue - Function to select a section value.
 * @returns {Ref<boolean>} loading - Computed ref indicating if the product configuration fetching or line item creation is in progress.
 * @returns {Ref<ConfigurationSectionType[]>} configuration - Readonly ref containing the product configuration.
 * @returns {Ref<Record<string, SelectedConfigurationType | undefined>>} selectedConfiguration - Readonly ref containing the selected configuration.
 * @returns {Ref<ConfigurationSectionInput[] | []>} selectedConfigurationInput - Readonly ref containing the selected configuration input.
 * @returns {Ref<ConfiguredLineItemType | undefined>} configuredLineItem - Readonly ref containing the created configured line item.
 */
function _useConfigurableProduct(configurableProductId: string) {
  const fetching: Ref<boolean> = ref(false);
  const creating: Ref<boolean> = ref(false);

  const configuration: Ref<ConfigurationSectionType[]> = ref([]);
  const configuredLineItem: Ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"]> = ref();

  const selectedConfigurationInput: Ref<ConfigurationSectionInput[] | []> = ref([]);

  const selectedConfiguration = computed(() => {
    return selectedConfigurationInput.value
      ?.filter(({ value }) => value !== undefined)
      ?.reduce(
        (acc, section) => {
          const rawSection = configuration.value.find(({ id }) => id === section.sectionId);
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
      const data = await getProductConfiguration(configurableProductId);
      configuration.value = (data?.configurationSections as ConfigurationSectionType[]) ?? [];
      selectedConfigurationInput.value =
        configuration.value.map((section) => ({
          sectionId: section.id ?? "",
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
    configuration: shallowReadonly(configuration),
    selectedConfiguration: readonly(selectedConfiguration),
    selectedConfigurationInput: readonly(selectedConfigurationInput),
    configuredLineItem: readonly(configuredLineItem),
  };
}

export const useConfigurableProduct = useMemoize(_useConfigurableProduct);
