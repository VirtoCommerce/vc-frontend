<template>
  <VcWidget :title="$t('shared.cart.gifts_section.title')" prepend-icon="gift" size="lg">
    <VcLineItems :with-header="false">
      <template #line-items>
        <VcLineItem
          v-for="gift in gifts"
          :key="gift.id"
          with-image
          selectable
          :name="gift.name"
          :image-url="gift.imageUrl"
          :disabled="disabled"
          :selected="gift.isAddedInCart"
          @select="$emit('toggle:gift', gift)"
        >
          <VcQuantity v-model="gift.quantity" disabled />
        </VcLineItem>
      </template>
    </VcLineItems>
  </VcWidget>
</template>

<script setup lang="ts">
import type { ExtendedGiftItemType } from "@/shared/cart";

interface IProps {
  disabled?: boolean;
  gifts?: ExtendedGiftItemType[];
}

interface IEmits {
  /** Emitted when a gift needs to be added or removed from the shopping cart */
  (event: "toggle:gift", value: ExtendedGiftItemType): void;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  gifts: () => [],
});
</script>
