<template>
  <div class="rounded shadow-sm">
    <div
      v-if="withHeader"
      class="rounded-t border bg-white px-3.5 pb-1 pt-1.5 text-13-title font-extrabold"
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
      v-if="isContentVisible"
      class="border-x bg-white text-13 text-[color:var(--color-filter-card-content)]"
      :class="{
        'px-4 py-3.5': !fullWidthContent,
        'rounded-t border-t': !withHeader,
        'rounded-b border-b': !withFooter,
      }"
    >
      <slot></slot>
    </div>
    <div v-if="withFooter && isContentVisible" class="rounded-b border bg-white px-4 py-3">
      <div class="flex items-center">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, watch, onMounted, computed } from "vue";

interface IProps {
  title?: string;
  withHeader?: boolean;
  withFooter?: boolean;
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

const isContentVisible = computed(() => !props.isCollapsible || (props.isCollapsible && !collapsed.value));
</script>
