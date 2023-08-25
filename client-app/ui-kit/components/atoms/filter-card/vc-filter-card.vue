<template>
  <div class="divide-y rounded border bg-[--color-additional-50] shadow-sm">
    <div
      v-if="title || $slots.header"
      class="flex items-center gap-3 px-3.5 pb-1 pt-1.5 text-sm font-black"
      :class="{ 'cursor-pointer': isCollapsible }"
      @click="isCollapsible && (collapsed = !collapsed)"
    >
      <slot name="header">
        <div class="grow uppercase text-[--color-neutral-950] [word-break:break-word]">
          {{ title }}
        </div>

        <VcIcon
          v-if="isCollapsible"
          class="text-[--color-primary-500]"
          :name="collapsed ? 'chevron-down' : 'chevron-up'"
          :size="12"
        />

        <slot name="header-button"></slot>
      </slot>
    </div>

    <div
      v-if="isContentVisible"
      class="text-sm text-[--color-neutral-800]"
      :class="{
        'px-4 py-3.5': !fullWidthContent,
      }"
    >
      <slot></slot>
    </div>

    <div v-if="$slots.footer && isContentVisible" class="flex items-center px-4 py-2">
      <slot name="footer"></slot>
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
