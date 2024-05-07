<template>
  <nav class="vc-breadcrumbs">
    <ol class="vc-breadcrumbs__list">
      <template v-for="(item, i) in items" :key="i">
        <template v-if="i < items.length - 1">
          <li class="vc-breadcrumbs__item">
            <component :is="item.route ? 'router-link' : 'span'" :to="item.route" class="vc-breadcrumbs__link">
              {{ item.title }}
            </component>
          </li>

          <li class="vc-breadcrumbs__item">
            <span class="vc-breadcrumbs__slash">/</span>
          </li>
        </template>

        <!-- Last breadcrumbs item -->
        <li v-else class="vc-breadcrumbs__item">{{ item.title }}</li>
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

<style lang="scss">
.vc-breadcrumbs {
  &__list {
    @apply flex flex-wrap text-sm font-normal;
  }

  &__item {
    @apply text-neutral;
  }

  &__link {
    @apply text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__slash {
    @apply mx-2 text-neutral-300;
  }
}
</style>
