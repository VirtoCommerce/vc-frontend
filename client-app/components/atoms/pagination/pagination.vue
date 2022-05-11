<template>
  <div class="flex items-center justify-center z-0" :class="$attrs.class">
    <!-- Previous page -->
    <button
      class="uppercase text-sm text-center w-10 h-9 rounded-l font-medium bg-white border border-solid border-gray-300"
      :class="{ 'text-gray-300 cursor-default': page === 1 }"
      :type="page > 1 ? 'button' : undefined"
      @click="page > 1 && $emit('update:page', page - 1)"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <!-- Preprevious numbered page -->
    <button
      v-if="mode === 'full' && page > 2"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page - 2)"
    >
      <slot name="item" :page="page - 2">{{ page - 2 }}</slot>
    </button>

    <!-- Previous numbered page -->
    <button
      v-if="mode === 'full' && page > 1"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      <slot name="item" :page="page - 1">{{ page - 1 }}</slot>
    </button>

    <!-- Current page -->
    <div
      class="uppercase text-sm leading-9 text-center w-10 h-9 -mx-px font-bold bg-[color:var(--color-primary)] text-white z-10 cursor-default"
    >
      <slot name="selectedItem" :page="page">{{ page }}</slot>
    </div>

    <!-- Next numbered page -->
    <button
      v-if="mode === 'full' && page < pages"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      <slot name="item" :page="page + 1">{{ page + 1 }}</slot>
    </button>

    <!-- Postnext numbered page -->
    <button
      v-if="mode === 'full' && page < pages - 1"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page + 2)"
    >
      <slot name="item" :page="page + 2">{{ page + 2 }}</slot>
    </button>

    <!-- Next page -->
    <button
      class="uppercase text-sm text-center w-10 h-9 rounded-r font-medium bg-white border border-solid border-gray-300"
      :class="{ 'text-gray-300 cursor-default': page === pages }"
      :type="page < pages ? 'button' : undefined"
      @click="page < pages && $emit('update:page', page + 1)"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  /**
   * Current page number.
   */
  page: {
    type: Number,
    default: 1,
  },

  /**
   * Total pages count.
   */
  pages: {
    type: Number,
    default: 1,
  },

  /**
   * Display mode.
   */
  mode: {
    type: String as PropType<"full" | "compact">,
    default: "full",
    validator: (value: string) => ["full", "compact"].includes(value),
  },
});

defineEmits<{
  (event: "update:page", page: number): void;
}>();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
