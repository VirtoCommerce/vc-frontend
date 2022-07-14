<template>
  <div class="rounded shadow-sm">
    <div
      v-if="withHeader"
      class="px-3.5 py-2 border font-extrabold text-13-title rounded-t bg-white"
      :class="{ 'cursor-pointer': isCollapsible, 'rounded-b': _isCollapsed }"
      @click="isCollapsible && (_isCollapsed = !_isCollapsed)"
    >
      <div class="flex items-center">
        <slot name="header">
          <div class="flex-grow uppercase">{{ title }}</div>
          <div v-if="isCollapsible" class="ml-3">
            <i
              class="fas text-[color:var(--color-primary)] text-base"
              :class="[!_isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down']"
            ></i>
          </div>
          <slot name="header-button"></slot>
        </slot>
      </div>
    </div>
    <div
      v-if="!isCollapsible || (isCollapsible && !_isCollapsed)"
      class="bg-white rounded-b border-l border-r border-b"
      :class="{ 'px-4 py-3.5': !fullWidthContent }"
    >
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
