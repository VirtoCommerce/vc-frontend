<template>
  <VcWidget :title="$t('shared.cart.gifts_section.title')" prepend-icon="gift" size="lg">
    <div class="divide-y rounded border">
      <div v-for="gift in gifts" :key="gift.id" class="flex items-center px-6 py-3">
        <VcCheckbox
          :model-value="gift.isAddedInCart"
          :disabled="disabled"
          class="mr-6"
          @change="$emit('toggle:gift', gift)"
        />

        <VcImage :src="gift.imageUrl" class="mr-4 size-[60px] shrink-0 rounded border" lazy />

        <span class="grow text-sm font-bold">
          {{ gift.name }}
        </span>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { ExtendedGiftItemType } from "@/shared/cart/types";

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
