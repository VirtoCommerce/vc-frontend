<template>
  <div class="flex flex-col bg-white rounded border p-4 shadow-sm hover:shadow-lg overflow-hidden">
    <!-- Product image -->
    <router-link :to="link" class="cursor-pointer">
      <div class="square relative flex flex-col justify-center items-center border border-gray-100">
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          size-suffix="md"
          class="absolute top-0 w-full h-full object-cover object-center"
          lazy
        />
      </div>
    </router-link>

    <div class="flex flex-col flex-grow pt-3 xl:pt-4">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-1.5 xl:mb-3">
        <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="mb-2 xl:mb-0" />

        <div v-if="product.availabilityData?.isInStock" class="flex items-center text-green-700 text-xs">
          <div class="w-1.5 h-1.5 bg-green-700 rounded mr-1"></div>
          {{ product.availabilityData.availableQuantity > 9999 ? "9999+" : product.availabilityData.availableQuantity }}
          {{ $t("common.suffixes.product_count_in_stock") }}
        </div>

        <div v-else class="flex items-center text-[color:var(--color-danger)] text-xs">
          <div class="w-1.5 h-1.5 bg-[color:var(--color-danger)] rounded mr-1"></div>
          {{ $t("common.messages.product_out_of_stock") }}
        </div>
      </div>

      <!-- Product title -->
      <router-link
        :to="link"
        class="text-[color:var(--color-link)] font-extrabold text-sm mb-3 flex-grow line-clamp-3 overflow-hidden cursor-pointer"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="hidden md:block text-sm pb-2">
        <div class="flex items-baseline justify-between gap-x-2">
          <div class="font-bold text-xs" v-t="'shared.catalog.product_card.product_sku_label'"></div>
          <span class="text-[color:var(--color-link)] truncate">{{ product.code }}</span>
        </div>
      </div>

      <!-- Product price -->
      <div class="flex h-10 md:h-8 flex-col md:flex-row items-baseline justify-between text-sm mb-5 gap-x-2">
        <div class="font-bold text-xs" v-t="'shared.catalog.product_card.price_label'"></div>
        <VcItemPrice :value="product.price" />
      </div>

      <slot name="cart-handler"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { AddToCompare } from "@/shared/compare";
import { Product } from "@/xapi/graphql/types";
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
