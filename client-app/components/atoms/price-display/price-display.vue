<template>
  <span :class="$attrs.class">{{ value?.formattedAmount ?? naText }}</span>
</template>

<script setup lang="ts">
/**
 * Price render component supporting MoneyField format.
 */

import { MoneyType } from "@/core/api/graphql/types";
import { PropType } from "vue";

defineProps({
  /**
   * Price value.
   */
  value: {
    type: Object as PropType<MoneyType>,
    default: undefined,
  },

  /**
   * N/A text.
   */
  naText: {
    type: String,
    default: "N/A",
  },
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
