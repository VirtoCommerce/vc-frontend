<template>
  <div
    class="vc-line-item relative border border-[color:var(--color-line-item-border)] rounded shadow-t-3sm md:rounded-none md:shadow-none md:border-0"
  >
    <!-- line-item grid -->
    <div
      class="vc-line-item__grid grid gap-x-2.5 pt-3 pl-3 pr-3.5 pb-4 md:p-4 md:gap-x-3 md:place-items-center"
      :class="`vc-line-item__grid--${modifier}`"
    >
      <div class="contents vc-line-item__product md:flex md:gap-3 md:w-full">
        <!--  IMAGE -->
        <div
          class="vc-line-item__img shrink-0 w-16 h-16 md:w-[60px] md:h-[60px]"
          :class="{ 'opacity-25': !productExists }"
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
          class="vc-line-item__name text-sm font-extrabold md:grow lg:text-13 lg:leading-4 lg:font-bold"
          :class="{ 'opacity-25': !productExists }"
        >
          <router-link
            v-if="link"
            :to="link"
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

      <div class="vc-line-item__props w-full xl:contents">
        <!-- PROPERTIES -->
        <div class="vc-line-item__properties w-full">
          <div
            class="grid grid-cols-[auto_1fr_auto] gap-1.5 text-13 md:grid-cols-[33%_1fr] lg:text-xs"
            v-for="property in properties"
            :key="property.id"
          >
            <div
              class="min-w-0 font-medium capitalize text-[color:var(--color-line-item-light)] md:font-bold md:text-[color:var(--color-secondary)]"
            >
              <div class="truncate">{{ property.name.toLowerCase() }}:</div>
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
          class="vc-line-item__price grid grid-cols-[auto_1fr_auto] gap-1.5 w-full md:grid-cols-[33%_1fr] xl:contents"
          v-if="withPricePerItem"
        >
          <div
            class="min-w-0 font-medium capitalize text-13 lg:text-xs text-[color:var(--color-line-item-light)] md:font-bold md:text-[color:var(--color-secondary)] xl:hidden"
          >
            <div class="truncate">{{ $t("pages.account.quote_details.line_items.price_per_item") }}:</div>
          </div>
          <div class="grow mb-1 h-4 border-b-2 border-gray-200 border-dotted md:hidden"></div>
          <div class="flex flex-col items-end md:items-start xl:items-end xl:w-full xl:pr-4">
            <slot name="pricePerItem" />
          </div>
        </div>
      </div>

      <!-- QUANTITY -->
      <div class="vc-line-item__quantity mt-3 md:place-self-end md:mt-0 xl:w-full xl:place-self-center">
        <slot name="quantity" />
      </div>

      <!-- TOTAL -->
      <div
        class="vc-line-item__total flex flex-col justify-center items-end min-h-[32px] mt-3 md:mt-0 md:min-h-auto md:w-full"
        v-if="withTotal"
      >
        <slot name="total" />
      </div>

      <!-- ADD TO CART -->
      <div class="vc-line-item__add-to-cart" v-if="withAddToCart">
        <slot name="addToCart" />
      </div>

      <!-- REMOVE BUTTON -->
      <div
        class="vc-line-item__remove-button absolute -top-3 -right-3 md:static md:flex md:justify-end md:w-full"
        v-if="!readOnly"
      >
        <button
          type="button"
          class="flex items-center justify-center h-[26px] w-[26px] rounded-full border border-[color:var(--color-line-item-border)] bg-white text-[color:var(--color-danger)] md:border-2 md:w-7 md:h-7 md:rounded hover:bg-gray-100"
          @click="$emit('remove', item)"
        >
          <svg class="w-3.5 h-3.5">
            <use href="/static/images/delete.svg#main"></use>
          </svg>
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div class="-mt-0.5 mb-3 mx-3 md:-mt-2 md:mb-2.5 md:mx-4" v-if="false">
      <VcAlert icon type="error" text v-if="true"> Error message example </VcAlert>
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
      grid-template-areas:
        "img name name"
        "img props props"
        "img quantity total";
      grid-template-columns: 64px auto 1fr;

      @media (min-width: theme("screens.md")) {
        grid-template-areas:
          "product props quantity remove-button"
          "product props total remove-button";
        grid-template-columns: 250px 1fr 100px 32px;
      }

      @media (min-width: theme("screens.xl")) {
        grid-template-areas: "product properties price quantity total remove-button";
        grid-template-columns: 250px 1fr 120px 88px 100px 32px;
      }
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
    @media (min-width: theme("screens.xl")) {
      grid-area: properties;
    }
  }

  &__total {
    grid-area: total;
  }

  &__quantity {
    grid-area: quantity;
  }

  &__price {
    @media (min-width: theme("screens.xl")) {
      grid-area: price;
    }
  }

  &__add-to-cart {
    grid-area: add-to-cart;
  }

  &__remove-button {
    @media (min-width: theme("screens.md")) {
      grid-area: remove-button;
    }
  }
}
</style>
