<template>
  <nav :id="componentId" class="mega-menu">
    <VcPopover arrow-enabled placement="bottom-start" class="mega-menu__popover">
      <template #trigger>
        <button type="button" to="/catalog" class="mega-menu__button" :disabled="loading">
          <VcIcon class="mega-menu__icon" name="drag-dots" />
          <span> All Products </span>
        </button>
      </template>

      <template #content="{ close }">
        <div class="mega-menu__content">
          <Subcategories v-if="category" :item="category" @close="close" />
        </div>
      </template>
    </VcPopover>

    <div class="mega-menu__divider"></div>

    <ul class="mega-menu__nav">
      <li v-for="(item, index) in catalogMenuItems" :key="index" class="mega-menu__item">
        <router-link :to="item.route ?? '#'" class="mega-menu__link">
          {{ item.title }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useNavigations } from "@/core/composables";
import { useCategory } from "@/shared/catalog";
import { useComponentId } from "@/ui-kit/composables";
import Subcategories from "./subcategories.vue";

interface IProps {}

defineProps<IProps>();

const componentId = useComponentId("mega-menu");
const { catalogMenuItems } = useNavigations();
const { category, fetchCategory, loading } = useCategory();

onMounted(() => {
  void fetchCategory({
    maxLevel: 4,
    onlyActive: true,
  });
});
</script>

<style lang="scss">
.mega-menu {
  @apply relative z-[3] flex gap-4 h-10 bg-[--header-bottom-bg-color] px-5 xl:px-12;

  &__popover {
    @apply flex items-stretch;
  }

  &__button {
    @apply flex items-center p-1 h-full gap-2 text-sm text-[--header-bottom-link-color] font-bold hover:text-[--header-bottom-link-hover-color];
  }

  &__icon {
    @apply fill-primary size-4;
  }

  &__divider {
    @apply self-center h-5 w-px bg-secondary-200;
  }

  &__nav {
    @apply flex items-center gap-6;
  }

  &__link {
    @apply text-sm font-normal text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color];
  }

  &__content {
    @apply flex min-w-0 max-h-[calc(100vh-11.5rem)] p-5 bg-[--header-bottom-bg-color] rounded shadow-lg;
  }
}
</style>
