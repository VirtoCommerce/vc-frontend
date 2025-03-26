<template>
  <component
    :is="forId ? 'label' : 'div'"
    :for="forId"
    :class="[
      'vc-label',
      {
        'vc-label--error': error,
      },
    ]"
  >
    <slot />
    <span v-if="required" class="vc-label__asterisk">*</span>
  </component>
</template>

<script setup lang="ts">
interface IProps {
  required?: boolean;
  error?: boolean;
  forId?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-label {
  @apply block mb-0.5 text-sm font-bold text-neutral-900;

  &--error {
    @apply text-danger;
  }

  &__asterisk {
    @apply text-danger ms-1;
  }
}
</style>
