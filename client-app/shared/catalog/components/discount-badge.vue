<template>
  <VcBadge v-if="discount" color="danger" :size="size" class="left-0 top-0 z-[2]" :class="{ absolute: !static }">
    <VcIcon v-if="isHot" name="fire" />

    <span>{{ $t("shared.catalog.discount_badge.off", { discount }) }}</span>
  </VcBadge>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import type { PriceType } from "@/core/api/graphql/types";

interface IProps {
  price: PriceType;
  isHot?: boolean;
  size?: "sm" | "md" | "lg";
  static?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  isHot: false,
  size: "md",
});

const discount = computedEager<string | null>(() =>
  props.price.discountPercent >= 0.05 ? `${Math.round(props.price.discountPercent * 100)}%` : null,
);
</script>
