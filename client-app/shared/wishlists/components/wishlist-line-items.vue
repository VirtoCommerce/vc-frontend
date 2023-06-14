<template>
  <div class="vc-wishlist-line-items">
    <!-- table header -->
    <div class="vc-wishlist-line-items__header">
      <div class="vc-wishlist-line-items__product">
        {{ $t("common.labels.product") }}
      </div>
      <div class="vc-wishlist-line-items__properties">
        {{ $t("common.labels.properties") }}
      </div>
      <div class="vc-wishlist-line-items__price">
        {{ $t("common.labels.price_per_item") }}
      </div>
      <div class="vc-wishlist-line-items__quantity">
        {{ $t("common.labels.quantity") }}
      </div>
      <div class="vc-wishlist-line-items__remove-button"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="vc-wishlist-line-items__body">
      <WishlistLineItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        @update:cart-item-quantity="changeCartItemQuantity"
        @update:list-item-quantity="changeItemQuantity"
        @remove="$emit('remove:listItem', item)"
      />
    </div>

    <div v-else class="vc-wishlist-line-items__empty">
      <VcAlert color="warning" icon>
        {{ $t("common.messages.empty_wish_list") }}
      </VcAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import WishlistLineItem from "./wishlist-line-item.vue";
import type { PreparedLineItemType } from "@/core/types";
import type { InputNewBulkItemType, LineItemType } from "@/xapi/types";

interface IEmits {
  (event: "update:cartItem", value: InputNewBulkItemType): void;
  (event: "update:listItem", value: InputNewBulkItemType): void;
  (event: "remove:listItem", value: LineItemType): void;
}

interface IProp {
  items: PreparedLineItemType[];
}

const emit = defineEmits<IEmits>();
defineProps<IProp>();

function changeCartItemQuantity(item: InputNewBulkItemType): void {
  emit("update:cartItem", item);
}

function changeItemQuantity(item: InputNewBulkItemType): void {
  emit("update:listItem", item);
}
</script>

<style scoped lang="scss">
.vc-wishlist-line-items {
  @media (min-width: theme("screens.md")) {
    @apply border rounded bg-white divide-y;
  }

  &__header {
    @apply hidden;

    @media (min-width: theme("screens.md")) {
      @apply grid gap-x-3 px-4 py-3 text-sm font-bold;

      grid-template-columns: 200px 1fr 170px min-content;
      grid-template-areas: "product properties quantity remove-button";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 250px 1fr 120px 207px min-content;
      grid-template-areas: "product properties price quantity remove-button";
    }
  }

  &__product {
    grid-area: product;
  }

  &__properties {
    grid-area: properties;
  }

  &__price {
    @apply hidden;

    grid-area: price;

    @media (min-width: theme("screens.xl")) {
      @apply block pr-4 text-right;
    }
  }

  &__quantity {
    @apply hidden;

    grid-area: quantity;

    @media (min-width: theme("screens.md")) {
      @apply block pl-4 text-left;
    }
  }

  &__remove-button {
    @apply w-8;

    grid-area: remove-button;
  }

  &__body {
    @apply flex flex-col gap-6;

    @media (min-width: theme("screens.md")) {
      @apply gap-0 divide-y;
    }
  }

  &__empty {
    @apply p-3;
  }
}
</style>
