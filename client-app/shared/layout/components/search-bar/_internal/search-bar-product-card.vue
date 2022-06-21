<template>
  <div class="flex flex-row gap-x-2.5">
    <!-- Product image -->
    <router-link
      :to="link"
      class="shrink-0 w-[4.75rem] h-[4.75rem] border border-gray-200 p-1"
      @click="$emit('link-click', $event)"
    >
      <VcImage
        :src="product.imgSrc"
        :alt="product.name"
        size-suffix="sm"
        class="w-full h-full object-cover object-center"
        lazy
      />
    </router-link>

    <div class="flex flex-col justify-start space-y-[0.7rem] overflow-hidden">
      <!-- Product title -->
      <router-link
        :to="link"
        class="shrink-0 h-8 text-[color:var(--color-link)] font-extrabold text-[13px] leading-[1.05rem] line-clamp-2"
        @click="$emit('link-click', $event)"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="text-xs overflow-hidden grid grid-cols-[auto_1fr] leading-[1.063rem]">
        <span class="font-bold pr-3.5">{{ $t("common.labels.item") }}</span>
        <span class="truncate">{{ product.code }}</span>

        <span class="font-bold pr-3.5">{{ $t("common.labels.price") }}</span>
        <VcItemPrice :value="product.price" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { Product as ProductType } from "@/xapi/graphql/types";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute } from "@/shared/catalog";

defineEmits(["link-click"]);

const props = defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product));
</script>
