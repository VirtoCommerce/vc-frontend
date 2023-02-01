<template>
  <nav class="text-sm">
    <ol class="flex flex-wrap">
      <template v-for="(item, i) in items" :key="i">
        <template v-if="i < items.length - 1">
          <li>
            <component
              :is="item.route ? 'router-link' : 'span'"
              :to="item.route"
              class="font-medium text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
            >
              {{ item.title }}
            </component>
          </li>
          <li><span class="mx-2 text-gray-300">/</span></li>
        </template>

        <!-- Last breadcrumbs item -->
        <li v-else class="font-medium text-gray-500">{{ item.title }}</li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  items: IBreadcrumb[];
}

defineProps<Props>();
</script>
