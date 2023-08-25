<template>
  <div :class="['rounded border bg-white', { 'shadow-sm': shadow }]">
    <div v-if="withHeader" :class="['relative text-sm font-black', headerClasses]">
      <div class="flex items-center">
        <slot name="header" v-bind="{ isCollapsible, isCollapsed: _isCollapsed, toggleCollapse }">
          <slot name="header-content">
            <span class="grow text-xl font-black uppercase">
              {{ title }}
            </span>
          </slot>

          <slot name="header-button" v-bind="{ isCollapsible, isCollapsed: _isCollapsed, toggleCollapse }">
            <button
              v-if="isCollapsible"
              type="button"
              class="-my-2 -mr-3 ml-2 flex appearance-none p-2 before:absolute before:inset-0"
              @click="isCollapsible && toggleCollapse()"
            >
              <VcIcon
                class="text-[--color-primary-500]"
                :name="!_isCollapsed ? 'chevron-up' : 'chevron-down'"
                :size="16"
              />
            </button>
          </slot>
        </slot>
      </div>
    </div>

    <div v-if="!isCollapsible || !_isCollapsed" class="overflow-hidden">
      <div :class="['rounded-b border-t', { [contentClasses]: !fullWidthContent }]">
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
