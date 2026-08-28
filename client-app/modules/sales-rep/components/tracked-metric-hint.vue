<template>
  <!-- The class sits on an element this component owns: VcTooltip forwards attributes to VcPopover,
       which does not always render a single root to receive them. -->
  <span class="tracked-metric-hint">
    <VcTooltip placement="top">
      <template #trigger>
        <VcIcon name="hourglass" :size="14" :label="t(messageKey)" />
      </template>

      <template #content>
        {{ t(messageKey) }}
      </template>
    </VcTooltip>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  // Whether reading this figure still costs a request to Google. Set it where the figure is not on
  // screen yet (a tab that has to be opened); leave it off where it already is, since a load the
  // reader has no decision left to make about is noise, not a warning.
  slow?: boolean;
}

const props = defineProps<IProps>();

// Marks a figure that comes from tracked storefront activity rather than from the platform's own
// data. Such a figure appears late (Google processes events for up to 48 hours) and, until it is
// fetched, is slow to load. The wording lives here so every surface says it the same way.
const { t } = useI18n();

const messageKey = computed(() =>
  props.slow ? "sales_rep.activity.tracked_hint_slow" : "sales_rep.activity.tracked_hint",
);
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
