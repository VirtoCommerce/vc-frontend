<template>
  <div class="bg-white rounded border shadow-sm">
    <div v-if="withHeader" class="px-6 py-3 border-b font-extrabold text-sm">
      <div class="flex items-center">
        <slot name="header">
          <div class="flex-grow text-xl font-extrabold uppercase">{{ title }}</div>
          <div v-if="isCollapsible" class="ml-3">
            <i
              class="fas text-[color:var(--color-primary)] text-base cursor-pointer"
              :class="[!_isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down']"
              @click="_isCollapsed = !_isCollapsed"
            ></i>
          </div>
          <slot name="header-button"></slot>
        </slot>
      </div>
    </div>
    <div v-if="!isCollapsible || (isCollapsible && !_isCollapsed)" :class="{ 'px-6 py-4': !fullWidthContent }">
      <div class="overflow-hidden">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, watch, onMounted } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  withHeader: {
    type: Boolean,
    default: true,
  },
  isCollapsible: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  fullWidthContent: {
    type: Boolean,
    default: false,
  },
});

const { isCollapsed } = toRefs(props);
const _isCollapsed = ref(false);

watch(isCollapsed, (value: boolean) => (_isCollapsed.value = value));

onMounted(() => {
  _isCollapsed.value = isCollapsed.value;
});
</script>
