<template>
  <DialogPanel
    :class="[
      'vc-dialog',
      {
        'vc-dialog--dividers': dividers,
      },
    ]"
  >
    <slot />
  </DialogPanel>
</template>

<script setup lang="ts">
import { DialogPanel } from "@headlessui/vue";

interface IProps {
  dividers?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-dialog {
  @apply grid w-full max-h-full rounded-md bg-additional-50 shadow-lg transition-all text-start w-full max-h-full;

  grid-template-areas:
    "vc-dialog-header"
    "vc-dialog-content"
    "vc-dialog-footer";
  grid-template-rows: min-content 1fr min-content;

  &--dividers {
    @apply divide-y;
  }
}
</style>
