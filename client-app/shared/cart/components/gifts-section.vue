<template>
  <VcSectionWidget :title="$t('shared.cart.gifts_section.title')" icon="gift">
    <div class="border rounded divide-y">
      <div v-for="gift in gifts" :key="gift.id" class="flex items-center px-6 py-3">
        <VcCheckbox
          :model-value="gift.isAddedInCart"
          :disabled="disabled"
          class="mr-6"
          @change="$emit('toggle:gift', gift)"
        />

        <VcImage :src="gift.imageUrl" class="shrink-0 mr-4 w-[60px] h-[60px] border rounded" lazy />

        <span class="grow text-sm font-bold lg:text-13">
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
