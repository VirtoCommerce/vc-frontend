<template>
  <div class="space-x-2" role="group">
    <button
      type="button"
      class="flex rounded p-2"
      :class="[
        mode === 'grid'
          ? 'bg-white text-secondary cursor-auto hover:shadow-t-2sm'
          : 'text-primary hover:text-[color:var(--color-view-mode-hover)]',
      ]"
      @click="$emit('update:mode', 'grid')"
    >
      <svg class="w-5 h-5">
        <use href="/static/images/common/grid-view.svg#main"></use>
      </svg>
      <span class="hidden ml-1.5 text-15 font-semibold lg:block">{{ $t("shared.catalog.view_mode.grid_label") }}</span>
    </button>
    <button
      type="button"
      class="flex rounded p-2"
      :class="[
        mode === 'list'
          ? 'bg-white text-secondary cursor-auto hover:shadow-t-2sm'
          : 'text-primary hover:text-[color:var(--color-view-mode-hover)]',
      ]"
      @click="$emit('update:mode', 'list')"
    >
      <svg class="w-5 h-5">
        <use href="/static/images/common/list-view.svg#main"></use>
      </svg>
      <span class="hidden ml-1.5 text-15 font-semibold lg:block">{{ $t("shared.catalog.view_mode.list_label") }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  mode: {
    type: String,
    default: "grid",
  },
});

defineEmits(["update:mode"]);
</script>
