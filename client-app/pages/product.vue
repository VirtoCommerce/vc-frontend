<template>
  <div v-if="product && template" class="bg-[--color-neutral-50] pb-8 pt-7 print:bg-[--color-additional-50]">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <div class="mx-auto max-w-screen-2xl px-5 print:!px-0 md:px-12">
      <!-- Breadcrumbs -->
      <VcBreadcrumbs class="mb-3 hidden print:block lg:block" :items="breadcrumbs" />

      <h1 class="text-2xl font-bold uppercase md:text-4xl">{{ product.name }}</h1>

      <div v-if="!product.hasVariations" class="mt-1 flex items-center text-sm">
        {{ $t("pages.product.sku_label") }}
        <span class="font-extrabold">{{ product.code }}</span>
        <VcButton
          v-if="isSupported"
          class="ml-1.5"
          size="xs"
          variant="outline"
          icon="document-duplicate"
          color="secondary"
          @click="copySKU(product.code)"
        />
      </div>

      <template v-for="item in template.content">
        <component
          :is="item.type"
          v-if="!item.hidden"
          :key="item.id"
          :product="product"
          :related-products="relatedProducts"
          :model="item"
          :is-mobile="isMobile"
          :product-with-variations="!!product.hasVariations"
          :variations-cart-total-amount="variationsCartTotalAmount"
        />
      </template>

      <!-- Related products section -->
      <div v-show="relatedProducts.length" class="mt-10 flex flex-col print:hidden lg:mt-6 lg:flex-row lg:space-x-8">
        <div class="-mx-5 flex flex-col md:mx-0 lg:w-8/12 xl:w-9/12">
          <VcSection
            :title="$t('pages.product.related_product_section_title')"
            icon-url="/static/images/checkout/products.svg"
            class="rounded-none border shadow-sm md:rounded"
          >
            <VcCarousel
              :slides="relatedProducts"
              :options="relatedProductsCarouselOptions"
              :pagination="isMobile"
              :navigation="!isMobile"
              class="mb-8 px-6 [--navigation-offset:3rem] lg:mb-2"
            >
              <template #slide="{ slide: item }">
                <CarouselProductCard :product="item" class="mb-6" @link-click="ga.selectItem(item)" />
              </template>
            </VcCarousel>
          </VcSection>
        </div>

        <div class="flex flex-col lg:w-4/12 xl:w-3/12"></div>
      </div>
    </div>
  </div>

  <Error404 v-else-if="!loading && template" />
</template>

<script setup lang="ts">
import { breakpointsTailwind, eagerComputed, useBreakpoints, useClipboard } from "@vueuse/core";
import { computed, defineAsyncComponent, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";
import { useCart } from "@/shared/cart";
import { CarouselProductCard, useProduct, useRelatedProducts, useCategory } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useNotifications } from "@/shared/notification";
import { useTemplate } from "@/shared/static-content";
import type { Breadcrumb } from "@/core/api/graphql/types";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

interface IProps {
  productId?: string;
}

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const relatedProductsCarouselOptions: CarouselOptions = {
  spaceBetween: 30,
  slidesPerView: 2,
  slidesPerGroup: 2,
  breakpoints: {
    // 640: /* sm */ {},
    768: /* md */ {
      slidesPerView: 3,
      slidesPerGroup: 3,
      spaceBetween: 30,
    },
    1024: /* lg */ {
      slidesPerView: 4,
      slidesPerGroup: 4,
      spaceBetween: 6,
    },
    1280: /* xl */ {
      slidesPerView: 5,
      slidesPerGroup: 5,
      spaceBetween: 6,
    },
    // 1536: /* 2xl */ {},
  },
};

const { t } = useI18n();
const { getItemsTotal } = useCart();
const { product, loading, loadProduct } = useProduct();
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const template = useTemplate("product");
const ga = useGoogleAnalytics();
const { rootCategory } = useCategory();
const { copy, isSupported } = useClipboard();
const notifications = useNotifications();

const copySKU = async (SKU: string) => {
  await copy(SKU);
  notifications.success({
    text: t("pages.product.sku_copied_message"),
    duration: 4000,
    single: true,
  });
};

usePageHead({
  title: computed(() => product.value?.seoInfo?.pageTitle || product.value?.name),
  meta: {
    keywords: computed(() => product.value?.seoInfo?.metaKeywords),
    description: computed(() => product.value?.seoInfo?.metaDescription),
  },
});

const breadcrumbs = useBreadcrumbs(() => {
  const firstItem: Breadcrumb = { itemId: rootCategory.id, title: rootCategory.name, seoPath: rootCategory.slug };
  const items = product.value
    ? product.value.breadcrumbs ?? [{ itemId: product.value.id, title: product.value.name }]
    : [];

  return buildBreadcrumbs([firstItem].concat(items)) ?? [];
});

const variationsCartTotalAmount = eagerComputed<number>(() => {
  if (!product.value) {
    return 0;
  }

  const variationsIds = product.value.variations!.map((variation) => variation.id!);
  variationsIds.push(product.value.id);

  return getItemsTotal(variationsIds);
});

watchEffect(() => {
  const productId = props.productId;
  loadProduct(productId);
  fetchRelatedProducts({ productId, itemsPerPage: 30 });
});

/**
 * Send Google Analytics event for product.
 */
watchEffect(() => {
  if (product.value) {
    ga.viewItem(product.value);
  }
});

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  if (relatedProducts.value.length) {
    ga.viewItemList(relatedProducts.value, {
      item_list_id: "related_products",
      item_list_name: t("pages.product.related_product_section_title"),
    });
  }
});
</script>
