<template>
  <div class="flex items-center gap-x-1">
    <VcIcon
      :class="[
        {
          'fill-danger': rating.value <= 3,
          'fill-warning': rating.value > 3 && rating.value <= 4,
          'fill-success': rating.value > 4,
        },
      ]"
      class="flex-none"
      name="cup"
      size="xs"
    />
    {{ rating.value }} / {{ MAX_RATING }}
  </div>
</template>

<script setup lang="ts">
import { MAX_RATING } from "../constants";
import type { Rating } from "@/core/api/graphql/types";

interface IProps {
  rating: Rating;
}

defineProps<IProps>();
</script>
