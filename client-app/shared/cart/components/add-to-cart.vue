<template>
  <div class="flex">
    <input
      v-model="counter"
      type="text"
      class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9"
      :disabled="disabled"
    />
    <button
      class="rounded-r uppercase px-3 border font-roboto-condensed font-bold text-sm"
      :class="[
        disabled
          ? 'border-gray-300 text-gray-300 cursor-default'
          : 'border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500',
      ]"
      :disabled="disabled"
      @click="$emit('update:count', counter)"
    >
      <span class="hidden lg:inline">Add to cart</span>
      <i class="inline lg:hidden fas fa-shopping-cart"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },

  count: {
    type: Number,
    default: undefined,
  },
});

defineEmits(["update:count"]);

const counter = ref(props.count);
</script>
