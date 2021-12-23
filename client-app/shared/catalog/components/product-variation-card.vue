<template>
  <div class="flex flex-row space-x-2.5 border border-gray-100 rounded-sm p-5">
    <!-- image -->
    <div class="w-12 h-12">
      <div
        v-if="variation?.images?.length"
        class="-mt-2 -ml-2 square relative flex flex-col justify-center items-center"
      >
        <img
          :src="variation?.images[0]?.url ?? ''"
          alt="variation"
          class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
        />
      </div>
    </div>
    <div class="flex-1 flex flex-col xl:flex-row xl:space-x-3">
      <!-- variations description -->
      <div class="flex-1 flex flex-col">
        <div class="text-base font-bold uppercase mb-2">item #{{ variation?.code }}</div>
        <VariationProperties :properties="variation?.properties || []"></VariationProperties>
        <div class="flex flex-row space-x-3">
          <div class="w-1/2 text-sm text-gray-500">Your price</div>
          <div class="w-1/2 font-bold">
            <span class="text-green-800">{{ variation?.price?.actual?.formattedAmount }}</span>
            <span class="invisible lg:visible">/ each</span>
          </div>
        </div>
      </div>
      <!-- add to cart -->
      <div class="flex-1 xl:self-center flex flex-row items-center">
        <div class="flex flex-col w-full mt-4">
          <AddToCart :product="product"></AddToCart>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VariationType, Product } from "@core/api/graphql/types";
import { VariationProperties } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";

const props = defineProps<{ variation: VariationType; product: Product }>();
</script>
