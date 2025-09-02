<template>
  <div :class="['vc-dialog-footer', `vc-dialog-footer--size--${sizeStr}`]">
    <slot name="container">
      <div class="vc-dialog-footer__container">
        <slot>
          <VcButton color="secondary" variant="outline" class="mx-auto" @click="$emit('close')">
            {{ $t("ui_kit.buttons.close") }}
          </VcButton>
        </slot>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { vcDialogKey } from "../../atoms/dialog/vc-dialog-context";

interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();

const dialogContext = inject(vcDialogKey, { size: ref("md") });
const sizeStr = computed(() => dialogContext.size.value);
</script>

<style lang="scss">
.vc-dialog-footer {
  grid-area: vc-dialog-footer;

  @apply @container;

  &__container {
    @apply flex flex-wrap items-center gap-x-5 gap-y-2 py-4 px-6;

    & > .vc-button {
      @apply w-full;

      @container (min-width: theme("containers.xs")) {
        @apply flex-1;
      }

      @container (min-width: theme("containers.md")) {
        @apply flex-none min-w-32 w-auto;
      }
    }

    & > * {
      &:first-child:not(:last-child) {
        @apply me-auto;
      }
    }
  }

  /* Size modifiers */
  &--size {
    &--xs {
      /* TODO: footer paddings / button stack for xs */
    }

    &--sm {
      /* TODO: footer paddings / button stack for sm */
    }

    &--md {
    }
  }
}
</style>
