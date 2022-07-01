<template>
  <div class="flex items-center gap-x-8 pt-3 pb-5 py-3 px-6">
    <!-- Name and image -->
    <div class="relative shrink-0 w-full flex-1 flex space-x-3 items-center">
      <div class="border border-gray-100 w-16 h-16 shrink-0">
        <VcImage :src="listItem.imageUrl" :alt="listItem.name" class="w-full h-full object-cover object-center" />
      </div>

      <router-link
        v-if="listItem.product"
        :to="link"
        class="text-sm text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)] break-words font-extrabold line-clamp-3 overflow-hidden"
      >
        {{ listItem.product.name }}
      </router-link>
      <div v-else>
        <div class="text-sm break-words font-extrabold line-clamp-3 overflow-hidden">{{ listItem.name }}</div>
        <!-- todo: extract small alert component https://virtocommerce.atlassian.net/browse/ST-2488 -->
        <div class="flex items-center space-x-1 mt-1">
          <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] self-start"></i>
          <span class="text-xs text-gray-400" v-t="'common.messages.item_can_t_be_purchased'"></span>
        </div>
      </div>
    </div>

    <!-- Price -->
    <div class="shrink-0 w-32 text-sm flex flex-col items-start">
      <span class="font-bold">
        {{ $t("pages.compare.main_block.price_label") }}
      </span>

      <div>
        <VcItemPrice :value="listItem.product?.price || { list: listItem.listPrice, sale: listItem.salePrice }" />
      </div>
    </div>

    <!-- Add to cart -->
    <div class="w-48 shrink-0 flex flex-col justify-center">
      <AddToCart v-if="listItem.product" :product="listItem.product" />

      <div class="flex">
        <VcInStock
          :is-in-stock="listItem.product?.availabilityData?.isInStock || false"
          :quantity="listItem.product ? listItem.product.availabilityData?.availableQuantity : undefined"
        ></VcInStock>
      </div>
    </div>

    <!-- Actions -->
    <div class="shrink-0 ml-auto">
      <!-- todo: https://virtocommerce.atlassian.net/browse/ST-2256 -->
      <button
        type="button"
        class="h-7 w-7 shadow rounded text-[color:var(--color-danger)] bg-white hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.remove_list_button')"
        @click="$emit('remove')"
      >
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import { LineItemType } from "@/xapi/types";

defineEmits(["remove"]);

const props = defineProps({
  listItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});

const link = computed<RouteLocationRaw | undefined>(() =>
  props.listItem.product ? getProductRoute(props.listItem.product) : undefined
);
</script>
