<template>
  <div
    :class="[
      'vc-dialog',
      {
        'vc-dialog--dividers': dividers,
      },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  dividers?: boolean;
  width?: string;
  maxHeight?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  width: "",
  maxHeight: "",
});
</script>

<style lang="scss">
.vc-dialog {
  --props-width: v-bind(props.width);
  --props-max-height: v-bind(props.maxHeight);
  --w: var(--props-width, var(--vc-dialog-width, 100%));
  --max-h: var(--props-max-height, var(--vc-dialog-max-height, 100%));

  @apply grid w-[--w] max-h-[--max-h] rounded-md bg-additional-50 shadow-lg transition-all text-start;

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
