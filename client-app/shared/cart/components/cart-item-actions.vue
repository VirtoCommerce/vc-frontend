<template>
  <div class="cart-item-actions">
    <VcButton
      v-if="isAuthenticated && saveableForLater"
      class="cart-item-actions__button"
      color="secondary"
      size="xs"
      icon-size="1.25rem"
      prepend-icon="bookmark"
      :variant="selected ? 'no-border' : 'solid-light'"
      :disabled="disabled"
      @click="$emit('saveForLater')">
      {{ $t("pages.cart.save_for_later") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { useUser } from "@/shared/account";

interface IEmits {
  (event: "saveForLater"): void;
}

interface IProps {
  selected?: boolean;
  saveableForLater?: boolean;
  disabled?: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>(); 

const { isAuthenticated } = useUser();
</script>

<style lang="scss">
.cart-item-actions {
  &__button {
    @apply align-middle mt-2;

    &:nth-child(2) {
      @apply ml-2;
    }
  }
}
</style>
