<template>
  <VcWidget :title="$t('shared.cart.gifts_section.title')" prepend-icon="gift" size="lg">
    <VcLineItems :with-header="false">
      <template #line-items>
        <VcLineItem
          v-for="gift in gifts"
          :key="gift.id"
          :name="gift.name"
          :image-url="gift.imageUrl"
          :disabled="disabled"
          :selected="gift.isAddedInCart"
          :browser-target="$cfg.details_browser_target"
          with-image
          selectable
          @select="$emit('toggle:gift', gift)"
        >
          <VcAddToCart v-model="gift.quantity" disabled hide-button />
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
