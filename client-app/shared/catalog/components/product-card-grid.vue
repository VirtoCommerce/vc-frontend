<template>
  <div class="flex flex-col bg-white rounded border p-4 shadow-sm hover:shadow-lg overflow-hidden">
    <!-- Product image -->
    <router-link :to="`/${SeoUrl.Product}/${product.id}`" class="cursor-pointer">
      <div class="square relative flex flex-col justify-center items-center border border-gray-100">
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          class="absolute top-0 w-full h-full object-cover object-center"
        />
      </div>
    </router-link>

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
          {{ product.availabilityData.availableQuantity > 9999 ? "9999+" : product.availabilityData.availableQuantity }}
          in stock
        </div>
        <div v-else class="flex items-center text-red-500 text-xs">
          <div class="w-1.5 h-1.5 bg-red-500 rounded mr-1"></div>
          Out of stock
        </div>
      </div>

      <!-- Product title -->
      <router-link
        :to="`/${SeoUrl.Product}/${product.id}`"
        class="text-cyan-700 font-extrabold text-sm mb-3 flex-grow line-clamp-3 overflow-hidden cursor-pointer"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="hidden md:block text-sm pb-2">
        <div class="flex items-baseline">
          <div class="w-1/2 font-bold text-xs">Item #</div>
          <span class="w-1/2 text-cyan-700 truncate">{{ product.code }}</span>
        </div>
        <div class="flex items-baseline">
          <div class="w-1/2 font-bold text-xs">Mfr. model #</div>
          <span class="w-1/2 text-cyan-700 truncate">-</span>
        </div>
      </div>

      <!-- Product price -->
      <div class="flex flex-col md:flex-row items-baseline text-sm mb-4">
        <div class="w-1/2 font-bold text-xs">Your price</div>
        <div class="md:w-1/2">
          <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span> / each
        </div>
      </div>

      <slot name="cart-handler"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { VcImage, VcPriceDisplay } from "@/components";
import { Product as ProductType } from "@/core/api/graphql/types";
import SeoUrl from "@core/seo-routes.enum";

defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});
</script>
