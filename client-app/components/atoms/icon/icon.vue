<template>
  <svg @click="!isDisabled && $emit('click', $event)" :class="$attrs.class">
    <use :href="svg" />
  </svg>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  /**
   * Icon SVG source.
   */
  svg: {
    type: String,
    required: true,
  },

  /**
   * Icon size.
   */
  size: {
    type: String as PropType<"sm" | "md" | "lg">,
    default: "md",
    validator: (value: string) => ["sm", "md", "lg"].includes(value),
  },

  /**
   * Icon disabled state.
   */
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
