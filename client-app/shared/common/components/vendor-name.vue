<template>
  <VcChip size="lg" color="secondary" variant="outline-dark">
    {{ name ? $t("common.labels.vendor_name", { name }) : $t("common.labels.not_available") }}
  </VcChip>
</template>

<script setup lang="ts">
interface IProps {
  name?: string;
}

defineProps<IProps>();
</script>
