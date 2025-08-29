<template>
  <VcEmptyPage
    v-if="!productsToShow.length"
    :breadcrumbs="breadcrumbs"
    :title="$t('pages.compare.empty_list.title')"
    icon="outline-compare"
    image="pills.jpg"
  >
    <div class="mb-6 text-lg font-bold">
      {{ $t("pages.compare.empty_list.message") }}
    </div>

    <VcButton v-if="!!continue_shopping_link" :external-link="continue_shopping_link" prepend-icon="shopping-bag">
      {{ $t("pages.compare.empty_list.button_text") }}
    </VcButton>

    <VcButton v-else to="/" prepend-icon="shopping-bag">
      {{ $t("pages.compare.empty_list.button_text") }}
    </VcButton>
  </VcEmptyPage>

  <VcContainer v-else>
    <!-- Page header -->
    <VcBreadcrumbs :items="breadcrumbs" class="mb-3"></VcBreadcrumbs>

    <div class="flex flex-col lg:mb-5 lg:flex-row lg:space-x-12">
      <div class="space-y-1.5">
        <VcTypography tag="h1">
          {{ $t("pages.compare.header_block.title") }}
        </VcTypography>

        <i18n-t keypath="pages.compare.header_block.counter_message" scope="global" tag="span" class="mb-3 block">
          <template #productsNumber>
            <strong>{{ productsToShow.length }}</strong>
          </template>

          <template #productsLimit>
            <strong>{{ productsLimit }}</strong>
          </template>
        </i18n-t>
      </div>

      <div class="mb-5 flex grow items-start justify-between lg:mb-0">
        <VcCheckbox v-model="showOnlyDifferences" class="mt-2">
          {{ $t("pages.compare.header_block.differences_checkbox_label") }}
        </VcCheckbox>

        <VcButton variant="outline" size="sm" @click="openClearListModal">
          {{ $t("pages.compare.header_block.clear_button") }}
        </VcButton>
      </div>
    </div>

    <!-- Main block -->
    <VcWidget size="lg">
      <template #default-container>
        <div
          ref="cardsElement"
          class="hide-scrollbar sticky top-[-7.5rem] z-10 max-w-full overflow-x-auto rounded-t-[--radius] bg-additional-50 shadow-lg lg:top-[-8.25rem] lg:ps-[9.6rem]"
        >
          <!-- Product cards block -->
          <div class="float-left flex min-w-full gap-4.5 p-5">
            <ProductCardCompare
              v-for="(product, index) in productsToShow"
              :key="product.id"
              :product="product"
              class="w-[9.625rem] lg:w-[13.625rem]"
              :query-string="
                isProductInConfigurableGroup(product, index) ? getConfigurationProductByIndex(index).id : undefined
              "
              :with-configuration="isProductInConfigurableGroup(product, index)"
              @remove="removeFromCompareListHandler(product, index)"
              @link-click="selectItemEvent(product)"
            />
          </div>
        </div>

        <div ref="propertiesElement" class="relative w-full overflow-x-auto py-5 lg:pt-0">
          <!-- Properties block -->
          <div class="float-left min-w-full space-y-5 lg:space-y-0">
            <div
              v-for="(prop, index) in showOnlyDifferences ? propertiesDiffs : properties"
              :key="index"
              class="flex gap-4.5 px-5 lg:min-h-17 lg:items-center lg:border-0 lg:py-2 lg:odd:bg-neutral-50"
            >
              <div class="hidden w-[8.5rem] shrink-0 pl-1 text-sm font-black lg:block">{{ prop.label }}</div>

              <div
                v-for="(value, i) in prop.values"
                :key="i"
                class="w-[9.625rem] shrink-0 text-xs lg:w-[13.625rem] lg:px-2 lg:text-sm"
              >
                <div class="font-black lg:hidden">{{ prop.label }}</div>

                <div class="break-words text-neutral-700">{{ value }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcWidget>
  </VcContainer>
</template>

<script setup lang="ts">
import { useMutation } from "@vue/apollo-composable";
import pickBy from "lodash/pickBy";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { CreateConfiguredLineItemDocument } from "@/core/api/graphql/types";
import { useBreadcrumbs, useAnalytics, usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { globals } from "@/core/globals";
import { getPropertyValue, Logger } from "@/core/utilities";
import { ProductCardCompare, useProducts } from "@/shared/catalog";
import { useCompareProducts } from "@/shared/compare";
import { useModal } from "@/shared/modal";
import { VcConfirmationModal } from "@/ui-kit/components";
import type { CreateConfiguredLineItemMutation, Product } from "@/core/api/graphql/types";

const EMPTY_VALUE_PLACEHOLDER = "\u2013";

interface ICompareProductProperties {
  [key: string]: { label: string; values: string[] };
}

type ConfiguredLineItemType = CreateConfiguredLineItemMutation["createConfiguredLineItem"];

const { t } = useI18n();

usePageHead({
  title: t("pages.compare.meta.title"),
  meta: {
    keywords: t("pages.compare.meta.keywords"),
    description: t("pages.compare.meta.description"),
  },
});

const { storeId, currencyCode, cultureName } = globals;

const { mutate: createConfiguredLineItemMutation } = useMutation(CreateConfiguredLineItemDocument);
const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { analytics } = useAnalytics();
const { fetchProducts, products } = useProducts();
const { clearCompareList, productsLimit, removeFromCompareList, productsIds, configProductsToCompare } =
  useCompareProducts();
const breadcrumbs = useBreadcrumbs([{ title: t("pages.compare.links.compare_products") }]);
const { openModal, closeModal } = useModal();

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const showOnlyDifferences = ref(false);

const properties = ref<ICompareProductProperties>({});

const configProductsConfiguredItems = ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"][]>([]);

const cardsElement = ref<HTMLElement | null>(null);
const propertiesElement = ref<HTMLElement | null>(null);

const allProductIdsToShow = computed(() => {
  const configProductsIds = configProductsToCompare.value.map((configProduct) => configProduct.productId);
  return [...productsIds.value, ...configProductsIds];
});

const allProductIdsForFetch = computed(() => uniq(allProductIdsToShow.value));

const productsToShow = computed(() =>
  allProductIdsToShow.value.map(buildProductForDisplay).filter((p): p is Product => p !== null),
);

const propertiesDiffs = computed<ICompareProductProperties>(() => {
  return pickBy(properties.value, (prop) => uniq(prop.values).length !== 1);
});

const compareProductsListProperties = computed(() => ({
  item_list_id: "compare_products",
  item_list_name: t("pages.compare.header_block.title"),
}));

function normalizeProductProperties(product: Product) {
  return {
    ...product,
    properties: product.properties.map((prop) => ({
      ...prop,
      name: prop.name.toLowerCase(),
    })), // Normalize names to make shown properties like "Brand" and "brand" the same
  };
}

function getConfiguredLineItemByIndex(index: number) {
  const configProductIndex = index - productsIds.value.length;
  return configProductsConfiguredItems.value[configProductIndex];
}

function withConfiguredPrices(product: Product, configuredItem?: ConfiguredLineItemType): Product {
  if (!configuredItem || !product.price) {
    return product;
  }

  const actualOverride = configuredItem.salePrice
    ? {
        ...product.price.actual,
        amount: configuredItem.salePrice.amount,
        formattedAmount: configuredItem.salePrice.formattedAmount,
        formattedAmountWithoutCurrency: configuredItem.salePrice.formattedAmountWithoutCurrency,
      }
    : product.price.actual;

  const listOverride = configuredItem.listPrice
    ? {
        ...product.price.list,
        amount: configuredItem.listPrice.amount,
        formattedAmount: configuredItem.listPrice.formattedAmount,
        formattedAmountWithoutCurrency: configuredItem.listPrice.formattedAmountWithoutCurrency,
      }
    : product.price.list;

  return {
    ...product,
    price: {
      ...product.price,
      actual: actualOverride,
      list: listOverride,
    },
  };
}

function buildProductForDisplay(productId: string, index: number) {
  const product = products.value.find((_product) => _product.id === productId);
  if (!product) {
    return null;
  }

  const normalized = normalizeProductProperties(product);
  const configuredItem = getConfiguredLineItemByIndex(index);
  return withConfiguredPrices(normalized, configuredItem);
}

function getConfigurationProductByIndex(index: number) {
  const configProductIndex = index - productsIds.value.length;
  return configProductsToCompare.value[configProductIndex];
}

async function refreshProducts(): Promise<void> {
  try {
    await fetchProducts({ productIds: allProductIdsForFetch.value });

    const configProductsConfiguredItemsResponses = await Promise.all(
      configProductsToCompare.value.map((configProduct) =>
        createConfiguredLineItemMutation({
          command: {
            configurableProductId: configProduct.productId,
            configurationSections: configProduct.configurationSectionInput,
            storeId,
            currencyCode,
            cultureName,
          },
        }),
      ),
    );
    configProductsConfiguredItems.value = configProductsConfiguredItemsResponses.map(
      (response) => response?.data?.createConfiguredLineItem,
    );

    getProperties();
  } catch (e) {
    Logger.error(refreshProducts.name, e);
  }
}

function getProperties() {
  properties.value = {};

  if (!products.value.length) {
    return;
  }

  const normalizedPropertyNames = computeNormalizedPropertyNames();
  const baseProperties = buildBasePropertiesMap(normalizedPropertyNames);
  const configOnlyProperties = buildConfigurationPropertiesMap();

  properties.value = {
    ...baseProperties,
    ...configOnlyProperties,
  };
}

function computeNormalizedPropertyNames() {
  const propertiesCombined = products.value.flatMap((product) => product.properties);

  return uniqBy(
    propertiesCombined.map((prop) => ({
      name: prop.name.toLowerCase(), // Normalize names to make shown properties like "Brand" and "brand" the same
      label: prop.label,
    })),
    "name",
  );
}

function computeConfigurationProductsProperties() {
  return uniqBy(
    configProductsToCompare.value.flatMap((configProduct) => {
      return configProduct.properties.map((prop: { label: string }) => ({
        name: prop.label,
        label: prop.label,
      }));
    }),
    "name",
  );
}

function buildBasePropertiesMap(propertiesNames: { name: string; label: string }[]) {
  const map: ICompareProductProperties = {};

  propertiesNames.forEach(({ name, label }) => {
    map[name] = {
      label,
      values: productsToShow.value.map((product) => {
        const property = product.properties.find((prop) => prop.name === name);
        return property ? (getPropertyValue(property) ?? EMPTY_VALUE_PLACEHOLDER) : EMPTY_VALUE_PLACEHOLDER;
      }),
    };
  });

  return map;
}

function buildConfigurationPropertiesMap() {
  const configurationProductsProperties = computeConfigurationProductsProperties();

  if (!configurationProductsProperties.length) {
    return {};
  }

  const map: ICompareProductProperties = {};
  const regularProductsValuesOffset = Array.from({ length: productsIds.value.length }).fill(
    EMPTY_VALUE_PLACEHOLDER,
  ) as string[];

  configurationProductsProperties.forEach((propertyInfo) => {
    const values = configProductsToCompare.value.map((configProduct) => {
      return (
        configProduct.properties.find((prop: { label: string; value?: string }) => prop.label === propertyInfo.name)
          ?.value ?? EMPTY_VALUE_PLACEHOLDER
      );
    });

    map[propertyInfo.name] = {
      label: propertyInfo.label,
      values: [...regularProductsValuesOffset, ...values],
    };
  });

  return map;
}

function openClearListModal() {
  openModal({
    component: VcConfirmationModal,
    props: {
      variant: "danger",
      title: t("shared.compare.clear_list_modal.title"),
      text: t("shared.compare.clear_list_modal.message"),
      noIcon: true,
      onConfirm() {
        clearCompareList();
        closeModal();
      },
    },
  });
}

watch(
  allProductIdsToShow,
  async () => {
    await refreshProducts();
  },
  { immediate: true },
);

function syncScroll(event: Event) {
  if (cardsElement.value && propertiesElement.value) {
    if (event.target === cardsElement.value) {
      propertiesElement.value.scrollLeft = cardsElement.value.scrollLeft;
    } else {
      cardsElement.value.scrollLeft = propertiesElement.value.scrollLeft;
    }
  }
}

function selectItemEvent(product: Product) {
  analytics("selectItem", product, compareProductsListProperties.value);
}

function removeFromCompareListHandler(product: Product, index: number) {
  if (product.isConfigurable && index >= productsIds.value.length) {
    const configProductIndex = index - productsIds.value.length;
    removeFromCompareList(product, configProductsToCompare.value[configProductIndex].configurationSectionInput);
  } else {
    removeFromCompareList(product);
  }
}

function isProductInConfigurableGroup(product: Product, index: number) {
  return product.isConfigurable && index >= productsIds.value.length;
}

/**
 * Send Google Analytics event for related products.
 */
watch(
  products,
  (productsValue) => {
    if (!productsValue.length) {
      return;
    }

    analytics("viewItemList", productsValue, compareProductsListProperties.value);
  },
  { immediate: true },
);

onMounted(() => {
  // Add scroll event listeners to both elements
  if (cardsElement.value && propertiesElement.value) {
    cardsElement.value.addEventListener("scroll", syncScroll);
    propertiesElement.value.addEventListener("scroll", syncScroll);
  }
});

onUnmounted(() => {
  if (cardsElement.value && propertiesElement.value) {
    cardsElement.value.removeEventListener("scroll", syncScroll);
    propertiesElement.value.removeEventListener("scroll", syncScroll);
  }
});
</script>

<style scoped lang="scss">
.hide-scrollbar {
  -ms-overflow-style: none; /* for Edge */
  scrollbar-width: none; /* for Firefox */

  &::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
}
</style>
