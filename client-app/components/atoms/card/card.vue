<template>
  <div class="bg-white rounded border shadow-sm" :class="$attrs.class">
    <div
      class="border-b font-extrabold text-sm"
      :class="{ 'cursor-pointer': isCollapsible }"
      @click="isCollapsible && toggleCollapse()"
    >
      <div v-if="isLoading" class="px-4 py-3 flex items-center">
        <div class="flex-grow text-sm bg-gray-100">&nbsp;</div>
        <div v-if="isCollapsible" class="ml-6 bg-gray-100 w-3.5 h-3">&nbsp;</div>
      </div>

      <template v-else>
        <slot name="header">
          <div class="px-4 py-2 flex items-center">
            <div class="flex-grow">
              <slot name="title">
                <div class="text-base font-extrabold uppercase">{{ title }}</div>
              </slot>
            </div>

            <div v-if="isCollapsible" class="ml-3">
              <i
                class="fas text-[color:var(--color-primary)] text-base cursor-pointer"
                :class="[isCollapsedInternal ? 'fa-chevron-up' : 'fa-chevron-down']"
              ></i>
            </div>

            <slot name="header-actions"></slot>
          </div>
        </slot>
      </template>
    </div>

    <div v-if="!isCollapsedInternal" class="overflow-hidden">
      <template v-if="isLoading">
        <slot name="skeleton"></slot>
      </template>

      <template v-else>
        <slot></slot>
      </template>
    </div>

    <div v-if="$slots['footer']" class="px-6 py-3 border-t">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Common collapsible card component with loading state.
 */

import { ref } from "vue";

const props = defineProps({
  /**
   * Card title.
   */
  title: {
    type: String,
    default: "",
  },

  /**
   * Toggle collapse handler.
   */
  isCollapsible: {
    type: Boolean,
    default: false,
  },

  /**
   * Toggle default collapsed state.
   */
  isCollapsed: {
    type: Boolean,
    default: false,
  },

  /**
   * Set loading state to display skeleton.
   */
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "click:collapse", state: boolean): void;
  (event: "click:header"): void;
}>();

const isCollapsedInternal = ref(props.isCollapsed);

function toggleCollapse(): void {
  isCollapsedInternal.value = !isCollapsedInternal.value;
  emit("click:collapse", isCollapsedInternal.value);
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
