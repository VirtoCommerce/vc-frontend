<template>
  <div>
    <a href="#" class="block px-2 py-0.5 mb-3 text-md font-bold hover:bg-gray-100" :title="category.name">
      {{ category.name }}
    </a>

    <template v-for="(sub, key) in category.sub" :key="key">
      <a
        v-if="(showMoreIndex !== index && key < 5) || showMoreIndex === index"
        class="block px-2 py-0.5 mb-2 text-sm text-gray-500 truncate hover:bg-gray-100"
        href="#"
        :title="sub.name"
      >
        {{ sub.name }}
      </a>
    </template>

    <div
      v-if="category.sub.length > 5 && showMoreIndex !== index"
      @click="clickShowMore"
      class="px-2 py-0.5 text-sm cursor-pointer flex items-baseline"
    >
      <span class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"> Show more </span>
      <i class="ml-[5px] fas fa-chevron-down text-[color:var(--color-primary)]"></i>
    </div>
    <div
      v-if="category.sub.length > 5 && showMoreIndex === index"
      @click="clickHideMore"
      class="px-2 py-0.5 text-sm cursor-pointer flex items-baseline"
    >
      <span class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"> Hide </span>
      <i class="ml-[5px] fas fa-chevron-up text-[color:var(--color-primary)]"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
//import { CategoryTree } from "@/shared/catalog/index.js";
import { PropType } from "vue";

const props = defineProps({
  category: {
    type: Object as PropType<any>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  showMoreIndex: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits<{
  (event: "showMore", categoryMenuIndex: number): void;
  (event: "hideMore"): void;
}>();

function clickShowMore() {
  emit("showMore", props.index);
}

function clickHideMore() {
  emit("hideMore");
}
</script>
