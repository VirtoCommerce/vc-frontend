<template>
  <div
    class="vc-line-item relative flex gap-2.5 pt-3 pl-3 pr-3.5 pb-4 border border-[color:var(--color-line-item-border)] rounded shadow-t-3sm md:gap-3.5 md:py-4 md:pr-4 md:rounded-none md:shadow-none md:border-0"
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
    <div class="vc-line-item__grid grow md:grid md:gap-3 md:place-items-center" :class="`vc-line-item__grid--${modifier}`">
      <!-- NAME -->
      <div
        class="vc-line-item__name text-sm font-extrabold md:w-full lg:text-13 lg:leading-4 lg:font-bold"
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
      <div class="vc-line-item__properties text-13 md:w-full lg:text-xs">
        <div class="flex items-stretch gap-1.5" v-for="property in properties" :key="property.id">
          <div class="font-medium capitalize text-[color:var(--color-line-item-light)]">
            {{ property.name.toLowerCase() }}:
          </div>
          <div class="grow mb-1 border-b-2 border-gray-200 border-dotted md:hidden" />
          <div class="relative font-semibold">
            <div class="truncate">
              {{ property.value }}
            </div>
          </div>
        </div>
        <div class="flex items-stretch gap-1.5 md:hidden" v-if="withPricePerItem">
          <div class="font-medium capitalize text-[color:var(--color-line-item-light)]">
            {{ $t("pages.account.quote_details.line_items.price_per_item") }}:
          </div>
          <div class="grow mb-1 border-b-2 border-gray-200 border-dotted md:hidden" />
          <div class="relative font-semibold">
            <slot name="pricePerItem" />
          </div>
        </div>
      </div>

      <!-- PRICE -->
      <div class="vc-line-item__price hidden md:block md:w-full pr-4 text-right" v-if="withPricePerItem">
        <slot name="pricePerItem" />
      </div>

      <div class="flex items-start justify-between mt-3 md:contents">
        <!-- QUANTITY -->
        <div class="vc-line-item__quantity md:w-full">
          <slot name="quantity" />
        </div>

        <!-- TOTAL -->
        <div
          class="vc-line-item__total flex flex-col justify-center items-end min-h-[32px] md:min-h-auto md:w-full"
          v-if="withTotal"
        >
          <slot name="total" />
        </div>
      </div>

      <!-- ADD TO CART -->
      <div class="vc-line-item__add-to-cart" v-if="withAddToCart">
        <slot name="addToCart" />
      </div>

      <!-- REMOVE BUTTON -->
      <div class="vc-line-item__remove-button absolute -top-3 -right-3 md:static md:pl-2 md:w-full" v-if="!readOnly">
        <button
          type="button"
          class="h-[26px] w-[26px] rounded-full border border-[color:var(--color-line-item-border)] bg-white text-[color:var(--color-danger)] md:border-2 md:w-7 md:h-7 md:rounded hover:bg-gray-100"
          @click="$emit('removeItem', item)"
        >
          <i class="fas fa-times" />
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="false"></div>
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
    default: true,
  },

  withTotal: {
    type: Boolean,
    default: true,
  },

  withAddToCart: {
    type: Boolean,
    default: false,
  },

  modifier: {
    type: String,
    default: "quote",
  },
});

defineEmits(["remove"]);

const productExists = computedEager<boolean>(() => !!props.item.product);

const link = computed<RouteLocationRaw>(() => getProductRoute(props.item!.productId!, props.item!.product!.slug));
const properties = computed<Property[] | undefined>(() => props.item!.product?.properties?.slice(0, 3));
</script>

<style scoped lang="scss">
.vc-line-item {
  &__grid {
    &--quote {
      @media (min-width: theme("screens.md")) {
        grid-template-areas: "name properties price quantity total remove-button";
      }

      @media (min-width: theme("screens.lg")) {
        grid-template-columns: 184px 1fr 150px 88px 100px 40px;
      }
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
