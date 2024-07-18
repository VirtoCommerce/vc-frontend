<template>
  <VcContainer
    v-if="product && template"
    ref="productComponentAnchor"
    class="print:min-w-[1024px] print:bg-transparent print:px-0 print:[zoom:0.7]"
  >
    <!-- Breadcrumbs -->
    <VcBreadcrumbs class="mb-3" :items="breadcrumbs" />

    <VcTypography tag="h1">
      {{ product.name }}
    </VcTypography>

    <div v-if="!product.hasVariations" class="mt-2 flex flex-wrap gap-5">
      <VcCopyText :text="product.code" :notification="$t('pages.product.sku_copied_message')">
        <span class="text-base text-secondary-900">
          {{ $t("pages.product.sku_label") }}
          <span class="font-black">#{{ product.code }}</span>
        </span>
      </VcCopyText>
    </div>

    <!--
        TODO: create VcLayoutWithSidebar component
        https://virtocommerce.atlassian.net/browse/ST-5629
      -->
    <div class="mt-5 flex flex-col gap-6 sm:gap-7 md:flex-row md:items-start md:gap-4 lg:gap-5 xl:gap-6">
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
          :variations="variations"
          :sort="variationSortInfo"
          :model="productVariationsBlock"
          :fetching-variations="fetchingVariations"
          @apply-sorting="sortVariations"
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
          'flex-none md:sticky md:top-18 md:w-64 lg:top-[6.5rem] xl:w-[17.875rem]',
          { 'print:hidden': product.hasVariations },
        ]"
        :product="sideBarProduct"
        :variations="variations"
      />
    </div>
  </VcContainer>

  <Error404 v-else-if="!fetchingProduct && template" />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { computed, defineAsyncComponent, ref, shallowRef, toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { SortDirection } from "@/core/enums";
import { buildBreadcrumbs, getSortingExpression } from "@/core/utilities";
import { useProduct, useRelatedProducts, useCategory, ProductSidebar, useProducts } from "@/shared/catalog";
import { useTemplate } from "@/shared/static-content";
import type { Product } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { PageContent } from "@/shared/static-content";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

const variationsPerPage = 1000;

interface IProps {
  productId?: string;
  allowSetMeta?: boolean;
}

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const { t } = useI18n();
const { product, fetching: fetchingProduct, fetchProduct } = useProduct();
const { loading: fetchingVariations, products: variations, fetchProducts } = useProducts();
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const template = useTemplate("product");
const ga = useGoogleAnalytics();
const { catalogBreadcrumb } = useCategory();

// todo https://github.com/VirtoCommerce/vc-theme-b2b-vue/issues/1099
const sideBarProduct = computed(() => {
  return product.value as Product;
});

const productId = toRef(props, "productId");

const seoTitle = computed(() => product.value?.seoInfo?.pageTitle || product.value?.name);
const seoDescription = computed(() => product.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => product.value?.seoInfo?.metaKeywords);
const seoImageUrl = computed(() => product.value?.imgSrc);
const variationSortInfo = ref<ISortInfo>({
  column: "name",
  direction: SortDirection.Ascending,
});
const variationsFilterExpression = ref(`productfamilyid:${productId.value} status:hidden,visible`);

const productInfoSection = computed(() =>
  template.value?.content.find((item: PageContent) => item.type === "product-info"),
);

const productVariationsBlock = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productInfoSection.value?.blocks.find((block: any) => block.type === "product-variations"),
);

const relatedProductsSection = computed(() =>
  template.value?.content.find((item: PageContent) => item.type === "related-products"),
);

const productComponentAnchor = shallowRef<HTMLElement | null>(null);
const productComponentAnchorIsVisible = useElementVisibility(productComponentAnchor);

watchEffect(() => {
  if (props.allowSetMeta && productComponentAnchorIsVisible.value) {
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
  }
});

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(product.value?.breadcrumbs) ?? []);
});

async function sortVariations(sortInfo: ISortInfo): Promise<void> {
  variationSortInfo.value = sortInfo;

  await fetchProducts({
    sort: getSortingExpression(sortInfo),
    filter: variationsFilterExpression.value,
    itemsPerPage: variationsPerPage,
  });
}

watchEffect(async () => {
  await fetchProduct(productId.value);

  if (product.value?.associations?.totalCount && !relatedProductsSection.value?.hidden) {
    await fetchRelatedProducts({ productId: productId.value, itemsPerPage: 30 });
  }

  if (product.value?.hasVariations) {
    await fetchProducts({
      filter: variationsFilterExpression.value,
      itemsPerPage: variationsPerPage,
    });
  }
});

/**
 * Send Google Analytics event for product.
 */
watchEffect(() => {
  if (product.value) {
    // todo https://github.com/VirtoCommerce/vc-theme-b2b-vue/issues/1098
    ga.viewItem(product.value as Product);
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
