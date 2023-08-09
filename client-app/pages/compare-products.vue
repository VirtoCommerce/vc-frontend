<template>
  <div class="grow bg-gray-100 pb-16 shadow-inner">
    <VcEmptyPage
      v-if="!productsIds.length"
      :breadcrumbs="breadcrumbs"
      :title="$t('pages.compare.empty_list.title')"
      :description="$t('pages.compare.empty_list.message')"
      image="/static/images/errors/emptyCompareList.webp"
      mobile-image="/static/images/errors/emptyCompareListMobile.webp"
    >
      <template #actions>
        <VcButton :to="{ name: 'Catalog' }">
          {{ $t("pages.compare.empty_list.button_text") }}
        </VcButton>
      </template>
    </VcEmptyPage>

    <div v-else class="mx-auto w-full pt-7 md:max-w-screen-2xl md:px-12">
      <!-- Page header -->
      <VcBreadcrumbs :items="breadcrumbs" class="mb-3 px-5 md:px-0"></VcBreadcrumbs>

      <div class="flex flex-col px-5 md:px-0 lg:mb-5 lg:flex-row lg:space-x-12">
        <div class="flex flex-col space-y-1.5">
          <h1 class="text-black-800 text-3xl font-bold uppercase">{{ $t("pages.compare.header_block.title") }}</h1>

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
          <VcCheckbox v-model="showOnlyDifferences" class="mt-2" @change="onShowOnlyDifferencesChange">
            {{ $t("pages.compare.header_block.differences_checkbox_label") }}
          </VcCheckbox>

          <VcButton variant="outline" @click="openClearListModal">
            {{ $t("pages.compare.header_block.clear_button") }}
          </VcButton>
        </div>
      </div>

      <!-- Main block -->
      <div class="overflow-x-auto bg-white py-8 shadow md:rounded">
        <!-- Product cards block -->
        <div class="flex gap-x-5 px-8 lg:pl-0">
          <div class="hidden w-56 shrink-0 lg:block"></div>
          <div
            v-for="product in products"
            :key="product.id"
            class="flex w-40 shrink-0 flex-col md:w-48 md:pb-6 lg:shrink"
          >
            <!-- Product image -->
            <router-link :to="productsRoutes[product.id]" class="mb-3 cursor-pointer" @click="ga.selectItem(product)">
              <div
                class="relative flex h-32 w-40 flex-col items-center justify-center border border-gray-100 md:h-48 md:w-48"
              >
                <VcImage
                  :src="product.imgSrc"
                  :alt="product.name"
                  size-suffix="md"
                  class="h-full w-full object-cover object-center"
                  lazy
                />

                <button
                  class="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100"
                  type="button"
                  @click.prevent="removeFromCompareList(product)"
                >
                  <i class="fas fa-times text-red-500"></i>
                </button>
              </div>
            </router-link>

            <!-- Product title -->
            <router-link
              :to="productsRoutes[product.id]"
              class="mb-3 line-clamp-3 h-16 cursor-pointer text-sm font-extrabold text-[color:var(--color-link)]"
              @click="ga.selectItem(product)"
            >
              {{ product.name }}
            </router-link>

            <!-- Product price -->
            <div class="mb-3 flex h-8 flex-col items-baseline justify-between text-sm md:flex-row">
              <div v-if="!isMobile" class="text-xs font-bold">
                {{ $t("pages.compare.main_block.price_label") }}
              </div>
              <VcItemPrice :value="product.price" />
            </div>

            <div class="h-12">
              <AddToCart :product="product" @update:line-item="refreshProducts" />
            </div>

            <div v-if="product.productType === ProductType.Digital" class="mt-1 flex items-center gap-1">
              <VcBadge size="sm" color="info" variant="solid-light">
                {{ $t("common.labels.digital_product") }}
              </VcBadge>
            </div>
          </div>
        </div>

        <!-- Properties block -->
        <div
          v-for="(prop, index) in showOnlyDifferences ? propertiesDiffs : properties"
          :key="index"
          class="items-start space-x-5 border-b border-gray-100 px-8 md:items-center lg:border-0 lg:px-0"
          :class="!isMobile ? 'even:bg-gray-50 flex' : productsIds.length >= 3 ? 'inline-flex' : 'flex'"
        >
          <div v-if="!isMobile" class="w-56 shrink-0 pl-8 text-sm font-extrabold">{{ prop.label }}</div>

          <div v-for="(value, i) in prop.values" :key="i" class="w-40 shrink-0 py-5 last:pr-8 md:w-48">
            <span v-if="isMobile" class="block text-sm font-extrabold">{{ prop.label }}</span>
            {{ value }}
          </div>
        </div>

        <div class="flex items-center space-x-5 px-5 lg:px-0">
          <div v-if="!isMobile" class="w-56 shrink-0"></div>
          <div v-for="product in products" :key="product.id" class="w-40 shrink-0 md:w-48">
            <!-- Product price -->
            <div class="my-4 flex h-8 flex-col items-baseline justify-between text-sm md:flex-row">
              <div v-if="!isMobile" class="text-xs font-bold">
                {{ $t("pages.compare.main_block.price_label") }}
              </div>
              <VcItemPrice :value="product.price" />
            </div>
            <AddToCart :product="product" @update:line-item="refreshProducts" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import _ from "lodash";
import { ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead, useProductsRoutes } from "@/core/composables";
import { PropertyValueType, ProductType } from "@/core/enums";
import { getPropertyValue } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import { useProducts } from "@/shared/catalog";
import { useCompareProducts } from "@/shared/compare";
import { usePopup } from "@/shared/popup";
import { VcConfirmationDialog } from "@/ui-kit/components";

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

const ga = useGoogleAnalytics();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const { fetchProducts, products } = useProducts();
const { clearCompareList, productsLimit, removeFromCompareList, productsIds } = useCompareProducts();
const productsRoutes = useProductsRoutes(products);
const breadcrumbs = useBreadcrumbs([{ title: t("pages.compare.links.compare_products") }]);
const { openPopup, closePopup } = usePopup();

const showOnlyDifferences = ref(false);

const properties = ref<ICompareProductProperties>({});
const propertiesDiffs = ref<ICompareProductProperties>({});

function onShowOnlyDifferencesChange() {
  if (showOnlyDifferences.value && productsIds.value.length > 1) {
    propertiesDiffs.value = _.pickBy(properties.value, (prop) => _.uniq(prop.values).length !== 1);
  }
}

async function refreshProducts() {
  await fetchProducts({ productIds: productsIds.value });

  getProperties();
}

function getProperties() {
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

        return property?.value || property?.valueType === PropertyValueType.Boolean ? getPropertyValue(property) : "-";
      }),
    };
  });
}

function openClearListModal() {
  openPopup({
    component: VcConfirmationDialog,
    props: {
      variant: "danger",
      title: t("shared.compare.clear_list_modal.title"),
      text: t("shared.compare.clear_list_modal.message"),
      noIcon: true,
      onConfirm() {
        clearCompareList();
        closePopup();
      },
    },
  });
}

watch(
  () => productsIds.value,
  () => {
    refreshProducts();
  },
  { immediate: true },
);

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  if (products.value.length) {
    ga.viewItemList(products.value, {
      item_list_id: "compare_products",
      item_list_name: t("pages.compare.header_block.title"),
    });
  }
});
</script>
