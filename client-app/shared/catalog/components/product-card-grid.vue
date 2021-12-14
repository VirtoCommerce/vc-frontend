<template>
  <div class="flex flex-col bg-white rounded border p-4 shadow-sm hover:shadow-lg cursor-pointer">
    <!-- Product image -->
    <div class="square relative flex flex-col justify-center items-center border border-gray-100">
      <img
        :src="product.imgSrc || '/assets/static/images/no-image.svg'"
        :alt="product.name"
        class="absolute top-0 w-full h-full object-cover object-center"
      />
    </div>

    <div class="flex flex-col flex-grow pt-4">
      <div class="flex items-center justify-between mb-3">
        <!-- Compare checkbox -->
        <label class="flex-grow hidden md:inline-flex items-center text-sm cursor-pointer">
          <input
            type="checkbox"
            class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
          />
          <span class="ml-2">Compare</span>
        </label>

        <div v-if="product.availabilityData?.isInStock" class="flex items-center text-green-700 text-xs">
          <div class="w-1.5 h-1.5 bg-green-700 rounded mr-1"></div>
          {{ product.availabilityData.availableQuantity }} in stock
        </div>
        <div v-else class="flex items-center text-red-500 text-xs">
          <div class="w-1.5 h-1.5 bg-red-500 rounded mr-1"></div>
          Out of stock
        </div>
      </div>

      <!-- Product title -->
      <router-link
        :to="`/catalog/${product.slug}`"
        class="text-cyan-700 font-extrabold text-sm mb-3 flex-grow line-clamp-3 overflow-hidden"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="hidden md:block text-sm pb-2">
        <div class="flex items-baseline">
          <div class="w-1/2 font-bold text-xs">Item #</div>
          <span class="w-1/2 text-cyan-700">{{ product.code }}</span>
        </div>
        <div class="flex items-baseline">
          <div class="w-1/2 font-bold text-xs">Mfr. model #</div>
          <span class="w-1/2 text-cyan-700">-</span>
        </div>
      </div>

      <!-- Product price -->
      <div class="flex flex-col md:flex-row items-baseline text-sm mb-4">
        <div class="w-1/2 font-bold text-xs">Your price</div>
        <div class="md:w-1/2">
          <span class="text-green-700 font-extrabold">{{ product.price?.actual?.formattedAmount }}</span> / each
        </div>
      </div>

      <!-- Card widget -->
      <div class="flex">
        <input
          type="text"
          class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9"
          :disabled="!product.availabilityData?.isBuyable"
        />
        <button
          class="rounded-r uppercase px-3 border font-roboto-condensed font-bold text-sm"
          :class="[
            product.availabilityData?.isBuyable
              ? 'border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500'
              : 'border-gray-300 text-gray-300 cursor-default',
          ]"
          :disabled="!product.availabilityData?.isBuyable"
        >
          <span class="hidden lg:inline">Add to cart</span>
          <i class="inline lg:hidden fas fa-shopping-cart"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Product } from "@/core/api/graphql/types";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});
</script>
