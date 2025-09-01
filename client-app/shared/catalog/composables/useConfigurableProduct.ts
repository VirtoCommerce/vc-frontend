import { provideApolloClient, useMutation } from "@vue/apollo-composable";
import { ref, readonly, computed } from "vue";
import { useI18n } from "vue-i18n";
import { apolloClient, getConfigurationItems, getProductConfiguration } from "@/core/api/graphql";
import { ChangeCartConfiguredItemDocument, CreateConfiguredLineItemDocument } from "@/core/api/graphql/types";
import { getMergeStrategyUniqueBy, useMutationBatcher } from "@/core/composables";
import { LINE_ITEM_ID_URL_SEARCH_PARAM } from "@/core/constants";
import { globals } from "@/core/globals";
import { createSharedComposableByArgs, getUrlSearchParam, Logger } from "@/core/utilities";
import { toCSV } from "@/core/utilities/common";
import { useShortCart } from "@/shared/cart/composables";
import { compareConfigurationInputs } from "@/shared/catalog/utilities/compareConfiguration";
import { CONFIGURABLE_SECTION_TYPES } from "../constants/configurableProducts";
import type {
  CartConfigurationItemFileType,
  CartConfigurationItemType,
  ConfigurationSectionInput,
  ConfigurationSectionType,
  CreateConfiguredLineItemMutation,
  ShortCartFragment,
} from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

type SectionValueType = Omit<CartConfigurationItemType, "id">;

type SelectedConfigurationType = {
  productId: string | undefined;
  quantity: number | undefined;
  selectedOptionTextValue: string | undefined;
  files: CartConfigurationItemFileType[];
};

provideApolloClient(apolloClient);

/**
 * Composable function to handle configurable products.
 *
 * @param {string} configurableProductId - The ID of the configurable product.
 * @returns {Object} The composable functions and properties:
 * @returns {Function} fetchProductConfiguration - Function to fetch the product configuration.
 * @returns {Function} selectSectionValue - Function to select a section value for a configuration section.
 * @returns {Function} changeCartConfiguredItem - Function to change the cart configured item.
 * @returns {Function} validateSections - Function to validate the configuration input. Populates the validationErrors map with the errors and returns true if there are errors.
 * @returns {ComputedRef<boolean>} loading - Computed ref indicating if any operation is in progress.
 * @returns {ShallowReadonly<Ref<ConfigurationSectionType[]>>} configuration - Readonly ref containing the product configuration sections.
 * @returns {Readonly<ComputedRef<Record<string, SelectedConfigurationType>>>} selectedConfiguration - Readonly computed ref of the selected configuration state. Mapped by sectionId.
 * @returns {ShallowReadonly<Ref<ConfigurationSectionInput[]>>} selectedConfigurationInput - Readonly ref containing the configuration input data. Aimed to be used in mutations.
 * @returns {Readonly<Ref<CreateConfiguredLineItemMutation['createConfiguredLineItem']>>} configuredLineItem - Readonly ref of the created configured line item.
 * @returns {Readonly<ComputedRef<boolean>>} isConfigurationChanged - Readonly computed ref indicating if the configuration has changed.
 * @returns {Readonly<ComputedRef<Map<string, string>>>} validationErrors - Readonly computed ref of the validation errors.
 */
function _useConfigurableProduct(configurableProductId: string) {
  const fetching = ref(false);
  const creating = ref(false);
  const configuration = ref<ConfigurationSectionType[]>([]);
  const configuredLineItem = ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"]>();
  const selectedConfigurationValue = ref<SectionValueType[]>([]);
  const initialSelectedConfigurationInput = ref<DeepReadonly<ConfigurationSectionInput[] | []>>([]);
  const validationErrors = ref<Map<string, string>>(new Map());

  const { t } = useI18n();
  const { cart } = useShortCart();
  const { storeId, currencyCode, cultureName, userId } = globals;

  const loading = computed(() => fetching.value || creating.value || changeCartConfiguredItemLoading.value);

  const isConfigurationChanged = computed(() => {
    if (initialSelectedConfigurationInput.value.length !== selectedConfigurationValue.value.length) {
      return true;
    }
    return initialSelectedConfigurationInput.value.some(
      (section, i) => !compareInputs(section, selectedConfigurationInput.value[i]),
    );
  });

  const selectedConfigurationInput = computed(() => {
    return selectedConfigurationValue.value.map((value) => preselectedValueToInputSection(value));
  });

  const selectedConfiguration = computed(() => {
    return selectedConfigurationValue.value
      ?.filter((value) => isValidValue(value.sectionId, value))
      ?.reduce(
        (acc, section) => {
          acc[section.sectionId] = {
            productId: section.productId,
            quantity: section.quantity,
            selectedOptionTextValue: getSelectedOptionTextValue(section, section.sectionId),
            files: section.files ?? [],
          };
          return acc;
        },
        {} as Record<string, SelectedConfigurationType | undefined>,
      );
  });

  function changeSelectionValue(payload: SectionValueType) {
    const index = selectedConfigurationValue.value?.findIndex((section) => section.sectionId === payload.sectionId);
    if (index !== -1) {
      const newValue = [...selectedConfigurationValue.value];
      isEmptyValue(payload.sectionId, payload) ? newValue.splice(index, 1) : newValue.splice(index, 1, payload);
      selectedConfigurationValue.value = newValue;
    } else {
      selectedConfigurationValue.value = [...selectedConfigurationValue.value, payload];
    }
  }

  function selectSectionValue(payload: SectionValueType) {
    changeSelectionValue(payload);
    void createConfiguredLineItem();
    validateSection(payload.sectionId);
  }

  function getSelectedOptionTextValue(section: SectionValueType, sectionId: string) {
    const rawSection = configuration.value.find(({ id }) => id === sectionId);
    switch (rawSection?.type) {
      case CONFIGURABLE_SECTION_TYPES.text:
        return section.customText;
      case CONFIGURABLE_SECTION_TYPES.product:
        return rawSection.options?.find(({ product }) => product?.id === section.productId)?.product?.name;
      case CONFIGURABLE_SECTION_TYPES.file:
        return toCSV(section.files?.map((file) => file.name) ?? []);
      default:
    }
  }

  function validateValue(
    sectionId: string,
    value?: SectionValueType,
  ): { isValid: boolean } & ({ isValid: true } | { isValid: false; error: string }) {
    const section = configuration.value.find(({ id }) => id === sectionId);
    switch (section?.type) {
      case CONFIGURABLE_SECTION_TYPES.product: {
        const isExistingProduct = section.options?.some(({ product }) => product?.id === value?.productId) ?? false;
        const isRequired = section.isRequired;
        const isEmpty = !value?.productId;

        const isValid = isEmpty ? !isRequired : isExistingProduct;
        return isValid
          ? { isValid }
          : { isValid, error: t("shared.catalog.product_details.product_configuration.required_section") };
      }
      case CONFIGURABLE_SECTION_TYPES.text: {
        const isValid = !section.isRequired || !!value?.customText?.trim();
        return isValid
          ? { isValid }
          : { isValid, error: t("shared.catalog.product_details.product_configuration.required_section") };
      }
      case CONFIGURABLE_SECTION_TYPES.file: {
        const isValid = !section.isRequired || !!value?.files?.length;
        return isValid
          ? { isValid }
          : { isValid, error: t("shared.catalog.product_details.product_configuration.required_section") };
      }
      default:
        return { isValid: false, error: "Invalid section type" };
    }
  }

  function isValidValue(sectionId: string, value?: SectionValueType) {
    return validateValue(sectionId, value).isValid;
  }

  function validateSection(sectionId: string) {
    const section = configuration.value.find(({ id }) => id === sectionId);
    if (!section) {
      return;
    }
    const input = selectedConfigurationValue.value.find((value) => value.sectionId === section.id);

    if (!input && section.isRequired) {
      validationErrors.value.set(
        section.id,
        t("shared.catalog.product_details.product_configuration.required_section"),
      );
    } else if (input) {
      const validationResult = validateValue(section.id, input);
      if (!validationResult.isValid) {
        validationErrors.value.set(section.id, validationResult.error);
      } else {
        validationErrors.value.delete(section.id);
      }
    }
  }

  function validateSections() {
    validationErrors.value.clear();

    configuration.value.forEach((section) => validateSection(section.id));
    return validationErrors.value.size === 0;
  }

  function isEmptyValue(sectionId: string, value?: SectionValueType) {
    const section = configuration.value.find(({ id }) => id === sectionId);
    switch (section?.type) {
      case CONFIGURABLE_SECTION_TYPES.product:
        return !value?.productId;
      case CONFIGURABLE_SECTION_TYPES.text:
        return !value?.customText;
      case CONFIGURABLE_SECTION_TYPES.file:
        return !value?.files?.length;
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

  const { mutate: createConfiguredLineItemMutation } = useMutation(CreateConfiguredLineItemDocument);
  const { add: batchedCreateConfiguredLineItem, abort: abortBatchedCreateConfiguredLineItem } = useMutationBatcher(
    createConfiguredLineItemMutation,
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
          cultureName,
          currencyCode,
          storeId,
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

  const { mutate: _changeCartConfiguredItem, loading: changeCartConfiguredItemLoading } = useMutation(
    ChangeCartConfiguredItemDocument,
  );
  const { add: batchedChangeCartConfiguredItem, overflowed: batchedChangeCartConfiguredItemOverflowed } =
    useMutationBatcher(_changeCartConfiguredItem);
  async function changeCartConfiguredItemFunction(
    lineItemId: string,
    quantity?: number,
    configurationSections?: DeepReadonly<ConfigurationSectionInput[]>,
    mutation: typeof _changeCartConfiguredItem | typeof batchedChangeCartConfiguredItem = _changeCartConfiguredItem,
  ): Promise<ShortCartFragment | undefined> {
    try {
      const result = await mutation({
        command: {
          lineItemId,
          userId,
          quantity,
          configurationSections: configurationSections as ConfigurationSectionInput[],
          cultureName,
          currencyCode,
          storeId,
        },
      });
      initialSelectedConfigurationInput.value = configurationSections ?? [];
      return result?.data?.changeCartConfiguredItem;
    } catch (e) {
      Logger.error(`${useConfigurableProduct.name}.${changeCartConfiguredItem.name}`, e);
      throw e;
    }
  }

  async function changeCartConfiguredItem(
    lineItemId: string,
    quantity?: number,
    configurationSections?: DeepReadonly<ConfigurationSectionInput[]>,
  ) {
    return changeCartConfiguredItemFunction(lineItemId, quantity, configurationSections, _changeCartConfiguredItem);
  }

  async function changeCartConfiguredItemBatched(
    lineItemId: string,
    quantity?: number,
    configurationSections?: DeepReadonly<ConfigurationSectionInput[]>,
  ) {
    return changeCartConfiguredItemFunction(
      lineItemId,
      quantity,
      configurationSections,
      batchedChangeCartConfiguredItem,
    );
  }

  function reset() {
    fetching.value = false;
    creating.value = false;
    selectedConfigurationValue.value = [];
    initialSelectedConfigurationInput.value = [];
    configuration.value = [];
    configuredLineItem.value = undefined;
    abortBatchedCreateConfiguredLineItem();
    validationErrors.value.clear();
  }

  function updateWithDefaultValues() {
    configuration.value.forEach((section) => {
      if (!section.isRequired) {
        return;
      }
      switch (section.type) {
        case CONFIGURABLE_SECTION_TYPES.product:
          changeSelectionValue({
            sectionId: section.id,
            type: section.type,
            productId: section.options?.[0]?.product?.id ?? "",
            quantity: section.options?.[0]?.quantity ?? 1,
          });
          break;
        case CONFIGURABLE_SECTION_TYPES.text:
          break;
        case CONFIGURABLE_SECTION_TYPES.file:
          break;
      }
    });
  }

  function updateWithPreselectedValues(preselectedValues?: CartConfigurationItemType[]) {
    preselectedValues?.forEach((value) => {
      const section = configuration.value.find(({ id }) => id === value.sectionId);
      const isPreselectedValueValid = !!section && isValidValue(section.id, value);
      if (isPreselectedValueValid) {
        changeSelectionValue(value);
      }
    });
  }

  function preselectedValueToInputSection(value: SectionValueType): ConfigurationSectionInput {
    return {
      sectionId: value.sectionId,
      customText: value.customText,
      type: value.type,
      option:
        value.type === CONFIGURABLE_SECTION_TYPES.product && value.productId && value.quantity
          ? {
              productId: value.productId,
              quantity: value.quantity,
            }
          : undefined,
      fileUrls: value.files?.map((file) => file.url),
    };
  }

  function compareInputs(
    input1: DeepReadonly<ConfigurationSectionInput>,
    input2: DeepReadonly<ConfigurationSectionInput>,
  ) {
    return compareConfigurationInputs(input1, input2);
  }

  return {
    fetchProductConfiguration,
    selectSectionValue,
    changeCartConfiguredItem,
    changeCartConfiguredItemBatched,
    validateSections,
    updateWithPreselectedValues,

    loading: readonly(loading),
    changeCartConfiguredItemOverflowed: batchedChangeCartConfiguredItemOverflowed,
    configuration: readonly(configuration),
    selectedConfiguration: readonly(selectedConfiguration),
    selectedConfigurationInput: readonly(selectedConfigurationInput),
    configuredLineItem: readonly(configuredLineItem),
    isConfigurationChanged: readonly(isConfigurationChanged),
    validationErrors: readonly(validationErrors),
  };
}

export const useConfigurableProduct = createSharedComposableByArgs(_useConfigurableProduct);
