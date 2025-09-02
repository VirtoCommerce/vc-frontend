<template>
  <div :class="['vc-dialog-content', `vc-dialog-content--size--${sizeStr}`]">
    <slot name="container">
      <div class="vc-dialog-content__container">
        <slot />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, defineProps } from "vue";
import { vcDialogKey } from "../../atoms/dialog/vc-dialog-context";

interface IProps {
  size?: VcDialogSizeType;
}

const props = defineProps<IProps>();

const dialogContext = inject(vcDialogKey, { size: ref("md") });
const sizeStr = computed(() => props.size ?? dialogContext.size.value);
</script>

<style lang="scss">
.vc-dialog-content {
  grid-area: vc-dialog-content;

  @apply max-h-full overflow-y-auto;

  &__container {
    @apply py-4 px-6 min-h-0 flex flex-col;
  }

  /* Size modifiers */
  &--size {
    &--xs {
      /* TODO: content paddings for xs */
    }

    &--sm {
      /* TODO: content paddings for sm */
    }

    &--md {
    }
  }
}
</style>
