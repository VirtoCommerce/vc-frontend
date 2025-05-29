<template>
  <div class="vc-slider">
    <div class="vc-slider__cols">
      <div class="vc-slider__col"></div>
    </div>

    <div ref="sliderRef" class="vc-slider__slider"></div>
  </div>
</template>

<script setup lang="ts">
import { create } from "nouislider";
import { ref, onMounted } from "vue";
import "nouislider/dist/nouislider.css";

const sliderRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (sliderRef.value) {
    create(sliderRef.value, {
      range: {
        min: 1300,
        max: 3250,
      },

      step: 10,

      start: [10, 2050],

      connect: true,
    });
  }
});
</script>

<style lang="scss">
.vc-slider {
  @apply w-full;

  &__slider {
    .noUi-handle {
      @apply size-8 rounded-full;

      &:before,
      &:after {
        content: none;
      }
    }
  }
}
</style>
