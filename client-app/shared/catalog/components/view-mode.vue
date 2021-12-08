<template>
  <div role="group">
    <button
      type="button"
      class="rounded text-sm font-extrabold px-4 py-2"
      :class="[mode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-transparent']"
      @click="$emit('update:mode', 'grid')"
    >
      <i class="fas fa-th mr-1"></i>
      Grid
    </button>
    <button
      type="button"
      class="rounded text-sm font-extrabold px-4 py-2"
      :class="[mode === 'list' ? 'bg-yellow-500 text-white' : 'bg-transparent']"
      @click="$emit('update:mode', 'list')"
    >
      <i class="fas fa-list mr-1"></i>
      List
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
