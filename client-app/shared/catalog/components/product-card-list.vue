<template>
  <div class="flex items-center justify-between bg-white rounded border p-4 shadow-sm hover:shadow-lg space-x-6">
    <div class="flex flex-grow items-center">
      <!-- Product image -->
      <router-link :to="link" class="cursor-pointer">
        <div class="border border-gray-100 w-20 h-20 flex-shrink-0 mr-4">
          <VcImage
            :src="product.imgSrc"
            :alt="product.name"
            size-suffix="md"
            class="w-full h-full object-cover object-center"
            lazy
          />
        </div>
      </router-link>

      <div>
        <!-- Product title -->
        <router-link
          :to="link"
          class="text-[color:var(--color-link)] font-extrabold text-sm mb-3 flex-grow line-clamp-2 overflow-hidden"
          :title="product.name"
        >
          {{ product.name }}
        </router-link>

        <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="inline-flex" />
      </div>
    </div>
    <div class="flex items-start flex-shrink-0 space-x-6">
      <!-- Product props -->
      <div class="hidden xl:block text-sm flex-shrink-0 w-20">
        <div class="font-bold text-xs" v-t="'shared.catalog.product_card.product_sku_label'"></div>
        <div class="text-[color:var(--color-link)] truncate">{{ product.code }}</div>
      </div>

      <!-- Product price -->
      <div class="text-sm flex-shrink-0 w-28">
        <div class="font-bold text-xs" v-t="'shared.catalog.product_card.price_label'"></div>
        <VcItemPrice :value="product.price"></VcItemPrice>
      </div>

      <!-- VcCard widget -->
      <div class="flex-shrink-0 w-48">
        <slot name="cart-handler"></slot>

        <div class="flex">
          <VcInStock
            :is-in-stock="product.availabilityData?.isInStock"
            :quantity="product.availabilityData?.availableQuantity"
          ></VcInStock>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { AddToCompare } from "@/shared/compare";
import { Product } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute } from "@/shared/catalog";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product));
</script>
