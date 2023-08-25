<template>
  <div class="z-0 flex items-stretch justify-center text-center text-sm">
    <!-- Previous page -->
    <button
      v-if="page > 1"
      class="inline-flex h-9 w-10 items-center justify-center rounded-l border border-[--color-neutral-200] bg-[--color-additional-50]"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      <VcIcon class="text-[--color-neutral-800]" name="chevron-left" size="xs" />
    </button>

    <button
      v-else
      type="button"
      class="inline-flex h-9 w-10 cursor-default items-center justify-center rounded-l border border-[--color-neutral-200] bg-[--color-additional-50]"
    >
      <VcIcon class="text-[--color-neutral-200]" name="chevron-left" size="xs" />
    </button>

    <!-- Preprevious numbered page -->
    <button
      v-if="page > 2"
      class="-mx-px h-9 w-10 border border-[--color-neutral-200] bg-[--color-additional-50]"
      type="button"
      @click="$emit('update:page', page - 2)"
    >
      {{ page - 2 }}
    </button>

    <!-- Previous numbered page -->
    <button
      v-if="page > 1"
      class="-mx-px h-9 w-10 border border-[--color-neutral-200] bg-[--color-additional-50]"
      type="button"
      @click="$emit('update:page', page - 1)"
    >
      {{ page - 1 }}
    </button>

    <!-- Current page -->
    <div
      class="z-10 -mx-px h-9 w-10 cursor-default bg-[--color-primary-500] font-bold leading-9 text-[--color-additional-50]"
    >
      {{ page }}
    </div>

    <!-- Next numbered page -->
    <button
      v-if="page < pages"
      class="-mx-px h-9 w-10 border border-[--color-neutral-200] bg-[--color-additional-50]"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      {{ page + 1 }}
    </button>

    <!-- Postnext numbered page -->
    <button
      v-if="page < pages - 1"
      class="-mx-px h-9 w-10 border border-[--color-neutral-200] bg-[--color-additional-50]"
      type="button"
      @click="$emit('update:page', page + 2)"
    >
      {{ page + 2 }}
    </button>

    <!-- Next page -->
    <button
      v-if="page < pages"
      class="inline-flex h-9 w-10 items-center justify-center rounded-r border border-[--color-neutral-200] bg-[--color-additional-50]"
      type="button"
      @click="$emit('update:page', page + 1)"
    >
      <VcIcon class="text-[--color-neutral-800]" name="chevron-right" size="xs" />
    </button>

    <button
      v-else
      type="button"
      class="inline-flex h-9 w-10 cursor-default items-center justify-center rounded-r border border-[--color-neutral-200] bg-[--color-additional-50]"
    >
      <VcIcon class="text-[--color-neutral-200]" name="chevron-right" size="xs" />
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
