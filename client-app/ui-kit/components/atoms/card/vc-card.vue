<template>
  <div :class="['bg-white rounded border', { 'shadow-sm': shadow }]">
    <div v-if="withHeader" :class="['relative font-extrabold text-sm', headerClasses]">
      <div class="flex items-center">
        <slot name="header" v-bind="{ isCollapsible, isCollapsed: _isCollapsed, toggleCollapse }">
          <slot name="header-content">
            <span class="flex-grow text-xl font-extrabold uppercase">
              {{ title }}
            </span>
          </slot>

          <slot name="header-button" v-bind="{ isCollapsible, isCollapsed: _isCollapsed, toggleCollapse }">
            <button
              v-if="isCollapsible"
              class="px-3 py-2 ml-2 -mr-3 -my-2 appearance-none before:absolute before:inset-0"
              @click="isCollapsible && toggleCollapse()"
            >
              <i
                class="fas text-[color:var(--color-primary)] text-base"
                :class="!_isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down'"
              />
            </button>
          </slot>
        </slot>
      </div>
    </div>

    <div v-if="!isCollapsible || !_isCollapsed" class="overflow-hidden">
      <div :class="['border-t rounded-b', { [contentClasses]: !fullWidthContent }]">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";

const props = defineProps({
  title: String,
  isCollapsible: Boolean,
  isCollapsed: Boolean,
  shadow: Boolean,
  fullWidthContent: Boolean,

  withHeader: {
    type: Boolean,
    default: true,
  },

  headerClasses: {
    type: String,
    default: "px-4 py-3",
  },

  contentClasses: {
    type: String,
    default: "p-4",
  },
});

const _isCollapsed = ref(false);

function toggleCollapse() {
  _isCollapsed.value = !_isCollapsed.value;
}

watchEffect(() => (_isCollapsed.value = props.isCollapsed));
</script>
