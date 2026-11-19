<template>
  <VcLink
    :to="{ name: HOW_IT_WORKS_ROUTE_NAME }"
    class="how-it-works-link"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
    :data-test-id="testId"
  >
    <VcIcon name="info" size="xs" />

    {{ $t("product_subscriptions.how_it_works.link") }}
  </VcLink>
</template>

<script setup lang="ts">
import { HOW_IT_WORKS_ROUTE_NAME } from "../constants";

interface IProps {
  /** Opens the page in a new tab, e.g. from a dialog that would otherwise stay open over it. */
  newTab?: boolean;
  testId?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.how-it-works-link {
  // The hand cursor is set here too: the link sits inside a selectable card, and the cursor must not depend on it.
  @apply inline-flex cursor-pointer items-center gap-1 self-start text-xs text-[--link-color] hover:text-[--link-hover-color];
}
</style>
