<template>
  <div class="vc-dialog-footer">
    <slot>
      <VcButton color="secondary" variant="outline" class="mx-auto" @click="$emit('close')">
        {{ $t("ui_kit.buttons.close") }}
      </VcButton>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();
</script>

<style lang="scss">
.vc-dialog-footer {
  grid-area: vc-dialog-footer;

  @apply @container flex flex-wrap items-center gap-x-5 gap-y-2 py-4 px-6;

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
      @apply mr-auto;
    }
  }
}
</style>
