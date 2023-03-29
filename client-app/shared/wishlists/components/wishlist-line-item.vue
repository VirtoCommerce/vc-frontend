<template>
  <div
    :class="[
      'vc-wishlist-line-item',
      {
        'vc-wishlist-line-item--not-exists': !extendedItem.extended.isProductExists,
      },
    ]"
  >
    <div class="vc-wishlist-line-item__before">
      <slot name="before" />
    </div>

    <div class="vc-wishlist-line-item__grid">
      <div class="vc-wishlist-line-item__product">
        <!--  IMAGE -->
        <VcImage
          :src="extendedItem.imageUrl"
          :alt="extendedItem.name"
          size-suffix="sm"
          class="vc-wishlist-line-item__img"
          lazy
        />

        <!-- NAME -->
        <router-link
          v-if="extendedItem.extended.route"
          :to="extendedItem.extended.route"
          :title="extendedItem.name"
          class="vc-wishlist-line-item__name vc-wishlist-line-item__name--link"
          @click="sendGASelectItemEvent"
        >
          {{ extendedItem.name }}
        </router-link>

        <div v-else class="vc-wishlist-line-item__name">
          {{ extendedItem.name }}
        </div>
      </div>

      <!-- PROPERTIES -->
      <div class="vc-wishlist-line-item__properties">
        <VcLineItemProperty
          v-for="property in extendedItem.extended.displayProperties"
          :key="property.id"
          :label="property.label"
        >
          {{ property.value }}
        </VcLineItemProperty>

        <div class="xl:hidden">
          <VcLineItemProperty :label="$t('common.labels.price_per_item')">
            <VcLineItemPrice :list-price="extendedItem.listPrice" :actual-price="extendedItem.salePrice" />
          </VcLineItemProperty>
        </div>
      </div>

      <!-- PRICE -->
      <div class="vc-wishlist-line-item__price">
        <VcLineItemPrice :list-price="extendedItem.listPrice" :actual-price="extendedItem.salePrice" />
      </div>

      <!-- ADD-TO-CART -->
      <div class="vc-wishlist-line-item__quantity">
        <AddToCart
          v-if="extendedItem.extended.isProductExists"
          :product="extendedItem.product!"
          @update:line-item="changeItemQuantity"
        />

        <div class="vc-wishlist-line-item__quantity-badges">
          <VcInStock
            :is-in-stock="extendedItem.product?.availabilityData?.isInStock || false"
            :is-available="extendedItem.extended.isProductExists"
            :quantity="extendedItem.product?.availabilityData?.availableQuantity"
          />
          <VcCountInCart :product-id="extendedItem.product?.id" />
        </div>
      </div>

      <!-- REMOVE BUTTON -->
      <div class="vc-wishlist-line-item__button-container">
        <button type="button" class="vc-wishlist-line-item__button" @click="$emit('remove')">
          <VcIcon size="xs" name="delete-2" />
        </button>
      </div>
    </div>

    <div class="vc-wishlist-line-item__after">
      <slot name="after" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGoogleAnalytics } from "@/core/composables";
import { AddToCart } from "@/shared/cart";
import { extendWishListItem } from "../utilities";
import type { LineItemType } from "@/xapi/types";

interface IEmits {
  (event: "remove"): void;
  (event: "update", item: LineItemType): void;
}

interface IProps {
  item: LineItemType;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const ga = useGoogleAnalytics();

const extendedItem = computed(() => extendWishListItem(props.item));

function changeItemQuantity(lineItem: LineItemType): void {
  emit("update", lineItem);
}

function sendGASelectItemEvent() {
  if (props.item.product) {
    ga.selectItem(props.item.product);
  }
}
</script>

<style scoped lang="scss">
.vc-wishlist-line-item {
  $notExists: "";

  @apply relative border bg-white rounded shadow-t-3sm;

  @media (min-width: theme("screens.md")) {
    @apply rounded-none shadow-none border-0 bg-transparent;
  }

  &--not-exists {
    $notExists: &;
  }

  &__before {
    @apply flex flex-col gap-1 -mb-0.5 pt-3 px-3 empty:hidden;

    @media (min-width: theme("screens.md")) {
      @apply -mb-2 pt-2.5 px-4;
    }
  }

  &__grid {
    @apply grid gap-x-2.5 pt-3 pl-3 pr-3.5 pb-4;

    grid-template-areas:
      "img name"
      "img properties"
      "img quantity";
    grid-template-columns: 64px 1fr;

    @media (min-width: theme("screens.md")) {
      @apply p-4 gap-x-3 place-items-center;

      grid-template-areas: "product properties quantity remove-button";
      grid-template-columns: 200px 1fr 170px min-content;
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-areas: "product properties price quantity remove-button";
      grid-template-columns: 250px 1fr 120px 207px min-content;
    }
  }

  &__product {
    @apply contents;

    grid-area: product;

    @media (min-width: theme("screens.md")) {
      @apply flex gap-3 w-full;
    }
  }

  &__img {
    @apply shrink-0 w-16 h-16 object-cover object-center;

    grid-area: img;

    @media (min-width: theme("screens.md")) {
      @apply w-[60px] h-[60px];
    }

    #{$notExists} & {
      @apply opacity-25;
    }
  }

  &__name {
    @apply text-sm font-extrabold [word-break:break-word];

    grid-area: name;

    @media (min-width: theme("screens.md")) {
      @apply grow;
    }

    @media (min-width: theme("screens.lg")) {
      @apply text-13 leading-4 font-bold;
    }

    &--link {
      @apply text-[color:var(--color-link)];
    }

    #{$notExists} & {
      @apply opacity-25;
    }
  }

  &__properties {
    @apply w-full;

    grid-area: properties;

    &--mobile {
      @apply xl:hidden;
    }
  }

  &__price {
    @apply hidden;

    @media (min-width: theme("screens.xl")) {
      @apply block w-full pr-4 text-right;
    }
  }

  &__quantity {
    @apply mt-3;

    grid-area: quantity;

    @media (min-width: theme("screens.md")) {
      @apply mt-0 w-full;
    }
  }

  &__quantity-badges {
    @apply flex flex-wrap justify-start gap-1 mt-1.5;
  }

  &__button-container {
    @apply absolute -top-3 -right-3;

    grid-area: remove-button;

    @media (min-width: theme("screens.md")) {
      @apply static flex justify-end w-8;
    }
  }

  &__button {
    @apply flex items-center justify-center h-[26px] w-[26px] rounded-full border bg-white text-[color:var(--color-danger)];

    @media (min-width: theme("screens.md")) {
      @apply border-2 w-7 h-7 rounded;
    }

    &:hover {
      @apply bg-gray-100;
    }
  }

  &__after {
    @apply flex flex-col gap-1 -mt-0.5 pb-3 px-3 empty:hidden;

    @media (min-width: theme("screens.md")) {
      @apply -mt-2 pb-2.5 px-4;
    }
  }
}
</style>
