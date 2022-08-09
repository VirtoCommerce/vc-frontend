<template>
  <div>
    <a href="#" class="font-bold">{{ category.name }}</a>

    <template v-for="(sub, key) in category.sub" :key="key">
      <div v-if="(showMoreIndex !== index && key < 5) || showMoreIndex === index">
        <a href="#">{{ sub.name }}</a>
      </div>
    </template>

    <div
      v-if="category.sub.length > 5 && showMoreIndex !== index"
      @click="clickShowMore"
      class="underline cursor-pointer text-[color:var(--color-link)]"
    >
      Show more
    </div>
    <div
      v-if="category.sub.length > 5 && showMoreIndex === index"
      @click="clickHideMore"
      class="underline cursor-pointer text-[color:var(--color-link)]"
    >
      Hide
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
