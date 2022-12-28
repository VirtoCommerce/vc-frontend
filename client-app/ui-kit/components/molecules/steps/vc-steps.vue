<template>
  <div class="flex flex-wrap gap-x-5 gap-y-2.5">
    <router-link class="flex items-center gap-1.5 text-[var(--color-success)]" to="/cart">
      <svg class="w-5 h-5">
        <use href="/static/images/arrow-left-circle.svg#main"></use>
      </svg>
      <div class="text-14 font-semibold text-[var(--color-success)]">Back to Cart</div>
    </router-link>

    <div class="flex items-center gap-1.5" v-for="(step, index) in steps" :key="index">
      <svg v-if="step.completed" class="w-5 h-5 text-[var(--color-success)]">
        <use href="/static/images/check-circle.svg#main"></use>
      </svg>

      <div
        v-else
        class="flex items-center justify-center w-5 h-5 rounded-full text-sm font-extrabold text-white"
        :class="{
          'bg-[var(--color-primary)]': step.active,
          'bg-gray-400': !step.active,
        }"
      >
        {{ index + 2 }}
      </div>

      <div
        class="text-14"
        :class="{
          'font-bold': step.active,
          'font-semibold text-gray-600': !step.active,
          'font-semibold text-[var(--color-success)]': step.completed,
        }"
      >
        {{ step.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  steps: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});
</script>
