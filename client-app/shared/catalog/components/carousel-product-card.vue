<template>
  <div class="rounded border border-transparent bg-additional-50 lg:p-2 lg:hover:border-neutral-100 lg:hover:shadow-lg">
    <!-- Product image -->
    <router-link :to="link" @click="$emit('link-click', $event)">
      <div class="square relative border border-neutral-200">
        <VcImage
          :src="product.imgSrc"
          :alt="product.name"
          size-suffix="md"
          class="absolute top-0 size-full object-cover object-center"
          lazy
        />
      </div>
    </router-link>

    <div class="md:text-center">
      <!-- Product title -->
      <router-link
        :to="link"
        :title="product.name"
        class="mt-2 line-clamp-3 text-sm font-extrabold text-[--link-color] hover:text-[--link-hover-color]"
        @click="$emit('link-click', $event)"
      >
        {{ product.name }}
      </router-link>

      <!-- Product price -->
      <div class="mt-2 text-sm">
        <VcItemPrice class="items-center" :value="product.price"></VcItemPrice>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";

defineEmits<{ (eventName: "link-click", globalEvent: PointerEvent): void }>();

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>
