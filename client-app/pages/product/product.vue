<template>
  <div v-if="product" class="bg-gray-100 pt-7 pb-8 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="hidden md:block mb-3" :items="breadcrumbs" />

      <div class="md:hidden mb-5">
        <!-- todo: use VcButton -->
        <button class="border border-grey-200 rounded bg-white px-3 py-2 hover:bg-gray-100" @click="$router.back()">
          <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i
          ><span class="ml-2 text-[color:var(--color-link)]">{{ $t("pages.product.back_button") }}</span>
        </button>
      </div>

      <h1 class="text-2xl md:text-4xl font-bold uppercase">{{ product.name }}</h1>

      <div v-if="!productWithVariations && !isMobile" class="text-sm mt-1">
        {{ $t("pages.product.sku_label") }} <span class="font-extrabold">{{ product.code }}</span>
      </div>

      <div class="flex flex-col lg:flex-row lg:space-x-8 mt-5" :class="{ 'mb-6': !relatedProducts.length }">
        <div class="-mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
          <ProductDetails :product="product" class="shadow-sm border rounded-none md:rounded" />
        </div>

        <div class="lg:w-4/12 mt-6 lg:mt-0 xl:w-3/12">
          <!-- Price & Delivery (with variations) -->
          <ProductPriceBlock v-if="productWithVariations" :product="product">
            <div class="flex items-baseline justify-between text-sm">
              <div class="font-extrabold text-base" v-t="'pages.product.variations_total_label'"></div>

              <div class="font-extrabold">
                <!-- todo: extract a component for price and use it here -->
                <span class="text-green-700">{{ currency?.symbol }}{{ variationsCartTotal.toFixed(2) }}</span>
              </div>
            </div>

            <div class="mt-7 md:mt-5">
              <VcButton :to="{ name: 'Checkout' }" class="uppercase px-2 w-full">
                {{ $t("pages.product.view_cart_button") }}
              </VcButton>
            </div>
          </ProductPriceBlock>

          <!-- Price & Delivery (without variations) -->
          <ProductPriceBlock v-else :product="product">
            <div class="flex items-baseline justify-between text-sm">
              <div class="font-extrabold text-base" v-t="'pages.product.price_label'"></div>

              <div>
                <VcPriceDisplay :value="product.price?.actual" class="font-extrabold text-green-700" />
                <span class="font-semibold hidden lg:inline-block ml-1" v-t="'common.suffixes.per_item'"></span>
              </div>
            </div>

            <div class="mt-7 md:mt-5">
              <AddToCart :product="product" />
            </div>
          </ProductPriceBlock>
        </div>
      </div>

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

  <Error404 v-else-if="!loading" />
</template>

<script setup lang="ts">
import { ref, Ref, computed, watchEffect, defineAsyncComponent } from "vue";
import { VcCarousel, VcSection, VcButton, VcPriceDisplay, CarouselOptions } from "@/components";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useCart, AddToCart } from "@/shared/cart";
import {
  useProduct,
  useBreadcrumbs,
  useRelatedProducts,
  Breadcrumbs,
  IBreadcrumbsItem,
  ProductDetails,
  ProductPriceBlock,
  CarouselProductCard,
} from "@/shared/catalog";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const Error404 = defineAsyncComponent(() => import("@/pages/404/404.vue"));

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

const { currency } = useCart();
const { buildBreadcrumbs } = useBreadcrumbs();
const { product, loading, loadProduct, variationsCartTotal } = useProduct();
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("lg");
const breadcrumbs: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: t("common.links.home") }]);

const productWithVariations = computed<boolean>(() => !!product.value?.variations?.length);

watchEffect(() => {
  const productId = props.productId;
  loadProduct(productId);
  fetchRelatedProducts({ productId, itemsPerPage: 30 });
});

watchEffect(() => {
  breadcrumbs.value = buildBreadcrumbs(product.value?.breadcrumbs ?? []);
});
</script>
