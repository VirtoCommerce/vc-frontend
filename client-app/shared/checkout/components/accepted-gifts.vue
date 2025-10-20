<template>
  <VcWidget :title="$t('shared.cart.gifts_section.title')" prepend-icon="gift" size="lg">
    <VcLineItems :with-header="false">
      <template #line-items>
        <VcLineItem
          v-for="gift in items"
          :key="gift.id"
          :name="gift.name"
          :image-url="gift.imageUrl"
          :browser-target="browserTarget"
          with-image
        >
          <VcAddToCart v-model="gift.quantity" hide-button disabled />
        </VcLineItem>
      </template>
    </VcLineItems>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBrowserTarget } from "@/core/composables";
import type { GiftItemType, OrderLineItemType } from "@/core/api/graphql/types";

interface IProps {
  items: (GiftItemType | OrderLineItemType)[];
}

defineProps<IProps>();

const { browserTarget } = useBrowserTarget();
</script>
