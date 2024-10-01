<template>
  <slot name="right" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, useSlots, warn, watch, watchEffect } from "vue";
import { useNestedMobileHeader } from "../../composables";

interface IProps {
  show?: boolean;
  animated?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  show: true,
});

const slots = useSlots();
const { setSlots, resetSlots, isAnimated } = useNestedMobileHeader();

onBeforeUnmount(() => {
  resetSlots();
});

watch(
  () => props.show,
  (show) => {
    if (show) {
      setSlots(slots);
    } else {
      resetSlots();
    }

    if (!Object.keys(slots).length) {
      warn("Component content is empty.");
    }
  },
  { immediate: true },
);

watchEffect(() => {
  isAnimated.value = props.animated;
});
</script>
