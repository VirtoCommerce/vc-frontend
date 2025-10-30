<template>
  <div
    :id="componentId"
    :class="[
      'vc-dialog',
      `vc-dialog--size--${props.size}`,
      {
        'vc-dialog--dividers': dividers,
      },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, toRef } from "vue";
import { useComponentId, useFocusManagement } from "@/ui-kit/composables";
import { vcDialogKey } from "./vc-dialog-context";

interface IProps {
  dividers?: boolean;
  width?: string;
  maxHeight?: string;
  size?: VcDialogSizeType;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
});

const componentId = useComponentId("dialog");

useFocusManagement({
  container: `#${componentId}`,
});

const sizeRef = toRef(props, "size");
provide(vcDialogKey, { size: sizeRef });
</script>

<style lang="scss">
.vc-dialog {
  --props-width: v-bind(props.width);
  --props-max-height: v-bind(props.maxHeight);
  --w: var(--props-width, var(--vc-dialog-width, 100%));
  --max-h: var(--props-max-height, var(--vc-dialog-max-height, 100%));
  --radius: var(--vc-dialog-radius, var(--vc-radius, 0.5rem));

  @apply grid w-[--w] max-h-[--max-h] rounded-[--radius] bg-additional-50 shadow-lg transition-all text-start;

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
