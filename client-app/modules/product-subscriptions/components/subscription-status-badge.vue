<template>
  <VcBadge :color="statusColor(status)" size="sm" variant="soft" rounded nowrap :data-test-id="`status-${status}`">
    {{ $t(`product_subscriptions.statuses.${status}`, status ?? "") }}
  </VcBadge>
</template>

<script setup lang="ts">
import { statusColor } from "../utils";

defineProps<{ status?: string | null }>();
</script>
