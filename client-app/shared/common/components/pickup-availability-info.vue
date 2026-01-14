<template>
  <VcChip v-if="availabilityNote" size="sm" :variant="variant" :color="chipColor" icon="truck">
    {{ availabilityNote }}
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ProductPickupAvailabilityType } from "@/core/api/graphql/types";

interface IProps {
  availabilityType?: string;
  availabilityNote?: string;
  variant?: VcChipVariantType;
}

const props = withDefaults(defineProps<IProps>(), {
  variant: "solid-light",
});

const chipColor = computed<VcChipColorType>(() => {
  if (props.availabilityType === ProductPickupAvailabilityType.Today) {
    return "success";
  }
  return "accent";
});
</script>
