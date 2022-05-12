<template>
  <svg :class="[$attrs.class, calculatedSize]" @click="!isDisabled && $emit('click', $event)">
    <use :href="svg" />
  </svg>
</template>

<script setup lang="ts">
/**
 * Icon component created to display colorized icons from SVG or icon font.
 */

import { computed, PropType } from "vue";

const props = defineProps({
  /**
   * Icon SVG source.
   */
  svg: {
    type: String,
    default: "",
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

const calculatedSize = computed(() => {
  let additionalClass = "";

  switch (props.size) {
    case "sm": {
      additionalClass = "h-4 w-4";
      break;
    }
    case "lg": {
      additionalClass = "h-16 w-16";
      break;
    }
    default: {
      additionalClass = "h-8 w-8";
    }
  }

  return additionalClass;
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
