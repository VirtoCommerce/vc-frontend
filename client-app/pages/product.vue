<template>
  <div v-if="product && template" class="bg-gray-100 pt-7 pb-8 shadow-inner">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="hidden lg:block mb-3" :items="breadcrumbs" />

      <h1 class="text-2xl md:text-4xl font-bold uppercase">{{ product.name }}</h1>

      <div v-if="!productWithVariations && !isMobile" class="text-sm mt-1">
        {{ $t("pages.product.sku_label") }} <span class="font-extrabold">{{ product.code }}</span>
      </div>

      <template v-for="item in template.content">
        <component
          v-if="!item.hidden"
          :key="item.id"
          :is="item.type"
          :product="product"
          :relatedProducts="relatedProducts"
          :model="item"
          :isMobile="isMobile"
          :productWithVariations="productWithVariations"
          :variationsCartTotalAmount="variationsCartTotalAmount"
        />
      </template>

      <!-- Related products section -->
      <div v-show="relatedProducts.length" class="flex flex-col lg:flex-row lg:space-x-8 mt-10 lg:mt-6">
        <div class="flex flex-col -mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
          <VcSection
            :title="$t('pages.product.related_product_section_title')"
            icon-url="/static/images/checkout/products.svg"
            class="shadow-sm border rounded-none md:rounded"
          >
            <VcCarousel
              :slides="relatedProducts"
              :options="relatedProductsCarouselOptions"
              :pagination="isMobile"
              :navigation="!isMobile"
              class="px-6 mb-8 lg:mb-2"
              style="--navigation-offset: 3rem"
            >
              <template #slide="{ slide }">
                <CarouselProductCard :product="slide" class="mb-6" />
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
import { ref, Ref, watchEffect, defineAsyncComponent, computed } from "vue";
import { breakpointsTailwind, eagerComputed, useBreakpoints } from "@vueuse/core";
import { usePageHead } from "@/core/composables";
import { useTemplate } from "@/shared/static-content";
import { useCart } from "@/shared/cart";
import {
  useProduct,
  useBreadcrumbs,
  useRelatedProducts,
  Breadcrumbs,
  IBreadcrumbsItem,
  CarouselProductCard,
} from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));
const template = useTemplate("product");

const props = defineProps({
  productId: {
    type: String,
    default: "",
  },
});

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

const { getItemsTotal } = useCart();
const { buildBreadcrumbs } = useBreadcrumbs();
const { product, loading, loadProduct } = useProduct();
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const breakpoints = useBreakpoints(breakpointsTailwind);

usePageHead({
  title: computed(() => product.value?.seoInfo?.pageTitle || product.value?.name),
  meta: {
    keywords: computed(() => product.value?.seoInfo?.metaKeywords),
    description: computed(() => product.value?.seoInfo?.metaDescription),
  },
});

const isMobile = breakpoints.smaller("lg");
const breadcrumbs: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: t("common.links.home") }]);

const productWithVariations = eagerComputed<boolean>(() => !!product.value?.variations?.length);

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

watchEffect(() => {
  breadcrumbs.value = buildBreadcrumbs(product.value?.breadcrumbs ?? []);
});
</script>
