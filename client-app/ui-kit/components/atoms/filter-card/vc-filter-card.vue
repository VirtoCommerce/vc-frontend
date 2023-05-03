<template>
  <div class="rounded shadow-sm">
    <div
      v-if="withHeader"
      class="rounded-t border bg-white px-3.5 pt-1.5 pb-1 text-13-title font-extrabold"
      :class="{ 'cursor-pointer': isCollapsible, 'rounded-b': collapsed }"
      @click="isCollapsible && (collapsed = !collapsed)"
    >
      <div class="flex items-center">
        <slot name="header">
          <div class="grow uppercase text-[color:var(--color-filter-card-header)] [word-break:break-word]">
            {{ title }}
          </div>
          <div v-if="isCollapsible" class="ml-3">
            <svg
              width="12"
              height="12"
              class="text-[color:var(--color-primary)]"
              :class="[collapsed ? '' : 'rotate-180']"
            >
              <use href="/static/images/common/arrow-down.svg#main"></use>
            </svg>
          </div>
          <slot name="header-button"></slot>
        </slot>
      </div>
    </div>
    <div
      v-if="!isCollapsible || (isCollapsible && !collapsed)"
      class="rounded-b border-x border-b bg-white text-13 text-[color:var(--color-filter-card-content)]"
      :class="{ 'px-4 py-3.5': !fullWidthContent, 'rounded-t border-t': !withHeader }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, watch, onMounted } from "vue";

interface IProps {
  title?: string;
  withHeader?: boolean;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  fullWidthContent?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  withHeader: true,
});

const { isCollapsed } = toRefs(props);
const collapsed = ref(false);

watch(isCollapsed, (value: boolean) => (collapsed.value = value));

onMounted(() => {
  collapsed.value = isCollapsed.value;
});
</script>
