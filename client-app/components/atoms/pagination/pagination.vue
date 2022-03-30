<template>
  <div class="flex items-center justify-center z-0">
    <!-- Previous page -->
    <button
      v-if="page > 1"
      class="uppercase text-sm text-center w-10 h-9 rounded-l font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
    <button
      v-else
      class="uppercase text-sm text-center w-10 h-9 rounded-l font-medium bg-white border border-solid border-gray-300 text-gray-300 cursor-default"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <!-- Preprevious numbered page -->
    <button
      v-if="page > 2"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page - 2)"
    >
      {{ page - 2 }}
    </button>

    <!-- Previous numbered page -->
    <button
      v-if="page > 1"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      {{ page - 1 }}
    </button>

    <!-- Current page -->
    <div
      class="uppercase text-sm leading-9 text-center w-10 h-9 -mx-px font-bold bg-[color:var(--color-primary)] text-white z-10 cursor-default"
    >
      {{ page }}
    </div>

    <!-- Next numbered page -->
    <button
      v-if="page < pages"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      {{ page + 1 }}
    </button>

    <!-- Postnext numbered page -->
    <button
      v-if="page < pages - 1"
      class="uppercase text-sm text-center w-10 h-9 -mx-px font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page + 2)"
    >
      {{ page + 2 }}
    </button>

    <!-- Next page -->
    <button
      v-if="page < pages"
      class="uppercase text-sm text-center w-10 h-9 rounded-r font-medium bg-white border border-solid border-gray-300"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
    <button
      v-else
      class="uppercase text-sm text-center w-10 h-9 rounded-r font-medium bg-white border border-solid border-gray-300 text-gray-300 cursor-default"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
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

defineEmits(["update:page"]);
</script>
