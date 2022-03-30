<template>
  <div role="group">
    <button
      type="button"
      class="rounded text-sm font-extrabold px-4 py-2"
      :class="[mode === 'grid' ? 'bg-[color:var(--color-primary)] text-white' : 'bg-transparent']"
      @click="$emit('update:mode', 'grid')"
    >
      <i class="fas fa-th mr-1"></i>
      {{ $t("shared.catalog.view_mode.grid_label") }}
    </button>
    <button
      type="button"
      class="rounded text-sm font-extrabold px-4 py-2"
      :class="[mode === 'list' ? 'bg-[color:var(--color-primary)] text-white' : 'bg-transparent']"
      @click="$emit('update:mode', 'list')"
    >
      <i class="fas fa-list mr-1"></i>
      {{ $t("shared.catalog.view_mode.list_label") }}
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
