<template>
  <div class="space-x-2" role="group">
    <button
      type="button"
      class="flex rounded p-2"
      :class="[
        mode === 'grid'
          ? 'cursor-auto bg-white text-secondary hover:shadow-t-2sm'
          : 'text-primary hover:text-[color:var(--color-view-mode-hover)]',
      ]"
      @click="$emit('update:mode', 'grid')"
    >
      <svg class="h-5 w-5">
        <use href="/static/images/common/grid-view.svg#main"></use>
      </svg>
      <span class="ml-1.5 hidden text-15 font-semibold lg:block">{{ $t("shared.catalog.view_mode.grid_label") }}</span>
    </button>
    <button
      type="button"
      class="flex rounded p-2"
      :class="[
        mode === 'list'
          ? 'cursor-auto bg-white text-secondary hover:shadow-t-2sm'
          : 'text-primary hover:text-[color:var(--color-view-mode-hover)]',
      ]"
      @click="$emit('update:mode', 'list')"
    >
      <svg class="h-5 w-5">
        <use href="/static/images/common/list-view.svg#main"></use>
      </svg>
      <span class="ml-1.5 hidden text-15 font-semibold lg:block">{{ $t("shared.catalog.view_mode.list_label") }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(["update:mode"]);

defineProps({
  mode: {
    type: String,
    default: "grid",
  },
});
</script>
