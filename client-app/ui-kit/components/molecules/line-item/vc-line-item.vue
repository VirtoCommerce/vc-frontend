<template>
  <div
    class="vc-line-item relative flex gap-2.5 pt-3 pl-3 pr-3.5 pb-4 border border-[color:var(--color-line-item-border)] rounded"
  >
    <!--  IMAGE -->
    <div class="vc-line-item__img shrink-0 w-16 h-16 lg:w-[60px] lg:h-[60px]" :class="{ 'opacity-25': !productExists }">
      <VcImage
        :src="item.imageUrl"
        :alt="item.name"
        size-suffix="sm"
        class="w-full h-full object-cover object-center"
        lazy
      />
    </div>

    <!-- line-item grid -->
    <div class="vc-line-item__grid">
      <!-- NAME -->
      <div
        class="vc-line-item__name text-sm font-extrabold lg:text-13 lg:leading-4 lg:font-bold"
        :class="{ 'opacity-25': !productExists }"
      >
        <router-link v-if="link" :to="link" :title="item.name" class="text-[color:var(--color-link)]">
          {{ item.name }}
        </router-link>
        <template v-else>
          {{ item.name }}
        </template>
      </div>

      <!-- PROPERTIES -->
      <div class="vc-line-item__properties text-13 lg:text-xs">
        <div class="flex items-stretch gap-1.5" v-for="property in properties" :key="property.id">
          <div class="font-medium capitalize">{{ property.name.toLowerCase() }}:</div>
          <div class="grow mb-1 border-b-2 border-gray-200 border-dotted md:hidden" />
          <div class="relative font-semibold">
            <div class="truncate">
              {{ property.value }}
            </div>
          </div>
        </div>
        <div class="flex space-y-1 lg:space-y-0 lg:hidden" v-if="withPricePerItem">
          <span class="pr-1 w-auto lg:w-1/2 font-medium lg:font-bold">
            {{ $t("shared.line_items.header.price_per_item") }}:
          </span>
          <span class="flex-1 w-auto mx-2 h-4 border-b-2 border-gray-200 border-dotted lg:hidden" />
          <span class="font-bold lg:font-medium">
            <slot name="pricePerItem" />
          </span>
        </div>
      </div>

      <!-- PRICE -->
      <div class="vc-line-item__price" v-if="withPricePerItem">
        <slot name="pricePerItem" />
      </div>

      <!-- QUANTITY -->
      <div class="vc-line-item__quantity">
        <slot name="quantity" />
      </div>

      <!-- TOTAL -->
      <div class="vc-line-item__total" v-if="withTotal">
        <slot name="total" />
      </div>

      <!-- ADD TO CART -->
      <div class="vc-line-item__add-to-cart" v-if="withAddToCart">
        <slot name="addToCart" />
      </div>

      <!-- REMOVE BUTTON -->
      <div class="vc-line-item__remove-button absolute -top-3 -right-3" v-if="!readOnly">
        <button
          type="button"
          class="h-[26px] w-[26px] rounded-full border border-[color:var(--color-line-item-border)] bg-white text-[color:var(--color-danger)] hover:bg-gray-100"
          @click="$emit('removeItem', item)"
        >
          <i class="fas fa-times" />
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div></div>
  </div>

  <div class="border-b md:table-row" v-if="false">
    <div class="md:table-cell md:border-b px-4 py-2.5 align-middle">
      <div class="flex">
        <div :class="{ 'opacity-25': !productExists }" class="flex-col w-16 h-16 border border-gray-100 mr-4"></div>

        <div :class="{ 'opacity-25': !productExists }" class="flex-col flex-1">
          <router-link
            :to="link"
            :title="item.name"
            class="text-[color:var(--color-link)] font-extrabold line-clamp-3"
            v-if="link"
          >
            {{ item.name }}
          </router-link>
          <div class="font-extrabold line-clamp-3" v-else>
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { RouteLocationRaw } from "vue-router";
import { computedEager } from "@vueuse/core";
import { LineItemType, OrderLineItemType, Property, QuoteItemType } from "@/xapi";
import { getProductRoute } from "@/core";

const props = defineProps({
  item: {
    type: Object as PropType<QuoteItemType | OrderLineItemType | LineItemType>,
    required: true,
  },

  readOnly: {
    type: Boolean,
  },

  withPricePerItem: {
    type: Boolean,
    default: false,
  },

  withTotal: {
    type: Boolean,
    default: false,
  },

  withAddToCart: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["removeItem"]);

const productExists = computedEager<boolean>(() => !!props.item.product);

const link = computed<RouteLocationRaw>(() => getProductRoute(props.item!.productId!, props.item!.product!.slug));
const properties = computed<Property[] | undefined>(() => props.item!.product?.properties?.slice(0, 3));
</script>

<style scoped lang="scss">
.vc-line-item {
  &__grid {
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
  }

  &__name {
    grid-area: name;
  }

  &__properties {
    grid-area: properties;
  }

  &__total {
    grid-area: total;
  }

  &__quantity {
    grid-area: quantity;
  }

  &__price {
    grid-area: price;
  }

  &__add-to-cart {
    grid-area: add-to-cart;
  }

  &__remove-button {
    grid-area: remove-button;
  }
}
</style>
