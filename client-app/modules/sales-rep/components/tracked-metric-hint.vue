<template>
  <!-- The class sits on an element this component owns: VcTooltip forwards attributes to VcPopover,
       which does not always render a single root to receive them. -->
  <span class="tracked-metric-hint">
    <!-- lazy: without it the popover mounts its floating element straight away, and floating-ui's
         autoUpdate then measures the trigger every animation frame for the life of the page — once
         per hint, and a tab row carries four. -->
    <VcTooltip lazy placement="top">
      <template #trigger>
        <VcIcon name="hourglass" :size="14" :label="t('sales_rep.activity.tracked_hint')" />
      </template>

      <template #content>
        {{ t("sales_rep.activity.tracked_hint") }}
      </template>
    </VcTooltip>
  </span>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Marks a figure that comes from tracked storefront activity rather than from the platform's own
// data, and says the one thing a reader can act on: it appears late, because Google processes events
// for up to 48 hours. Such a figure is also slow to fetch, but that is not a decision anyone makes
// here — the tab is going to be opened regardless — so it stays out of the wording.
const { t } = useI18n();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.tracked-metric-hint {
  @apply inline-flex shrink-0 items-center self-center text-neutral-400;

  // VcTooltip wraps the icon in a popover and a trigger, both block elements, and VcIcon is an
  // inline-block with align-top: in that inline context the icon sits against the line box instead
  // of the text next to it. Flex the whole chain so it centres on the label.
  .vc-popover,
  .vc-popover__trigger {
    @apply flex items-center;
  }

  .vc-icon {
    @apply block;
  }
}
</style>
