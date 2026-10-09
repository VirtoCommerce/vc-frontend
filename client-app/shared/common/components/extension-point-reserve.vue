<template>
  <!--
    Held while the plugin that declared this slot is on the way — even once its component is
    registered, because the plugin merges its locales in init() and revealing earlier would paint raw
    keys. The host's own fallback keeps the box its exact size, hidden and inert; a slot without one
    is sized by host CSS on `data-slot`.
  -->
  <div
    class="extension-point-reserve"
    :data-slot="slotId"
    :data-policy="policy"
    data-test-id="extension-point-reserve-section"
    aria-busy="true"
  >
    <div
      v-if="$slots.default"
      class="extension-point-reserve__fallback"
      data-test-id="extension-point-reserve-fallback-section"
      inert
    >
      <slot />
    </div>

    <VcLoader v-if="policy === 'block'" class="extension-point-reserve__loader" />
  </div>
</template>

<script setup lang="ts">
import type { SlotPolicyType } from "@/core/federation/contributions/types";

interface IProps {
  /** `"<category>/<name>"` */
  slotId: string;
  policy: SlotPolicyType;
}

defineProps<IProps>();

defineSlots<{
  /** The host's fallback markup, kept for its size only. */
  default?(): unknown;
}>();
</script>

<style lang="scss">
.extension-point-reserve {
  @apply relative;

  &__fallback {
    @apply invisible;
  }

  &__loader {
    @apply absolute inset-0 m-auto;
  }

  &[data-policy="block"] {
    @apply min-h-24;
  }

  &[data-slot="productCard/card-button"] {
    @apply min-h-9;
  }
}
</style>
