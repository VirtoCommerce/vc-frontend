<template>
  <div class="divide-y overflow-hidden rounded border shadow-sm">
    <div
      v-if="title || $slots.header"
      class="bg-white px-3.5 pb-1 pt-1.5 text-13-title font-extrabold"
      :class="{ 'cursor-pointer': isCollapsible, 'rounded-b': collapsed }"
      @click="isCollapsible && (collapsed = !collapsed)"
    >
      <div class="flex items-center">
        <slot name="header">
          <div class="grow uppercase text-[color:var(--color-neutral-950)] [word-break:break-word]">
            {{ title }}
          </div>
          <div v-if="isCollapsible" class="ml-3">
            <VcIcon
              :name="collapsed ? 'chevron-down' : 'chevron-up'"
              :size="12"
              class="flex items-center text-[var(--color-primary-500)]"
            />
          </div>
          <slot name="header-button"></slot>
        </slot>
      </div>
    </div>
    <div
      v-if="isContentVisible"
      class="bg-white text-13 text-[color:var(--color-neutral-800)]"
      :class="{
        'px-4 py-3.5': !fullWidthContent,
      }"
    >
      <slot></slot>
    </div>
    <div v-if="$slots.footer && isContentVisible" class="bg-white px-4 py-3">
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
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  fullWidthContent?: boolean;
}

const props = defineProps<IProps>();

const { isCollapsed } = toRefs(props);
const collapsed = ref(false);

watch(isCollapsed, (value: boolean) => (collapsed.value = value));

onMounted(() => {
  collapsed.value = isCollapsed.value;
});

const isContentVisible = computed(() => !props.isCollapsible || (props.isCollapsible && !collapsed.value));
</script>
