<template>
  <nav class="text-sm">
    <ol class="flex flex-wrap">
      <template v-for="(item, i) in items" :key="i">
        <template v-if="i < items.length - 1">
          <li>
            <component
              :is="item.route ? 'router-link' : 'span'"
              :to="item.route"
              class="font-medium text-accent-600 hover:text-accent-700"
            >
              {{ item.title }}
            </component>
          </li>
          <li><span class="mx-2 text-neutral-300">/</span></li>
        </template>

        <!-- Last breadcrumbs item -->
        <li v-else class="font-medium text-neutral">{{ item.title }}</li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface IProps {
  items: IBreadcrumb[];
}

defineProps<IProps>();
</script>
