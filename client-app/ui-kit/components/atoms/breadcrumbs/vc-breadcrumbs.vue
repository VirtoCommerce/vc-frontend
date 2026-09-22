<template>
  <nav class="vc-breadcrumbs" :aria-label="$t('ui_kit.breadcrumbs.aria_label')">
    <ol class="vc-breadcrumbs__list">
      <template v-for="(item, i) in items" :key="i">
        <template v-if="i < items.length - 1">
          <li class="vc-breadcrumbs__item">
            <router-link v-if="item.route" :to="item.route" class="vc-breadcrumbs__link">
              {{ item.title }}
            </router-link>

            <template v-else>{{ item.title }}</template>
          </li>

          <!-- Hidden on the item: hiding only the glyph leaves a blank list entry -->
          <li class="vc-breadcrumbs__item" aria-hidden="true">
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
    @apply mx-2 select-none text-neutral-500;
  }
}
</style>
