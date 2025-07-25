<template>
  <VcRating :label="$t('common.labels.rating')" :value="rating.value" :size="size" />
</template>

<script setup lang="ts">
import type { Rating } from "@/core/api/graphql/types";

interface IProps {
  rating: Rating;
  size?: VcRatingSizeType;
}

defineProps<IProps>();
</script>
