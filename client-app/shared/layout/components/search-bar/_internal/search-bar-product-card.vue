<template>
  <div class="flex flex-row gap-2">
    <!-- Product image -->
    <router-link :to="link" class="shrink-0 w-20 h-20 border border-gray-200" @click="$emit('link-click', $event)">
      <VcImage :src="product.imgSrc" :alt="product.name" class="w-full h-full object-cover object-center" lazy />
    </router-link>

    <div class="flex flex-col justify-evenly gap-2 overflow-hidden">
      <!-- Product title -->
      <router-link
        :to="link"
        class="text-cyan-700 font-extrabold text-sm leading-tight line-clamp-2"
        @click="$emit('link-click', $event)"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="text-xs overflow-hidden">
        <p class="truncate">
          <span class="font-bold mr-1">Item</span>
          <span>{{ product.code }}</span>
        </p>

        <p class="truncate">
          <span class="font-bold mr-1">Price</span>
          <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span> / each
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { VcImage, VcPriceDisplay } from "@/components";
import { Product as ProductType } from "@/core/api/graphql/types";
import { RouteLocationRaw } from "vue-router";

defineEmits(["link-click"]);

const props = defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});

const link = computed<RouteLocationRaw>(() => ({ name: "Product", params: { productId: props.product.id } }));
</script>
