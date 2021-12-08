<template>
  <nav class="pb-2 md:pb-8">
    <ol class="flex">
      <template v-for="(item, i) in items" :key="i">
        <template v-if="i < items.length - 1">
          <li>
            <router-link :to="item.url" class="text-cyan-700">{{ item.title }}</router-link>
          </li>
          <li><span class="mx-2 text-gray-300">/</span></li>
        </template>

        <!-- Last breadcrumbs item -->
        <li v-else class="text-gray-500">{{ item.title }}</li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { IBreadcrumbsItem } from "@/typings";

defineProps({
  items: {
    type: Array as PropType<IBreadcrumbsItem[]>,
    required: true,
  },
});
</script>
