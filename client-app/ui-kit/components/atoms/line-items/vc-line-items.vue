<template>
  <div class="md:table w-full border rounded-md">
    <div class="hidden md:table-row top-0 text-15 font-extrabold" v-if="!!columns?.length">
      <div v-for="column in columns" :key="column.id" :class="['table-cell px-4 py-2.5', column.classes]">
        {{ column.title }}
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  columns: {
    type: Array as PropType<ITableColumn[]>,
  },
});
</script>
