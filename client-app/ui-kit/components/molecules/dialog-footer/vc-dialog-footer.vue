<template>
  <div class="vc-dialog-footer">
    <slot>
      <VcButton color="secondary" variant="outline" class="mx-auto">
        {{ $t("common.buttons.close") }}
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

  @apply flex flex-wrap items-center gap-5 py-4 px-6;

  & > .vc-button {
    @apply min-w-32;
  }

  & > * {
    &:first-child:not(:last-child) {
      @apply mr-auto;
    }
  }
}
</style>
