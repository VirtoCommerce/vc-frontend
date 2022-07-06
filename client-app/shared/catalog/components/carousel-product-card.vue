<template>
  <div class="bg-white rounded border border-transparent lg:hover:border-gray-100 lg:hover:shadow-lg lg:p-2">
    <!-- Product image -->
    <router-link :to="link">
      <div class="square relative border border-gray-200">
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          size-suffix="md"
          class="absolute top-0 w-full h-full object-cover object-center"
          lazy
        />
      </div>
    </router-link>

    <div class="md:text-center">
      <!-- Product title -->
      <router-link :to="link" class="text-[color:var(--color-link)] font-extrabold text-sm line-clamp-3 mt-2" :title="product.name">
        {{ product.name }}
      </router-link>

      <!-- Product price -->
      <div class="text-sm mt-2">
        <VcItemPrice class="items-center" :value="product.price"></VcItemPrice>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
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
