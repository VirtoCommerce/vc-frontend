<template>
  <div
    v-if="product && template"
    class="bg-[--color-neutral-50] pb-8 pt-7 print:w-full print:min-w-[1024px] print:bg-[--color-additional-50] print:[zoom:0.7]"
  >
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <div class="mx-auto max-w-screen-2xl px-6 print:!px-0 lg:px-12">
      <!-- Breadcrumbs -->
      <VcBreadcrumbs class="mb-3 hidden print:block lg:block" :items="breadcrumbs" />

      <h1 class="text-2xl font-bold uppercase md:text-4xl">{{ product.name }}</h1>

      <VcCopyText
        v-if="!product.hasVariations"
        class="mt-1 text-sm"
        :text="product.code"
        :notification="$t('pages.product.sku_copied_message')"
      >
        <span class="mr-1">{{ $t("pages.product.sku_label") }}</span>
        <span class="font-extrabold">{{ product.code }}</span>
      </VcCopyText>

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
    </div>
  </div>

  <Error404 v-else-if="!loading && template" />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { breakpointsTailwind, eagerComputed, useBreakpoints } from "@vueuse/core";
import { computed, defineAsyncComponent, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";
import { useShortCart } from "@/shared/cart";
import { useProduct, useRelatedProducts, useCategory } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useTemplate } from "@/shared/static-content";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

interface IProps {
  productId?: string;
}

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const { t } = useI18n();
const { getItemsTotal } = useShortCart();
const { product, loading, loadProduct } = useProduct();
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const template = useTemplate("product");
const ga = useGoogleAnalytics();
const { catalogBreadcrumb } = useCategory();

const seoTitle = computed(() => product.value?.seoInfo?.pageTitle || product.value?.name);
const seoDescription = computed(() => product.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => product.value?.seoInfo?.metaKeywords);
const seoImageUrl = computed(() => product.value?.imgSrc);

usePageHead({
  title: seoTitle,
  meta: {
    keywords: seoKeywords,
    description: seoDescription,
  },
});

useSeoMeta({
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImageUrl,
});

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(product.value?.breadcrumbs) ?? []);
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
