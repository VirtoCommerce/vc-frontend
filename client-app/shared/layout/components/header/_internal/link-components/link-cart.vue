<template>
  <VcTooltip :disabled="!isQuantityCapped" placement="bottom">
    <template #trigger>
      <BottomHeaderLink :link="item" :count="itemsQuantity">
        {{ item.title }}
      </BottomHeaderLink>
    </template>

    <template #content>
      {{ $t("shared.layout.header.cart_items_tooltip", { n: $n(itemsQuantity) }, itemsQuantity) }}
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useShortCart } from "@/shared/cart";
import { HEADER_BADGE_MAX } from "@/shared/layout/utils";
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";

defineProps<{ item: ExtendedMenuLinkType }>();

const { cart } = useShortCart();

const itemsQuantity = computed(() => cart.value?.itemsQuantity ?? 0);
// The badge shows "99+" from here on, so the exact number moves into the tooltip
const isQuantityCapped = computed(() => itemsQuantity.value > HEADER_BADGE_MAX);
</script>
