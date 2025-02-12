import { provideApolloClient } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import isEqual from "lodash/isEqual";
import { ref, readonly, computed } from "vue";
import {
  apolloClient,
  getConfigurationItems,
  getProductConfiguration,
  useChangeCartConfiguredItemMutation,
  useCreateConfiguredLineItemMutation,
} from "@/core/api/graphql";
import { ProductConfigurationSectionType, CartConfigurationItemEnumType } from "@/core/api/graphql/types";
import { getMergeStrategyUniqueBy, useMutationBatcher } from "@/core/composables";
import { LINE_ITEM_ID_URL_SEARCH_PARAM } from "@/core/constants";
import { getUrlSearchParam, Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import type {
  CartConfigurationItemType,
  ConfigurationSectionInput,
  ConfigurationSectionType,
  CreateConfiguredLineItemMutation,
  ShortCartFragment,
} from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

type SelectedConfigurationType = {
  productId: string | undefined;
  quantity: number | undefined;
  selectedOptionTextValue: string | undefined;
};

type InputSectionType = Pick<ConfigurationSectionInput, "type" | "sectionId" | "customText" | "option">;

provideApolloClient(apolloClient);

/**
 * Composable function to handle configurable products.
 *
 * @param {string} configurableProductId - The ID of the configurable product.
 * @returns {Object} The composable functions and properties:
 * @returns {Function} fetchProductConfiguration - Function to fetch the product configuration.
 * @returns {Function} selectSectionValue - Function to select a section value for a configuration section.
 * @returns {Function} changeCartConfiguredItem - Function to change the cart configured item.
 * @returns {ComputedRef<boolean>} loading - Computed ref indicating if any operation is in progress.
 * @returns {ShallowReadonly<Ref<ConfigurationSectionType[]>>} configuration - Readonly ref containing the product configuration sections.
 * @returns {Readonly<ComputedRef<Record<string, SelectedConfigurationType>>>} selectedConfiguration - Readonly computed ref of the selected configuration state.
 * @returns {ShallowReadonly<Ref<ConfigurationSectionInput[]>>} selectedConfigurationInput - Readonly ref containing the configuration input data.
 * @returns {Readonly<Ref<CreateConfiguredLineItemMutation['createConfiguredLineItem']>>} configuredLineItem - Readonly ref of the created configured line item.
 * @returns {Readonly<ComputedRef<boolean>>} isConfigurationChanged - Readonly computed ref indicating if the configuration has changed.
 */
function _useConfigurableProduct(configurableProductId: string) {
  const fetching = ref(false);
  const creating = ref(false);
  const configuration = ref<ConfigurationSectionType[]>([]);
  const configuredLineItem = ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"]>();
  const selectedConfigurationInput = ref<ConfigurationSectionInput[]>([]);
  const initialSelectedConfigurationInput = ref<DeepReadonly<ConfigurationSectionInput[] | []>>([]);

  const { cart } = useShortCart();
  const { mutate: _changeCartConfiguredItem, loading: changeCartConfiguredItemLoading } =
    useChangeCartConfiguredItemMutation();
  const { mutate } = useCreateConfiguredLineItemMutation();
  const { add: batchedCreateConfiguredLineItem, abort: abortBatchedCreateConfiguredLineItem } = useMutationBatcher(
    mutate,
    { mergeStrategy: getMergeStrategyUniqueBy("sectionId") },
  );

  const loading = computed(() => fetching.value || creating.value || changeCartConfiguredItemLoading.value);
  const isConfigurationChanged = computed(() => {
    if (initialSelectedConfigurationInput.value.length !== selectedConfigurationInput.value.length) {
      return true;
    }
    return initialSelectedConfigurationInput.value.some(
      (section, i) => !compareInputs(section, selectedConfigurationInput.value[i]),
    );
  });

  const selectedConfiguration = computed(() => {
    return selectedConfigurationInput.value
      ?.filter((value) => isValidValue(value.sectionId, value))
      ?.reduce(
        (acc, section) => {
          acc[section.sectionId] = {
            productId: section.option?.productId,
            quantity: section.option?.quantity,
            selectedOptionTextValue: getSelectedOptionTextValue(section, section.sectionId),
          };
          return acc;
        },
        {} as Record<string, SelectedConfigurationType | undefined>,
      );
  });

  function changeSelectionValue(payload: ConfigurationSectionInput) {
    const index = selectedConfigurationInput.value?.findIndex((section) => section.sectionId === payload.sectionId);
    if (index !== -1) {
      const newValue = [...selectedConfigurationInput.value];
      isEmptyValue(payload.sectionId, payload) ? newValue.splice(index, 1) : newValue.splice(index, 1, payload);
      selectedConfigurationInput.value = newValue;
    } else {
      selectedConfigurationInput.value = [...selectedConfigurationInput.value, payload];
    }
  }

  function selectSectionValue(payload: ConfigurationSectionInput) {
    changeSelectionValue(payload);
    void createConfiguredLineItem();
  }

  function getSelectedOptionTextValue(section: ConfigurationSectionInput, sectionId: string) {
    const rawSection = configuration.value.find(({ id }) => id === sectionId);
    switch (rawSection?.type) {
      case ProductConfigurationSectionType.Text:
        return section.customText;
      case ProductConfigurationSectionType.Product:
        return rawSection.options?.find(({ product }) => product?.id === section.option?.productId)?.product?.name;
      default:
        return "";
    }
  }

  function isValidValue(sectionId: string, value?: InputSectionType) {
    const section = configuration.value.find(({ id }) => id === sectionId);
    switch (section?.type) {
      case ProductConfigurationSectionType.Product:
        return section.options?.some(({ product }) => product?.id === value?.option?.productId);
      case ProductConfigurationSectionType.Text:
        return !!value?.customText;
      default:
        return false;
    }
  }

  function isEmptyValue(sectionId: string, value?: InputSectionType) {
    const section = configuration.value.find(({ id }) => id === sectionId);
    switch (section?.type) {
      case ProductConfigurationSectionType.Product:
        return !value?.option?.productId;
      case ProductConfigurationSectionType.Text:
        return !value?.customText;
      default:
        return true;
    }
  }

  async function fetchProductConfiguration() {
    reset();
    fetching.value = true;
    try {
      const data = await getProductConfiguration(configurableProductId);
      configuration.value = (data?.configurationSections as ConfigurationSectionType[]) ?? [];

      const preselectedValues = await getPreselectedValues();
      updateWithDefaultValues();
      updateWithPreselectedValues(preselectedValues);

      initialSelectedConfigurationInput.value = selectedConfigurationInput.value;
      void createConfiguredLineItem();
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${fetchProductConfiguration.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

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

  async function getPreselectedValues(): Promise<CartConfigurationItemType[] | undefined> {
    const lineItemId = getUrlSearchParam(LINE_ITEM_ID_URL_SEARCH_PARAM);
    if (lineItemId) {
      try {
        const result = await getConfigurationItems(lineItemId, cart.value?.id);
        return (result?.configurationItems as CartConfigurationItemType[]) ?? [];
      } catch (e) {
        Logger.error(`${useConfigurableProduct.name}.${getPreselectedValues.name}`, e);
        throw e;
      }
    }
  }

  async function changeCartConfiguredItem(
    lineItemId: string,
    quantity?: number,
    configurationSections?: DeepReadonly<ConfigurationSectionInput[]>,
  ): Promise<ShortCartFragment | undefined> {
    try {
      const result = await _changeCartConfiguredItem({
        lineItemId,
        quantity,
        configurationSections: configurationSections as ConfigurationSectionInput[],
      });
      initialSelectedConfigurationInput.value = configurationSections ?? [];
      return result?.data?.changeCartConfiguredItem;
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${changeCartConfiguredItem.name}`, e);
      throw e;
    }
  }

  function reset() {
    fetching.value = false;
    creating.value = false;
    selectedConfigurationInput.value = [];
    initialSelectedConfigurationInput.value = [];
    configuration.value = [];
    configuredLineItem.value = undefined;
    abortBatchedCreateConfiguredLineItem();
  }

  function updateWithDefaultValues() {
    configuration.value.forEach((section) => {
      if (!section.isRequired) {
        return;
      }
      switch (section.type) {
        case ProductConfigurationSectionType.Product:
          changeSelectionValue({
            sectionId: section.id,
            type: section.type as unknown as CartConfigurationItemEnumType,
            option: {
              productId: section.options?.[0]?.product?.id ?? "",
              quantity: section.options?.[0]?.quantity ?? 1,
            },
          });
          break;
        case ProductConfigurationSectionType.Text:
          break;
      }
    });
  }

  function updateWithPreselectedValues(preselectedValues?: CartConfigurationItemType[]) {
    preselectedValues?.forEach((value) => {
      const section = configuration.value.find(({ id }) => id === value.sectionId);
      const isPreselectedValueValid = !!section && isValidValue(section.id, preselectedValueToInputSection(value));
      if (isPreselectedValueValid) {
        changeSelectionValue(preselectedValueToInputSection(value));
      }
    });
  }

  function preselectedValueToInputSection(value: CartConfigurationItemType): InputSectionType {
    return {
      sectionId: value.sectionId ?? "",
      customText: value.customText,
      type: value.type,
      option:
        value.type === CartConfigurationItemEnumType.Product && value.productId && value.quantity
          ? {
              productId: value.productId,
              quantity: value.quantity,
            }
          : undefined,
    };
  }

  function compareInputs(input1: ConfigurationSectionInput, input2: ConfigurationSectionInput) {
    switch (input1.type) {
      case CartConfigurationItemEnumType.Product:
        return isEqual(input1.option, input2.option);
      case CartConfigurationItemEnumType.Text:
        return input1.customText === input2.customText;
      default:
        return true;
    }
  }

  return {
    fetchProductConfiguration,
    selectSectionValue,
    changeCartConfiguredItem,
    loading: readonly(loading),
    configuration: readonly(configuration),
    selectedConfiguration: readonly(selectedConfiguration),
    selectedConfigurationInput: readonly(selectedConfigurationInput),
    configuredLineItem: readonly(configuredLineItem),
    isConfigurationChanged: readonly(isConfigurationChanged),
  };
}

export const useConfigurableProduct = createSharedComposable(_useConfigurableProduct);
