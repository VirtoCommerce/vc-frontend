<template>
  <div class="cart-item-actions">
    <VcButton
      v-if="saveableForLater"
      class="cart-item-actions__button"
      color="secondary"
      size="xs"
      variant="solid-light"
      prepend-icon="bookmark"
      :disabled="disabled"
      @click="$emit('saveForLater')">
      {{ $t("pages.cart.save_for_later_selected") }}
    </VcButton>

    <VcButton
      v-if="removable"
      class="cart-item-actions__button"
      color="secondary"
      size="xs"
      variant="solid-light"
      icon="trash"
      :disabled="disabled"
      @click="$emit('remove')" />
  </div>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "remove"): void;
  (event: "saveForLater"): void;
}

interface IProps {
  removable?: boolean;
  saveableForLater?: boolean;
  disabled?: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>(); 
</script>

<style lang="scss">
.cart-item-actions {
  &__button {
    @apply align-middle m-1;
  }
}
</style>
