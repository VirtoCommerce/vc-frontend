<template>
  <div class="rounded shadow-sm">
    <div
      v-if="withHeader"
      class="px-3.5 pt-2 pb-1.5 border font-extrabold text-13-title rounded-t bg-white"
      :class="{ 'cursor-pointer': isCollapsible, 'rounded-b': collapsed }"
      @click="isCollapsible && (collapsed = !collapsed)"
    >
      <div class="flex items-center pb-px">
        <slot name="header">
          <div class="flex-grow uppercase">{{ title }}</div>
          <div v-if="isCollapsible" class="ml-3">
            <svg width="12" height="12" class="text-[color:var(--color-primary)]"
              :class="[collapsed ? 'rotate-90' : '']"
            >
              <user href="/static/images/common/arrow-down.svg#main"></user>
            </svg>
          </div>
          <slot name="header-button"></slot>
        </slot>
      </div>
    </div>
    <div
      v-if="!isCollapsible || (isCollapsible && !collapsed)"
      class="bg-white rounded-b border-l border-r border-b"
      :class="{ 'px-4 py-3.5': !fullWidthContent }"
    >
      <slot></slot>
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
const collapsed = ref(false);

watch(isCollapsed, (value: boolean) => (collapsed.value = value));

onMounted(() => {
  collapsed.value = isCollapsed.value;
});
</script>
