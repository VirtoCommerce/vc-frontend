<template>
  <div
    class="vc-product-card-list grid gap-x-3.5 px-4 pt-4 pb-5 bg-white lg:outline lg:outline-offset-0 lg:outline-1 lg:outline-[color:var(--color-product-outline)] lg:py-3.5 lg:rounded lg:place-items-center lg:shadow-t-3sm lg:hover:shadow-lg"
  >
    <div class="vc-product-card-list__mobile-left sm:contents">
      <!-- Product image -->
      <router-link
        :to="link"
        class="vc-product-card-list__img relative block w-[72px] h-[72px] xl:w-[86px] xl:h-[86px]"
        @click="$emit('link-click', $event)"
      >
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          size-suffix="md"
          class="w-full h-full rounded object-cover object-center"
          lazy
        />
        <DiscountBadge :price="product.price!" size="sm" />
      </router-link>

      <div
        class="vc-product-card-list__buttons flex justify-center gap-3.5 mt-3 w-full sm:justify-start sm:place-self-end lg:mt-2 lg:gap-3"
      >
        <AddToList customClass="w-5 h-5 lg:w-4 lg:h-4" :product="product" tooltip-placement="bottom" />
        <AddToCompareCatalog
          customClass="w-5 h-5 lg:w-4 lg:h-4"
          v-if="$cfg.product_compare_enabled"
          :product="product"
          tooltip-placement="bottom"
        />
      </div>
    </div>

    <!-- Product title -->
    <VcTooltip class="w-full" placement="bottom" strategy="fixed">
      <template #trigger>
        <router-link
          :to="link"
          class="vc-product-card-list__name w-full text-[color:var(--color-link)] font-extrabold text-sm flex-grow sm:line-clamp-3 sm:overflow-hidden lg:h-[60px] lg:mt-1 2xl:pr-2"
          @click="$emit('link-click', $event)"
        >
          {{ product.name }}
        </router-link>
      </template>

      <template #content>
        <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5">
          {{ product.name }}
        </div>
      </template>
    </VcTooltip>

    <div
      class="vc-product-card-list__properties grid grid-cols-[40%_1fr] gap-x-1.5 gap-y-0.5 mt-2 w-full text-tooltip text-14 leading-4 lg:mt-0.5 lg:text-xs empty:mt-0"
    >
      <!-- Product props -->
      <template v-if="product.properties && !isSmallScreen">
        <template v-for="prop in product.properties.slice(0, 3)" :key="prop.id">
          <div class="min-w-0">
            <div class="truncate font-bold">{{ prop.label }}:</div>
          </div>
          <div class="min-w-0">
            <div class="truncate">
              {{ prop.value }}
            </div>
          </div>
        </template>
      </template>

      <!-- Raiting -->
      <template v-if="false">
        <div class="font-bold capitalize">
          {{ $t("shared.catalog.product_card.product_rating") }}
        </div>
        <div class="flex items-center gap-1 pl-1">
          <svg
            class="shrink-0 w-3 h-3"
            :class="{
              'text-[color:var(--color-success)]': true,
              'text-[color:var(--color-warning)]': false,
              'text-[color:var(--color-danger)]': false,
            }"
          >
            <use href="/static/images/cup.svg#main"></use>
          </svg>
          <div class="font-bold">4,3/5</div>
        </div>
      </template>

      <!-- Vendor -->
      <template v-if="$cfg.vendor_enabled && product.vendor">
        <div class="font-bold capitalize">
          {{ $t("shared.catalog.product_card.product_vendor") }}
        </div>
        <div class="grow relative">
          <div class="absolute inset-0 flex pl-1">
            <Vendor :vendor="product.vendor" />
          </div>
        </div>
      </template>
    </div>

    <div class="vc-product-card-list__price mt-2 w-full sm:mt-0 2xl:pr-2">
      <VcItemPriceCatalog class="lg:flex-col lg:gap-0" :variations="product.variations" :value="product.price" />
    </div>

    <div class="vc-product-card-list__add-to-cart flex flex-col gap-2 mt-3 w-full sm:mt-0">
      <template v-if="product.hasVariations">
        <VcButton :to="link" class="w-full uppercase !text-13 !border" is-outline @click="$emit('link-click', $event)">
          {{ $t("pages.catalog.variations_button", [(product.variations?.length || 0) + 1]) }}
        </VcButton>

        <router-link
          class="flex items-center gap-1 text-14 text-[color:var(--color-link)] lg:mt-1 lg:text-11"
          target="_blank"
          :to="link"
        >
          <svg class="shrink-0 w-3 h-3 text-primary lg:w-2.5 lg:h-2.5">
            <use href="/static/images/link.svg#main"></use>
          </svg>
          <span class="truncate" v-t="'pages.catalog.show_on_a_separate_page'"></span>
        </router-link>
      </template>

      <template v-else>
        <slot name="cart-handler"></slot>

        <div class="flex items-center gap-1 lg:mt-0.5">
          <VcInStock
            :is-in-stock="product.availabilityData?.isInStock"
            :quantity="product.availabilityData?.availableQuantity"
          />

          <VcCountInCart :productId="product.id" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import { Product } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";
import { DiscountBadge, Vendor } from "@/shared/catalog";
import { getProductRoute } from "@/core";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

defineEmits<{ (eventName: "link-click", globalEvent: PointerEvent): void }>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isSmallScreen = breakpoints.smaller("xl");
const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>

<style scoped lang="scss">
.vc-product-card-list {
  grid-template-columns: 72px 1fr;
  grid-template-areas:
    "mobile-left name"
    "mobile-left properties"
    "mobile-left price"
    "mobile-left add-to-cart"
    "mobile-left .";

  @media (min-width: theme("screens.sm")) {
    grid-template-columns: 72px 1fr 30%;
    grid-template-areas:
      "img name price"
      "img properties add-to-cart"
      "img buttons add-to-cart";
  }

  @media (min-width: theme("screens.lg")) {
    grid-template-columns: 72px 1fr 126px 207px;
    grid-template-areas:
      "img name price add-to-cart"
      "img properties price add-to-cart"
      "img buttons price add-to-cart"
      "img . price add-to-cart";
  }

  @media (min-width: theme("screens.xl")) {
    grid-template-columns: 86px 1fr 31.5% 140px 207px;
    grid-template-areas:
      "img name properties price add-to-cart"
      "img buttons properties price add-to-cart"
      "img . properties price add-to-cart";
  }

  &__mobile-left {
    grid-area: mobile-left;
  }

  &__img {
    grid-area: img;
  }

  &__buttons {
    grid-area: buttons;
  }

  &__name {
    grid-area: name;
  }

  &__properties {
    grid-area: properties;
  }

  &__price {
    grid-area: price;
  }

  &__add-to-cart {
    grid-area: add-to-cart;
  }
}
</style>
