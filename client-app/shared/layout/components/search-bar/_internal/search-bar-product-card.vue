<template>
  <div class="flex flex-row gap-2">
    <!-- Product image -->
    <router-link :to="link" class="shrink-0 w-20 h-20 border border-gray-200" @click="$emit('link-click', $event)">
      <VcImage
        :src="product.imgSrc"
        :alt="product.name"
        size-suffix="sm"
        class="w-full h-full object-cover object-center"
        lazy
      />
    </router-link>

    <div class="flex flex-col justify-start space-y-2 overflow-hidden">
      <!-- Product title -->
      <router-link
        :to="link"
        class="shrink-0 h-8 text-[color:var(--color-link)] font-extrabold text-sm leading-tight line-clamp-2"
        @click="$emit('link-click', $event)"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="text-xs overflow-hidden">
        <p class="truncate">
          <span class="font-bold mr-1">{{ $t("common.labels.item") }}</span>
          <span>{{ product.code }}</span>
        </p>

        <p class="truncate flex">
          <span class="font-bold mr-1">{{ $t("common.labels.price") }}</span>
          <VcItemPrice :value="product.price" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { VcImage, VcItemPrice } from "@/components";
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
