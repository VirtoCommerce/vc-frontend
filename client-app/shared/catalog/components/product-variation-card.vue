<template>
  <div class="flex flex-row space-x-2.5 border border-gray-100 rounded-sm p-5">
    <!-- image -->
    <div class="w-12 h-12">
      <div
        v-if="variation?.images?.length"
        class="-mt-2 -ml-2 square relative flex flex-col justify-center items-center"
      >
        <VcImage
          :src="variation?.images[0]?.url"
          :alt="variation?.name"
          class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
        />
      </div>
    </div>
    <div class="flex-1 flex flex-col xl:flex-row xl:space-x-3">
      <!-- variations description -->
      <div class="flex-1 flex flex-col">
        <div class="text-base font-bold uppercase mb-2">
          {{ $t("shared.catalog.product_details.product_variation_card.variation_sku_label") }}{{ variation?.code }}
        </div>
        <VariationProperties :properties="variation?.properties || []"></VariationProperties>
        <div class="flex flex-row items-center space-x-3 text-xs">
          <div
            class="w-1/2 text-gray-500"
            v-t="'shared.catalog.product_details.product_variation_card.price_label'"
          ></div>
          <div class="w-1/2">
            <!-- todo: extract a component for price and use it here -->
            <span class="font-extrabold text-sm text-green-700"
              ><VcPriceDisplay :value="variation?.price?.actual" /></span
            >&nbsp;<span class="font-extrabold hidden lg:inline-block" v-t="'common.suffixes.per_item'"></span>
          </div>
        </div>
      </div>
      <!-- add to cart -->
      <div class="flex-1 xl:self-center flex flex-row items-center">
        <div class="flex flex-col w-full mt-4">
          <AddToCart :product="variation"></AddToCart>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage, VcPriceDisplay } from "@/components";
import { VariationType, Product } from "@core/api/graphql/types";
import { VariationProperties } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import { PropType } from "vue";

defineProps({
  variation: {
    type: Object as PropType<VariationType | Product>,
    required: true,
  },
});
</script>
