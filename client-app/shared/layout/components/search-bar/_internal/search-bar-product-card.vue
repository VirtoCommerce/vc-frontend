<template>
  <div class="flex flex-row gap-x-2.5">
    <!-- Product image -->
    <router-link :to="link" class="size-19 shrink-0 border border-neutral-200 p-1" @click="$emit('linkClick', $event)">
      <VcImage
        :src="product.imgSrc"
        :alt="product.name"
        size-suffix="sm"
        class="size-full object-cover object-center"
        lazy
      />
    </router-link>

    <div class="flex flex-col justify-start space-y-[0.7rem] overflow-hidden">
      <!-- Product title -->
      <router-link
        :to="link"
        class="line-clamp-2 h-8 shrink-0 text-sm font-black leading-[1.05rem] text-[--link-color]"
        @click="$emit('linkClick', $event)"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="grid grid-cols-[auto_1fr] overflow-hidden text-xs leading-[1.063rem]">
        <span class="pr-3.5 font-bold">{{ $t("common.labels.sku") }}</span>
        <span class="truncate">{{ product.code }}</span>

        <span class="pr-3.5 font-bold">{{ $t("common.labels.price") }}</span>

        <span v-if="product.hasVariations" class="flex space-x-1">
          <span>{{ $t("common.suffixes.from") }}</span>
          <VcItemPrice :value="product.minVariationPrice" />
        </span>

        <VcItemPrice v-else :value="product.price" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (eventName: "linkClick", globalEvent: PointerEvent): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>
