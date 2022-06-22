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
        <div
          v-if="sale"
          class="absolute top-0 right-0 px-2 pt-1 pb-1.5 rounded-bl bg-[color:var(--color-sale-badge-bg)] text-white text-xs font-extrabold"
        >
          {{ sale }}
        </div>
      </div>
    </router-link>

    <div class="flex flex-col flex-grow pt-3 xl:pt-3">
      <div class="mb-1.5 xl:inline-flex xl:flex-wrap xl:items-center xl:justify-between xl:mb-2">
        <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="mb-2 xl:my-0.5 xl:pr-0.5" />

        <VcInStock
          :is-in-stock="product.availabilityData?.isInStock"
          :quantity="product.availabilityData?.availableQuantity"
          class="inline-block my-0.5"
        ></VcInStock>
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

const sale = computed(() => {
  if (props.product.price?.list && props.product.price?.sale) {
    const {
      list: { amount: listPrice },
      sale: { amount: salePrice },
    } = props.product.price;

    const amount = (listPrice - salePrice) / listPrice;
    const isSaleEnabled = amount >= 0.05;

    return isSaleEnabled ? `-${Math.round(amount * 100)}%` : null;
  } else {
    return null;
  }
});
</script>
