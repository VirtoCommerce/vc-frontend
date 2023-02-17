<template>
  <component
    :is="forId ? 'label' : 'div'"
    :class="[
      'vc-label',
      {
        'vc-label--error': error,
      },
    ]"
    :for="forId"
  >
    <slot />
    <span v-if="required" class="vc-label__asterisk">*</span>
  </component>
</template>

<script setup lang="ts">
interface Props {
  required?: boolean;
  error?: boolean;
  forId?: string;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-label {
  @apply mb-0.5 text-15 font-lato font-bold text-[color:var(--color-body-text)];

  &--error {
    @apply text-[color:var(--color-danger)];
  }

  &__asterisk {
    @apply ml-0.5 text-[color:var(--color-danger)];
  }
}
</style>
