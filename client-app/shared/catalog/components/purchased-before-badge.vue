<template>
  <VcBadge
    color="success"
    :size="size"
    :title="$t('shared.catalog.purchased_before_badge.title')"
    class="purchased-before-badge"
    data-test-id="purchased-before-badge"
    :square="!showText"
  >
    <VcIcon name="round-check" />

    <span v-if="showText">
      {{ $t("shared.catalog.purchased_before_badge.title") }}
    </span>
  </VcBadge>
</template>

<script setup lang="ts">
interface IProps {
  size?: VcBadgeSizeType;
  showText?: boolean;
}

withDefaults(defineProps<IProps>(), {
  size: "md",
});
</script>
