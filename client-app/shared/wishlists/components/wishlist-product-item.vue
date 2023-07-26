<template>
  <div class="flex items-center gap-x-8 px-6 py-3 pb-5">
    <!-- Name and image -->
    <div
      :class="{ 'opacity-25': !productAvailable }"
      class="relative flex w-full flex-1 shrink-0 items-center space-x-3"
    >
      <div class="h-16 w-16 shrink-0 border border-gray-100">
        <VcImage :src="listItem.imageUrl" :alt="listItem.name" class="h-full w-full object-cover object-center" />
      </div>

      <router-link
        v-if="listItem.product && link"
        :to="link"
        class="line-clamp-3 overflow-hidden break-words text-sm font-extrabold text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
        :title="listItem.product.name"
        @click="$emit('linkClick', $event)"
      >
        {{ listItem.product.name }}
      </router-link>

      <div v-else>
        <div class="line-clamp-3 overflow-hidden break-words text-sm font-extrabold">{{ listItem.name }}</div>
        <!-- todo: extract small alert component https://virtocommerce.atlassian.net/browse/ST-2488 -->
        <div v-if="productAvailable" class="mt-1 flex items-center space-x-1">
          <i class="fas fa-exclamation-circle self-start text-[color:var(--color-primary)]"></i>
          <span v-t="'common.messages.item_can_t_be_purchased'" class="text-xs text-gray-400"></span>
        </div>
      </div>
    </div>

    <!-- Price -->
    <div :class="{ 'opacity-25': !productAvailable }" class="flex w-32 shrink-0 flex-col items-start text-sm">
      <span class="font-bold">
        {{ $t("pages.compare.main_block.price_label") }}
      </span>

      <div>
        <VcItemPrice :value="listItem.product?.price || { list: listItem.listPrice, sale: listItem.salePrice }" />
      </div>
    </div>

    <!-- Add to cart -->
    <div class="flex w-48 shrink-0 flex-col justify-center">
      <AddToCart v-if="listItem.product" :product="listItem.product" />

      <div class="mt-2 flex">
        <VcInStock
          :is-in-stock="listItem.product?.availabilityData?.isInStock || false"
          :is-available="productAvailable"
          :is-track-inventory="listItem.product?.availabilityData?.isTrackInventory"
          :quantity="listItem.product ? listItem.product.availabilityData?.availableQuantity : undefined"
        ></VcInStock>
      </div>
    </div>

    <!-- Actions -->
    <div class="ml-auto shrink-0">
      <!-- todo: https://virtocommerce.atlassian.net/browse/ST-2256 -->
      <button
        type="button"
        class="h-7 w-7 rounded bg-white text-[color:var(--color-danger)] shadow hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.remove_list_button')"
        @click="$emit('remove')"
      >
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/shared";
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import type { LineItemType } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  listItem: LineItemType;
}

defineEmits<{
  (eventName: "linkClick", globalEvent: PointerEvent): void;
  (eventName: "remove"): void;
}>();

const props = defineProps<IProps>();

const link = computed<RouteLocationRaw | undefined>(() =>
  props.listItem.product ? getProductRoute(props.listItem.product.id, props.listItem.product.slug) : undefined
);

const productAvailable = computedEager(() => !!props.listItem.product);
</script>
