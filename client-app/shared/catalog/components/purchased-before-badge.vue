<template>
  <VcBadge
    color="success"
    :size="size"
    :title="$t('shared.catalog.purchased_before_badge.title')"
    class="purchased-before-badge"
    data-test-id="purchased-before-badge"
  >
    <VcIcon name="round-check" :size="iconSize" />
    <span v-if="showText" class="max-w-full truncate">
      {{ $t("shared.catalog.purchased_before_badge.title") }}
    </span>
  </VcBadge>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
});

const iconSize = computed(() => {
  switch (props.size) {
    case "sm":
      return "xxs";
    case "md":
      return 14;
    case "lg":
      return 17;
    default:
      return 17;
  }
});
</script>

<style lang="scss">
.purchased-before-badge {
  @apply max-w-full;
}
</style>
