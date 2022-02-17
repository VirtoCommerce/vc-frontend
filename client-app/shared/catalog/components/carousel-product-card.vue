<template>
  <div class="bg-white rounded border border-transparent lg:hover:border-gray-100 lg:hover:shadow-lg lg:p-2">
    <!-- Product image -->
    <router-link :to="`/${SeoUrl.Product}/${product.id}`">
      <div class="square relative border border-gray-200">
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          class="absolute top-0 w-full h-full object-cover object-center"
        />
      </div>
    </router-link>

    <div class="md:text-center">
      <!-- Product title -->
      <router-link
        :to="`/${SeoUrl.Product}/${product.id}`"
        class="text-cyan-700 font-extrabold text-sm line-clamp-3 mt-2"
      >
        {{ product.name }}
      </router-link>

      <!-- Product price -->
      <div class="text-sm mt-2">
        <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span> / each
      </div>
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
