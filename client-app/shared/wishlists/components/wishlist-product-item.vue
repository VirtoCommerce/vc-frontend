<template>
  <div class="flex items-center gap-x-8 pt-3 pb-5 py-3 px-6">
    <!-- Name and image -->
    <div class="relative shrink-0 w-full flex-1 flex space-x-3 items-center">
      <div class="border border-gray-100 w-16 h-16 shrink-0">
        <VcImage :src="product.imgSrc" :alt="product.name" class="w-full h-full object-cover object-center" />
      </div>

      <router-link
        :to="link"
        class="text-sm text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)] break-words font-extrabold line-clamp-3 overflow-hidden"
      >
        {{ product.name }}
      </router-link>
    </div>

    <!-- Price -->
    <div class="shrink-0 w-32 font-bold text-sm flex flex-col items-start">
      <span class="font-bold">
        {{ $t("pages.compare.main_block.price_label") }}
      </span>

      <div>
        <VcItemPrice :value="product.price" />
      </div>
    </div>

    <!-- Add to cart -->
    <div class="w-48 shrink-0 flex flex-col justify-center">
      <AddToCart :product="product" />

      <div class="flex">
        <VcInStock
          :is-in-stock="product.availabilityData?.isInStock"
          :quantity="product.availabilityData?.availableQuantity"
        ></VcInStock>
      </div>
    </div>

    <!-- Actions -->
    <div class="shrink-0 ml-auto">
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
import { Product } from "@/xapi/types";

defineEmits(["remove"]);

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product));
</script>
