<template>
  <component
    :is="forId ? 'label' : 'div'"
    :class="[
      'vc-label',
      {
        'vc-label--error': error,
      },
    ]"
  >
    {{ text }}
    <span v-if="required" class="vc-label__asterisk">*</span>
  </component>
</template>

<script setup lang="ts">
interface Props {
  required?: boolean;
  error?: boolean;
  forId?: string;
  text: string;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-label {
  @apply text-15 font-bold text-[color:var(--color-body-text)];

  &--error {
    @apply text-[color:var(--color-danger)];
  }

  &__asterisk {
    @apply text-[color:var(--color-danger)];
  }
}
</style>
