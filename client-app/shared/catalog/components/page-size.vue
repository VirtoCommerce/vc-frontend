<template>
  <div class="items-center justify-center z-0">
    <span class="hidden xl:inline pr-2">Results per page:</span>
    <button
      class="uppercase text-sm text-center w-12 h-9 rounded-l"
      :class="[
        size === 16
          ? 'bg-yellow-500 text-white font-extrabold z-10'
          : 'bg-white border border-solid border-gray-300 font-semibold z-0',
      ]"
      type="button"
      @click="$emit('update:size', 16)"
    >
      16
    </button>
    <button
      class="uppercase text-sm text-center w-12 h-9 -mx-px"
      :class="[
        size === 32
          ? 'bg-yellow-500 text-white font-extrabold z-10'
          : 'bg-white border border-solid border-gray-300 font-semibold z-0',
      ]"
      type="button"
      @click="$emit('update:size', 32)"
    >
      32
    </button>
    <button
      class="uppercase text-sm text-center w-12 h-9 rounded-r"
      :class="[
        size === 48
          ? 'bg-yellow-500 text-white font-extrabold z-10'
          : 'bg-white border border-solid border-gray-300 font-semibold z-0',
      ]"
      type="button"
      @click="$emit('update:size', 48)"
    >
      48
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 16,
  },
});

defineEmits(["update:size"]);
</script>
