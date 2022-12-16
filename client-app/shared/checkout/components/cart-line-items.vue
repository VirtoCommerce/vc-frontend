<template>
  <div class="vc-wishlist-line-items">
    <!-- table header -->
    <div class="vc-wishlist-line-items__header gap-x-3 px-4 py-3 border rounded-t text-sm font-bold hidden md:grid">
      <div class="vc-wishlist-line-items__product">
        {{ $t("shared.wishlists.wishlist_line_items.product") }}
      </div>
      <div class="vc-wishlist-line-items__properties">
        {{ $t("shared.wishlists.wishlist_line_items.properties") }}
      </div>
      <div class="vc-wishlist-line-items__price hidden xl:block pr-4 text-right">
        {{ $t("shared.wishlists.wishlist_line_items.price_per_item") }}
      </div>
      <div class="vc-wishlist-line-items__quantity hidden md:block pl-4 text-left">
        {{ $t("shared.wishlists.wishlist_line_items.quantity") }}
      </div>
      <div class="vc-wishlist-line-items__remove-button w-8"></div>
    </div>

    <!-- table body -->
    <div class="flex flex-col gap-6 md:gap-0 md:border-x md:border-b md:rounded-b md:divide-y" v-if="items.length">
      <div
        v-for="item in items"
        :key="item.id"
        class="relative border bg-white rounded shadow-t-3sm md:rounded-none md:shadow-none md:border-0"
      >
        <div
          class="vc-wishlist-line-items__line-item grid gap-x-2.5 pt-3 pl-3 pr-3.5 pb-4 md:p-4 md:gap-x-3 md:place-items-center"
        >
          <div class="contents vc-wishlist-line-items__product md:flex md:gap-3 md:w-full">
            <!--  IMAGE -->
            <div
              class="vc-wishlist-line-items__img shrink-0 w-16 h-16 md:w-[60px] md:h-[60px]"
              :class="{ 'opacity-25': !extendedItems[item.id].isProductExists }"
            >
              <VcImage
                :src="item.imageUrl"
                :alt="item.name"
                size-suffix="sm"
                class="w-full h-full object-cover object-center"
                lazy
              />
            </div>

            <!-- NAME -->
            <div
              class="vc-wishlist-line-items__name text-sm font-extrabold md:grow lg:text-13 lg:leading-4 lg:font-bold"
              :class="{ 'opacity-25': !extendedItems[item.id].isProductExists }"
            >
              <router-link
                v-if="extendedItems[item.id].route"
                :to="extendedItems[item.id].route"
                :title="item.name"
                class="text-[color:var(--color-link)] [word-break:break-word]"
              >
                {{ item.name }}
              </router-link>
              <div class="[word-break:break-word]" v-else>
                {{ item.name }}
              </div>
            </div>
          </div>

          <div class="vc-wishlist-line-items__props w-full xl:contents">
            <!-- PROPERTIES -->
            <div class="vc-wishlist-line-items__properties w-full">
              <div
                class="grid grid-cols-[auto_1fr_auto] gap-1.5 text-13 md:grid-cols-[45%_1fr] lg:text-xs"
                v-for="property in extendedItems[item.id].properties"
                :key="property.id"
              >
                <div class="min-w-0 font-medium capitalize text-gray-600 md:font-bold md:text-gray-800">
                  <div class="truncate">{{ property.label }}:</div>
                </div>
                <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>
                <div class="min-w-0">
                  <div class="truncate font-semibold md:font-normal">
                    {{ property.value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- PRICE -->
            <div
              class="vc-wishlist-line-items__price grid grid-cols-[auto_1fr_auto] gap-1.5 w-full md:grid-cols-[45%_1fr] xl:contents"
            >
              <div
                class="min-w-0 font-medium capitalize text-13 lg:text-xs text-gray-600 md:font-bold md:text-gray-800 xl:hidden"
              >
                <div class="truncate">{{ $t("shared.wishlists.wishlist_line_items.price_per_item") }}:</div>
              </div>
              <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>
              <div class="xl:w-full xl:pr-4 xl:text-right">
                <div class="text-13 font-semibold md:font-normal lg:text-xs xl:font-medium">
                  <!-- Price per item -->
                  Actual Price
                </div>

                <!-- Price without discount -->
                <div class="text-11 leading-3 line-through text-[color:var(--color-price-old)]">Old Price</div>
              </div>
            </div>
          </div>

          <!-- ADD-TO-CART -->
          <div class="vc-wishlist-line-items__quantity mt-3 md:mt-0 md:w-full">
            <AddToCart v-if="item.product" :product="item.product" />

            <div class="flex flex-wrap justify-start gap-1 mt-1.5">
              <VcInStock
                :is-in-stock="item.product?.availabilityData?.isInStock || false"
                :is-available="!!item.product"
                :quantity="item.product ? item.product.availabilityData?.availableQuantity : undefined"
              ></VcInStock>
              <VcCountInCart :productId="item.product?.id" />
            </div>
          </div>

          <!-- REMOVE BUTTON -->
          <div
            class="vc-wishlist-line-items__remove-button absolute -top-3 -right-3 md:static md:flex md:justify-end md:w-8"
          >
            <button
              type="button"
              class="flex items-center justify-center h-[26px] w-[26px] rounded-full border bg-white text-[color:var(--color-danger)] md:border-2 md:w-7 md:h-7 md:rounded hover:bg-gray-100"
              @click="$emit('remove:item', item)"
            >
              <svg class="w-3.5 h-3.5">
                <use href="/static/images/delete.svg#main"></use>
              </svg>
            </button>
          </div>
        </div>

        <!-- Line item validation error -->
        <div class="-mt-0.5 mb-3 mx-3 md:-mt-2 md:mb-2.5 md:mx-4" v-if="false">
          <VcAlert icon type="error" text v-if="true"> Error message example </VcAlert>
        </div>
      </div>
    </div>

    <div class="p-3 border-x md:rounded-b" v-else>
      <VcAlert type="warning" icon>
        {{ $t("shared.wishlists.wishlist_line_items.no_items_message") }}
      </VcAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { RouteLocationRaw } from "vue-router";
import { sumBy } from "lodash";
import { Property, LineItemType } from "@/xapi";
import { VcPriceDisplay } from "@/ui-kit/components";
import { AddToCart } from "@/shared/cart";
import { getProductRoute } from "@/core";

const props = defineProps({
  items: {
    type: Array as PropType<LineItemType[]>,
    required: true,
  },
});

defineEmits(["remove:item", "update:item"]);

const extendedItems = computed<
  Record<string, { isProductExists: boolean; route: RouteLocationRaw; properties: Property[] }>
>(() =>
  props.items.reduce(
    (result, item: LineItemType) =>
      Object.assign(result, {
        [item.id]: {
          isProductExists: !!item.product,
          route: getProductRoute(item.product?.id ?? "", item.product?.slug),
          properties: item.product?.properties?.slice(0, 3),
        },
      }),
    {}
  )
);
</script>

<style scoped lang="scss">
.vc-wishlist-line-items {
  &__header {
    @media (min-width: theme("screens.md")) {
      grid-template-columns: 200px 1fr 170px min-content;
      grid-template-areas: "product properties quantity remove-button";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 250px 1fr 120px 207px min-content;
      grid-template-areas: "product properties price quantity remove-button";
    }
  }

  &__line-item {
    grid-template-areas:
      "img name"
      "img props"
      "img quantity";
    grid-template-columns: 64px 1fr;

    @media (min-width: theme("screens.md")) {
      grid-template-areas: "product props quantity remove-button";
      grid-template-columns: 200px 1fr 170px min-content;
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-areas: "product properties price quantity remove-button";
      grid-template-columns: 250px 1fr 120px 207px min-content;
    }
  }

  &__product {
    grid-area: product;
  }

  &__img {
    grid-area: img;
  }

  &__name {
    grid-area: name;
  }

  &__props {
    grid-area: props;
  }

  &__properties {
    grid-area: properties;
  }

  &__quantity {
    grid-area: quantity;
  }
}
</style>
