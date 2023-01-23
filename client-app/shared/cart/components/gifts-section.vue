<template>
  <VcSectionWidget :title="$t('shared.cart.gifts_section.title')" icon="gift">
    <div class="border rounded">
      <div
        v-for="gift in gifts"
        :key="gift.id"
        class="flex items-center justify-between px-7 py-6 border-b last:border-b-0"
      >
        <VcCheckbox
          :model-value="gift.isAddedInCart"
          :disabled="disabled"
          class="mr-7"
          @change="$emit('toggle:gift', gift)"
        />

        <VcImage :src="gift.imageUrl" class="mr-4 border aspect-square w-16 h-16" lazy />

        <span class="flex-grow font-bold">
          {{ gift.name }}
        </span>
      </div>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { ExtendedGiftItemType } from "@/shared/cart";

interface Props {
  disabled?: boolean;
  gifts?: ExtendedGiftItemType[];
}

interface Emits {
  /** Emitted when a gift needs to be added or removed from the shopping cart */
  (event: "toggle:gift", value: ExtendedGiftItemType): void;
}

withDefaults(defineProps<Props>(), {
  gifts: () => [],
});

defineEmits<Emits>();
</script>
