<template>
  <div>
    <component v-for="item in content" :key="item.id" :is="item.type" :model="item" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

type TPageContent = {
  id: string;
  name: string;
  type: string;
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
