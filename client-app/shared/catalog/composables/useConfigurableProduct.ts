import { provideApolloClient } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import { ref, readonly, computed } from "vue";
import { apolloClient, getProductConfiguration, useCreateConfiguredLineItemMutation } from "@/core/api/graphql";
import { getMergeStrategyUniqueBy, useMutationBatcher, useRouteQueryParam } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useFullCart } from "@/shared/cart/composables";
import type {
  CartConfigurationItemType,
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

provideApolloClient(apolloClient);

/**
 * Composable function to handle configurable products.
 *
 * @param {string} configurableProductId - The ID of the configurable product.
 * @returns {Object} The composable functions and properties:
 * @returns {Function} fetchProductConfiguration - Function to fetch the product configuration.
 * @returns {Function} selectSectionValue - Function to select a section value for a configuration section.
 * @returns {ComputedRef<boolean>} loading - Computed ref indicating if any operation is in progress.
 * @returns {ShallowReadonly<Ref<ConfigurationSectionType[]>>} configuration - Readonly ref containing the product configuration sections.
 * @returns {Readonly<ComputedRef<Record<string, SelectedConfigurationType>>>} selectedConfiguration - Readonly computed ref of the selected configuration state.
 * @returns {ShallowReadonly<Ref<ConfigurationSectionInput[]>>} selectedConfigurationInput - Readonly ref containing the configuration input data.
 * @returns {Readonly<Ref<CreateConfiguredLineItemMutation['createConfiguredLineItem']>>} configuredLineItem - Readonly ref of the created configured line item.
 */
function _useConfigurableProduct(configurableProductId: string) {
  const fetching: Ref<boolean> = ref(false);
  const creating: Ref<boolean> = ref(false);

  const lineItemId = useRouteQueryParam<string>("lineItemId");

  const configuration: Ref<ConfigurationSectionType[]> = ref([]);
  const configuredLineItem: Ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"]> = ref();
  const selectedConfigurationInput: Ref<ConfigurationSectionInput[] | []> = ref([]);
  const { cart, forceFetch } = useFullCart();

  const selectedConfiguration = computed(() => {
    return selectedConfigurationInput.value
      ?.filter(({ value }) => value !== undefined)
      ?.reduce(
        (acc, section) => {
          const rawSection = configuration.value.find(({ id }) => id === section.sectionId);
          acc[section.sectionId] = {
            productId: section.value?.productId,
            quantity: section.value?.quantity,
            selectedProductTitle: rawSection?.options?.find(({ product }) => product?.id === section.value?.productId)
              ?.product?.name,
          };
          return acc;
        },
        {} as Record<string, SelectedConfigurationType | undefined>,
      );
  });

  async function fetchProductConfiguration() {
    reset();
    fetching.value = true;
    try {
      const data = await getProductConfiguration(configurableProductId);
      configuration.value = (data?.configurationSections as ConfigurationSectionType[]) ?? [];
      const preselectedValues = await getPreselectedValues();

      configuration.value.forEach((section) => {
        const preselectedValue = preselectedValues?.find(({ sectionId }) => sectionId === section.id);
        const isPreselectedValueValid =
          preselectedValue?.productId &&
          section.options?.some(({ product }) => product?.id === preselectedValue.productId);

        if ((preselectedValue && isPreselectedValueValid) || section.isRequired) {
          changeSelectionValue({
            sectionId: section.id,
            value: {
              productId: preselectedValue?.productId ?? section.options?.[0]?.product?.id ?? "",
              quantity: preselectedValue?.quantity ?? section.options?.[0]?.quantity ?? 1,
            },
          });
        }
      });
      void createConfiguredLineItem();
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${fetchProductConfiguration.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  const { mutate } = useCreateConfiguredLineItemMutation();
  const { add: batchedCreateConfiguredLineItem, abort: abortBatchedCreateConfiguredLineItem } = useMutationBatcher(
    mutate,
    {
      mergeStrategy: getMergeStrategyUniqueBy("sectionId"),
    },
  );
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

  function changeSelectionValue(payload: ConfigurationSectionInput) {
    const sectionIndex = selectedConfigurationInput.value?.findIndex(
      (section) => section.sectionId === payload.sectionId,
    );
    if (sectionIndex !== -1) {
      const newValue = [...selectedConfigurationInput.value];
      payload.value ? newValue.splice(sectionIndex, 1, payload) : newValue.splice(sectionIndex, 1);
      selectedConfigurationInput.value = newValue;
    } else if (payload.value) {
      selectedConfigurationInput.value = [...selectedConfigurationInput.value, payload];
    }
  }

  function selectSectionValue(payload: ConfigurationSectionInput) {
    changeSelectionValue(payload);
    void createConfiguredLineItem();
  }

  async function getPreselectedValues(): Promise<CartConfigurationItemType[] | undefined> {
    if (lineItemId.value) {
      await forceFetch();
      const lineItem = cart.value?.items.find(({ id }) => id === lineItemId.value);
      return lineItem?.configurationItems ?? [];
    }
  }

  function reset() {
    fetching.value = false;
    creating.value = false;
    selectedConfigurationInput.value = [];
    configuration.value = [];
    configuredLineItem.value = undefined;
    abortBatchedCreateConfiguredLineItem();
  }

  return {
    fetchProductConfiguration,
    selectSectionValue,
    loading: computed(() => fetching.value || creating.value),
    configuration: readonly(configuration),
    selectedConfiguration: readonly(selectedConfiguration),
    selectedConfigurationInput: readonly(selectedConfigurationInput),
    configuredLineItem: readonly(configuredLineItem),
  };
}

export const useConfigurableProduct = createSharedComposable(_useConfigurableProduct);
