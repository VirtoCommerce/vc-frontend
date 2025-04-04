<template>
  <VcChip size="lg" color="secondary" variant="outline">
    {{ _name ? $t("ui_kit.labels.vendor_name", { name: _name }) : $t("ui_kit.labels.not_available") }}
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CommonVendor } from "@/core/api/graphql/types";

interface IProps {
  name?: string;
  // @deprecated use `name` instead of `vendor`
  vendor?: CommonVendor;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  size: "lg",
});

if (props.vendor) {
  console.warn("[UI-kit] VcVendor", 'The "vendor" prop is deprecated. Please use "name" instead.');
}

const _name = computed(() => props.name ?? props.vendor?.name);
</script>
