<template>
  <div>
    <component v-for="item in content" :key="item.id" :is="item.type" :model="item" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

type TPageContent = {
  id: String;
  name: String;
  type: String;
}

defineProps({
  settings: {
    type: Object,
    default: () => ({}),
  },

  content: {
    type: Array as PropType<TPageContent[]>,
    default: () => [{}],
  },
});
</script>
