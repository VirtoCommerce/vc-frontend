<template>
  <VcContainer v-if="product && template" class="print:min-w-[1024px] print:bg-transparent print:px-0 print:[zoom:0.7]">
    <!-- Breadcrumbs -->
    <VcBreadcrumbs class="mb-3" :items="breadcrumbs" />

    <VcTypography tag="h1">
      {{ product.name }}
    </VcTypography>

    <div v-if="!hasVariations" class="mt-2 flex flex-wrap gap-5">
      <VcCopyText :text="product.code" :notification="$t('pages.product.sku_copied_message')">
        <span class="text-base text-[--color-secondary-900]">
          {{ $t("pages.product.sku_label") }}
          <span class="font-black">#{{ product.code }}</span>
        </span>
      </VcCopyText>
    </div>

    <!--
        TODO: create VcLayoutWithSidebar component
        https://virtocommerce.atlassian.net/browse/ST-5629
      -->
    <div
      class="mt-5 flex flex-col gap-6 sm:gap-7 md:flex-row md:items-start md:gap-4 lg:gap-5 xl:gap-6 print:flex-row print:gap-4"
    >
      <div class="contents md:block md:w-0 md:grow md:space-y-6 xl:space-y-7">
        <component
          :is="productInfoSection?.type"
          v-if="productInfoSection && !productInfoSection.hidden"
          :product="product"
          :model="productInfoSection"
        />

        <component
          :is="productVariationsBlock?.type"
          v-if="productVariationsBlock && !productVariationsBlock.hidden"
          :product="product"
          :model="productVariationsBlock"
        />

        <component
          :is="relatedProductsSection?.type"
          v-if="relatedProductsSection && !relatedProductsSection.hidden"
          :related-products="relatedProducts"
          :model="relatedProductsSection"
        />
      </div>

      <ProductSidebar
        :class="[
          'flex-none md:sticky md:top-[4.5rem] md:w-64 lg:top-[6.5rem] xl:w-[17.875rem]',
          { 'print:hidden': !!product.hasVariations },
        ]"
        :product="product"
      />
    </div>
  </VcContainer>

  <Error404 v-else-if="!loading && template" />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { computed, defineAsyncComponent, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { buildBreadcrumbs, productHasVariations } from "@/core/utilities";
import { useProduct, useRelatedProducts, useCategory, ProductSidebar } from "@/shared/catalog";
import { useTemplate } from "@/shared/static-content";
import type { PageContent } from "@/shared/static-content";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

interface IProps {
  productId?: string;
}

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const { t } = useI18n();
const { product, loading, loadProduct } = useProduct();
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const template = useTemplate("product");
const ga = useGoogleAnalytics();
const { catalogBreadcrumb } = useCategory();

const seoTitle = computed(() => product.value?.seoInfo?.pageTitle || product.value?.name);
const seoDescription = computed(() => product.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => product.value?.seoInfo?.metaKeywords);
const seoImageUrl = computed(() => product.value?.imgSrc);
const hasVariations = computed(() => productHasVariations(product.value));

const productInfoSection = computed(
  () => template.value?.content.filter((item: PageContent) => item.type === "product-info")[0],
);

const productVariationsBlock = computed(
  () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productInfoSection.value?.blocks.filter((block: any) => block.type === "product-variations")[0],
);

const relatedProductsSection = computed(
  () => template.value?.content.filter((item: PageContent) => item.type === "related-products")[0],
);

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

watchEffect(async () => {
  const productId = props.productId;
  await loadProduct(productId);
  await fetchRelatedProducts({ productId, itemsPerPage: 30 });
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

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
