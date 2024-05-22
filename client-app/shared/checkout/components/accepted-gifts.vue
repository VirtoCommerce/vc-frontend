<template>
  <VcWidget :title="$t('shared.cart.gifts_section.title')" prepend-icon="gift" size="lg">
    <VcLineItems :with-header="false">
      <template #line-items>
        <VcLineItem v-for="gift in items" :key="gift.id" with-image :name="gift.name" :image-url="gift.imageUrl">
          <VcQuantity v-model="gift.quantity" disabled />
        </VcLineItem>
      </template>
    </VcLineItems>
  </VcWidget>
</template>

<script setup lang="ts">
import type { GiftItemType, OrderLineItemType } from "@/core/api/graphql/types";

interface IProps {
  items: (GiftItemType | OrderLineItemType)[];
}

defineProps<IProps>();
</script>
