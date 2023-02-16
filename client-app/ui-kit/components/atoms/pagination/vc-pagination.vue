<template>
  <div class="z-0 flex items-center justify-center">
    <!-- Previous page -->
    <button
      v-if="page > 1"
      class="h-9 w-10 rounded-l border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
    <button
      v-else
      class="h-9 w-10 cursor-default rounded-l border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase text-gray-300"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <!-- Preprevious numbered page -->
    <button
      v-if="page > 2"
      class="-mx-px h-9 w-10 border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase"
      type="button"
      @click="$emit('update:page', page - 2)"
    >
      {{ page - 2 }}
    </button>

    <!-- Previous numbered page -->
    <button
      v-if="page > 1"
      class="-mx-px h-9 w-10 border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      {{ page - 1 }}
    </button>

    <!-- Current page -->
    <div
      class="z-10 -mx-px h-9 w-10 cursor-default bg-[color:var(--color-primary)] text-center text-sm font-bold uppercase leading-9 text-white"
    >
      {{ page }}
    </div>

    <!-- Next numbered page -->
    <button
      v-if="page < pages"
      class="-mx-px h-9 w-10 border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      {{ page + 1 }}
    </button>

    <!-- Postnext numbered page -->
    <button
      v-if="page < pages - 1"
      class="-mx-px h-9 w-10 border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase"
      type="button"
      @click="$emit('update:page', page + 2)"
    >
      {{ page + 2 }}
    </button>

    <!-- Next page -->
    <button
      v-if="page < pages"
      class="h-9 w-10 rounded-r border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
    <button
      v-else
      class="h-9 w-10 cursor-default rounded-r border border-solid border-gray-300 bg-white text-center text-sm font-medium uppercase text-gray-300"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(["update:page"]);

defineProps({
  page: {
    type: Number,
    default: 1,
  },

  pages: {
    type: Number,
    default: 1,
  },
});
</script>
