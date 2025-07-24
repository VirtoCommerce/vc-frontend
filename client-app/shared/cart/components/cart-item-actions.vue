<template>
  <div class="cart-item-actions">
    <VcButton
      v-if="saveableForLater"
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

    <VcButton
      v-if="removable"
      class="cart-item-actions__button"
      color="secondary"
      size="xs"
      icon-size="1.25rem"
      icon="trash"
      :variant="selected ? 'no-border' : 'solid-light'"
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
  selected?: boolean;
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
    @apply align-middle mt-2;

    &:nth-child(2) {
      @apply ml-2;
    }
  }
}
</style>
