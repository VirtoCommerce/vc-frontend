<template>
  <VcBadge
    color="success"
    :size="size"
    :title="$t('shared.catalog.purchased_before_badge.title')"
    class="purchased-before-badge"
    data-test-id="purchased-before-badge"
  >
    <VcIcon name="round-check" square />
    <span v-if="showText" class="max-w-full truncate">
      {{ $t("shared.catalog.purchased_before_badge.title") }}
    </span>
  </VcBadge>
</template>

<script setup lang="ts">
interface IProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

withDefaults(defineProps<IProps>(), {
  size: "md",
});
</script>

<style lang="scss">
.purchased-before-badge {
  @apply max-w-full;
}
</style>
