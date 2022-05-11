<template>
  <nav class="text-sm" :class="$attrs.class">
    <ol itemscope itemtype="https://schema.org/BreadcrumbList" class="flex">
      <template v-for="(item, i) in items" :key="i">
        <template v-if="i < items.length - 1">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <router-link
              itemprop="item"
              :to="item.route"
              class="font-medium text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
            >
              <span itemprop="name">
                <slot name="item">{{ item.title }}</slot>
              </span>
            </router-link>
            <meta itemprop="position" :content="i.toString()" />
          </li>
          <li>
            <slot name="divider">
              <span class="mx-2 text-gray-300">/</span>
            </slot>
          </li>
        </template>

        <!-- Last breadcrumbs item -->
        <li
          v-else
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/ListItem"
          class="font-medium text-gray-500"
        >
          <span itemprop="name">
            <slot name="last">{{ item.title }}</slot>
          </span>
          <meta itemprop="position" :content="i.toString()" />
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { IBreadcrumbs } from "@/components";

defineProps({
  /**
   * Items array.
   */
  items: {
    type: Array as PropType<IBreadcrumbs[]>,
    default: () => [],
  },
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
