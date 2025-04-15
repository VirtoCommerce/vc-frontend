<template>
  <div class="vendor">
    <VcChip size="lg" color="secondary" variant="outline-dark" truncate>
      {{ $t("common.labels.vendor_name", { name: vendor.name ?? $t("common.labels.not_available") }) }}
    </VcChip>

    <VcRating
      v-if="$cfg.vendor_rating_enabled && displayRating"
      :value="vendor.rating?.value"
      :review-count="vendor.rating?.reviewCount"
      size="xs"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CommonVendor } from "@/core/api/graphql/types";

interface IProps {
  withRating?: boolean;
  vendor: CommonVendor;
}

const props = withDefaults(defineProps<IProps>(), {
  withRating: false,
});

const displayRating = computed(
  () => props.withRating && props.vendor.rating?.reviewCount !== undefined && props.vendor.rating?.reviewCount > 0,
);
</script>

<style lang="scss">
.vendor {
  @apply flex items-center gap-2;
}
</style>
