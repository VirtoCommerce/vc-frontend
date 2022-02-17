<template>
  <div class="bg-white rounded border shadow-sm">
    <div class="px-6 py-3 border-b uppercase font-extrabold text-sm">
      <div class="flex items-center">
        <div class="flex-grow text-xl font-extrabold">{{ title }}</div>
        <div v-if="isCollapsible" class="ml-3">
          <i
            class="fas text-yellow-500 text-base cursor-pointer"
            :class="[isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down']"
            @click="isCollapsed = !isCollapsed"
          ></i>
        </div>
      </div>
    </div>
    <div v-if="isCollapsed" class="px-6 py-4">
      <div class="overflow-hidden">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
  },

  isCollapsible: {
    type: Boolean,
    default: false,
  },
});

const isCollapsed = ref(true);
</script>
