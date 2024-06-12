<template>
  <div
    class="vc-product-card-list grid gap-x-3.5 bg-additional-50 px-4 pb-5 pt-4 md:place-items-center lg:rounded lg:py-3.5 lg:shadow-t-3sm lg:outline lg:outline-1 lg:outline-offset-0 lg:outline-neutral-200 lg:hover:shadow-lg"
  >
    <div class="vc-product-card-list__mobile-left sm:contents">
      <!-- Product image -->
      <router-link
        :to="link"
        class="vc-product-card-list__img relative block size-[72px] xl:size-[86px]"
        @click="$emit('linkClick', $event)"
      >
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          size-suffix="md"
          class="size-full rounded object-cover object-center"
          :lazy="lazy"
        />
        <DiscountBadge :price="product.price!" size="sm" />
      </router-link>

      <div
        class="vc-product-card-list__buttons mt-3 flex w-full justify-center gap-3.5 sm:justify-start sm:place-self-end lg:mt-2 lg:gap-3"
      >
        <AddToList custom-class="w-5 h-5 lg:w-4 lg:h-4" :product="product" tooltip-placement="bottom" />
        <AddToCompareCatalog
          v-if="$cfg.product_compare_enabled"
          custom-class="w-5 h-5 lg:w-4 lg:h-4"
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
          :target="target"
          class="vc-product-card-list__name w-full grow text-sm font-extrabold text-[--link-color] hover:text-[--link-hover-color] sm:line-clamp-3 sm:overflow-hidden lg:mt-1 2xl:pr-2"
          @click="$emit('linkClick', $event)"
        >
          {{ product.name }}
        </router-link>
      </template>

      <template #content>
        <div class="max-w-64 rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs shadow-md">
          {{ product.name }}
        </div>
      </template>
    </VcTooltip>

    <div
      class="vc-product-card-list__properties mt-2 hidden w-full grid-cols-[40%_1fr] gap-x-1.5 gap-y-0.5 text-sm leading-4 text-neutral-800 empty:mt-0 lg:mt-0.5 lg:text-xs xl:grid"
    >
      <!-- Product properties -->
      <template v-for="prop in properties" :key="prop.name">
        <div class="min-w-0">
          <div class="truncate font-bold">{{ prop.label }}:</div>
        </div>
        <div class="min-w-0">
          <div class="truncate">
            {{ prop.value }}
          </div>
        </div>
      </template>

      <!-- Rating -->
      <template v-if="false">
        <div class="min-w-0">
          <div class="truncate font-bold">
            {{ $t("shared.catalog.product_card.product_rating") }}
          </div>
        </div>
        <div class="flex items-center gap-1">
          <svg class="size-3 shrink-0 text-success">
            <use href="/static/images/cup.svg#main"></use>
          </svg>
          <div class="font-bold">4,3/5</div>
        </div>
      </template>

      <!-- Vendor -->
      <template v-if="$cfg.vendor_enabled && product.vendor">
        <div class="min-w-0">
          <div class="truncate font-bold">
            {{ $t("shared.catalog.product_card.product_vendor") }}
          </div>
        </div>
        <div class="min-w-0">
          <div class="truncate">
            <Vendor :vendor="product.vendor" />
          </div>
        </div>
      </template>
    </div>

    <div class="vc-product-card-list__price mt-2 w-full sm:mt-0 2xl:pr-2">
      <VcItemPriceCatalog :has-variations="hasVariations" :value="price" class="md:flex-col md:gap-0" />
    </div>

    <div class="vc-product-card-list__add-to-cart mt-3 flex w-full flex-col gap-2 sm:mt-0">
      <template v-if="hasVariations">
        <VcButton
          :to="link"
          :target="target"
          variant="outline"
          size="sm"
          full-width
          @click="$emit('linkClick', $event)"
        >
          {{ $t("pages.catalog.variations_button", [(product.variations?.length || 0) + 1]) }}
        </VcButton>

        <router-link
          :to="link"
          class="flex items-center gap-1 text-sm text-[--link-color] hover:text-[--link-hover-color] lg:mt-1 lg:text-xs"
          target="_blank"
        >
          <svg class="size-3 shrink-0 text-primary lg:size-2.5">
            <use href="/static/images/link.svg#main"></use>
          </svg>
          <span class="truncate">
            {{ $t("pages.catalog.show_on_a_separate_page") }}
          </span>
        </router-link>
      </template>

      <template v-else>
        <slot name="cart-handler"></slot>

        <div class="flex items-center gap-1 lg:mt-0.5">
          <InStock
            :is-in-stock="product.availabilityData?.isInStock"
            :is-digital="isDigital"
            :quantity="product.availabilityData?.availableQuantity"
          />

          <CountInCart :product-id="product.id" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { ProductType } from "@/core/enums";
import { getLinkTarget, getProductRoute, getPropertiesGroupedByName, productHasVariations } from "@/core/utilities";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import CountInCart from "./count-in-cart.vue";
import DiscountBadge from "./discount-badge.vue";
import InStock from "./in-stock.vue";
import Vendor from "./vendor.vue";
import type { Product } from "@/core/api/graphql/types";

defineEmits<{ (eventName: "linkClick", globalEvent: MouseEvent): void }>();

const props = withDefaults(defineProps<IProps>(), {
  lazy: true,
});

interface IProps {
  product: Product;
  lazy?: boolean;
  openInNewTab?: boolean;
}

const link = computed(() => getProductRoute(props.product.id, props.product.slug));
const target = computed(() => getLinkTarget(props.openInNewTab));
const isDigital = computed(() => props.product.productType === ProductType.Digital);
const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)).slice(0, 3),
);
const hasVariations = computed(() => productHasVariations(props.product));
const price = computed(() => (hasVariations.value ? props.product.minVariationPrice : props.product.price));
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
    grid-template-columns: 72px 1fr 1fr;
    grid-template-areas:
      "img name price"
      "img properties add-to-cart"
      "img buttons add-to-cart";
  }

  @media (min-width: theme("screens.md")) {
    grid-template-columns: 72px 1fr 200px 207px;
    grid-template-areas:
      "img name price add-to-cart"
      "img properties price add-to-cart"
      "img . price add-to-cart"
      "img buttons price add-to-cart";
  }

  @media (min-width: theme("screens.xl")) {
    grid-template-columns: 86px 1fr 1fr 200px 207px;
    grid-template-areas:
      "img name properties price add-to-cart"
      "img . properties price add-to-cart"
      "img buttons properties price add-to-cart";
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
