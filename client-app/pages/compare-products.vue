<template>
  <VcEmptyPage
    v-if="!productsIds.length"
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
            <strong>{{ productsIds.length }}</strong>
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
          class="hide-scrollbar sticky top-[-7.5rem] z-10 max-w-full overflow-x-auto rounded-t bg-additional-50 shadow-lg lg:top-[-8.25rem] lg:ps-[9.6rem]"
        >
          <!-- Product cards block -->
          <div class="float-left flex min-w-full gap-4.5 p-5">
            <ProductCardCompare
              v-for="product in products"
              :key="product.id"
              :product="product"
              class="w-[9.625rem] lg:w-[13.625rem]"
              @remove="removeFromCompareList(product)"
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
import _ from "lodash";
import { ref, computed, watch, watchEffect, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useAnalytics, usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { getPropertyValue } from "@/core/utilities";
import { ProductCardCompare, useProducts } from "@/shared/catalog";
import { useCompareProducts } from "@/shared/compare";
import { useModal } from "@/shared/modal";
import { VcConfirmationModal } from "@/ui-kit/components";
import type { Product } from "@/core/api/graphql/types";

interface ICompareProductProperties {
  [key: string]: { label: string; values: string[] };
}

const { t } = useI18n();

usePageHead({
  title: t("pages.compare.meta.title"),
  meta: {
    keywords: t("pages.compare.meta.keywords"),
    description: t("pages.compare.meta.description"),
  },
});

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { analytics } = useAnalytics();
const { fetchProducts, products } = useProducts();
const { clearCompareList, productsLimit, removeFromCompareList, productsIds } = useCompareProducts();
const breadcrumbs = useBreadcrumbs([{ title: t("pages.compare.links.compare_products") }]);
const { openModal, closeModal } = useModal();

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const showOnlyDifferences = ref(false);

const properties = ref<ICompareProductProperties>({});

const cardsElement = ref<HTMLElement | null>(null);
const propertiesElement = ref<HTMLElement | null>(null);

const propertiesDiffs = computed<ICompareProductProperties>(() => {
  return _.pickBy(properties.value, (prop) => _.uniq(prop.values).length !== 1);
});

async function refreshProducts() {
  await fetchProducts({ productIds: productsIds.value });

  getProperties();
}

function getProperties() {
  properties.value = {};

  if (!products.value.length) {
    return;
  }

  const propertiesCombined = _.flatten(_.map(products.value, "properties"));
  const names = _.uniq(
    propertiesCombined.map((prop) => {
      return {
        name: prop!.name,
        label: prop!.label!,
      };
    }),
  );

  _.each(names, ({ name, label }) => {
    properties.value[name] = {
      label,
      values: _.map(products.value, (product) => {
        const property = _.find(product.properties, ["name", name]);

        return property ? (getPropertyValue(property) ?? "\u2013") : "\u2013";
      }),
    };
  });
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
  () => productsIds.value,
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
  analytics("selectItem", product, {
    item_list_name: "compare_products",
  });
}

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  if (products.value.length) {
    analytics("viewItemList", products.value, {
      item_list_id: "compare_products",
      item_list_name: t("pages.compare.header_block.title"),
    });
  }
});

onMounted(() => {
  // Add scroll event listeners to both elements
  if (cardsElement.value && propertiesElement.value) {
    cardsElement.value.addEventListener("scroll", syncScroll);
    propertiesElement.value.addEventListener("scroll", syncScroll);
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
